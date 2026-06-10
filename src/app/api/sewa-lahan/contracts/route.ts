import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { isPeriodLocked } from "@/lib/period-lock"
import { logActivity } from "@/lib/audit"
import { cookies } from "next/headers"
import { formatRupiah } from "@/lib/utils"

async function getUserSession() {
  const cookieStore = await cookies()
  const userCookie = cookieStore.get("bumdes_user")
  if (!userCookie) return null
  try {
    return JSON.parse(userCookie.value)
  } catch (_) {
    return null
  }
}

// GET: Fetch all contracts with their payments
export async function GET() {
  try {
    const contracts = await db.lahanContract.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        payments: true
      }
    })
    return NextResponse.json({ success: true, data: contracts })
  } catch (error: any) {
    console.error("Fetch contracts error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch contracts" },
      { status: 500 }
    )
  }
}

// POST: Create a new contract
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      type,
      number,
      tenantName,
      phone,
      shift,
      fee,
      periodStart,
      periodEnd,
      initialPaymentAmount,
      periodCovered,
      date
    } = body

    const txDate = date ? new Date(date) : new Date()

    // Verify accounting period lock status (Tutup Buku)
    if (await isPeriodLocked(txDate)) {
      return NextResponse.json(
        { success: false, error: "Transaksi ditolak. Periode keuangan untuk tanggal tersebut telah dikunci (Tutup Buku)." },
        { status: 400 }
      )
    }

    if (!type || !number || !tenantName || fee === undefined || !periodStart || !periodEnd) {
      return NextResponse.json(
        { success: false, error: "Semua data wajib (type, number, tenantName, fee, periodStart, periodEnd) harus diisi" },
        { status: 400 }
      )
    }

    if (fee <= 0) {
      return NextResponse.json(
        { success: false, error: "Biaya sewa harus lebih dari 0" },
        { status: 400 }
      )
    }

    const start = new Date(periodStart)
    const end = new Date(periodEnd)

    if (start >= end) {
      return NextResponse.json(
        { success: false, error: "Tanggal mulai kontrak harus sebelum tanggal selesai" },
        { status: 400 }
      )
    }

    // Validation: check if the kavling number and shift are already occupied by another active contract
    const overlappingContracts = await db.lahanContract.findMany({
      where: {
        number,
        status: "ACTIVE",
        OR: [
          { periodStart: { gte: start, lte: end } },
          { periodEnd: { gte: start, lte: end } },
          { periodStart: { lte: start }, periodEnd: { gte: end } }
        ]
      }
    })

    if (overlappingContracts.length > 0) {
      if (type === "WARUNG") {
        // Warungs occupy the plot full-time
        return NextResponse.json(
          {
            success: false,
            error: `Kavling warung nomor ${number} sudah terisi oleh kontrak pedagang ${overlappingContracts[0].tenantName} yang sedang aktif.`
          },
          { status: 400 }
        )
      } else {
        // Lapak can be split by shift (PAGI vs MALAM)
        const sameShiftOverlap = overlappingContracts.filter(c => c.shift === shift || c.shift === "NONE")
        if (sameShiftOverlap.length > 0) {
          return NextResponse.json(
            {
              success: false,
              error: `Kavling lapak nomor ${number} untuk shift ${shift} sudah terisi oleh pedagang ${sameShiftOverlap[0].tenantName}.`
            },
            { status: 400 }
          )
        }
      }
    }

    const result = await db.$transaction(async (tx) => {
      // 1. Create contract
      const contract = await tx.lahanContract.create({
        data: {
          type,
          number,
          tenantName,
          phone: phone || null,
          shift: type === "WARUNG" ? "NONE" : shift,
          fee,
          periodStart: start,
          periodEnd: end,
          status: "ACTIVE",
          createdAt: txDate
        }
      })

      // 2. Process initial payment if any (initialPaymentAmount > 0)
      if (initialPaymentAmount > 0) {
        await tx.lahanPayment.create({
          data: {
            contractId: contract.id,
            amount: initialPaymentAmount,
            date: txDate,
            periodCovered: periodCovered || "Sewa Awal Kontrak"
          }
        })

        // Post Journal Entry:
        // Debit: Kas/Bank Unit Lapak (1-1300)
        // Credit: Pendapatan Sewa Lapak (4-1300)
        const journal = await tx.journalEntry.create({
          data: {
            date: txDate,
            description: `Penerimaan Sewa Lahan (${type} Kav ${number}) - ${tenantName}`,
            unitUsaha: "LAHAN"
          }
        })

        await tx.journalLine.createMany({
          data: [
            {
              journalEntryId: journal.id,
              accountCode: "1-1300", // Kas Unit Lapak/Warung
              type: "DEBIT",
              amount: initialPaymentAmount
            },
            {
              journalEntryId: journal.id,
              accountCode: "4-1300", // Pendapatan Sewa Lapak/Warung
              type: "CREDIT",
              amount: initialPaymentAmount
            }
          ]
        })
      }

      return contract
    })

    // Write audit activity log
    const session = await getUserSession()
    if (session) {
      const actDetail = `Membuat kontrak sewa lahan ${type} Kavling ${number} untuk ${tenantName} dengan tarif ${formatRupiah(fee)}${initialPaymentAmount > 0 ? `, bayar awal ${formatRupiah(initialPaymentAmount)}` : ""}`
      await logActivity("CREATE_LAHAN_CONTRACT", actDetail, session)
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error: any) {
    console.error("Create contract error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create contract" },
      { status: 500 }
    )
  }
}

// PUT: Update contract info or deactivate it
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, tenantName, phone, fee, status } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID kontrak sewa harus diisi" },
        { status: 400 }
      )
    }

    const contract = await db.lahanContract.findUnique({ where: { id } })
    if (!contract) {
      return NextResponse.json(
        { success: false, error: "Kontrak sewa tidak ditemukan" },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {}
    if (tenantName !== undefined) updateData.tenantName = tenantName
    if (phone !== undefined) updateData.phone = phone || null
    if (fee !== undefined) {
      if (fee <= 0) {
        return NextResponse.json(
          { success: false, error: "Biaya sewa harus lebih dari 0" },
          { status: 400 }
        )
      }
      updateData.fee = parseFloat(fee)
    }
    if (status !== undefined) {
      if (!["ACTIVE", "EXPIRED", "TERMINATED"].includes(status)) {
        return NextResponse.json(
          { success: false, error: "Status kontrak tidak valid" },
          { status: 400 }
        )
      }
      updateData.status = status
    }

    const updated = await db.lahanContract.update({
      where: { id },
      data: updateData
    })

    // Write audit log
    const session = await getUserSession()
    if (session) {
      let actDetail = `Memperbarui kontrak sewa lahan (${contract.type} Kav ${contract.number})`
      if (status && status !== contract.status) {
        const statusIndo = status === "ACTIVE" ? "Aktif" : status === "TERMINATED" ? "Dinonaktifkan" : "Selesai/Expired"
        actDetail = `Mengubah status kontrak sewa lahan (${contract.type} Kav ${contract.number}) menjadi ${statusIndo}`
      }
      await logActivity("UPDATE_LAHAN_CONTRACT", actDetail, session)
    }

    return NextResponse.json({ success: true, data: updated })
  } catch (error: any) {
    console.error("Update contract error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update contract" },
      { status: 500 }
    )
  }
}

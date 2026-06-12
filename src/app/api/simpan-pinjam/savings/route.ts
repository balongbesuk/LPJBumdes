import { getUserSession } from "@/lib/auth"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { isPeriodLocked } from "@/lib/period-lock"
import { logActivity } from "@/lib/audit"
import { formatRupiah } from "@/lib/utils"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { memberId, type, amount, flow, description, date } = body

    const txDate = date ? new Date(date) : new Date()

    // Verify accounting period lock status (Tutup Buku)
    if (await isPeriodLocked(txDate)) {
      return NextResponse.json(
        { success: false, error: "Transaksi ditolak. Periode keuangan untuk tanggal tersebut telah dikunci (Tutup Buku)." },
        { status: 400 }
      )
    }

    if (!memberId || !type || !amount || !flow) {
      return NextResponse.json(
        { success: false, error: "Semua data (memberId, type, amount, flow) harus diisi" },
        { status: 400 }
      )
    }

    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Jumlah nominal harus lebih dari 0" },
        { status: 400 }
      )
    }

    if (type !== "POKOK" && type !== "WAJIB") {
      return NextResponse.json(
        { success: false, error: "Tipe simpanan harus POKOK atau WAJIB" },
        { status: 400 }
      )
    }

    if (flow !== "MASUK" && flow !== "KELUAR") {
      return NextResponse.json(
        { success: false, error: "Aliran kas harus MASUK atau KELUAR" },
        { status: 400 }
      )
    }

    const member = await db.member.findUnique({
      where: { id: memberId }
    })

    if (!member) {
      return NextResponse.json(
        { success: false, error: "Anggota tidak ditemukan" },
        { status: 404 }
      )
    }

    if (!member.isActive) {
      return NextResponse.json(
        { success: false, error: "Transaksi ditolak. Anggota tersebut sudah tidak aktif / keluar." },
        { status: 400 }
      )
    }

    // Validation for withdrawal: check if member has sufficient balance
    if (flow === "KELUAR") {
      const currentBalance = type === "POKOK" ? member.simpananPokok : member.simpananWajib
      if (currentBalance < amount) {
        return NextResponse.json(
          {
            success: false,
            error: `Saldo simpanan ${type} tidak mencukupi untuk penarikan. Saldo saat ini: Rp ${currentBalance.toLocaleString("id-ID")}`
          },
          { status: 400 }
        )
      }
    }

    // Run transaction
    const transaction = await db.$transaction(async (tx) => {
      // 1. Create saving transaction log
      const savingTx = await tx.savingTransaction.create({
        data: {
          memberId,
          type,
          amount,
          flow,
          date: txDate,
          description: description || `${flow === "MASUK" ? "Setoran" : "Penarikan"} Simpanan ${type}`
        }
      })

      // 2. Update member balances
      const factor = flow === "MASUK" ? 1 : -1
      const updateData: any = {}
      if (type === "POKOK") {
        updateData.simpananPokok = member.simpananPokok + factor * amount
      } else {
        updateData.simpananWajib = member.simpananWajib + factor * amount
      }

      await tx.member.update({
        where: { id: memberId },
        data: updateData
      })

      // 3. Post journal entries
      const journal = await tx.journalEntry.create({
        data: {
          date: txDate,
          description: `${flow === "MASUK" ? "Setoran" : "Penarikan"} Simpanan ${type} - ${member.code} - ${member.name}`,
          unitUsaha: "SP"
        }
      })

      const targetAccount = type === "POKOK" ? "2-1100" : "2-1200"

      if (flow === "MASUK") {
        // Debit: Kas BUMDES (1-1100)
        // Credit: Simpanan Pokok/Wajib (2-1100 / 2-1200)
        await tx.journalLine.createMany({
          data: [
            {
              journalEntryId: journal.id,
              accountCode: "1-1100",
              type: "DEBIT",
              amount
            },
            {
              journalEntryId: journal.id,
              accountCode: targetAccount,
              type: "CREDIT",
              amount
            }
          ]
        })
      } else {
        // Debit: Simpanan Pokok/Wajib (2-1100 / 2-1200)
        // Credit: Kas BUMDES (1-1100)
        await tx.journalLine.createMany({
          data: [
            {
              journalEntryId: journal.id,
              accountCode: targetAccount,
              type: "DEBIT",
              amount
            },
            {
              journalEntryId: journal.id,
              accountCode: "1-1100",
              type: "CREDIT",
              amount
            }
          ]
        })
      }

      return savingTx
    })

    // Write audit activity log
    const session = await getUserSession()
    if (session) {
      const actType = flow === "MASUK" ? "DEPOSIT_SAVINGS" : "WITHDRAW_SAVINGS"
      const actDetail = `${flow === "MASUK" ? "Setoran" : "Penarikan"} Simpanan ${type} untuk ${member.name} (${member.code}) sebesar ${formatRupiah(amount)}`
      await logActivity(actType, actDetail, session)
    }

    return NextResponse.json({ success: true, data: transaction })
  } catch (error: any) {
    console.error("Savings transaction error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process savings transaction" },
      { status: 500 }
    )
  }
}

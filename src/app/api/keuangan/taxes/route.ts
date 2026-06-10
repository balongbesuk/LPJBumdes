import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { isPeriodLocked } from "@/lib/period-lock"
import { logActivity } from "@/lib/audit"
import { cookies } from "next/headers"

function getUserSession() {
  const cookieStore = cookies()
  const userCookie = cookieStore.get("bumdes_user")
  if (!userCookie) return null
  try {
    return JSON.parse(userCookie.value)
  } catch (_) {
    return null
  }
}

// GET: Fetch all tax transactions
export async function GET() {
  try {
    const taxes = await db.taxTransaction.findMany({
      orderBy: { date: "desc" }
    })
    return NextResponse.json({ success: true, data: taxes })
  } catch (error: any) {
    console.error("Fetch taxes error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch tax transactions" },
      { status: 500 }
    )
  }
}

// POST: Record a new tax withholding or settlement
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { date, description, taxType, amount, flow } = body

    const txDate = date ? new Date(date) : new Date()

    if (await isPeriodLocked(txDate)) {
      return NextResponse.json(
        { success: false, error: "Transaksi ditolak. Periode keuangan untuk tanggal tersebut telah dikunci (Tutup Buku)." },
        { status: 400 }
      )
    }

    if (!description || !taxType || !amount || !flow) {
      return NextResponse.json(
        { success: false, error: "Semua data (deskripsi, tipe pajak, nominal, aliran) harus diisi." },
        { status: 400 }
      )
    }

    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Nominal harus lebih dari 0." },
        { status: 400 }
      )
    }

    if (flow !== "POTONG" && flow !== "SETOR") {
      return NextResponse.json(
        { success: false, error: "Aliran kas pajak harus POTONG atau SETOR." },
        { status: 400 }
      )
    }

    const result = await db.$transaction(async (tx) => {
      // 1. Create Tax transaction log
      const taxTx = await tx.taxTransaction.create({
        data: {
          date: txDate,
          description,
          taxType,
          amount,
          flow
        }
      })

      // 2. Post corresponding journal entries to General Ledger
      const journal = await tx.journalEntry.create({
        data: {
          date: txDate,
          description: `Pencatatan Pajak ${taxType} (${flow === "POTONG" ? "Pemotongan" : "Penyetoran"}) - ${description}`,
          unitUsaha: "UMUM"
        }
      })

      if (flow === "POTONG") {
        // Debit: Biaya Administrasi Bank & Pajak (5-1500)
        // Credit: Hutang Pajak (2-1400)
        await tx.journalLine.createMany({
          data: [
            {
              journalEntryId: journal.id,
              accountCode: "5-1500", // Biaya Administrasi Bank & Pajak
              type: "DEBIT",
              amount
            },
            {
              journalEntryId: journal.id,
              accountCode: "2-1400", // Hutang Pajak
              type: "CREDIT",
              amount
            }
          ]
        })
      } else {
        // Debit: Hutang Pajak (2-1400)
        // Credit: Kas/Bank BUMDES (1-1100)
        await tx.journalLine.createMany({
          data: [
            {
              journalEntryId: journal.id,
              accountCode: "2-1400", // Hutang Pajak
              type: "DEBIT",
              amount
            },
            {
              journalEntryId: journal.id,
              accountCode: "1-1100", // Kas/Bank BUMDES
              type: "CREDIT",
              amount
            }
          ]
        })
      }

      return taxTx
    })

    // Log to audit trail
    const session = getUserSession()
    if (session) {
      const actDetail = `Mencatat transaksi pajak ${taxType} (${flow === "POTONG" ? "Dipotong" : "Disetor"}) senilai Rp ${amount.toLocaleString("id-ID")}`
      await logActivity("TAX_TRANSACTION", actDetail, session)
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error: any) {
    console.error("Post tax error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process tax transaction" },
      { status: 500 }
    )
  }
}

import { getUserSession } from "@/lib/auth"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { isPeriodLocked } from "@/lib/period-lock"
import { logActivity } from "@/lib/audit"
import { formatRupiah } from "@/lib/utils"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { contractId, amount, periodCovered, date } = body

    const txDate = date ? new Date(date) : new Date()

    // Verify accounting period lock status (Tutup Buku)
    if (await isPeriodLocked(txDate)) {
      return NextResponse.json(
        { success: false, error: "Transaksi ditolak. Periode keuangan untuk tanggal tersebut telah dikunci (Tutup Buku)." },
        { status: 400 }
      )
    }

    if (!contractId || amount === undefined || amount <= 0 || !periodCovered) {
      return NextResponse.json(
        { success: false, error: "Semua data (contractId, amount, periodCovered) harus diisi" },
        { status: 400 }
      )
    }

    const contract = await db.lahanContract.findUnique({
      where: { id: contractId }
    })

    if (!contract) {
      return NextResponse.json(
        { success: false, error: "Kontrak sewa tidak ditemukan" },
        { status: 404 }
      )
    }

    const result = await db.$transaction(async (tx) => {
      // 1. Create payment record
      const payment = await tx.lahanPayment.create({
        data: {
          contractId,
          amount,
          date: txDate,
          periodCovered
        }
      })

      // 2. Post Journal Entry:
      // Debit: Kas/Bank Unit Lapak & Warung (1-1300)
      // Credit: Pendapatan Sewa Lapak & Warung (4-1300)
      const journal = await tx.journalEntry.create({
        data: {
          date: txDate,
          description: `Penerimaan Iuran Sewa Lahan (${contract.type} Kav ${contract.number}) - ${contract.tenantName} untuk ${periodCovered}`,
          unitUsaha: "LAHAN"
        }
      })

      await tx.journalLine.createMany({
        data: [
          {
            journalEntryId: journal.id,
            accountCode: "1-1300", // Kas Unit Lapak
            type: "DEBIT",
            amount
          },
          {
            journalEntryId: journal.id,
            accountCode: "4-1300", // Pendapatan Sewa Lapak
            type: "CREDIT",
            amount
          }
        ]
      })

      return payment
    })

    // Write audit activity log
    const session = await getUserSession()
    if (session) {
      const actDetail = `Menerima pembayaran iuran sewa lahan (${contract.type} Kavling ${contract.number}) dari ${contract.tenantName} sebesar ${formatRupiah(amount)} untuk ${periodCovered}`
      await logActivity("COLLECT_LAHAN_RENT", actDetail, session)
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error: any) {
    console.error("Create payment error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process payment" },
      { status: 500 }
    )
  }
}

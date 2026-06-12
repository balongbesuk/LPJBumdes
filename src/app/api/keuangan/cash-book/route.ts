import { getUserSession } from "@/lib/auth"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { postJournalEntry } from "@/lib/ledger"
import { isPeriodLocked } from "@/lib/period-lock"
import { logActivity } from "@/lib/audit"
// GET: Fetch all journal entries with their lines for Buku Kas Umum
export async function GET() {
  try {
    const entries = await db.journalEntry.findMany({
      orderBy: { date: "desc" },
      include: {
        lines: true
      }
    })
    return NextResponse.json({ success: true, data: entries })
  } catch (error: any) {
    console.error("Fetch cash book error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch cash book entries" },
      { status: 500 }
    )
  }
}

// POST: Post a new general ledger expense/income entry
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { date, description, unitUsaha, lines, attachmentUrl } = body

    const txDate = date ? new Date(date) : new Date()

    // Verify lock period status
    if (await isPeriodLocked(txDate)) {
      return NextResponse.json(
        { success: false, error: "Transaksi ditolak. Periode keuangan untuk tanggal tersebut telah dikunci (Tutup Buku)." },
        { status: 400 }
      )
    }

    if (!description || !unitUsaha || !lines || !Array.isArray(lines) || lines.length < 2) {
      return NextResponse.json(
        { success: false, error: "Data transaksi tidak lengkap. Deskripsi, unit usaha, dan minimal 2 baris jurnal (Debit & Kredit) harus diisi." },
        { status: 400 }
      )
    }

    const result = await postJournalEntry(txDate, description, unitUsaha, lines, attachmentUrl)

    // Log to audit log
    const session = await getUserSession()
    if (session) {
      const actDetail = `Mencatat transaksi jurnal: ${description} (Unit: ${unitUsaha}) senilai Rp ${lines.find(l => l.type === 'DEBIT')?.amount.toLocaleString("id-ID")}`
      await logActivity("POST_JOURNAL_ENTRY", actDetail, session)
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error: any) {
    console.error("Post journal entry error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Gagal membukukan transaksi" },
      { status: 500 }
    )
  }
}

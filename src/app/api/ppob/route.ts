import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { isPeriodLocked } from "@/lib/period-lock"
import { logActivity } from "@/lib/audit"
import { cookies } from "next/headers"
import { formatRupiah } from "@/lib/utils"

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

// GET: Fetch all PPOB rekaps
export async function GET() {
  try {
    const rekaps = await db.ppobRekap.findMany({
      orderBy: { date: "desc" }
    })
    return NextResponse.json({ success: true, data: rekaps })
  } catch (error: any) {
    console.error("Fetch PPOB error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch PPOB records" },
      { status: 500 }
    )
  }
}

// POST: Record a new PPOB monthly rekap
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { totalRevenue, totalCommission, description, date } = body

    const txDate = date ? new Date(date) : new Date()

    // Verify accounting period lock status (Tutup Buku)
    if (await isPeriodLocked(txDate)) {
      return NextResponse.json(
        { success: false, error: "Transaksi ditolak. Periode keuangan untuk tanggal tersebut telah dikunci (Tutup Buku)." },
        { status: 400 }
      )
    }

    if (totalRevenue === undefined || totalCommission === undefined) {
      return NextResponse.json(
        { success: false, error: "Total Omset (totalRevenue) dan Laba Komisi (totalCommission) wajib diisi" },
        { status: 400 }
      )
    }

    if (totalRevenue < 0 || totalCommission < 0) {
      return NextResponse.json(
        { success: false, error: "Nominal tidak boleh kurang dari 0" },
        { status: 400 }
      )
    }

    const result = await db.$transaction(async (tx) => {
      // 1. Create PPOB record
      const rekap = await tx.ppobRekap.create({
        data: {
          totalRevenue,
          totalCommission,
          description: description || `Rekap Komisi PPOB/Agen Pos`,
          date: txDate
        }
      })

      // 2. Post Journal Entry:
      // Debit: Kas BUMDES (1-1100) -> totalCommission
      // Credit: Pendapatan Komisi PPOB (4-1400) -> totalCommission
      if (totalCommission > 0) {
        const journal = await tx.journalEntry.create({
          data: {
            date: txDate,
            description: `Penerimaan Komisi Bersih PPOB / Agen Pos Bulanan`,
            unitUsaha: "PPOB"
          }
        })

        await tx.journalLine.createMany({
          data: [
            {
              journalEntryId: journal.id,
              accountCode: "1-1100", // Kas BUMDES
              type: "DEBIT",
              amount: totalCommission
            },
            {
              journalEntryId: journal.id,
              accountCode: "4-1400", // Pendapatan PPOB
              type: "CREDIT",
              amount: totalCommission
            }
          ]
        })
      }

      return rekap
    })

    // Write audit activity log
    const session = getUserSession()
    if (session) {
      const actDetail = `Merekap komisi PPOB Agen Pos bulanan untuk tanggal ${txDate.toLocaleDateString("id-ID")} sebesar ${formatRupiah(totalCommission)} (Omset: ${formatRupiah(totalRevenue)})`
      await logActivity("CREATE_PPOB", actDetail, session)
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error: any) {
    console.error("Create PPOB error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create PPOB record" },
      { status: 500 }
    )
  }
}

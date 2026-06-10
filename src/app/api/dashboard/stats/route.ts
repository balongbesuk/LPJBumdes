import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getAccountBalance } from "@/lib/ledger"

export async function GET() {
  try {
    // 1. Count Members
    const memberCount = await db.member.count({
      where: { isActive: true }
    })

    // 2. Calculate Cash & Bank Balances
    const kasBumdes = await getAccountBalance("1-1100")
    const kasGedung = await getAccountBalance("1-1200")
    const kasLapak = await getAccountBalance("1-1300")
    const totalCash = kasBumdes + kasGedung + kasLapak

    // 3. Calculate Simpan Pinjam Receivables (Piutang)
    const piutangMasyarakat = await getAccountBalance("1-1400")
    const piutangGapoktan = await getAccountBalance("1-1500")
    const totalReceivables = piutangMasyarakat + piutangGapoktan

    // 4. Calculate Simpanan Balances (Liabilities)
    const simpananPokok = await getAccountBalance("2-1100")
    const simpananWajib = await getAccountBalance("2-1200")
    const totalSavings = simpananPokok + simpananWajib

    // 5. Fetch Revenue data (2025 historical + 2026 current year entries)
    // Query 2026 revenues from journal lines
    const getRevenueFromJournal = async (code: string) => {
      const lines = await db.journalLine.findMany({
        where: { accountCode: code, type: "CREDIT" } // Revenue increases on Credit
      })
      const debitLines = await db.journalLine.findMany({
        where: { accountCode: code, type: "DEBIT" }
      })
      const creditSum = lines.reduce((sum, l) => sum + l.amount, 0)
      const debitSum = debitLines.reduce((sum, l) => sum + l.amount, 0)
      return creditSum - debitSum
    }

    const currentSpRev = await getRevenueFromJournal("4-1100")
    const currentGedungRev = await getRevenueFromJournal("4-1200")
    const currentLapakRev = await getRevenueFromJournal("4-1300")
    const currentPpobRev = await getRevenueFromJournal("4-1400")

    // Consolidated revenue
    const revenueData = [
      { name: "Simpan Pinjam", value: currentSpRev, color: "#10b981" }, // Emerald 500
      { name: "Sewa Lapak/Warung", value: currentLapakRev, color: "#3b82f6" }, // Blue 500
      { name: "Sewa Gedung (GSG)", value: currentGedungRev, color: "#f59e0b" }, // Amber 500
      { name: "PPOB / Agen Pos", value: currentPpobRev, color: "#a855f7" } // Purple 500
    ]

    const totalRevenue = revenueData.reduce((sum, item) => sum + item.value, 0)

    // Expiring leases notification count (Warung expiring within 30 days)
    const today = new Date()
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(today.getDate() + 30)

    const expiringLeasesCount = await db.lahanContract.count({
      where: {
        type: "WARUNG",
        status: "ACTIVE",
        periodEnd: {
          gte: today,
          lte: thirtyDaysFromNow
        }
      }
    })

    // Active loans count
    const activeLoansCount = await db.loan.count({
      where: { status: "ACTIVE" }
    })

    return NextResponse.json({
      success: true,
      data: {
        memberCount,
        totalCash,
        totalReceivables,
        totalSavings,
        totalRevenue,
        revenueData,
        expiringLeasesCount,
        activeLoansCount
      }
    })
  } catch (error: any) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch stats" },
      { status: 500 }
    )
  }
}

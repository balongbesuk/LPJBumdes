import { db } from "@/lib/db"

export interface DashboardStatsData {
  memberCount: number
  totalCash: number
  totalReceivables: number
  totalSavings: number
  totalRevenue: number
  revenueData: { name: string; value: number; color: string }[]
  expiringLeasesCount: number
  activeLoansCount: number
}

export async function getDashboardStats(): Promise<DashboardStatsData> {
  const [
    memberCount,
    activeLoansCount,
    expiringLeasesCount,
    allJournalLines,
    ledgerAccounts,
  ] = await Promise.all([
    // 1. Count active members
    db.member.count({ where: { isActive: true } }),

    // 2. Count active loans
    db.loan.count({ where: { status: "ACTIVE" } }),

    // 3. Count expiring leases (within 30 days)
    (() => {
      const today = new Date()
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(today.getDate() + 30)
      return db.lahanContract.count({
        where: {
          type: "WARUNG",
          status: "ACTIVE",
          periodEnd: { gte: today, lte: thirtyDaysFromNow },
        },
      })
    })(),

    // 4. Fetch ALL journal lines in ONE query
    db.journalLine.findMany({
      where: {
        accountCode: {
          in: [
            "1-1100", "1-1200", "1-1300", // Cash accounts
            "1-1400", "1-1500",             // Receivable accounts
            "2-1100", "2-1200",             // Savings (liability)
            "4-1100", "4-1200", "4-1300", "4-1400", // Revenue accounts
          ],
        },
      },
      select: {
        accountCode: true,
        type: true,
        amount: true,
      },
    }),

    // 5. Fetch account type info for balance calculation
    db.ledgerAccount.findMany({
      where: {
        code: {
          in: [
            "1-1100", "1-1200", "1-1300",
            "1-1400", "1-1500",
            "2-1100", "2-1200",
            "4-1100", "4-1200", "4-1300", "4-1400",
          ],
        },
      },
      select: { code: true, type: true },
    }),
  ])

  // Build a lookup map: accountCode -> { debitSum, creditSum }
  const balanceMap: Record<string, { debit: number; credit: number }> = {}
  for (const line of allJournalLines) {
    if (!balanceMap[line.accountCode]) {
      balanceMap[line.accountCode] = { debit: 0, credit: 0 }
    }
    if (line.type === "DEBIT") {
      balanceMap[line.accountCode].debit += line.amount
    } else {
      balanceMap[line.accountCode].credit += line.amount
    }
  }

  // Build account type lookup
  const accountTypeMap: Record<string, string> = {}
  for (const acc of ledgerAccounts) {
    accountTypeMap[acc.code] = acc.type
  }

  // Calculate balance based on account type (ASSET/EXPENSE = debit-credit, others = credit-debit)
  function getBalance(code: string): number {
    const b = balanceMap[code] || { debit: 0, credit: 0 }
    const accType = accountTypeMap[code]
    if (accType === "ASSET" || accType === "EXPENSE") {
      return b.debit - b.credit
    }
    return b.credit - b.debit
  }

  // Calculate revenue (always credit - debit for revenue accounts)
  function getRevenue(code: string): number {
    const b = balanceMap[code] || { debit: 0, credit: 0 }
    return b.credit - b.debit
  }

  // Compute final values
  const totalCash = getBalance("1-1100") + getBalance("1-1200") + getBalance("1-1300")
  const totalReceivables = getBalance("1-1400") + getBalance("1-1500")
  const totalSavings = getBalance("2-1100") + getBalance("2-1200")

  const revenueData = [
    { name: "Simpan Pinjam", value: getRevenue("4-1100"), color: "#10b981" },
    { name: "Sewa Lapak/Warung", value: getRevenue("4-1300"), color: "#3b82f6" },
    { name: "Sewa Gedung (GSG)", value: getRevenue("4-1200"), color: "#f59e0b" },
    { name: "PPOB / Agen Pos", value: getRevenue("4-1400"), color: "#a855f7" },
  ]

  const totalRevenue = revenueData.reduce((sum, item) => sum + item.value, 0)

  return {
    memberCount,
    totalCash,
    totalReceivables,
    totalSavings,
    totalRevenue,
    revenueData,
    expiringLeasesCount,
    activeLoansCount,
  }
}

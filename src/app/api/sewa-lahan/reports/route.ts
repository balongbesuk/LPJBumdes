export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get("month") // "1" - "12" or "all"
    const year = searchParams.get("year") // "2026", etc. or "all"

    // 1. Fetch all contracts and payments
    const payments = await db.lahanPayment.findMany({
      include: {
        contract: true
      },
      orderBy: { date: "desc" }
    })

    // 2. Fetch all journal entries for unit "LAHAN"
    const journalEntries = await db.journalEntry.findMany({
      where: {
        unitUsaha: "LAHAN"
      },
      include: {
        lines: true
      },
      orderBy: { date: "desc" }
    })

    // 3. Process and filter by date
    let filteredPayments = payments
    let filteredJournalEntries = journalEntries

    if (year && year !== "all") {
      const y = parseInt(year)
      filteredPayments = filteredPayments.filter(p => new Date(p.date).getFullYear() === y)
      filteredJournalEntries = filteredJournalEntries.filter(je => new Date(je.date).getFullYear() === y)
    }

    if (month && month !== "all") {
      const m = parseInt(month) - 1 // JS Month is 0-indexed
      filteredPayments = filteredPayments.filter(p => new Date(p.date).getMonth() === m)
      filteredJournalEntries = filteredJournalEntries.filter(je => new Date(je.date).getMonth() === m)
    }

    // Extract expenses from journal entries
    // Expenses are lines with account code starting with '5-'
    const expenses: any[] = []
    filteredJournalEntries.forEach(je => {
      je.lines.forEach(line => {
        if (line.accountCode.startsWith("5-") && line.type === "DEBIT") {
          expenses.push({
            id: line.id,
            date: je.date,
            description: je.description,
            accountCode: line.accountCode,
            amount: line.amount
          })
        }
      })
    })

    return NextResponse.json({
      success: true,
      data: {
        payments: filteredPayments.map(p => ({
          id: p.id,
          date: p.date,
          amount: p.amount,
          periodCovered: p.periodCovered,
          tenantName: p.contract.tenantName,
          kavlingNumber: p.contract.number,
          type: p.contract.type
        })),
        expenses
      }
    })
  } catch (error: any) {
    console.error("Fetch reports error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch reports" },
      { status: 500 }
    )
  }
}

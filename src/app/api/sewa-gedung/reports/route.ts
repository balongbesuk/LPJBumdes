export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get("month") // "1" - "12" or "all"
    const year = searchParams.get("year") // "2026", etc. or "all"

    // 1. Fetch all bookings
    const bookings = await db.gedungBooking.findMany({
      orderBy: { dateStart: "desc" }
    })

    // 2. Fetch all journal entries for unit "GEDUNG"
    const journalEntries = await db.journalEntry.findMany({
      where: {
        unitUsaha: "GEDUNG"
      },
      include: {
        lines: true
      },
      orderBy: { date: "desc" }
    })

    // 3. Process and filter by date
    let filteredBookings = bookings
    let filteredJournalEntries = journalEntries

    if (year && year !== "all") {
      const y = parseInt(year)
      filteredBookings = filteredBookings.filter(b => new Date(b.dateStart).getFullYear() === y)
      filteredJournalEntries = filteredJournalEntries.filter(je => new Date(je.date).getFullYear() === y)
    }

    if (month && month !== "all") {
      const m = parseInt(month) - 1 // JS Month is 0-indexed
      filteredBookings = filteredBookings.filter(b => new Date(b.dateStart).getMonth() === m)
      filteredJournalEntries = filteredJournalEntries.filter(je => new Date(je.date).getMonth() === m)
    }

    // Extract revenues and expenses from journal entries
    const revenues: any[] = []
    const expenses: any[] = []

    filteredJournalEntries.forEach(je => {
      je.lines.forEach(line => {
        if (line.accountCode.startsWith("4-") && line.type === "CREDIT") {
          revenues.push({
            id: line.id,
            date: je.date,
            description: je.description,
            accountCode: line.accountCode,
            amount: line.amount
          })
        } else if (line.accountCode.startsWith("5-") && line.type === "DEBIT") {
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
        bookings: filteredBookings,
        revenues,
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

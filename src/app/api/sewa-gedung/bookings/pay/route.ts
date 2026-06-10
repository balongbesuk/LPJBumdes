import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { bookingId, amount } = body

    if (!bookingId || amount === undefined || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "bookingId dan nominal pelunasan yang valid harus diisi" },
        { status: 400 }
      )
    }

    const booking = await db.gedungBooking.findUnique({
      where: { id: bookingId }
    })

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking tidak ditemukan" },
        { status: 404 }
      )
    }

    const remaining = booking.totalFee - booking.dpAmount

    if (amount > remaining + 10) {
      return NextResponse.json(
        {
          success: false,
          error: `Nominal pelunasan (Rp ${amount.toLocaleString("id-ID")}) melebihi sisa kekurangan sewa (Rp ${remaining.toLocaleString("id-ID")})`
        },
        { status: 400 }
      )
    }

    const result = await db.$transaction(async (tx) => {
      // Update booking
      const updatedBooking = await tx.gedungBooking.update({
        where: { id: bookingId },
        data: {
          dpAmount: booking.dpAmount + amount,
          status: "PAID"
        }
      })

      // Post journal entry
      const journal = await tx.journalEntry.create({
        data: {
          date: new Date(),
          description: `Pelunasan Sewa Gedung (${booking.type}) - ${booking.customerName}`,
          unitUsaha: "GEDUNG"
        }
      })

      // Debit: Kas/Bank Unit Gedung (1-1200)
      // Credit: Pendapatan Sewa Gedung (4-1200)
      await tx.journalLine.createMany({
        data: [
          {
            journalEntryId: journal.id,
            accountCode: "1-1200",
            type: "DEBIT",
            amount
          },
          {
            journalEntryId: journal.id,
            accountCode: "4-1200",
            type: "CREDIT",
            amount
          }
        ]
      })

      return updatedBooking
    })

    return NextResponse.json({ success: true, data: result })
  } catch (error: any) {
    console.error("Pay booking error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process payment" },
      { status: 500 }
    )
  }
}

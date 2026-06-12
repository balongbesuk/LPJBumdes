import { getUserSession } from "@/lib/auth"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { isPeriodLocked } from "@/lib/period-lock"
import { logActivity } from "@/lib/audit"
import { formatRupiah } from "@/lib/utils"

// GET: Fetch all bookings
export async function GET() {
  try {
    const bookings = await db.gedungBooking.findMany({
      orderBy: { dateStart: "asc" }
    })
    return NextResponse.json({ success: true, data: bookings })
  } catch (error: any) {
    console.error("Fetch bookings error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch bookings" },
      { status: 500 }
    )
  }
}

// POST: Create a new booking
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { customerName, type, dateStart, dateEnd, totalFee, dpAmount, date } = body

    const txDate = date ? new Date(date) : new Date()

    // Verify accounting period lock status (Tutup Buku)
    if (await isPeriodLocked(txDate)) {
      return NextResponse.json(
        { success: false, error: "Transaksi ditolak. Periode keuangan untuk tanggal tersebut telah dikunci (Tutup Buku)." },
        { status: 400 }
      )
    }

    if (!customerName || !type || !dateStart || !dateEnd || totalFee === undefined || dpAmount === undefined) {
      return NextResponse.json(
        { success: false, error: "Semua data (customerName, type, dateStart, dateEnd, totalFee, dpAmount) harus diisi" },
        { status: 400 }
      )
    }

    const start = new Date(dateStart)
    const end = new Date(dateEnd)

    if (start >= end) {
      return NextResponse.json(
        { success: false, error: "Tanggal/Waktu mulai harus sebelum tanggal/waktu selesai" },
        { status: 400 }
      )
    }

    // Scheduling conflict validation:
    // 1. If RAPAT or PESTA: whole building is blocked. Check if there are any active bookings overlapping.
    // 2. If BADMINTON: only blocks badminton slots. Overlaps only block if there is a RAPAT/PESTA that day, or if there is another BADMINTON booking at the exact same time.
    const overlappingBookings = await db.gedungBooking.findMany({
      where: {
        status: { in: ["BOOKED", "PAID"] },
        OR: [
          // Overlap case A: existing booking starts during the new booking
          { dateStart: { gte: start, lte: end } },
          // Overlap case B: existing booking ends during the new booking
          { dateEnd: { gte: start, lte: end } },
          // Overlap case C: existing booking encompasses the new booking
          { dateStart: { lte: start }, dateEnd: { gte: end } }
        ]
      }
    })

    if (overlappingBookings.length > 0) {
      // If the new booking blocks the whole building, any overlap is a conflict
      if (type === "RAPAT" || type === "PESTA") {
        return NextResponse.json(
          {
            success: false,
            error: `Jadwal bentrok! Tanggal ini sudah dipesan oleh ${overlappingBookings[0].customerName} (${overlappingBookings[0].type})`
          },
          { status: 400 }
        )
      } else {
        // If BADMINTON, check if overlapping contains RAPAT or PESTA (which blocks badminton too)
        const blockWhole = overlappingBookings.filter(b => b.type === "RAPAT" || b.type === "PESTA")
        if (blockWhole.length > 0) {
          return NextResponse.json(
            {
              success: false,
              error: `Gedung sedang disewa penuh untuk ${blockWhole[0].customerName} (${blockWhole[0].type}) pada waktu tersebut.`
            },
            { status: 400 }
          )
        }

        // Check if there is another BADMINTON booking at the same exact time
        // (Assuming 1 court for badminton. If there are multiple, we'd check count, but assuming 1 court for simplicity)
        const sameTypeOverlap = overlappingBookings.filter(b => b.type === "BADMINTON")
        if (sameTypeOverlap.length > 0) {
          return NextResponse.json(
            {
              success: false,
              error: `Lapangan badminton sudah di-booking oleh ${sameTypeOverlap[0].customerName} pada jam tersebut.`
            },
            { status: 400 }
          )
        }
      }
    }

    const booking = await db.$transaction(async (tx) => {
      // 1. Create booking
      const dbBooking = await tx.gedungBooking.create({
        data: {
          customerName,
          type,
          dateStart: start,
          dateEnd: end,
          totalFee,
          dpAmount,
          status: dpAmount >= totalFee ? "PAID" : "BOOKED",
          createdAt: txDate
        }
      })

      // 2. Post journal entry if any payment is received (dpAmount > 0)
      if (dpAmount > 0) {
        const journal = await tx.journalEntry.create({
          data: {
            date: txDate,
            description: `Penerimaan Sewa Gedung (${type}) - ${customerName} (DP/Lunas)`,
            unitUsaha: "GEDUNG"
          }
        })

        // Debit: Kas/Bank Unit Gedung (1-1200)
        // Credit: Pendapatan Sewa Gedung (4-1200)
        await tx.journalLine.createMany({
          data: [
            {
              journalEntryId: journal.id,
              accountCode: "1-1200", // Kas Unit Gedung
              type: "DEBIT",
              amount: dpAmount
            },
            {
              journalEntryId: journal.id,
              accountCode: "4-1200", // Pendapatan Sewa Gedung
              type: "CREDIT",
              amount: dpAmount
            }
          ]
        })
      }

      return dbBooking
    })

    // Write audit activity log
    const session = await getUserSession()
    if (session) {
      const actDetail = `Membuat reservasi Gedung GSG untuk ${customerName} (${type}) senilai ${formatRupiah(totalFee)} dengan DP ${formatRupiah(dpAmount)}`
      await logActivity("ADD_BOOKING", actDetail, session)
    }

    return NextResponse.json({ success: true, data: booking })
  } catch (error: any) {
    console.error("Create booking error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create booking" },
      { status: 500 }
    )
  }
}

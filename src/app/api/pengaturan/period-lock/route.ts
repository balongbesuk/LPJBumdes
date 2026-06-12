import { getUserSession } from "@/lib/auth"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { logActivity } from "@/lib/audit"

// GET: Fetch all locked periods
export async function GET() {
  try {
    const locks = await db.periodLock.findMany({
      orderBy: [
        { year: "desc" },
        { month: "desc" }
      ]
    })
    return NextResponse.json({ success: true, data: locks })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal mengambil data kunci periode" },
      { status: 500 }
    )
  }
}

// POST: Toggle period lock
export async function POST(request: Request) {
  try {
    const session = await getUserSession()
    if (!session || (session.role !== "ADMIN" && session.role !== "BENDAHARA")) {
      return NextResponse.json(
        { success: false, error: "Hanya Admin dan Bendahara yang memiliki wewenang Tutup Buku" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { year, month, locked } = body

    if (!year || !month || locked === undefined) {
      return NextResponse.json(
        { success: false, error: "Parameter year, month, dan locked wajib diisi" },
        { status: 400 }
      )
    }

    const lock = await db.periodLock.upsert({
      where: {
        year_month: {
          year: parseInt(year),
          month: parseInt(month)
        }
      },
      update: {
        locked: !!locked,
        lockedBy: session.name
      },
      create: {
        year: parseInt(year),
        month: parseInt(month),
        locked: !!locked,
        lockedBy: session.name
      }
    })

    const monthNames = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ]
    const monthName = monthNames[month - 1] || month
    const actionText = locked ? "KUNCI_PERIODE" : "BUKA_PERIODE"
    const detailText = locked
      ? `Melakukan Tutup Buku (Kunci Periode) untuk bulan ${monthName} ${year}`
      : `Membuka kembali kunci periode pembukuan untuk bulan ${monthName} ${year}`

    await logActivity(actionText, detailText, session)

    return NextResponse.json({ success: true, data: lock })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal memproses kunci periode" },
      { status: 500 }
    )
  }
}

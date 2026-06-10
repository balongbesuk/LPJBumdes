import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { logActivity } from "@/lib/audit"
import { cookies } from "next/headers"

async function getUserSession() {
  const cookieStore = await cookies()
  const userCookie = cookieStore.get("bumdes_user")
  if (!userCookie) return null
  try {
    return JSON.parse(userCookie.value)
  } catch (_) {
    return null
  }
}

// GET: Fetch all meeting minutes logs
export async function GET() {
  try {
    const meetings = await db.meetingMinutes.findMany({
      orderBy: { date: "desc" }
    })
    return NextResponse.json({ success: true, data: meetings })
  } catch (error: any) {
    console.error("Fetch meetings error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch meeting minutes" },
      { status: 500 }
    )
  }
}

// POST: Record new meeting minutes
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { date, title, category, attendees, minutes, notes } = body

    if (!title || !category || !attendees || !minutes) {
      return NextResponse.json(
        { success: false, error: "Data rapat tidak lengkap. Judul, kategori, jumlah peserta, dan ringkasan notulen harus diisi." },
        { status: 400 }
      )
    }

    const attendeesVal = parseInt(attendees, 10)
    const txDate = date ? new Date(date) : new Date()

    const meeting = await db.meetingMinutes.create({
      data: {
        date: txDate,
        title,
        category,
        attendees: attendeesVal,
        minutes,
        notes
      }
    })

    // Log to audit log
    const session = await getUserSession()
    if (session) {
      const actDetail = `Mencatat notulen rapat: ${title} (Kategori: ${category}, Peserta: ${attendeesVal} orang)`
      await logActivity("CREATE_MEETING_MINUTES", actDetail, session)
    }

    return NextResponse.json({ success: true, data: meeting })
  } catch (error: any) {
    console.error("Post meeting error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save meeting minutes" },
      { status: 500 }
    )
  }
}

// DELETE: Delete a meeting minutes log
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID notulen rapat harus diisi" },
        { status: 400 }
      )
    }

    const meeting = await db.meetingMinutes.findUnique({ where: { id } })
    if (!meeting) {
      return NextResponse.json(
        { success: false, error: "Notulen rapat tidak ditemukan" },
        { status: 404 }
      )
    }

    await db.meetingMinutes.delete({
      where: { id }
    })

    // Log to audit log
    const session = await getUserSession()
    if (session) {
      const actDetail = `Menghapus notulen rapat: ${meeting.title}`
      await logActivity("DELETE_MEETING_MINUTES", actDetail, session)
    }

    return NextResponse.json({ success: true, message: "Notulen rapat berhasil dihapus" })
  } catch (error: any) {
    console.error("Delete meeting error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete meeting minutes" },
      { status: 500 }
    )
  }
}

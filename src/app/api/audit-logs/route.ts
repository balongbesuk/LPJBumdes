import { NextResponse } from "next/server"
import { db } from "@/lib/db"
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

export async function GET() {
  try {
    const session = await getUserSession()
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Hanya Admin (Kepala BUMDES) yang dapat mengakses log audit" },
        { status: 403 }
      )
    }

    const logs = await db.auditLog.findMany({
      orderBy: { timestamp: "desc" },
      take: 200
    })

    return NextResponse.json({ success: true, data: logs })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal memuat log audit" },
      { status: 500 }
    )
  }
}

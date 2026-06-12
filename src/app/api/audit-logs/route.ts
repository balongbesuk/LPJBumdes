import { getUserSession } from "@/lib/auth"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
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

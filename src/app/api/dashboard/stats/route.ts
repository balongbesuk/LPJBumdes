import { NextResponse } from "next/server"
import { getDashboardStats } from "@/lib/dashboard-stats"

export async function GET() {
  try {
    const stats = await getDashboardStats()
    return NextResponse.json({
      success: true,
      data: stats,
    })
  } catch (error: any) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch stats" },
      { status: 500 }
    )
  }
}

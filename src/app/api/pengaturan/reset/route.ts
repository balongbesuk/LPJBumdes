import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { logActivity } from "@/lib/audit"
import { cookies } from "next/headers"
import { AUTH_COOKIE_NAME } from "@/lib/jwt"

function getUserSession() {
  const cookieStore = cookies()
  const userCookie = cookieStore.get("bumdes_user")
  if (!userCookie) return null
  try {
    return JSON.parse(userCookie.value)
  } catch (_) {
    return null
  }
}

export async function POST() {
  try {
    // 1. Wipe all transactional data
    await db.savingTransaction.deleteMany()
    await db.loanRepayment.deleteMany()
    await db.loan.deleteMany()
    await db.gedungBooking.deleteMany()
    await db.lahanPayment.deleteMany()
    await db.lahanContract.deleteMany()
    await db.ppobRekap.deleteMany()
    await db.journalLine.deleteMany()
    await db.journalEntry.deleteMany()
    await db.post.deleteMany()
    await db.document.deleteMany()
    await db.member.deleteMany()
    await db.fixedAsset.deleteMany()
    await db.periodLock.deleteMany()
    await db.auditLog.deleteMany()

    // 2. Reset settings to default values (empty profile triggers setup page)
    const defaultSettings = [
      { key: "shu_pengurus_pct", value: "30" },
      { key: "shu_pengawas_pct", value: "10" },
      { key: "shu_sosial_pct", value: "10" },
      { key: "shu_modal_pct", value: "25" },
      { key: "shu_desa_pct", value: "25" },
      { key: "bumdes_name", value: "" },
      { key: "village_name", value: "" },
      { key: "district_name", value: "" },
      { key: "regency_name", value: "" }
    ]

    for (const s of defaultSettings) {
      await db.setting.upsert({
        where: { key: s.key },
        update: { value: s.value },
        create: s
      })
    }

    // 3. Log activity
    const session = getUserSession()
    if (session) {
      await logActivity("RESET_DATABASE", "Melakukan reset database ke pengaturan awal pabrik", session)
    }

    const response = NextResponse.json({ success: true, message: "Database berhasil di-reset ke pengaturan awal!" })

    // Clear JWT token cookie
    response.cookies.set(AUTH_COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0, // Expire immediately
    })

    // Clear legacy cookie
    response.cookies.set("bumdes_user", "", {
      path: "/",
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      maxAge: 0,
    })

    return response
  } catch (error: any) {
    console.error("Reset database error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Gagal melakukan reset database" },
      { status: 500 }
    )
  }
}


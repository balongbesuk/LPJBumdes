import { cookies } from "next/headers"
import { verifyToken, AUTH_COOKIE_NAME } from "@/lib/jwt"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import DashboardLayoutClient from "./DashboardLayoutClient"

export const dynamic = "force-dynamic"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value

  let user = null
  if (token) {
    user = await verifyToken(token)
  }

  // Fallback to legacy cookie if token is not verified/present
  if (!user) {
    const legacyCookie = cookieStore.get("bumdes_user")?.value
    if (legacyCookie) {
      try {
        user = JSON.parse(decodeURIComponent(legacyCookie))
      } catch {}
    }
  }

  // If still no user, redirect to login
  if (!user) {
    redirect("/login")
  }

  // Fetch settings from DB
  const settingsList = await db.setting.findMany()
  const settings: Record<string, string> = {}
  settingsList.forEach((s) => {
    settings[s.key] = s.value
  })

  return (
    <DashboardLayoutClient user={user} initialSettings={settings}>
      {children}
    </DashboardLayoutClient>
  )
}

import { cookies } from "next/headers"
import { verifyToken, AUTH_COOKIE_NAME } from "@/lib/jwt"
import { getDashboardStats } from "@/lib/dashboard-stats"
import DashboardClient from "./DashboardClient"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const cookieStore = cookies()
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value

  let userName = "Admin"
  if (token) {
    const user = await verifyToken(token)
    if (user && user.name) {
      userName = user.name
    }
  } else {
    const legacyCookie = cookieStore.get("bumdes_user")?.value
    if (legacyCookie) {
      try {
        const user = JSON.parse(decodeURIComponent(legacyCookie))
        userName = user.name || "Admin"
      } catch {}
    }
  }

  const stats = await getDashboardStats()

  return <DashboardClient stats={stats} initialUserName={userName} />
}

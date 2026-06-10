import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import fs from "fs"
import path from "path"
import { logActivity } from "@/lib/audit"

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
      return new Response("Unauthorized", { status: 401 })
    }

    const dbPath = path.join(process.cwd(), "prisma", "dev.db")
    if (!fs.existsSync(dbPath)) {
      return new Response("Database file not found", { status: 404 })
    }

    const dbBuffer = fs.readFileSync(dbPath)

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "")
    const timeStr = new Date().toTimeString().slice(0, 8).replace(/:/g, "")
    const filename = `bumdes_backup_${dateStr}_${timeStr}.db`

    // Log the backup action
    await logActivity("BACKUP_DB", `Melakukan pencadangan (backup) database BUMDES ke file: ${filename}`, session)

    return new Response(dbBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`
      }
    })
  } catch (error: any) {
    return new Response(error.message || "Failed to download database backup", { status: 500 })
  }
}

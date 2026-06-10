import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { db } from "@/lib/db"
import { logActivity } from "@/lib/audit"
import fs from "fs"
import path from "path"

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

export async function POST(request: Request) {
  try {
    const session = getUserSession()
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Hanya Admin yang memiliki hak akses untuk memulihkan database" },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ success: false, error: "Tidak ada file database yang diunggah" }, { status: 400 })
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer())

    // Validate SQLite signature (first 16 bytes: "SQLite format 3\0")
    const sqliteHeader = "SQLite format 3\0"
    const fileHeader = fileBuffer.slice(0, 16).toString("binary")
    
    if (fileHeader !== sqliteHeader) {
      return NextResponse.json(
        { success: false, error: "Format file tidak valid. Silakan unggah file database SQLite (.db) hasil backup BUMDES." },
        { status: 400 }
      )
    }

    const dbPath = path.join(process.cwd(), "prisma", "dev.db")
    
    // Disconnect Prisma Client before overwriting the file
    await db.$disconnect()
    
    // Write new database file
    fs.writeFileSync(dbPath, fileBuffer)
    
    // Log the restore action into the newly restored database
    await logActivity("RESTORE_DB", `Berhasil memulihkan (restore) database BUMDES dari file unggahan: ${file.name}`, session)

    return NextResponse.json({ success: true, message: "Database BUMDES berhasil dipulihkan!" })
  } catch (error: any) {
    console.error("Restore DB error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Gagal memulihkan database" },
      { status: 500 }
    )
  }
}

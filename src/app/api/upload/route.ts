import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import { getUserSession } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    // 1. Verify user is authenticated
    const session = await getUserSession()
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Akses ditolak. Sesi Anda tidak valid." },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Berkas tidak ditemukan dalam permintaan." },
        { status: 400 }
      )
    }

    // 2. Validate file size (Max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: "Ukuran berkas melebihi batas maksimal 5MB." },
        { status: 400 }
      )
    }

    // 3. Validate file type (PDF, JPG, JPEG, PNG)
    const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"]
    const allowedExtensions = [".pdf", ".jpg", ".jpeg", ".png"]
    const fileType = file.type?.toLowerCase() || ""
    const ext = path.extname(file.name).toLowerCase()

    if (!allowedMimeTypes.includes(fileType) || !allowedExtensions.includes(ext)) {
      return NextResponse.json(
        { success: false, error: "Format berkas tidak didukung. Hanya berkas PDF, JPG, JPEG, dan PNG yang diperbolehkan." },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Ensure upload directory exists inside public directory
    const uploadDir = path.join(process.cwd(), "public", "uploads")
    await fs.mkdir(uploadDir, { recursive: true })

    // Generate unique name for the file
    const baseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9]/g, "_")
    const fileName = `${Date.now()}-${baseName}${ext}`
    const filePath = path.join(uploadDir, fileName)

    // Write file to disk
    await fs.writeFile(filePath, buffer)

    return NextResponse.json({
      success: true,
      message: "Berkas berhasil diunggah",
      url: `/uploads/${fileName}`
    })
  } catch (error: any) {
    console.error("Upload route error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Gagal mengunggah berkas" },
      { status: 500 }
    )
  }
}

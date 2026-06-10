import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import * as crypto from "crypto"

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex")
}

// GET: List all users (exclude passwordHash)
export async function GET() {
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json({ success: true, data: users })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal memuat daftar pengguna" },
      { status: 500 }
    )
  }
}

// POST: Create a new user
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, password, name, role } = body

    if (!username || !password || !name || !role) {
      return NextResponse.json(
        { success: false, error: "Semua field (username, password, nama, role) wajib diisi" },
        { status: 400 }
      )
    }

    const validRoles = ["ADMIN", "BENDAHARA", "SEKRETARIS", "OPERATOR_SEWA", "OPERATOR_SP"]
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { success: false, error: `Role tidak valid. Pilih salah satu: ${validRoles.join(", ")}` },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password minimal 6 karakter" },
        { status: 400 }
      )
    }

    // Check if username already exists
    const existing = await db.user.findUnique({ where: { username } })
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Username sudah digunakan" },
        { status: 409 }
      )
    }

    const passwordHash = hashPassword(password)

    const user = await db.user.create({
      data: { username, passwordHash, name, role },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ success: true, data: user, message: "Pengguna berhasil ditambahkan" })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal menambahkan pengguna" },
      { status: 500 }
    )
  }
}

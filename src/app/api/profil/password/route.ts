import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import * as crypto from "crypto"

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex")
}

// POST: Change password for the logged-in user (accessible by ALL roles)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, currentPassword, newPassword } = body

    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: "User ID, password lama, dan password baru wajib diisi" },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password baru minimal 6 karakter" },
        { status: 400 }
      )
    }

    // Find the user
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Pengguna tidak ditemukan" },
        { status: 404 }
      )
    }

    // Verify current password
    const currentHash = hashPassword(currentPassword)
    if (user.passwordHash !== currentHash) {
      return NextResponse.json(
        { success: false, error: "Password lama tidak cocok" },
        { status: 401 }
      )
    }

    // Check new password is different
    const newHash = hashPassword(newPassword)
    if (currentHash === newHash) {
      return NextResponse.json(
        { success: false, error: "Password baru harus berbeda dari password lama" },
        { status: 400 }
      )
    }

    // Update password
    await db.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    })

    return NextResponse.json({ success: true, message: "Password berhasil diubah" })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal mengubah password" },
      { status: 500 }
    )
  }
}

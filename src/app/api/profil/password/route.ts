import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { comparePassword, hashPassword } from "@/lib/auth"

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

    // Verify current password (supports both bcrypt and legacy SHA-256)
    const isValid = await comparePassword(currentPassword, user.passwordHash)
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Password lama tidak cocok" },
        { status: 401 }
      )
    }

    // Hash new password with bcrypt
    const newHash = await hashPassword(newPassword)

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

import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { hashPassword } from "@/lib/auth"

// PUT: Update user (name, role, optionally password)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, role, password } = body

    if (!name || !role) {
      return NextResponse.json(
        { success: false, error: "Nama dan role wajib diisi" },
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

    // Check if user exists
    const existing = await db.user.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Pengguna tidak ditemukan" },
        { status: 404 }
      )
    }

    const updateData: any = { name, role }

    // Only update password if provided
    if (password) {
      if (password.length < 6) {
        return NextResponse.json(
          { success: false, error: "Password baru minimal 6 karakter" },
          { status: 400 }
        )
      }
      updateData.passwordHash = await hashPassword(password)
    }

    const user = await db.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ success: true, data: user, message: "Pengguna berhasil diperbarui" })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal memperbarui pengguna" },
      { status: 500 }
    )
  }
}

// DELETE: Remove a user
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existing = await db.user.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Pengguna tidak ditemukan" },
        { status: 404 }
      )
    }

    // Prevent deleting the last ADMIN
    if (existing.role === "ADMIN") {
      const adminCount = await db.user.count({ where: { role: "ADMIN" } })
      if (adminCount <= 1) {
        return NextResponse.json(
          { success: false, error: "Tidak dapat menghapus admin terakhir. Minimal harus ada 1 akun admin." },
          { status: 400 }
        )
      }
    }

    await db.user.delete({ where: { id } })

    return NextResponse.json({ success: true, message: "Pengguna berhasil dihapus" })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal menghapus pengguna" },
      { status: 500 }
    )
  }
}

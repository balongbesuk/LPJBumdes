import { db } from "@/lib/db"

export async function logActivity(
  action: string,
  detail: string,
  user: { id: string; username: string; name: string; role: string }
) {
  try {
    return await db.auditLog.create({
      data: {
        userId: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        action,
        detail
      }
    })
  } catch (error) {
    console.error("Gagal mencatat log aktivitas:", error)
  }
}

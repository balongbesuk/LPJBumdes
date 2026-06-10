import { db } from "@/lib/db"

export async function isPeriodLocked(dateInput: Date | string | number): Promise<boolean> {
  try {
    const date = new Date(dateInput)
    if (isNaN(date.getTime())) return false
    
    const year = date.getFullYear()
    const month = date.getMonth() + 1 // 1-indexed

    const lock = await db.periodLock.findUnique({
      where: {
        year_month: {
          year,
          month
        }
      }
    })

    return !!lock?.locked
  } catch (error) {
    console.error("Gagal memeriksa kunci periode:", error)
    return false
  }
}

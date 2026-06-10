import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const settingsList = await db.setting.findMany()
    const settings: Record<string, string> = {}
    settingsList.forEach((s) => {
      settings[s.key] = s.value
    })
    return NextResponse.json({ success: true, data: settings })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal mengambil pengaturan" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate SHU if provided
    const pengurus = parseFloat(body.shu_pengurus_pct)
    const pengawas = parseFloat(body.shu_pengawas_pct)
    const sosial = parseFloat(body.shu_sosial_pct)
    const modal = parseFloat(body.shu_modal_pct)
    const desa = parseFloat(body.shu_desa_pct)

    if (
      !isNaN(pengurus) &&
      !isNaN(pengawas) &&
      !isNaN(sosial) &&
      !isNaN(modal) &&
      !isNaN(desa)
    ) {
      const total = pengurus + pengawas + sosial + modal + desa
      if (Math.abs(total - 100) > 0.01) {
        return NextResponse.json(
          { success: false, error: "Total persentase alokasi SHU harus tepat 100% (saat ini: " + total + "%)" },
          { status: 400 }
        )
      }
    }

    // Save each key-value pair
    for (const key of Object.keys(body)) {
      await db.setting.upsert({
        where: { key },
        update: { value: String(body[key]) },
        create: { key, value: String(body[key]) }
      })
    }

    return NextResponse.json({ success: true, message: "Pengaturan berhasil diperbarui" })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal memperbarui pengaturan" },
      { status: 500 }
    )
  }
}

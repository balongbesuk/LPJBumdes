import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    // Return current settings and whether setup is complete
    const settingsList = await db.setting.findMany()
    const settings: Record<string, string> = {}
    settingsList.forEach((s) => {
      settings[s.key] = s.value
    })
    const isComplete = !!settings.bumdes_name && settings.bumdes_name.trim().length > 0
    return NextResponse.json({ success: true, data: settings, isComplete })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal mengambil data setup" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.bumdes_name || !body.bumdes_name.trim()) {
      return NextResponse.json(
        { success: false, error: "Nama BUMDES wajib diisi" },
        { status: 400 }
      )
    }
    if (!body.village_name || !body.village_name.trim()) {
      return NextResponse.json(
        { success: false, error: "Nama Desa wajib diisi" },
        { status: 400 }
      )
    }

    // Validate SHU if provided
    const shuKeys = ["shu_pengurus_pct", "shu_pengawas_pct", "shu_sosial_pct", "shu_modal_pct", "shu_desa_pct"]
    const shuValues = shuKeys.map((k) => parseFloat(body[k]))
    if (shuValues.every((v) => !isNaN(v))) {
      const total = shuValues.reduce((a, b) => a + b, 0)
      if (Math.abs(total - 100) > 0.01) {
        return NextResponse.json(
          { success: false, error: `Total alokasi SHU harus tepat 100% (saat ini: ${total}%)` },
          { status: 400 }
        )
      }
    }

    // Save profile and SHU settings
    const settingKeys = [
      "bumdes_name", "village_name", "district_name", "regency_name",
      ...shuKeys
    ]
    for (const key of settingKeys) {
      if (body[key] !== undefined) {
        await db.setting.upsert({
          where: { key },
          update: { value: String(body[key]) },
          create: { key, value: String(body[key]) }
        })
      }
    }

    // Create opening journal entry if opening balances are provided
    const openingBalances = body.openingBalances
    if (openingBalances && typeof openingBalances === "object") {
      const debits: { accountCode: string; amount: number }[] = []
      const credits: { accountCode: string; amount: number }[] = []

      // Map the form fields to account codes
      const accountMapping: Record<string, { code: string; side: "DEBIT" | "CREDIT" }> = {
        kas_bumdes: { code: "1-1100", side: "DEBIT" },
        kas_gedung: { code: "1-1200", side: "DEBIT" },
        kas_lapak: { code: "1-1300", side: "DEBIT" },
        piutang_masyarakat: { code: "1-1400", side: "DEBIT" },
        piutang_gapoktan: { code: "1-1500", side: "DEBIT" },
        peralatan: { code: "1-2100", side: "DEBIT" },
        akum_penyusutan: { code: "1-2200", side: "CREDIT" },
        simpanan_pokok: { code: "2-1100", side: "CREDIT" },
        simpanan_wajib: { code: "2-1200", side: "CREDIT" },
        hutang_shu: { code: "2-1300", side: "CREDIT" },
        modal_desa: { code: "3-1100", side: "CREDIT" },
      }

      let hasAnyBalance = false
      for (const [fieldKey, mapping] of Object.entries(accountMapping)) {
        const val = parseFloat(openingBalances[fieldKey])
        if (!isNaN(val) && val > 0) {
          hasAnyBalance = true
          if (mapping.side === "DEBIT") {
            debits.push({ accountCode: mapping.code, amount: val })
          } else {
            credits.push({ accountCode: mapping.code, amount: val })
          }
        }
      }

      if (hasAnyBalance) {
        const year = new Date().getFullYear()
        const entry = await db.journalEntry.create({
          data: {
            date: new Date(`${year}-01-01T00:00:00.000Z`),
            description: `Jurnal Pembuka Saldo Awal Tahun Anggaran ${year}`,
            unitUsaha: "UMUM"
          }
        })

        for (const d of debits) {
          await db.journalLine.create({
            data: {
              journalEntryId: entry.id,
              accountCode: d.accountCode,
              type: "DEBIT",
              amount: d.amount
            }
          })
        }
        for (const c of credits) {
          await db.journalLine.create({
            data: {
              journalEntryId: entry.id,
              accountCode: c.accountCode,
              type: "CREDIT",
              amount: c.amount
            }
          })
        }
      }
    }

    return NextResponse.json({ success: true, message: "Setup berhasil! Sistem siap digunakan." })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Gagal menyimpan konfigurasi" },
      { status: 500 }
    )
  }
}

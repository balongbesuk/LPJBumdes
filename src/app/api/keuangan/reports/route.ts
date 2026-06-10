import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getAccountBalance } from "@/lib/ledger"

export async function GET() {
  try {
    // 1. Calculate Revenue Accounts
    const revSp = await getAccountBalance("4-1100")
    const revGedung = await getAccountBalance("4-1200")
    const revLapak = await getAccountBalance("4-1300")
    const revPpob = await getAccountBalance("4-1400")
    const revBungaBank = await getAccountBalance("4-1500")

    // 2. Calculate Expense Accounts
    const expBumdes = await getAccountBalance("5-1100")
    const expLapak = await getAccountBalance("5-1200")
    const expGedung = await getAccountBalance("5-1300")
    const expPenyusutan = await getAccountBalance("5-1400")
    const expAdminBank = await getAccountBalance("5-1500")

    // Laba Rugi calculations
    const revenues = [
      { code: "4-1100", name: "Pendapatan Jasa Simpan Pinjam", amount: revSp },
      { code: "4-1200", name: "Pendapatan Sewa Gedung (GSG)", amount: revGedung },
      { code: "4-1300", name: "Pendapatan Sewa Lapak & Warung", amount: revLapak },
      { code: "4-1400", name: "Pendapatan Komisi Agen Pos/PPOB", amount: revPpob },
      { code: "4-1500", name: "Pendapatan Bunga Bank", amount: revBungaBank }
    ]

    const expenses = [
      { code: "5-1100", name: "Biaya Operasional Pengurus BUMDES", amount: expBumdes },
      { code: "5-1200", name: "Biaya Operasional Unit Lapak & Warung", amount: expLapak },
      { code: "5-1300", name: "Biaya Operasional Unit Gedung", amount: expGedung },
      { code: "5-1400", name: "Biaya Penyusutan Aktiva Tetap", amount: expPenyusutan },
      { code: "5-1500", name: "Biaya Administrasi Bank & Pajak", amount: expAdminBank }
    ]

    const totalRevenue = revenues.reduce((sum, r) => sum + r.amount, 0)
    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0)
    const netProfit = totalRevenue - totalExpense

    // 3. Calculate Asset Accounts
    const assetKasBumdes = await getAccountBalance("1-1100")
    const assetKasGedung = await getAccountBalance("1-1200")
    const assetKasLapak = await getAccountBalance("1-1300")
    const assetPiutangMasy = await getAccountBalance("1-1400")
    const assetPiutangGapoktan = await getAccountBalance("1-1500")
    const assetPeralatan = await getAccountBalance("1-2100")
    // Contra asset (Akumulasi Penyusutan) holds credit balance.
    // getAccountBalance will return credit-debit or debit-credit depending on account type.
    // Let's get raw credit sum for Akumulasi Penyusutan:
    const accumDepLines = await db.journalLine.findMany({ where: { accountCode: "1-2200" } })
    const accumDepDebit = accumDepLines.filter(l => l.type === "DEBIT").reduce((sum, l) => sum + l.amount, 0)
    const accumDepCredit = accumDepLines.filter(l => l.type === "CREDIT").reduce((sum, l) => sum + l.amount, 0)
    const assetAccumDep = accumDepCredit - accumDepDebit // Positive as credit, but will subtract in Assets presentation

    const currentAssets = [
      { name: "Kas/Bank BUMDES", amount: assetKasBumdes },
      { name: "Kas/Bank Unit Gedung (GSG)", amount: assetKasGedung },
      { name: "Kas/Bank Unit Lapak & Warung", amount: assetKasLapak },
      { name: "Piutang Pinjaman Masyarakat", amount: assetPiutangMasy },
      { name: "Piutang Pinjaman Gapoktan", amount: assetPiutangGapoktan }
    ]

    const totalCurrentAssets = currentAssets.reduce((sum, a) => sum + a.amount, 0)
    const netFixedAssets = assetPeralatan - assetAccumDep
    const totalAssets = totalCurrentAssets + netFixedAssets

    // 4. Calculate Liability Accounts
    const liabPokok = await getAccountBalance("2-1100")
    const liabWajib = await getAccountBalance("2-1200")
    const liabShu = await getAccountBalance("2-1300")

    const liabilities = [
      { name: "Tabungan Simpanan Pokok Anggota", amount: liabPokok },
      { name: "Tabungan Simpanan Wajib Anggota", amount: liabWajib },
      { name: "Hutang SHU Belum Dibagi", amount: liabShu }
    ]
    const totalLiabilities = liabilities.reduce((sum, l) => sum + l.amount, 0)

    // 5. Calculate Equity Accounts
    const eqModalAwal = await getAccountBalance("3-1100")
    const eqLabaDitahan = await getAccountBalance("3-1200") // This represents Penambahan Modal

    const equity = [
      { name: "Modal Awal Desa", amount: eqModalAwal },
      { name: "Laba Ditahan / Penambahan Modal", amount: eqLabaDitahan },
      { name: "Laba Tahun Berjalan", amount: netProfit } // Current Year Net Profit increases Equity
    ]
    const totalEquity = equity.reduce((sum, e) => sum + e.amount, 0)
    const totalLiabilitiesAndEquity = totalLiabilities + totalEquity

    // Settings for SHU calculation
    const settingsList = await db.setting.findMany()
    const settings = settingsList.reduce((map: any, s) => {
      map[s.key] = s.value
      return map
    }, {})

    return NextResponse.json({
      success: true,
      data: {
        labaRugi: {
          revenues,
          expenses,
          totalRevenue,
          totalExpense,
          netProfit
        },
        neraca: {
          currentAssets,
          totalCurrentAssets,
          fixedAssets: {
            peralatan: assetPeralatan,
            akumulasiPenyusutan: assetAccumDep,
            net: netFixedAssets
          },
          totalAssets,
          liabilities,
          totalLiabilities,
          equity,
          totalEquity,
          totalLiabilitiesAndEquity
        },
        shuSettings: {
          pengurus: parseFloat(settings.shu_pengurus_pct || "30"),
          pengawas: parseFloat(settings.shu_pengawas_pct || "10"),
          sosial: parseFloat(settings.shu_sosial_pct || "10"),
          modal: parseFloat(settings.shu_modal_pct || "25"),
          desa: parseFloat(settings.shu_desa_pct || "25")
        }
      }
    })
  } catch (error: any) {
    console.error("Fetch reports error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate financial reports" },
      { status: 500 }
    )
  }
}

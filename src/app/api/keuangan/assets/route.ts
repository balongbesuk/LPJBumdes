import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { isPeriodLocked } from "@/lib/period-lock"
import { logActivity } from "@/lib/audit"
import { cookies } from "next/headers"

function getUserSession() {
  const cookieStore = cookies()
  const userCookie = cookieStore.get("bumdes_user")
  if (!userCookie) return null
  try {
    return JSON.parse(userCookie.value)
  } catch (_) {
    return null
  }
}

// GET: Fetch all fixed assets
export async function GET() {
  try {
    const assets = await db.fixedAsset.findMany({
      orderBy: { code: "asc" }
    })
    return NextResponse.json({ success: true, data: assets })
  } catch (error: any) {
    console.error("Fetch assets error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch assets" },
      { status: 500 }
    )
  }
}

// POST: Add a new fixed asset purchase
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { date, name, purchaseCost, economicLife } = body

    const txDate = date ? new Date(date) : new Date()

    if (await isPeriodLocked(txDate)) {
      return NextResponse.json(
        { success: false, error: "Transaksi ditolak. Periode keuangan untuk tanggal tersebut telah dikunci (Tutup Buku)." },
        { status: 400 }
      )
    }

    if (!name || !purchaseCost || !economicLife) {
      return NextResponse.json(
        { success: false, error: "Semua data (nama aset, harga perolehan, umur ekonomis) harus diisi." },
        { status: 400 }
      )
    }

    const costVal = parseFloat(purchaseCost)
    const lifeVal = parseInt(economicLife, 10)

    if (costVal <= 0 || lifeVal <= 0) {
      return NextResponse.json(
        { success: false, error: "Harga perolehan dan umur ekonomis harus lebih dari 0." },
        { status: 400 }
      )
    }

    // Auto-generate asset code: AST-001, AST-002, etc.
    const lastAsset = await db.fixedAsset.findFirst({
      orderBy: { code: "desc" }
    })
    let nextCode = "AST-001"
    if (lastAsset && lastAsset.code.startsWith("AST-")) {
      const num = parseInt(lastAsset.code.split("-")[1], 10)
      nextCode = `AST-${String(num + 1).padStart(3, "0")}`
    }

    const depRate = 100 / lifeVal // Straight line depreciation percentage

    const result = await db.$transaction(async (tx) => {
      // 1. Create fixed asset record
      const asset = await tx.fixedAsset.create({
        data: {
          code: nextCode,
          name,
          purchaseDate: txDate,
          purchaseCost: costVal,
          economicLife: lifeVal,
          depreciationRate: depRate,
          accumDep: 0
        }
      })

      // 2. Post Jurnal pembelian asset
      const journal = await tx.journalEntry.create({
        data: {
          date: txDate,
          description: `Pembelian Inventaris Aset Tetap ${nextCode} - ${name}`,
          unitUsaha: "UMUM"
        }
      })

      // Debit: Peralatan & Inventaris (1-2100)
      // Credit: Kas/Bank BUMDES (1-1100)
      await tx.journalLine.createMany({
        data: [
          {
            journalEntryId: journal.id,
            accountCode: "1-2100", // Peralatan & Inventaris
            type: "DEBIT",
            amount: costVal
          },
          {
            journalEntryId: journal.id,
            accountCode: "1-1100", // Kas/Bank BUMDES
            type: "CREDIT",
            amount: costVal
          }
        ]
      })

      return asset
    })

    // Log activity
    const session = getUserSession()
    if (session) {
      const actDetail = `Membeli aset tetap ${nextCode} - ${name} senilai Rp ${costVal.toLocaleString("id-ID")}`
      await logActivity("ADD_FIXED_ASSET", actDetail, session)
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error: any) {
    console.error("Add asset error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to add fixed asset" },
      { status: 500 }
    )
  }
}

// PUT: Calculate and post annual depreciation expenses
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { year } = body

    if (!year) {
      return NextResponse.json(
        { success: false, error: "Tahun penyusutan harus ditentukan." },
        { status: 400 }
      )
    }

    const txDate = new Date(`${year}-12-31`)

    if (await isPeriodLocked(txDate)) {
      return NextResponse.json(
        { success: false, error: `Transaksi ditolak. Periode pembukuan bulan Desember ${year} telah dikunci (Tutup Buku).` },
        { status: 400 }
      )
    }

    // Get all assets that are not fully depreciated
    const assets = await db.fixedAsset.findMany()
    const activeAssets = assets.filter(a => a.accumDep < a.purchaseCost)

    if (activeAssets.length === 0) {
      return NextResponse.json(
        { success: false, error: "Tidak ada aset aktif yang perlu disusutkan." },
        { status: 400 }
      )
    }

    const result = await db.$transaction(async (tx) => {
      let totalDeprecAmount = 0
      const updatedAssetIds: string[] = []

      for (const asset of activeAssets) {
        // Annual depreciation amount
        const annualDep = asset.purchaseCost * (asset.depreciationRate / 100)
        // Ensure accumDep doesn't exceed purchaseCost
        const maxAllowedDep = asset.purchaseCost - asset.accumDep
        const deprecAmount = Math.min(annualDep, maxAllowedDep)

        if (deprecAmount > 0) {
          totalDeprecAmount += deprecAmount
          await tx.fixedAsset.update({
            where: { id: asset.id },
            data: {
              accumDep: asset.accumDep + deprecAmount
            }
          })
          updatedAssetIds.push(asset.id)
        }
      }

      if (totalDeprecAmount === 0) {
        throw new Error("Penyusutan tidak dapat diproses (nilai penyusutan Rp 0).")
      }

      // Post Jurnal Penyusutan
      const journal = await tx.journalEntry.create({
        data: {
          date: txDate,
          description: `Pencatatan Depresiasi/Penyusutan Aset Tetap BUMDES Tahun ${year}`,
          unitUsaha: "UMUM"
        }
      })

      // Debit: Biaya Penyusutan Aktiva Tetap (5-1400)
      // Credit: Akumulasi Penyusutan Peralatan (1-2200)
      await tx.journalLine.createMany({
        data: [
          {
            journalEntryId: journal.id,
            accountCode: "5-1400", // Biaya Penyusutan Aktiva Tetap
            type: "DEBIT",
            amount: totalDeprecAmount
          },
          {
            journalEntryId: journal.id,
            accountCode: "1-2200", // Akumulasi Penyusutan Peralatan
            type: "CREDIT",
            amount: totalDeprecAmount
          }
        ]
      })

      return { totalDeprecAmount, count: updatedAssetIds.length }
    })

    // Log activity
    const session = getUserSession()
    if (session) {
      const actDetail = `Menjalankan penyusutan aset tetap tahun ${year} senilai Rp ${result.totalDeprecAmount.toLocaleString("id-ID")} untuk ${result.count} barang`
      await logActivity("DEPRECIATE_ASSETS", actDetail, session)
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error: any) {
    console.error("Depreciation error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Gagal memproses penyusutan aset" },
      { status: 500 }
    )
  }
}

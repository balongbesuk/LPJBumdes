import { getUserSession } from "@/lib/auth"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getAccountBalance } from "@/lib/ledger"
import { isPeriodLocked } from "@/lib/period-lock"
import { logActivity } from "@/lib/audit"
// POST: Execute year-end closing entries and lock December period
export async function POST(request: Request) {
  try {
    const session = await getUserSession()
    if (!session || (session.role !== "ADMIN" && session.role !== "BENDAHARA")) {
      return NextResponse.json(
        { success: false, error: "Hanya Admin dan Bendahara yang memiliki wewenang Tutup Buku Tahunan" },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { year } = body

    if (!year) {
      return NextResponse.json(
        { success: false, error: "Tahun buku harus ditentukan." },
        { status: 400 }
      )
    }

    const parsedYear = parseInt(year, 10)
    const closingDate = new Date(`${parsedYear}-12-31T23:59:59Z`)

    // Verify December is not already locked.
    // If it is already locked and they want to close again, they must first unlock it.
    const lockRecord = await db.periodLock.findUnique({
      where: {
        year_month: {
          year: parsedYear,
          month: 12
        }
      }
    })

    if (lockRecord?.locked) {
      return NextResponse.json(
        {
          success: false,
          error: `Desember ${parsedYear} telah dikunci. Silakan buka kunci periode Desember terlebih dahulu di tab Kunci Periode jika ingin memposting ulang jurnal penutup.`
        },
        { status: 400 }
      )
    }

    // Check if Jurnal Penutup already exists for this year
    const existingClosing = await db.journalEntry.findFirst({
      where: {
        description: {
          startsWith: `Jurnal Penutup (Closing Entry) Akhir Tahun ${parsedYear}`
        }
      }
    })

    if (existingClosing) {
      return NextResponse.json(
        {
          success: false,
          error: `Jurnal penutup untuk tahun ${parsedYear} sudah pernah dibuat. Hapus jurnal tersebut secara manual jika ingin memposting ulang.`
        },
        { status: 400 }
      )
    }

    // Check if Jurnal Penyusutan has already been run for this year
    const existingDepreciation = await db.journalEntry.findFirst({
      where: {
        description: {
          contains: `Pencatatan Depresiasi/Penyusutan Aset Tetap BUMDES Tahun ${parsedYear}`
        }
      }
    })

    if (!existingDepreciation) {
      // Fetch all assets that are not fully depreciated
      const assets = await db.fixedAsset.findMany()
      const activeAssets = assets.filter(a => a.accumDep < a.purchaseCost)

      if (activeAssets.length > 0) {
        const depDate = new Date(`${parsedYear}-12-31T23:59:58Z`)
        
        await db.$transaction(async (tx) => {
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

          if (totalDeprecAmount > 0) {
            // Post Jurnal Penyusutan
            const journal = await tx.journalEntry.create({
              data: {
                date: depDate,
                description: `Pencatatan Depresiasi/Penyusutan Aset Tetap BUMDES Tahun ${parsedYear} (Otomatis saat Tutup Buku)`,
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

            // Log activity
            const actDetail = `Menjalankan penyusutan aset tetap tahun ${parsedYear} secara otomatis senilai Rp ${totalDeprecAmount.toLocaleString("id-ID")} untuk ${updatedAssetIds.length} barang saat Tutup Buku`
            await logActivity("DEPRECIATE_ASSETS", actDetail, session)
          }
        })
      }
    }

    // Fetch all LedgerAccounts
    const accounts = await db.ledgerAccount.findMany()

    // Calculate balances for revenues and expenses
    const revenueAccounts = accounts.filter(acc => acc.type === "REVENUE")
    const expenseAccounts = accounts.filter(acc => acc.type === "EXPENSE")

    const revenueBalances = []
    for (const acc of revenueAccounts) {
      const balance = await getAccountBalance(acc.code)
      if (Math.abs(balance) > 0.01) {
        revenueBalances.push({ code: acc.code, name: acc.name, balance })
      }
    }

    const expenseBalances = []
    for (const acc of expenseAccounts) {
      const balance = await getAccountBalance(acc.code)
      if (Math.abs(balance) > 0.01) {
        expenseBalances.push({ code: acc.code, name: acc.name, balance })
      }
    }

    if (revenueBalances.length === 0 && expenseBalances.length === 0) {
      return NextResponse.json(
        { success: false, error: "Tidak ada saldo pendapatan atau beban aktif yang perlu ditutup untuk tahun ini." },
        { status: 400 }
      )
    }

    const totalRevenue = revenueBalances.reduce((sum, r) => sum + r.balance, 0)
    const totalExpense = expenseBalances.reduce((sum, e) => sum + e.balance, 0)
    const netProfit = totalRevenue - totalExpense

    // Construct Journal Lines for closing
    const journalLines: { accountCode: string; type: "DEBIT" | "CREDIT"; amount: number }[] = []

    // 1. Debit all revenue accounts with positive balance
    for (const rev of revenueBalances) {
      journalLines.push({
        accountCode: rev.code,
        type: "DEBIT",
        amount: rev.balance
      })
    }

    // 2. Credit all expense accounts with positive balance
    for (const exp of expenseBalances) {
      journalLines.push({
        accountCode: exp.code,
        type: "CREDIT",
        amount: exp.balance
      })
    }

    // 3. Credit (if profit) or Debit (if loss) Laba Ditahan / Penambahan Modal (3-1200)
    if (Math.abs(netProfit) > 0.01) {
      journalLines.push({
        accountCode: "3-1200", // Laba Ditahan / Penambahan Modal
        type: netProfit > 0 ? "CREDIT" : "DEBIT",
        amount: Math.abs(netProfit)
      })
    }

    // Post everything in a single transaction
    const result = await db.$transaction(async (tx) => {
      // Create closing journal entry
      const journal = await tx.journalEntry.create({
        data: {
          date: closingDate,
          description: `Jurnal Penutup (Closing Entry) Akhir Tahun ${parsedYear} - Memindahkan Laba Bersih Rp ${netProfit.toLocaleString("id-ID")}`,
          unitUsaha: "UMUM"
        }
      })

      // Create journal lines
      for (const line of journalLines) {
        await tx.journalLine.create({
          data: {
            journalEntryId: journal.id,
            accountCode: line.accountCode,
            type: line.type,
            amount: line.amount
          }
        })
      }

      // Lock December period automatically
      const lock = await tx.periodLock.upsert({
        where: {
          year_month: {
            year: parsedYear,
            month: 12
          }
        },
        update: {
          locked: true,
          lockedBy: session.name
        },
        create: {
          year: parsedYear,
          month: 12,
          locked: true,
          lockedBy: session.name
        }
      })

      return { journalId: journal.id, netProfit, lock }
    })

    const actDetail = `Menjalankan Jurnal Penutup dan Tutup Buku Akhir Tahun ${parsedYear} dengan laba bersih Rp ${netProfit.toLocaleString("id-ID")}`
    await logActivity("CLOSE_FISCAL_YEAR", actDetail, session)

    return NextResponse.json({
      success: true,
      message: `Berhasil melakukan Tutup Buku Akhir Tahun ${parsedYear}. Saldo nominal pendapatan & beban di-reset ke 0 dan laba ditransfer ke Modal Laba Ditahan.`,
      data: result
    })
  } catch (error: any) {
    console.error("Year closing error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Gagal memproses jurnal penutup tahunan" },
      { status: 500 }
    )
  }
}

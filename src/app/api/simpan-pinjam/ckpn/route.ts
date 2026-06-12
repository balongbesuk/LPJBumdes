import { getUserSession } from "@/lib/auth"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { isPeriodLocked } from "@/lib/period-lock"
import { logActivity } from "@/lib/audit"
// Ensure CKPN accounts exist in the LedgerAccount table
async function ensureCkpnAccounts() {
  await db.ledgerAccount.upsert({
    where: { code: "1-1450" },
    update: {},
    create: {
      code: "1-1450",
      name: "Penyisihan Kerugian Piutang",
      type: "ASSET"
    }
  })

  await db.ledgerAccount.upsert({
    where: { code: "5-1600" },
    update: {},
    create: {
      code: "5-1600",
      name: "Beban Kerugian Piutang Tak Tertagih",
      type: "EXPENSE"
    }
  })
}

// GET: Calculate CKPN recommendations
export async function GET() {
  try {
    const session = await getUserSession()
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    await ensureCkpnAccounts()

    // Find all active/late loans
    const loans = await db.loan.findMany({
      where: {
        status: { in: ["ACTIVE", "LATE"] }
      },
      include: {
        member: true,
        repayments: true
      }
    })

    const loanDetails = loans.map(loan => {
      const totalPaidPrincipal = loan.repayments.reduce((sum, r) => sum + r.principalPaid, 0)
      const outstanding = Math.max(loan.principal - totalPaidPrincipal, 0)
      // Rate: Lancar (ACTIVE) = 0.5%, Macet (LATE) = 50%
      const rate = loan.status === "LATE" ? 0.50 : 0.005
      const targetAllowance = outstanding * rate

      return {
        id: loan.id,
        memberCode: loan.member.code,
        memberName: loan.member.name,
        type: loan.type,
        principal: loan.principal,
        outstanding,
        status: loan.status,
        rate: rate * 100,
        targetAllowance
      }
    })

    const totalTargetAllowance = loanDetails.reduce((sum, d) => sum + d.targetAllowance, 0)

    // Calculate current allowance in ledger (Credit - Debit for 1-1450)
    const lines = await db.journalLine.findMany({ where: { accountCode: "1-1450" } })
    const debitSum = lines.filter(l => l.type === "DEBIT").reduce((sum, l) => sum + l.amount, 0)
    const creditSum = lines.filter(l => l.type === "CREDIT").reduce((sum, l) => sum + l.amount, 0)
    const currentAllowance = Math.max(creditSum - debitSum, 0)

    const adjustmentNeeded = totalTargetAllowance - currentAllowance

    return NextResponse.json({
      success: true,
      data: {
        loans: loanDetails,
        totalTargetAllowance,
        currentAllowance,
        adjustmentNeeded
      }
    })
  } catch (error: any) {
    console.error("Calculate CKPN error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Gagal mengkalkulasi CKPN" },
      { status: 500 }
    )
  }
}

// POST: Post CKPN adjustment journal entry
export async function POST(request: Request) {
  try {
    const session = await getUserSession()
    if (!session || (session.role !== "ADMIN" && session.role !== "BENDAHARA")) {
      return NextResponse.json(
        { success: false, error: "Hanya Admin dan Bendahara yang memiliki wewenang mencatat CKPN" },
        { status: 403 }
      )
    }

    await ensureCkpnAccounts()

    const body = await request.json()
    const { date } = body
    const txDate = date ? new Date(date) : new Date()

    if (await isPeriodLocked(txDate)) {
      return NextResponse.json(
        { success: false, error: "Transaksi ditolak. Periode keuangan untuk tanggal tersebut telah dikunci (Tutup Buku)." },
        { status: 400 }
      )
    }

    // 1. Re-calculate target and current allowance
    const loans = await db.loan.findMany({
      where: {
        status: { in: ["ACTIVE", "LATE"] }
      },
      include: {
        repayments: true
      }
    })

    let totalTargetAllowance = 0
    for (const loan of loans) {
      const totalPaidPrincipal = loan.repayments.reduce((sum, r) => sum + r.principalPaid, 0)
      const outstanding = Math.max(loan.principal - totalPaidPrincipal, 0)
      const rate = loan.status === "LATE" ? 0.50 : 0.005
      totalTargetAllowance += outstanding * rate
    }

    const lines = await db.journalLine.findMany({ where: { accountCode: "1-1450" } })
    const debitSum = lines.filter(l => l.type === "DEBIT").reduce((sum, l) => sum + l.amount, 0)
    const creditSum = lines.filter(l => l.type === "CREDIT").reduce((sum, l) => sum + l.amount, 0)
    const currentAllowance = Math.max(creditSum - debitSum, 0)

    const adjustmentNeeded = totalTargetAllowance - currentAllowance

    if (Math.abs(adjustmentNeeded) < 0.01) {
      return NextResponse.json({
        success: true,
        message: "Tidak diperlukan penyesuaian CKPN. Saldo cadangan sudah sesuai target."
      })
    }

    const result = await db.$transaction(async (tx) => {
      const journal = await tx.journalEntry.create({
        data: {
          date: txDate,
          description: `Penyesuaian Cadangan Kerugian Piutang (CKPN) Simpan Pinjam - Saldo Target: Rp ${totalTargetAllowance.toLocaleString("id-ID")}`,
          unitUsaha: "SP"
        }
      })

      const absAdjustment = Math.abs(adjustmentNeeded)

      if (adjustmentNeeded > 0) {
        // Increase allowance: Debit Beban (5-1600), Credit Penyisihan (1-1450)
        await tx.journalLine.createMany({
          data: [
            {
              journalEntryId: journal.id,
              accountCode: "5-1600",
              type: "DEBIT",
              amount: absAdjustment
            },
            {
              journalEntryId: journal.id,
              accountCode: "1-1450",
              type: "CREDIT",
              amount: absAdjustment
            }
          ]
        })
      } else {
        // Decrease allowance (Reversal): Debit Penyisihan (1-1450), Credit Beban (5-1600)
        await tx.journalLine.createMany({
          data: [
            {
              journalEntryId: journal.id,
              accountCode: "1-1450",
              type: "DEBIT",
              amount: absAdjustment
            },
            {
              journalEntryId: journal.id,
              accountCode: "5-1600",
              type: "CREDIT",
              amount: absAdjustment
            }
          ]
        })
      }

      return { adjustment: adjustmentNeeded, target: totalTargetAllowance }
    })

    const actDetail = `Mencatat penyesuaian CKPN Simpan Pinjam senilai Rp ${Math.abs(adjustmentNeeded).toLocaleString("id-ID")} (${adjustmentNeeded > 0 ? "Peningkatan" : "Penurunan/Pemulihan"})`
    await logActivity("ADJUST_CKPN", actDetail, session)

    return NextResponse.json({
      success: true,
      message: `Berhasil menyesuaikan CKPN sebesar Rp ${Math.abs(adjustmentNeeded).toLocaleString("id-ID")}`,
      data: result
    })
  } catch (error: any) {
    console.error("Post CKPN error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Gagal mencatat penyesuaian CKPN" },
      { status: 500 }
    )
  }
}

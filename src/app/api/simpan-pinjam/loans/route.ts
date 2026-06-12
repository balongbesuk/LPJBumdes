import { getUserSession } from "@/lib/auth"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { isPeriodLocked } from "@/lib/period-lock"
import { logActivity } from "@/lib/audit"
import { formatRupiah } from "@/lib/utils"

// GET: Fetch all loans with member info
export async function GET() {
  try {
    const loans = await db.loan.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        member: true,
        repayments: true
      }
    })
    return NextResponse.json({ success: true, data: loans })
  } catch (error: any) {
    console.error("Fetch loans error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch loans" },
      { status: 500 }
    )
  }
}

// POST: Disburse a new loan
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { memberId, type, principal, interestRate, termMonths, date } = body

    const txDate = date ? new Date(date) : new Date()

    // Verify accounting period lock status (Tutup Buku)
    if (await isPeriodLocked(txDate)) {
      return NextResponse.json(
        { success: false, error: "Transaksi ditolak. Periode keuangan untuk tanggal tersebut telah dikunci (Tutup Buku)." },
        { status: 400 }
      )
    }

    if (!memberId || !type || !principal || interestRate === undefined || !termMonths) {
      return NextResponse.json(
        { success: false, error: "Semua data (memberId, type, principal, interestRate, termMonths) harus diisi" },
        { status: 400 }
      )
    }

    if (principal <= 0 || termMonths <= 0 || interestRate < 0) {
      return NextResponse.json(
        { success: false, error: "Nominal principal, jangka waktu, dan bunga harus valid (>= 0)" },
        { status: 400 }
      )
    }

    if (type !== "MASYARAKAT" && type !== "POKTAN") {
      return NextResponse.json(
        { success: false, error: "Tipe pinjaman harus MASYARAKAT atau POKTAN" },
        { status: 400 }
      )
    }

    const member = await db.member.findUnique({
      where: { id: memberId }
    })

    if (!member) {
      return NextResponse.json(
        { success: false, error: "Anggota tidak ditemukan" },
        { status: 404 }
      )
    }

    if (!member.isActive) {
      return NextResponse.json(
        { success: false, error: "Transaksi ditolak. Anggota tersebut sudah tidak aktif / keluar." },
        { status: 400 }
      )
    }

    // Check if member has an active loan already
    const activeLoan = await db.loan.findFirst({
      where: {
        memberId,
        status: "ACTIVE"
      }
    })

    if (activeLoan) {
      return NextResponse.json(
        {
          success: false,
          error: `Anggota ini masih memiliki pinjaman aktif senilai Rp ${activeLoan.principal.toLocaleString("id-ID")} dengan status ${activeLoan.status}. Harap lunasi terlebih dahulu.`
        },
        { status: 400 }
      )
    }

    // Check if BUMDES has enough cash to disburse this loan
    // Query balance of Kas BUMDES (1-1100)
    // For simplicity, we can query it and compare
    const lines = await db.journalLine.findMany({
      where: { accountCode: "1-1100" }
    })
    const debitSum = lines.filter(l => l.type === "DEBIT").reduce((sum, l) => sum + l.amount, 0)
    const creditSum = lines.filter(l => l.type === "CREDIT").reduce((sum, l) => sum + l.amount, 0)
    const currentCash = debitSum - creditSum

    if (currentCash < principal) {
      return NextResponse.json(
        {
          success: false,
          error: `Kas BUMDES tidak mencukupi untuk pencairan pinjaman. Saldo kas saat ini: Rp ${currentCash.toLocaleString("id-ID")}`
        },
        { status: 400 }
      )
    }

    // Calculate monthly installment (Bunga Flat)
    // Pokok Bulanan = Principal / Tenor
    // Bunga Bulanan = Principal * (InterestRate / 100)
    const monthlyPrincipal = principal / termMonths
    const monthlyInterest = principal * (interestRate / 100)
    const monthlyInstallment = monthlyPrincipal + monthlyInterest

    // Execute loan creation
    const loan = await db.$transaction(async (tx) => {
      // 1. Create loan record
      const dbLoan = await tx.loan.create({
        data: {
          memberId,
          type,
          principal,
          interestRate,
          monthlyInstallment,
          termMonths,
          status: "ACTIVE",
          createdAt: txDate
        }
      })

      // 2. Post journal entries
      const journal = await tx.journalEntry.create({
        data: {
          date: txDate,
          description: `Pencairan Pinjaman ${type} - ${member.code} - ${member.name} (Tenor ${termMonths} bln, Bunga ${interestRate}%)`,
          unitUsaha: "SP"
        }
      })

      const targetAccount = type === "MASYARAKAT" ? "1-1400" : "1-1500" // Piutang Masyarakat / Gapoktan

      // Debit: Piutang (1-1400 / 1-1500)
      // Credit: Kas BUMDES (1-1100)
      await tx.journalLine.createMany({
        data: [
          {
            journalEntryId: journal.id,
            accountCode: targetAccount,
            type: "DEBIT",
            amount: principal
          },
          {
            journalEntryId: journal.id,
            accountCode: "1-1100", // Kas BUMDES
            type: "CREDIT",
            amount: principal
          }
        ]
      })

      return dbLoan
    })

    // Write audit activity log
    const session = await getUserSession()
    if (session) {
      const actDetail = `Mencairkan pinjaman ${type} untuk ${member.name} (${member.code}) sebesar ${formatRupiah(principal)} dengan tenor ${termMonths} bulan`
      await logActivity("DISBURSE_LOAN", actDetail, session)
    }

    return NextResponse.json({ success: true, data: loan })
  } catch (error: any) {
    console.error("Create loan error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create loan" },
      { status: 500 }
    )
  }
}

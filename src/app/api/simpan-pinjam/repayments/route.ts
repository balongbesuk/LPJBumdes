import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { isPeriodLocked } from "@/lib/period-lock"
import { logActivity } from "@/lib/audit"
import { cookies } from "next/headers"
import { formatRupiah } from "@/lib/utils"

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

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { loanId, principalPaid, interestPaid, description, date } = body

    const txDate = date ? new Date(date) : new Date()

    // Verify accounting period lock status (Tutup Buku)
    if (await isPeriodLocked(txDate)) {
      return NextResponse.json(
        { success: false, error: "Transaksi ditolak. Periode keuangan untuk tanggal tersebut telah dikunci (Tutup Buku)." },
        { status: 400 }
      )
    }

    if (!loanId || principalPaid === undefined || interestPaid === undefined) {
      return NextResponse.json(
        { success: false, error: "Semua data (loanId, principalPaid, interestPaid) harus diisi" },
        { status: 400 }
      )
    }

    if (principalPaid < 0 || interestPaid < 0) {
      return NextResponse.json(
        { success: false, error: "Nominal pembayaran pokok dan bunga tidak boleh kurang dari 0" },
        { status: 400 }
      )
    }

    if (principalPaid === 0 && interestPaid === 0) {
      return NextResponse.json(
        { success: false, error: "Nominal pembayaran pokok atau bunga harus lebih dari 0" },
        { status: 400 }
      )
    }

    const loan = await db.loan.findUnique({
      where: { id: loanId },
      include: { member: true }
    })

    if (!loan) {
      return NextResponse.json(
        { success: false, error: "Data pinjaman tidak ditemukan" },
        { status: 404 }
      )
    }

    if (loan.status !== "ACTIVE") {
      return NextResponse.json(
        { success: false, error: `Pinjaman ini sudah tidak aktif (status: ${loan.status})` },
        { status: 400 }
      )
    }

    // Get previous repayments to calculate remaining principal
    const repayments = await db.loanRepayment.findMany({
      where: { loanId }
    })

    const totalPreviousPrincipal = repayments.reduce((sum, r) => sum + r.principalPaid, 0)
    const remainingPrincipal = loan.principal - totalPreviousPrincipal

    // Validation: make sure user doesn't pay more than the remaining principal
    if (principalPaid > remainingPrincipal + 10) { // allow small round-off threshold
      return NextResponse.json(
        {
          success: false,
          error: `Pembayaran pokok (Rp ${principalPaid.toLocaleString("id-ID")}) melebihi sisa pokok pinjaman (Rp ${remainingPrincipal.toLocaleString("id-ID")})`
        },
        { status: 400 }
      )
    }

    // Check if this payment will close/pay off the loan
    const isPaidOff = totalPreviousPrincipal + principalPaid >= loan.principal - 10 // allow small threshold

    const result = await db.$transaction(async (tx) => {
      // 1. Create repayment log
      const dbRepayment = await tx.loanRepayment.create({
        data: {
          loanId,
          principalPaid,
          interestPaid,
          date: txDate,
          description: description || `Angsuran Pinjaman: Pokok Rp ${principalPaid.toLocaleString("id-ID")}, Jasa Rp ${interestPaid.toLocaleString("id-ID")}`
        }
      })

      // 2. If paid off, update loan status
      if (isPaidOff) {
        await tx.loan.update({
          where: { id: loanId },
          data: { status: "PAID" }
        })
      }

      // 3. Post journal entries:
      // Debit: Kas BUMDES (1-1100) -> total (principal + interest)
      // Credit: Piutang Pinjaman (1-1400 / 1-1500) -> principal
      // Credit: Pendapatan Jasa Simpan Pinjam (4-1100) -> interest (jasa)
      const totalPaid = principalPaid + interestPaid
      const journal = await tx.journalEntry.create({
        data: {
          date: txDate,
          description: `Penerimaan Angsuran Pinjaman ${loan.type} - ${loan.member.code} - ${loan.member.name} (${isPaidOff ? "Lunas" : "Cicilan"})`,
          unitUsaha: "SP"
        }
      })

      const targetPiutangAccount = loan.type === "MASYARAKAT" ? "1-1400" : "1-1500"

      const lines = [
        {
          journalEntryId: journal.id,
          accountCode: "1-1100", // Kas BUMDES (debit increase)
          type: "DEBIT",
          amount: totalPaid
        }
      ]

      if (principalPaid > 0) {
        lines.push({
          journalEntryId: journal.id,
          accountCode: targetPiutangAccount, // Piutang Pinjaman (credit decrease)
          type: "CREDIT",
          amount: principalPaid
        })
      }

      if (interestPaid > 0) {
        lines.push({
          journalEntryId: journal.id,
          accountCode: "4-1100", // Pendapatan Jasa Simpan Pinjam (credit increase)
          type: "CREDIT",
          amount: interestPaid
        })
      }

      await tx.journalLine.createMany({
        data: lines
      })

      return dbRepayment
    })

    // Write audit activity log
    const session = getUserSession()
    if (session) {
      const actDetail = `Menerima angsuran pinjaman ${loan.type} dari ${loan.member.name} (${loan.member.code}) sebesar ${formatRupiah(principalPaid + interestPaid)} (${isPaidOff ? "Lunas" : "Cicilan"})`
      await logActivity("REPAY_LOAN", actDetail, session)
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error: any) {
    console.error("Loan repayment error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process loan repayment" },
      { status: 500 }
    )
  }
}

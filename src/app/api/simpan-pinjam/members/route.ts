import { getUserSession } from "@/lib/auth"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { postJournalEntry } from "@/lib/ledger"
import { logActivity } from "@/lib/audit"
// GET: Fetch all members
export async function GET() {
  try {
    const members = await db.member.findMany({
      orderBy: { code: "asc" },
      include: {
        loans: {
          where: { status: "ACTIVE" }
        }
      }
    })
    return NextResponse.json({ success: true, data: members })
  } catch (error: any) {
    console.error("Fetch members error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch members" },
      { status: 500 }
    )
  }
}

// POST: Create a new member
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, bayarPokok } = body

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { success: false, error: "Nama anggota harus diisi" },
        { status: 400 }
      )
    }

    // Auto-generate member code: find max code, increment by 1
    const lastMember = await db.member.findFirst({
      orderBy: { code: "desc" }
    })

    let nextCode = "M-001"
    if (lastMember && lastMember.code.startsWith("M-")) {
      const lastNumStr = lastMember.code.split("-")[1]
      const lastNum = parseInt(lastNumStr, 10)
      const nextNum = lastNum + 1
      nextCode = `M-${String(nextNum).padStart(3, "0")}`
    }

    const result = await db.$transaction(async (tx) => {
      // 1. Create Member
      const member = await tx.member.create({
        data: {
          code: nextCode,
          name: name.trim(),
          simpananPokok: bayarPokok ? 50000 : 0,
          simpananWajib: 0
        }
      })

      // 2. If initial Simpanan Pokok is paid
      if (bayarPokok) {
        // Create Saving Transaction
        await tx.savingTransaction.create({
          data: {
            memberId: member.id,
            type: "POKOK",
            amount: 50000,
            flow: "MASUK",
            description: `Setoran Simpanan Pokok awal pendaftaran anggota ${nextCode}`
          }
        })

        // Post Journal Entry to General Ledger:
        // Debit: Kas BUMDES (1-1100) -> 50.000
        // Credit: Tabungan Simpanan Pokok (2-1100) -> 50.000
        const journal = await tx.journalEntry.create({
          data: {
            date: new Date(),
            description: `Penerimaan Simpanan Pokok anggota baru ${nextCode} - ${member.name}`,
            unitUsaha: "SP"
          }
        })

        await tx.journalLine.createMany({
          data: [
            {
              journalEntryId: journal.id,
              accountCode: "1-1100", // Kas BUMDES
              type: "DEBIT",
              amount: 50000
            },
            {
              journalEntryId: journal.id,
              accountCode: "2-1100", // Tabungan Simpanan Pokok
              type: "CREDIT",
              amount: 50000
            }
          ]
        })
      }

      return member
    })

    return NextResponse.json({ success: true, data: result })
  } catch (error: any) {
    console.error("Create member error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create member" },
      { status: 500 }
    )
  }
}

// PUT: Edit member name or status
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, name, isActive } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID anggota harus diisi" },
        { status: 400 }
      )
    }

    if ((name === undefined || name.trim() === "") && isActive === undefined) {
      return NextResponse.json(
        { success: false, error: "Nama baru atau status keaktifan anggota harus diisi" },
        { status: 400 }
      )
    }

    // If deactivating, check validations (balance = 0, no active loans)
    if (isActive === false) {
      const member = await db.member.findUnique({
        where: { id },
        include: {
          loans: {
            where: { status: "ACTIVE" }
          }
        }
      })

      if (!member) {
        return NextResponse.json(
          { success: false, error: "Anggota tidak ditemukan" },
          { status: 404 }
        )
      }

      if (member.simpananPokok !== 0 || member.simpananWajib !== 0) {
        return NextResponse.json(
          {
            success: false,
            error: `Anggota tidak dapat dinonaktifkan karena masih memiliki saldo simpanan (Pokok: Rp ${member.simpananPokok.toLocaleString("id-ID")}, Wajib: Rp ${member.simpananWajib.toLocaleString("id-ID")}). Harap lakukan penarikan terlebih dahulu hingga saldo Rp 0.`
          },
          { status: 400 }
        )
      }

      if (member.loans.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: "Anggota tidak dapat dinonaktifkan karena masih memiliki pinjaman aktif yang belum lunas."
          },
          { status: 400 }
        )
      }
    }

    const dataToUpdate: any = {}
    if (name !== undefined && name.trim() !== "") {
      dataToUpdate.name = name.trim()
    }
    if (isActive !== undefined) {
      dataToUpdate.isActive = isActive
    }

    const updatedMember = await db.member.update({
      where: { id },
      data: dataToUpdate
    })

    // Log activity if isActive status is changed
    if (isActive !== undefined) {
      const session = await getUserSession()
      if (session) {
        const actType = isActive ? "ACTIVATE_MEMBER" : "DEACTIVATE_MEMBER"
        const actDetail = `${isActive ? "Mengaktifkan kembali" : "Menonaktifkan"} anggota ${updatedMember.name} (${updatedMember.code})`
        await logActivity(actType, actDetail, session)
      }
    }

    return NextResponse.json({ success: true, data: updatedMember })
  } catch (error: any) {
    console.error("Update member error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Gagal memperbarui anggota" },
      { status: 500 }
    )
  }
}

// DELETE: Delete member (only if no transactions exist)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID anggota harus diisi" },
        { status: 400 }
      )
    }

    // Check if member has transactions
    const savingsCount = await db.savingTransaction.count({
      where: { memberId: id }
    })
    const loansCount = await db.loan.count({
      where: { memberId: id }
    })

    if (savingsCount > 0 || loansCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Anggota ini tidak dapat dihapus karena sudah memiliki riwayat transaksi simpanan atau pinjaman. Untuk anggota yang keluar, silakan tarik seluruh sisa saldonya agar menjadi Rp 0."
        },
        { status: 400 }
      )
    }

    await db.member.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, message: "Anggota berhasil dihapus" })
  } catch (error: any) {
    console.error("Delete member error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Gagal menghapus anggota" },
      { status: 500 }
    )
  }
}

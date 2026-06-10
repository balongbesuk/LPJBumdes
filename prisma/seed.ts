import { PrismaClient } from "@prisma/client"
import * as crypto from "crypto"
import * as fs from "fs"
import * as path from "path"

const prisma = new PrismaClient()

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex")
}

async function main() {
  console.log("=== STARTING DATABASE SEEDING ===")

  console.log("Cleaning up existing database...")
  await prisma.savingTransaction.deleteMany()
  await prisma.loanRepayment.deleteMany()
  await prisma.loan.deleteMany()
  await prisma.gedungBooking.deleteMany()
  await prisma.lahanPayment.deleteMany()
  await prisma.lahanContract.deleteMany()
  await prisma.ppobRekap.deleteMany()
  await prisma.journalLine.deleteMany()
  await prisma.journalEntry.deleteMany()
  await prisma.post.deleteMany()
  await prisma.document.deleteMany()
  await prisma.member.deleteMany()

  // 1. Seed Default Users
  console.log("Seeding Users...")
  const users = [
    {
      username: "admin",
      passwordHash: hashPassword("admin123"),
      name: "Kepala BUMDES (Admin)",
      role: "ADMIN"
    },
    {
      username: "bendahara",
      passwordHash: hashPassword("bendahara123"),
      name: "Bendahara Keuangan",
      role: "BENDAHARA"
    },
    {
      username: "sekretaris",
      passwordHash: hashPassword("sekretaris123"),
      name: "Sekretaris BUMDES",
      role: "SEKRETARIS"
    },
    {
      username: "operator_sp",
      passwordHash: hashPassword("sp123"),
      name: "Operator Simpan Pinjam",
      role: "OPERATOR_SP"
    },
    {
      username: "operator_sewa",
      passwordHash: hashPassword("sewa123"),
      name: "Operator Sewa Gedung & Lahan",
      role: "OPERATOR_SEWA"
    }
  ]

  for (const user of users) {
    await prisma.user.upsert({
      where: { username: user.username },
      update: {},
      create: user
    })
  }

  // 2. Seed Chart of Accounts (Bagan Akun)
  console.log("Seeding Chart of Accounts...")
  const accounts = [
    // 1-xxxx: ASSETS
    { code: "1-1100", name: "Kas/Bank BUMDES", type: "ASSET" },
    { code: "1-1200", name: "Kas/Bank Unit Gedung (GSG)", type: "ASSET" },
    { code: "1-1300", name: "Kas/Bank Unit Lapak & Warung", type: "ASSET" },
    { code: "1-1400", name: "Piutang Pinjaman Masyarakat", type: "ASSET" },
    { code: "1-1500", name: "Piutang Pinjaman Gapoktan", type: "ASSET" },
    { code: "1-2100", name: "Peralatan & Inventaris", type: "ASSET" },
    { code: "1-2200", name: "Akumulasi Penyusutan Peralatan", type: "ASSET" }, // Contra-asset, holds negative or credit entries

    // 2-xxxx: LIABILITIES
    { code: "2-1100", name: "Tabungan Simpanan Pokok Anggota", type: "LIABILITY" },
    { code: "2-1200", name: "Tabungan Simpanan Wajib Anggota", type: "LIABILITY" },
    { code: "2-1300", name: "Hutang SHU Belum Dibagi", type: "LIABILITY" },
    { code: "2-1400", name: "Hutang Pajak", type: "LIABILITY" },

    // 3-xxxx: EQUITY
    { code: "3-1100", name: "Modal Awal Desa", type: "EQUITY" },
    { code: "3-1200", name: "Laba Ditahan / Penambahan Modal", type: "EQUITY" },

    // 4-xxxx: REVENUE
    { code: "4-1100", name: "Pendapatan Jasa Simpan Pinjam", type: "REVENUE" },
    { code: "4-1200", name: "Pendapatan Sewa Gedung", type: "REVENUE" },
    { code: "4-1300", name: "Pendapatan Sewa Lapak & Warung", type: "REVENUE" },
    { code: "4-1400", name: "Pendapatan Komisi Agen Pos/PPOB", type: "REVENUE" },
    { code: "4-1500", name: "Pendapatan Bunga Bank", type: "REVENUE" },

    // 5-xxxx: EXPENSES
    { code: "5-1100", name: "Biaya Operasional Pengurus BUMDES", type: "EXPENSE" },
    { code: "5-1200", name: "Biaya Operasional Unit Lapak & Warung", type: "EXPENSE" },
    { code: "5-1300", name: "Biaya Operasional Unit Gedung", type: "EXPENSE" },
    { code: "5-1400", name: "Biaya Penyusutan Aktiva Tetap", type: "EXPENSE" },
    { code: "5-1500", name: "Biaya Administrasi Bank & Pajak", type: "EXPENSE" }
  ]

  for (const acc of accounts) {
    await prisma.ledgerAccount.upsert({
      where: { code: acc.code },
      update: { name: acc.name, type: acc.type },
      create: acc
    })
  }

  // 3. Seed Opening Journal Entry (Saldo Awal 1 Jan 2026 / Per 31 Des 2025)
  console.log("Seeding Opening Journal Entry...")
  const openingJournal = await prisma.journalEntry.create({
    data: {
      date: new Date("2026-01-01T00:00:00.000Z"),
      description: "Jurnal Pembuka Saldo Awal Tahun Anggaran 2026 (Per 31 Des 2025)",
      unitUsaha: "UMUM"
    }
  })

  const journalLines = [
    // DEBITS
    { accountCode: "1-1100", type: "DEBIT", amount: 295050431.00 },
    { accountCode: "1-1200", type: "DEBIT", amount: 7748900.00 },
    { accountCode: "1-1300", type: "DEBIT", amount: 100000.00 },
    { accountCode: "1-1400", type: "DEBIT", amount: 61000000.00 },
    { accountCode: "1-1500", type: "DEBIT", amount: 28000000.00 },
    { accountCode: "1-2100", type: "DEBIT", amount: 21025000.00 },

    // CREDITS
    { accountCode: "1-2200", type: "CREDIT", amount: 19749996.00 },
    { accountCode: "2-1100", type: "CREDIT", amount: 2750000.00 },
    { accountCode: "2-1200", type: "CREDIT", amount: 15090000.00 },
    { accountCode: "2-1300", type: "CREDIT", amount: 27998321.25 },
    { accountCode: "3-1100", type: "CREDIT", amount: 347336013.75 }
  ]

  for (const line of journalLines) {
    await prisma.journalLine.create({
      data: {
        journalEntryId: openingJournal.id,
        accountCode: line.accountCode,
        type: line.type,
        amount: line.amount
      }
    })
  }

  // 4. Import Members & Savings Balances from JSON
  console.log("Importing Members & Savings Balances from JSON...")
  const seedMembersPath = path.join(__dirname, "seed_members.json")
  if (fs.existsSync(seedMembersPath)) {
    const rawData = fs.readFileSync(seedMembersPath, "utf-8")
    const membersData = JSON.parse(rawData)

    for (const item of membersData) {
      // Create Member
      const member = await prisma.member.create({
        data: {
          code: item.code,
          name: item.name,
          simpananPokok: item.simpananPokok,
          simpananWajib: item.simpananWajib
        }
      })

      // Add Saving Transactions history for traceability
      if (item.simpananPokok > 0) {
        await prisma.savingTransaction.create({
          data: {
            memberId: member.id,
            type: "POKOK",
            amount: item.simpananPokok,
            flow: "MASUK",
            date: new Date("2025-12-31T23:59:00.000Z"),
            description: "Saldo Awal Simpanan Pokok (Historis per 31 Des 2025)"
          }
        })
      }

      if (item.simpananWajib > 0) {
        await prisma.savingTransaction.create({
          data: {
            memberId: member.id,
            type: "WAJIB",
            amount: item.simpananWajib,
            flow: "MASUK",
            date: new Date("2025-12-31T23:59:00.000Z"),
            description: "Saldo Awal Simpanan Wajib (Historis per 31 Des 2025)"
          }
        })
      }
    }
    console.log(`Successfully seeded ${membersData.length} members!`)
  } else {
    console.log("[ERROR] seed_members.json not found. Run parse_sp.py first.")
  }

  // 5. Seed Default Settings
  console.log("Seeding settings...")
  const settings = [
    { key: "shu_pengurus_pct", value: "30" },
    { key: "shu_pengawas_pct", value: "10" },
    { key: "shu_sosial_pct", value: "10" },
    { key: "shu_modal_pct", value: "25" },
    { key: "shu_desa_pct", value: "25" },
    { key: "bumdes_name", value: 'BUMDES "BAROKAH" Balongbesuk' },
    { key: "village_name", value: "Desa Balongbesuk" },
    { key: "district_name", value: "Kecamatan Diwek" },
    { key: "regency_name", value: "Kabupaten Jombang" }
  ]

  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: {},
      create: s
    })
  }

  // 6. Seed Rich Dummy Data (January to May 2026)
  console.log("Seeding rich dummy data...")

  // Fetch created members so we have their IDs
  const dbMembers = await prisma.member.findMany()
  const memberP001 = dbMembers.find(m => m.code === "P-001")
  const memberP005 = dbMembers.find(m => m.code === "P-005")
  const memberP010 = dbMembers.find(m => m.code === "P-010")

  // Helper to create a journal entry with debits and credits
  const createJournal = async (
    dateStr: string,
    description: string,
    unitUsaha: string,
    debits: { accountCode: string; amount: number }[],
    credits: { accountCode: string; amount: number }[]
  ) => {
    const entry = await prisma.journalEntry.create({
      data: {
        date: new Date(dateStr),
        description,
        unitUsaha
      }
    })
    for (const d of debits) {
      await prisma.journalLine.create({
        data: {
          journalEntryId: entry.id,
          accountCode: d.accountCode,
          type: "DEBIT",
          amount: d.amount
        }
      })
    }
    for (const c of credits) {
      await prisma.journalLine.create({
        data: {
          journalEntryId: entry.id,
          accountCode: c.accountCode,
          type: "CREDIT",
          amount: c.amount
        }
      })
    }
    return entry
  }

  // A. Saving Transactions (Setoran Simpanan Wajib Bulanan Jan - May)
  // Let's simulate 20 members making monthly deposits of Rp30,000
  console.log("Creating savings dummy transactions...")
  const months = ["2026-01-15T10:00:00Z", "2026-02-15T10:00:00Z", "2026-03-15T10:00:00Z", "2026-04-15T10:00:00Z", "2026-05-15T10:00:00Z"]
  for (let i = 0; i < 20; i++) {
    const member = dbMembers[i]
    if (!member) continue
    for (let m = 0; m < months.length; m++) {
      const dateStr = months[m]
      // Create transaction record
      await prisma.savingTransaction.create({
        data: {
          memberId: member.id,
          type: "WAJIB",
          amount: 30000,
          flow: "MASUK",
          date: new Date(dateStr),
          description: `Setoran Simpanan Wajib Bulanan - Bln ${m + 1} 2026`
        }
      })
      // Update member balance
      await prisma.member.update({
        where: { id: member.id },
        data: { simpananWajib: { increment: 30000 } }
      })
      // Post Journal
      await createJournal(
        dateStr,
        `Setoran Simpanan Wajib ${member.name} (${member.code})`,
        "SP",
        [{ accountCode: "1-1100", amount: 30000 }],
        [{ accountCode: "2-1200", amount: 30000 }]
      )
    }
  }

  // B. Loans & Repayments
  console.log("Creating loan dummy transactions...")
  if (memberP001) {
    // Principal 10 million, 1% flat interest per month, 10 months. Active since Feb 1, 2026.
    const loan = await prisma.loan.create({
      data: {
        memberId: memberP001.id,
        type: "MASYARAKAT",
        principal: 10000000,
        interestRate: 1.0,
        monthlyInstallment: 1100000, // 1m principal + 100k interest
        termMonths: 10,
        status: "ACTIVE",
        createdAt: new Date("2026-02-01T08:00:00Z")
      }
    })
    
    // Disburse loan journal
    await createJournal(
      "2026-02-01T08:05:00Z",
      `Pencairan Pinjaman Masyarakat - ${memberP001.name} (${memberP001.code})`,
      "SP",
      [{ accountCode: "1-1400", amount: 10000000 }],
      [{ accountCode: "1-1100", amount: 10000000 }]
    )

    // Repayments in Feb, Mar, Apr, May
    const repMonths = ["2026-02-28T10:00:00Z", "2026-03-28T10:00:00Z", "2026-04-28T10:00:00Z", "2026-05-28T10:00:00Z"]
    for (let r = 0; r < repMonths.length; r++) {
      const dateStr = repMonths[r]
      await prisma.loanRepayment.create({
        data: {
          loanId: loan.id,
          principalPaid: 1000000,
          interestPaid: 100000,
          date: new Date(dateStr),
          description: `Angsuran Pinjaman ke-${r + 1} - ${memberP001.name}`
        }
      })
      await createJournal(
        dateStr,
        `Angsuran Pinjaman ke-${r + 1} - ${memberP001.name} (${memberP001.code})`,
        "SP",
        [{ accountCode: "1-1100", amount: 1100000 }],
        [
          { accountCode: "1-1400", amount: 1000000 },
          { accountCode: "4-1100", amount: 100000 }
        ]
      )
    }
  }

  if (memberP005) {
    // Principal 5 million, 1% flat, 5 months. Paid off. Active Jan 15, 2026.
    const loan = await prisma.loan.create({
      data: {
        memberId: memberP005.id,
        type: "MASYARAKAT",
        principal: 5000000,
        interestRate: 1.0,
        monthlyInstallment: 1050000,
        termMonths: 5,
        status: "PAID",
        createdAt: new Date("2026-01-15T09:00:00Z")
      }
    })

    await createJournal(
      "2026-01-15T09:10:00Z",
      `Pencairan Pinjaman Masyarakat - ${memberP005.name} (${memberP005.code})`,
      "SP",
      [{ accountCode: "1-1400", amount: 5000000 }],
      [{ accountCode: "1-1100", amount: 5000000 }]
    )

    // Repayments Jan, Feb, Mar, Apr, May (all paid)
    const repMonths = ["2026-01-30T10:00:00Z", "2026-02-28T10:00:00Z", "2026-03-30T10:00:00Z", "2026-04-30T10:00:00Z", "2026-05-30T10:00:00Z"]
    for (let r = 0; r < repMonths.length; r++) {
      const dateStr = repMonths[r]
      await prisma.loanRepayment.create({
        data: {
          loanId: loan.id,
          principalPaid: 1000000,
          interestPaid: 50000,
          date: new Date(dateStr),
          description: `Angsuran Pinjaman ke-${r + 1} (Pelunasan) - ${memberP005.name}`
        }
      })
      await createJournal(
        dateStr,
        `Angsuran Pinjaman ke-${r + 1} - ${memberP005.name} (${memberP005.code})`,
        "SP",
        [{ accountCode: "1-1100", amount: 1050000 }],
        [
          { accountCode: "1-1400", amount: 1000000 },
          { accountCode: "4-1100", amount: 50000 }
        ]
      )
    }
  }

  // C. Gedung Booking
  console.log("Creating gedung booking dummy transactions...")
  const bookings = [
    { customerName: "Bpk. Rahmat", type: "BADMINTON", dateStart: "2026-01-10T14:00:00Z", dateEnd: "2026-01-10T16:00:00Z", totalFee: 100000, dpAmount: 100000, status: "PAID", datePay: "2026-01-10T13:45:00Z" },
    { customerName: "Karang Taruna", type: "RAPAT", dateStart: "2026-02-15T08:00:00Z", dateEnd: "2026-02-15T17:00:00Z", totalFee: 500000, dpAmount: 500000, status: "PAID", datePay: "2026-02-15T07:30:00Z" },
    { customerName: "Pernikahan Andi & Rini", type: "PESTA", dateStart: "2026-03-20T07:00:00Z", dateEnd: "2026-03-21T22:00:00Z", totalFee: 3000000, dpAmount: 1000000, status: "PAID", datePay: "2026-03-01T10:00:00Z" },
    { customerName: "Asosiasi Tani", type: "RAPAT", dateStart: "2026-04-05T09:00:00Z", dateEnd: "2026-04-05T13:00:00Z", totalFee: 400000, dpAmount: 400000, status: "PAID", datePay: "2026-04-05T08:30:00Z" },
    { customerName: "Khitanan Putra Kades", type: "PESTA", dateStart: "2026-05-12T07:00:00Z", dateEnd: "2026-05-12T21:00:00Z", totalFee: 2000000, dpAmount: 1000000, status: "PAID", datePay: "2026-04-30T09:00:00Z" }
  ]

  for (const b of bookings) {
    await prisma.gedungBooking.create({
      data: {
        customerName: b.customerName,
        type: b.type,
        dateStart: new Date(b.dateStart),
        dateEnd: new Date(b.dateEnd),
        totalFee: b.totalFee,
        dpAmount: b.dpAmount,
        status: b.status,
        createdAt: new Date(b.datePay)
      }
    })
    
    if (b.type === "PESTA") {
      // DP payment journal
      await createJournal(
        b.datePay,
        `DP Booking Gedung GSG (${b.customerName})`,
        "GEDUNG",
        [{ accountCode: "1-1200", amount: b.dpAmount }],
        [{ accountCode: "4-1200", amount: b.dpAmount }]
      )
      // Remaining payment journal on event start
      const remAmount = b.totalFee - b.dpAmount
      await createJournal(
        b.dateStart,
        `Pelunasan Booking Gedung GSG (${b.customerName})`,
        "GEDUNG",
        [{ accountCode: "1-1200", amount: remAmount }],
        [{ accountCode: "4-1200", amount: remAmount }]
      )
    } else {
      // Full payment journal
      await createJournal(
        b.datePay,
        `Pembayaran Sewa Gedung GSG (${b.customerName})`,
        "GEDUNG",
        [{ accountCode: "1-1200", amount: b.totalFee }],
        [{ accountCode: "4-1200", amount: b.totalFee }]
      )
    }
  }

  // D. Lahan Contract & Payments
  console.log("Creating lahan dummy transactions...")
  // Contract 1: Warung Joko, Tahunan, 2.4 million, paid upfront Jan 1, 2026
  const contract1 = await prisma.lahanContract.create({
    data: {
      type: "WARUNG",
      number: "W-01",
      tenantName: "Pak Joko",
      phone: "081234567890",
      shift: "NONE",
      fee: 2400000,
      periodStart: new Date("2026-01-01T00:00:00Z"),
      periodEnd: new Date("2026-12-31T23:59:59Z"),
      status: "ACTIVE",
      createdAt: new Date("2026-01-01T09:00:00Z")
    }
  })
  await prisma.lahanPayment.create({
    data: {
      contractId: contract1.id,
      amount: 2400000,
      date: new Date("2026-01-01T09:15:00Z"),
      periodCovered: "Tahun Sewa Lahan 2026"
    }
  })
  await createJournal(
    "2026-01-01T09:15:00Z",
    `Kontrak Sewa Warung Tahunan W-01 - Pak Joko`,
    "LAHAN",
    [{ accountCode: "1-1300", amount: 2400000 }],
    [{ accountCode: "4-1300", amount: 2400000 }]
  )

  // Contract 2: Lapak Sri, Bulanan (Shift Pagi), 150k/month. Paid for Jan, Feb, Mar, Apr, May.
  const contract2 = await prisma.lahanContract.create({
    data: {
      type: "LAPAK",
      number: "L-01",
      tenantName: "Bu Sri",
      phone: "082345678901",
      shift: "PAGI",
      fee: 150000,
      periodStart: new Date("2026-01-01T00:00:00Z"),
      periodEnd: new Date("2026-06-30T23:59:59Z"),
      status: "ACTIVE",
      createdAt: new Date("2026-01-01T10:00:00Z")
    }
  })

  const payMonths2 = ["2026-01-05T08:00:00Z", "2026-02-05T08:00:00Z", "2026-03-05T08:00:00Z", "2026-04-05T08:00:00Z", "2026-05-05T08:00:00Z"]
  for (let p = 0; p < payMonths2.length; p++) {
    const dateStr = payMonths2[p]
    await prisma.lahanPayment.create({
      data: {
        contractId: contract2.id,
        amount: 150000,
        date: new Date(dateStr),
        periodCovered: `Iuran Bulan ke-${p + 1} 2026`
      }
    })
    await createJournal(
      dateStr,
      `Iuran Sewa Lapak Pagi L-01 - Bu Sri`,
      "LAHAN",
      [{ accountCode: "1-1300", amount: 150000 }],
      [{ accountCode: "4-1300", amount: 150000 }]
    )
  }

  // Contract 3: Lapak Budi, Bulanan (Shift Malam), 150k/month. Paid for Mar, Apr, May.
  const contract3 = await prisma.lahanContract.create({
    data: {
      type: "LAPAK",
      number: "L-01",
      tenantName: "Mas Budi",
      phone: "083456789012",
      shift: "MALAM",
      fee: 150000,
      periodStart: new Date("2026-03-01T00:00:00Z"),
      periodEnd: new Date("2026-08-31T23:59:59Z"),
      status: "ACTIVE",
      createdAt: new Date("2026-03-01T10:00:00Z")
    }
  })

  const payMonths3 = ["2026-03-05T17:00:00Z", "2026-04-05T17:00:00Z", "2026-05-05T17:00:00Z"]
  for (let p = 0; p < payMonths3.length; p++) {
    const dateStr = payMonths3[p]
    await prisma.lahanPayment.create({
      data: {
        contractId: contract3.id,
        amount: 150000,
        date: new Date(dateStr),
        periodCovered: `Iuran Bulan ke-${p + 1} 2026`
      }
    })
    await createJournal(
      dateStr,
      `Iuran Sewa Lapak Malam L-01 - Mas Budi`,
      "LAHAN",
      [{ accountCode: "1-1300", amount: 150000 }],
      [{ accountCode: "4-1300", amount: 150000 }]
    )
  }

  // E. PPOB Rekap
  console.log("Creating PPOB dummy records...")
  const ppobs = [
    { date: "2026-01-31T23:59:00Z", totalRevenue: 45000000, totalCommission: 850000 },
    { date: "2026-02-28T23:59:00Z", totalRevenue: 48000000, totalCommission: 920000 },
    { date: "2026-03-31T23:59:00Z", totalRevenue: 52000000, totalCommission: 1050000 },
    { date: "2026-04-30T23:59:00Z", totalRevenue: 41000000, totalCommission: 780000 },
    { date: "2026-05-31T23:59:00Z", totalRevenue: 55000000, totalCommission: 1100000 }
  ]

  for (const p of ppobs) {
    await prisma.ppobRekap.create({
      data: {
        date: new Date(p.date),
        totalRevenue: p.totalRevenue,
        totalCommission: p.totalCommission,
        description: "Rekapitulasi Transaksi PPOB Bulanan Agen Pos BUMDES"
      }
    })
    await createJournal(
      p.date,
      `Rekap Penerimaan Komisi Bersih PPOB Agen Pos`,
      "PPOB",
      [{ accountCode: "1-1100", amount: p.totalCommission }],
      [{ accountCode: "4-1400", amount: p.totalCommission }]
    )
  }

  // F. Biaya-Biaya Operasional (Expenses)
  console.log("Creating expense dummy transactions...")
  const expensesList = [
    { date: "2026-01-31T12:00:00Z", amount: 15000, name: "5-1500", cashCode: "1-1100", desc: "Biaya Administrasi Bank Bulanan - Jan" },
    { date: "2026-02-28T12:00:00Z", amount: 15000, name: "5-1500", cashCode: "1-1100", desc: "Biaya Administrasi Bank Bulanan - Feb" },
    { date: "2026-03-31T12:00:00Z", amount: 15000, name: "5-1500", cashCode: "1-1100", desc: "Biaya Administrasi Bank Bulanan - Mar" },
    { date: "2026-04-30T12:00:00Z", amount: 15000, name: "5-1500", cashCode: "1-1100", desc: "Biaya Administrasi Bank Bulanan - Apr" },
    { date: "2026-05-31T12:00:00Z", amount: 15000, name: "5-1500", cashCode: "1-1100", desc: "Biaya Administrasi Bank Bulanan - May" },
    { date: "2026-02-28T15:00:00Z", amount: 1200000, name: "5-1100", cashCode: "1-1100", desc: "Biaya Konsumsi & Cetak Rapat Anggota Tahunan (RAT)" },
    { date: "2026-03-15T16:00:00Z", amount: 350000, name: "5-1300", cashCode: "1-1200", desc: "Biaya Tagihan Listrik & Kebersihan Gedung GSG - Feb" },
    { date: "2026-05-10T11:00:00Z", amount: 200000, name: "5-1200", cashCode: "1-1300", desc: "Biaya Pembelian Tempat Sampah & Sapu Area Lahan Lapak" }
  ]

  for (const e of expensesList) {
    await createJournal(
      e.date,
      e.desc,
      "UMUM",
      [{ accountCode: e.name, amount: e.amount }],
      [{ accountCode: e.cashCode, amount: e.amount }]
    )
  }

  // G. CMS Posts
  console.log("Creating articles dummy posts...")
  const posts = [
    { title: "Pembukaan Unit Sewa Gedung Serbaguna Balongbesuk", content: "Mulai Januari 2026, Gedung Serbaguna (GSG) Desa Balongbesuk secara resmi dapat disewa untuk lapangan badminton harian dan acara resepsi pernikahan. Jajaran pengurus BUMDES Barokah siap melayani reservasi warga desa dengan tarif yang terjangkau.", published: true, createdAt: "2026-01-15T09:00:00Z" },
    { title: "Rapat Anggota Tahunan (RAT) BUMDES Barokah T.A 2025 Sukses Digelar", content: "Pada akhir Februari 2026, BUMDES Barokah Balongbesuk menyelenggarakan Rapat Anggota Tahunan untuk menyampaikan laporan pertanggungjawaban pengelolaan unit simpan pinjam dan sewa jasa tahun buku 2025. Hasil evaluasi menunjukkan kinerja keuangan yang sehat dengan Sisa Hasil Usaha (SHU) yang meningkat.", published: true, createdAt: "2026-02-28T14:00:00Z" },
    { title: "Kerjasama Lapak Kuliner Malam Desa Balongbesuk", content: "Guna mendongkrak ekonomi kerakyatan, unit sewa lahan BUMDES meluncurkan program Lapak PKL shift malam di area kavling L-01 sampai L-10. Lapak malam dikhususkan untuk kuliner lokal yang beroperasi dari pukul 17:00 hingga 23:00 WIB.", published: true, createdAt: "2026-03-10T10:00:00Z" },
    { title: "Laporan Kinerja Keuangan Triwulan I BUMDES Barokah Resmi Dirilis", content: "Sebagai bentuk akuntabilitas publik, pengurus BUMDES Barokah merilis Laporan Posisi Keuangan (Neraca) dan Laba Rugi Triwulan I T.A 2026. Laporan ini membuktikan keseimbangan aktiva-pasiva dan transparansi setoran Pendapatan Asli Desa (PADes).", published: true, createdAt: "2026-04-10T11:00:00Z" }
  ]

  for (const p of posts) {
    await prisma.post.create({
      data: {
        title: p.title,
        content: p.content,
        published: p.published,
        createdAt: new Date(p.createdAt)
      }
    })
  }

  // H. Documents
  console.log("Creating documents dummy logs...")
  const docs = [
    { docNumber: "005/12/PEM-BB/I/2026", type: "SURAT_MASUK", subject: "Undangan Rapat Evaluasi Kinerja BUMDES Triwulan", sender: "Kepala Desa Balongbesuk", recipient: null, date: "2026-01-05T09:00:00Z" },
    { docNumber: "140/01/BUMDES-BB/I/2026", type: "SURAT_KELUAR", subject: "Penyampaian Dokumen LPJ Tahunan BUMDES 2025", sender: null, recipient: "DPMD Kabupaten Jombang", date: "2026-01-20T10:00:00Z" },
    { docNumber: "SK-KADES/02/2026", type: "SK", subject: "Surat Keputusan Pengangkatan Badan Pengawas BUMDES T.A 2026", sender: "Kepala Desa Balongbesuk", recipient: null, date: "2026-02-01T09:00:00Z" },
    { docNumber: "020/05/BUMDES-BB/III/2026", type: "SURAT_KELUAR", subject: "Surat Pemberitahuan Jadwal Iuran Sewa Lahan Pertanian", sender: null, recipient: "Gapoktan Mulyo Agung", date: "2026-03-05T11:00:00Z" }
  ]

  for (const d of docs) {
    await prisma.document.create({
      data: {
        docNumber: d.docNumber,
        type: d.type,
        subject: d.subject,
        sender: d.sender,
        recipient: d.recipient,
        date: new Date(d.date)
      }
    })
  }

  console.log("=== SEEDING COMPLETED SUCCESSFULLY ===")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

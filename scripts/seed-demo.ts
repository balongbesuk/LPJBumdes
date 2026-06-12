import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 12)
}

async function main() {
  console.log("=== STARTING DATABASE DEMO SEEDING (SIMULASI DATA) ===")

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
  await prisma.fixedAsset.deleteMany()
  await prisma.taxTransaction.deleteMany()
  await prisma.meetingMinutes.deleteMany()
  await prisma.auditLog.deleteMany()
  await prisma.periodLock.deleteMany()

  // 1. Seed Default Users
  console.log("Seeding default users...")
  const users = [
    {
      username: "admin",
      passwordHash: hashPassword("admin123"),
      name: "Administrator",
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
      name: "Sekretaris",
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

  // 2. Seed Chart of Accounts
  console.log("Seeding Chart of Accounts...")
  const accounts = [
    { code: "1-1100", name: "Kas/Bank BUMDES", type: "ASSET" },
    { code: "1-1200", name: "Kas/Bank Unit Gedung (GSG)", type: "ASSET" },
    { code: "1-1300", name: "Kas/Bank Unit Lapak & Warung", type: "ASSET" },
    { code: "1-1400", name: "Piutang Pinjaman Masyarakat", type: "ASSET" },
    { code: "1-1500", name: "Piutang Pinjaman Gapoktan", type: "ASSET" },
    { code: "1-2100", name: "Peralatan & Inventaris", type: "ASSET" },
    { code: "1-2200", name: "Akumulasi Penyusutan Peralatan", type: "ASSET" },
    { code: "2-1100", name: "Tabungan Simpanan Pokok Anggota", type: "LIABILITY" },
    { code: "2-1200", name: "Tabungan Simpanan Wajib Anggota", type: "LIABILITY" },
    { code: "2-1300", name: "Hutang SHU Belum Dibagi", type: "LIABILITY" },
    { code: "2-1400", name: "Hutang Pajak", type: "LIABILITY" },
    { code: "3-1100", name: "Modal Awal Desa", type: "EQUITY" },
    { code: "3-1200", name: "Laba Ditahan / Penambahan Modal", type: "EQUITY" },
    { code: "4-1100", name: "Pendapatan Jasa Simpan Pinjam", type: "REVENUE" },
    { code: "4-1200", name: "Pendapatan Sewa Gedung", type: "REVENUE" },
    { code: "4-1300", name: "Pendapatan Sewa Lapak & Warung", type: "REVENUE" },
    { code: "4-1400", name: "Pendapatan Komisi Agen Pos/PPOB", type: "REVENUE" },
    { code: "4-1500", name: "Pendapatan Bunga Bank", type: "REVENUE" },
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

  // 3. Seed Demo Settings
  console.log("Seeding BUMDES demo settings...")
  const settings = [
    { key: "bumdes_name", value: "BUMDES MAJU SEJAHTERA" },
    { key: "village_name", value: "Sukamaju" },
    { key: "district_name", value: "Kemakmuran" },
    { key: "regency_name", value: "Harapan" },
    { key: "shu_pengurus_pct", value: "30" },
    { key: "shu_pengawas_pct", value: "10" },
    { key: "shu_sosial_pct", value: "10" },
    { key: "shu_modal_pct", value: "25" },
    { key: "shu_desa_pct", value: "25" },
    { key: "leader_name", value: "Budi Santoso, S.Sos." },
    { key: "leader_nip", value: "19800812 201001 1 003" },
    { key: "director_name", value: "Ahmad Fauzi, M.Ak." },
    { key: "director_nip", value: "3517123456780001" },
    { key: "treasurer_name", value: "Siti Rahmawati, S.E." },
    { key: "treasurer_nip", value: "3517098765430002" },
    { key: "supervisor_name", value: "Drs. Joko Wahyono" },
    { key: "supervisor_nip", value: "3517112233440003" },
    { key: "module_sp", value: "true" },
    { key: "module_gedung", value: "true" },
    { key: "module_lahan", value: "true" },
    { key: "module_ppob", value: "true" },
    { key: "module_persuratan", value: "true" }
  ]

  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s
    })
  }

  // 4. Seed Mock Members
  console.log("Seeding mock members...")
  const membersData = [
    { code: "P-001", name: "Budi Utomo", pokok: 50000, wajib: 120000 },
    { code: "P-002", name: "Siti Aminah", pokok: 50000, wajib: 90000 },
    { code: "P-003", name: "Joko Susilo", pokok: 50000, wajib: 60000 },
    { code: "P-004", name: "Anisa Rahma", pokok: 50000, wajib: 30000 }
  ]

  const dbMembers = []
  for (const m of membersData) {
    const member = await prisma.member.create({
      data: {
        code: m.code,
        name: m.name,
        isActive: true,
        simpananPokok: m.pokok,
        simpananWajib: m.wajib
      }
    })
    dbMembers.push(member)
  }

  // 5. Seed Mock Loans
  console.log("Seeding mock active loans...")
  const loan1 = await prisma.loan.create({
    data: {
      memberId: dbMembers[0].id,
      type: "MASYARAKAT",
      principal: 5000000,
      interestRate: 1.5, // 1.5% flat per month
      monthlyInstallment: 500000, // Rp 500k/mo
      termMonths: 10,
      status: "ACTIVE",
      createdAt: new Date("2026-01-10T00:00:00Z")
    }
  })

  const loan2 = await prisma.loan.create({
    data: {
      memberId: dbMembers[1].id,
      type: "MASYARAKAT",
      principal: 3000000,
      interestRate: 1.5,
      monthlyInstallment: 300000,
      termMonths: 10,
      status: "ACTIVE",
      createdAt: new Date("2026-02-15T00:00:00Z")
    }
  })

  // 6. Seed Loan Repayments
  console.log("Seeding loan repayments...")
  await prisma.loanRepayment.create({
    data: {
      loanId: loan1.id,
      principalPaid: 500000,
      interestPaid: 75000, // 1.5% of 5,000,000 = 75,000
      date: new Date("2026-02-10T08:00:00Z"),
      description: "Angsuran ke-1 Sdr. Budi Utomo"
    }
  })

  // 7. Seed Gedung Bookings
  console.log("Seeding mock gedung bookings...")
  await prisma.gedungBooking.create({
    data: {
      customerName: "Rian Hidayat",
      type: "PESTA",
      dateStart: new Date("2026-06-20T08:00:00Z"),
      dateEnd: new Date("2026-06-20T22:00:00Z"),
      totalFee: 2500000,
      dpAmount: 1000000,
      status: "BOOKED",
      createdAt: new Date("2026-05-01T09:00:00Z")
    }
  })

  await prisma.gedungBooking.create({
    data: {
      customerName: "Komunitas Badminton Sukamaju",
      type: "BADMINTON",
      dateStart: new Date("2026-05-15T15:00:00Z"),
      dateEnd: new Date("2026-05-15T17:00:00Z"),
      totalFee: 100000,
      dpAmount: 100000,
      status: "PAID",
      createdAt: new Date("2026-05-14T10:00:00Z")
    }
  })

  // 8. Seed Lahan Contracts
  console.log("Seeding mock land contracts...")
  const contract = await prisma.lahanContract.create({
    data: {
      type: "LAPAK",
      number: "LPK-01",
      tenantName: "Warteg Barokah",
      phone: "08123456789",
      shift: "PAGI",
      fee: 150000,
      periodStart: new Date("2026-01-01T00:00:00Z"),
      periodEnd: new Date("2026-12-31T00:00:00Z"),
      status: "ACTIVE"
    }
  })

  await prisma.lahanPayment.create({
    data: {
      contractId: contract.id,
      amount: 150000,
      date: new Date("2026-01-05T09:00:00Z"),
      periodCovered: "Januari 2026"
    }
  })

  // 9. Seed PPOB Rekap
  console.log("Seeding PPOB rekap entries...")
  await prisma.ppobRekap.create({
    data: {
      date: new Date("2026-01-31T17:00:00Z"),
      totalRevenue: 15000000,
      totalCommission: 450000,
      description: "Rekap Komisi Agen Pos Januari 2026"
    }
  })

  // 10. Seed Fixed Assets
  console.log("Seeding fixed assets...")
  await prisma.fixedAsset.create({
    data: {
      code: "AST-01",
      name: "Laptop Inventaris Kantor",
      purchaseDate: new Date("2026-01-02T10:00:00Z"),
      purchaseCost: 8500000,
      economicLife: 4,
      depreciationRate: 25,
      accumDep: 0,
      createdAt: new Date("2026-01-02T10:00:00Z")
    }
  })

  // 11. Post Journal Entries
  console.log("Posting Journal Entries for FY 2026...")
  
  // A. Opening Journal Entry
  const openingJournal = await prisma.journalEntry.create({
    data: {
      date: new Date("2026-01-01T00:00:00Z"),
      description: "Jurnal Pembuka Saldo Awal Tahun Anggaran 2026",
      unitUsaha: "UMUM"
    }
  })

  const openingLines = [
    { accountCode: "1-1100", type: "DEBIT", amount: 150000000 },
    { accountCode: "1-1200", type: "DEBIT", amount: 25000000 },
    { accountCode: "1-1300", type: "DEBIT", amount: 15000000 },
    { accountCode: "1-1400", type: "DEBIT", amount: 10000000 },
    { accountCode: "1-2100", type: "DEBIT", amount: 20000000 },
    { accountCode: "1-2200", type: "CREDIT", amount: 2000000 },
    { accountCode: "2-1100", type: "CREDIT", amount: 5000000 },
    { accountCode: "2-1200", type: "CREDIT", amount: 13000000 },
    { accountCode: "3-1100", type: "CREDIT", amount: 200000000 }
  ]

  for (const line of openingLines) {
    await prisma.journalLine.create({
      data: {
        journalEntryId: openingJournal.id,
        accountCode: line.accountCode,
        type: line.type,
        amount: line.amount
      }
    })
  }

  // B. Simpanan Anggota Baru (Anisa Rahma)
  const spJournal = await prisma.journalEntry.create({
    data: {
      date: new Date("2026-01-15T09:00:00Z"),
      description: "Penerimaan Simpanan Pokok & Wajib Anggota Baru (Anisa)",
      unitUsaha: "SP"
    }
  })

  const spLines = [
    { accountCode: "1-1100", type: "DEBIT", amount: 80000 },
    { accountCode: "2-1100", type: "CREDIT", amount: 50000 },
    { accountCode: "2-1200", type: "CREDIT", amount: 30000 }
  ]

  for (const line of spLines) {
    await prisma.journalLine.create({
      data: {
        journalEntryId: spJournal.id,
        accountCode: line.accountCode,
        type: line.type,
        amount: line.amount
      }
    })
  }

  // C. Pendapatan DP Sewa Gedung
  const gsgJournal = await prisma.journalEntry.create({
    data: {
      date: new Date("2026-05-01T09:00:00Z"),
      description: "Penerimaan Uang Muka Sewa Gedung Pesta (Rian)",
      unitUsaha: "GEDUNG"
    }
  })

  const gsgLines = [
    { accountCode: "1-1200", type: "DEBIT", amount: 1000000 },
    { accountCode: "4-1200", type: "CREDIT", amount: 1000000 }
  ]

  for (const line of gsgLines) {
    await prisma.journalLine.create({
      data: {
        journalEntryId: gsgJournal.id,
        accountCode: line.accountCode,
        type: line.type,
        amount: line.amount
      }
    })
  }

  // D. Pendapatan Lahan Lapak
  const lahanJournal = await prisma.journalEntry.create({
    data: {
      date: new Date("2026-01-05T09:00:00Z"),
      description: "Penerimaan Sewa Lapak Bulanan (LPK-01)",
      unitUsaha: "LAHAN"
    }
  })

  const lahanLines = [
    { accountCode: "1-1300", type: "DEBIT", amount: 150000 },
    { accountCode: "4-1300", type: "CREDIT", amount: 150000 }
  ]

  for (const line of lahanLines) {
    await prisma.journalLine.create({
      data: {
        journalEntryId: lahanJournal.id,
        accountCode: line.accountCode,
        type: line.type,
        amount: line.amount
      }
    })
  }

  // E. Laba Bersih PPOB Agen Pos
  const ppobJournal = await prisma.journalEntry.create({
    data: {
      date: new Date("2026-01-31T17:00:00Z"),
      description: "Penerimaan Komisi Agen Pos PPOB",
      unitUsaha: "UMUM"
    }
  })

  const ppobLines = [
    { accountCode: "1-1100", type: "DEBIT", amount: 450000 },
    { accountCode: "4-1400", type: "CREDIT", amount: 450000 }
  ]

  for (const line of ppobLines) {
    await prisma.journalLine.create({
      data: {
        journalEntryId: ppobJournal.id,
        accountCode: line.accountCode,
        type: line.type,
        amount: line.amount
      }
    })
  }

  // F. Pembayaran Angsuran Kredit
  const creditJournal = await prisma.journalEntry.create({
    data: {
      date: new Date("2026-02-10T08:00:00Z"),
      description: "Penerimaan Angsuran Ke-1 Sdr. Budi Utomo",
      unitUsaha: "SP"
    }
  })

  const creditLines = [
    { accountCode: "1-1100", type: "DEBIT", amount: 575000 },
    { accountCode: "1-1400", type: "CREDIT", amount: 500000 },
    { accountCode: "4-1100", type: "CREDIT", amount: 75000 }
  ]

  for (const line of creditLines) {
    await prisma.journalLine.create({
      data: {
        journalEntryId: creditJournal.id,
        accountCode: line.accountCode,
        type: line.type,
        amount: line.amount
      }
    })
  }

  // G. Biaya Operasional Listrik & ATK BUMDES
  const opsJournal = await prisma.journalEntry.create({
    data: {
      date: new Date("2026-02-15T10:00:00Z"),
      description: "Pembayaran Biaya Listrik & ATK Kantor",
      unitUsaha: "UMUM"
    }
  })

  const opsLines = [
    { accountCode: "5-1100", type: "DEBIT", amount: 350000 },
    { accountCode: "1-1100", type: "CREDIT", amount: 350000 }
  ]

  for (const line of opsLines) {
    await prisma.journalLine.create({
      data: {
        journalEntryId: opsJournal.id,
        accountCode: line.accountCode,
        type: line.type,
        amount: line.amount
      }
    })
  }

  // 12. Seed Default LPJ Narrative template
  console.log("Seeding default LPJ narrative template for 2026...")
  await prisma.lpjNarrative.upsert({
    where: { year: 2026 },
    update: {},
    create: {
      year: 2026,
      bab1: "BUM Desa Maju Sejahtera pada tahun 2026 berhasil mencatatkan peningkatan kinerja yang baik di seluruh unit usahanya.",
      bab2: "Manajemen operasional berjalan dengan efisiensi tinggi, diawasi oleh Badan Pengawas secara independen dan konstruktif.",
      bab3: "BUM Desa didirikan dengan badan hukum resmi untuk mengoptimalkan pemanfaatan aset desa dan potensi ekonomi lokal.",
      bab4: "Unit Simpan Pinjam memiliki modal berputar yang sehat, dan unit sewa Gedung GSG mencatatkan okupansi yang terus naik.",
      bab5: "Kendala utama adalah keterbatasan SDM dalam literasi digital, diatasi dengan pelatihan sistem akuntansi internal.",
      bab6: "Desa memiliki potensi agrowisata buah naga yang direncanakan akan dikembangkan menjadi unit usaha baru tahun depan.",
      bab7: "Rencana kerja tahun depan difokuskan pada perluasan kemitraan dengan UMKM lokal dan digitalisasi pembayaran sewa.",
      bab8: "Demikian laporan pertanggungjawaban ini disusun untuk dipertanggungjawabkan dalam forum Musyawarah Desa."
    }
  })

  console.log("=== DEMO SEEDING COMPLETED SUCCESSFULLY ===")
  console.log("Database initialized with generic demo data.")
  console.log("Access the app at: http://localhost:3001")
  console.log("Default login: admin / admin123")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

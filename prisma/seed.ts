import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 12)
}

async function main() {
  console.log("=== STARTING DATABASE SEEDING (GENERIC / MULTI-DESA) ===")

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

  // 2. Seed Chart of Accounts (Bagan Akun) — Universal for all BUMDES
  console.log("Seeding Chart of Accounts...")
  const accounts = [
    // 1-xxxx: ASSETS
    { code: "1-1100", name: "Kas/Bank BUMDES", type: "ASSET" },
    { code: "1-1200", name: "Kas/Bank Unit Gedung (GSG)", type: "ASSET" },
    { code: "1-1300", name: "Kas/Bank Unit Lapak & Warung", type: "ASSET" },
    { code: "1-1400", name: "Piutang Pinjaman Masyarakat", type: "ASSET" },
    { code: "1-1500", name: "Piutang Pinjaman Gapoktan", type: "ASSET" },
    { code: "1-2100", name: "Peralatan & Inventaris", type: "ASSET" },
    { code: "1-2200", name: "Akumulasi Penyusutan Peralatan", type: "ASSET" },

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

  // 3. Seed Default Settings (empty profile — triggers Setup Wizard)
  console.log("Seeding default settings...")
  const settings = [
    { key: "shu_pengurus_pct", value: "30" },
    { key: "shu_pengawas_pct", value: "10" },
    { key: "shu_sosial_pct", value: "10" },
    { key: "shu_modal_pct", value: "25" },
    { key: "shu_desa_pct", value: "25" },
    { key: "bumdes_name", value: "" },
    { key: "village_name", value: "" },
    { key: "district_name", value: "" },
    { key: "regency_name", value: "" }
  ]

  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: {},
      create: s
    })
  }

  console.log("")
  console.log("=== SEEDING COMPLETED SUCCESSFULLY ===")
  console.log("")
  console.log("Database siap digunakan. Saat pertama kali login,")
  console.log("sistem akan mengarahkan ke Setup Wizard untuk mengisi")
  console.log("profil BUMDES dan konfigurasi awal.")
  console.log("")
  console.log("Default login: admin / admin123")
  console.log("")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

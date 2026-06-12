import { PrismaClient } from "@prisma/client"
import * as fs from "fs"
import * as path from "path"

const prisma = new PrismaClient()

async function main() {
  console.log("=== STARTING SPECIAL SEEDING FROM 2025 PDF REPORT ===")

  console.log("Cleaning up existing database records...")
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

  // 1. Seed BUMDes Profile & SHU settings from PDF
  console.log("Setting BUMDes profile settings...")
  const settings = [
    { key: "bumdes_name", value: "BUMDES BAROKAH" },
    { key: "village_name", value: "Balongbesuk" },
    { key: "district_name", value: "Diwek" },
    { key: "regency_name", value: "Jombang" },
    { key: "shu_pengurus_pct", value: "25.43" }, // Computed from actual ratios
    { key: "shu_pengawas_pct", value: "8.48" },
    { key: "shu_sosial_pct", value: "44.90" },
    { key: "shu_modal_pct", value: "0" },        // 0% as modal is separate
    { key: "shu_desa_pct", value: "21.19" }
  ]

  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s
    })
  }

  // 2. Seed default users
  console.log("Ensuring admin users exist...")
  // Keep admin user if exists, or create a default one
  const adminUser = await prisma.user.findFirst({ where: { username: "admin" } })
  if (!adminUser) {
    const bcrypt = require("bcryptjs")
    const hash = bcrypt.hashSync("admin123", 12)
    await prisma.user.create({
      data: {
        username: "admin",
        passwordHash: hash,
        name: "Administrator",
        role: "ADMIN"
      }
    })
  }

  // 3. Seed actual Members & Loans from parsed Excel/PDF data
  console.log("Seeding actual members and active loans from JSON...")
  const spDataPath = path.join(__dirname, "../prisma/seed_sp_data.json")
  const spData = JSON.parse(fs.readFileSync(spDataPath, "utf-8"))

  for (const item of spData) {
    const dbMember = await prisma.member.create({
      data: {
        code: item.code,
        name: item.name,
        isActive: true,
        simpananPokok: item.pokok,
        simpananWajib: item.wajib
      }
    })

    if (item.piutang > 0) {
      await prisma.loan.create({
        data: {
          memberId: dbMember.id,
          type: item.code === "P-000" ? "POKTAN" : "MASYARAKAT",
          principal: item.piutang,
          interestRate: 0,
          monthlyInstallment: 0,
          termMonths: 12,
          status: "ACTIVE",
          createdAt: new Date("2025-12-31T00:00:00Z")
        }
      })
    }
  }

  // 4. Seed Fixed Assets to match GL balances
  console.log("Seeding fixed asset registry...")
  await prisma.fixedAsset.create({
    data: {
      code: "AST-001",
      name: "Peralatan & Inventaris Awal 2025",
      purchaseDate: new Date("2024-01-01T00:00:00Z"),
      purchaseCost: 21025000,
      economicLife: 5,
      depreciationRate: 20,
      accumDep: 19749996,
      createdAt: new Date("2025-12-31T00:00:00Z")
    }
  })

  // 5. Post Opening Journal Entry for 2026
  console.log("Posting Opening Journal Entry for Fiscal Year 2026...")
  const journal = await prisma.journalEntry.create({
    data: {
      date: new Date("2026-01-01T00:00:00Z"),
      description: "Jurnal Pembuka Saldo Awal Tahun Anggaran 2026 (Neraca Saldo 2025)",
      unitUsaha: "UMUM"
    }
  })

  const lines = [
    // Debits (Assets)
    { accountCode: "1-1100", type: "DEBIT", amount: 295050431 },       // Kas/Bank BUMDES
    { accountCode: "1-1200", type: "DEBIT", amount: 7748900 },        // Kas/Bank Gedung
    { accountCode: "1-1300", type: "DEBIT", amount: 100000 },         // Kas/Bank Lapak
    { accountCode: "1-1400", type: "DEBIT", amount: 61000000 },       // Piutang Masyarakat
    { accountCode: "1-1500", type: "DEBIT", amount: 28000000 },       // Piutang Gapoktan
    { accountCode: "1-2100", type: "DEBIT", amount: 21025000 },       // Peralatan & Inventaris

    // Credits (Contra-Assets, Liabilities, Equity)
    { accountCode: "1-2200", type: "CREDIT", amount: 19749996 },      // Akumulasi Penyusutan
    { accountCode: "2-1100", type: "CREDIT", amount: 2750000 },       // Simpanan Pokok
    { accountCode: "2-1200", type: "CREDIT", amount: 15090000 },      // Simpanan Wajib
    { accountCode: "2-1300", type: "CREDIT", amount: 27998321.25 },   // Hutang SHU Belum Dibagi
    { accountCode: "3-1100", type: "CREDIT", amount: 341402182.54 },  // Modal Awal Desa
    { accountCode: "3-1200", type: "CREDIT", amount: 5933831.21 }     // Laba Ditahan / Penambahan Modal
  ]

  for (const line of lines) {
    await prisma.journalLine.create({
      data: {
        journalEntryId: journal.id,
        accountCode: line.accountCode,
        type: line.type,
        amount: line.amount
      }
    })
  }

  console.log("=== SEEDING COMPLETED SUCCESSFULLY ===");
  console.log("Database initialized with T.A 2026 Opening Balances.");
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

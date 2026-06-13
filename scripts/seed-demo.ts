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
  await prisma.setting.deleteMany()

  // 0. Seed Settings
  console.log("Seeding settings with demo values...")
  const settingsData = [
    { key: "bumdes_name", value: "MAJU SEJAHTERA" },
    { key: "village_name", value: "Balongbesuk" },
    { key: "district_name", value: "Diwek" },
    { key: "regency_name", value: "Jombang" },
    { key: "shu_pengurus_pct", value: "30" },
    { key: "shu_pengawas_pct", value: "10" },
    { key: "shu_sosial_pct", value: "10" },
    { key: "shu_modal_pct", value: "25" },
    { key: "shu_desa_pct", value: "25" },
    { key: "sewa_lahan_whatsapp", value: "6281234567890" },
    { key: "sewa_lahan_description", value: "Unit Sewa Lahan BUMDes menyediakan kavling usaha berupa lapak tenda dan bangunan warung permanen di lokasi-lokasi strategis desa. Kami bertujuan mendukung akselerasi usaha mikro warga lokal dan penataan PKL agar lebih tertib, bersih, serta ramai dikunjungi pembeli." },
    { key: "sewa_lahan_rates", value: "Tarif Lapak Tenda: Rp 150.000 / bulan\nTarif Warung Permanen: Rp 1.500.000 / tahun" },
    { key: "sewa_lahan_requirements", value: "Fotokopi KTP & KK warga desa setempat\nMengisi formulir pengajuan sewa\nMembayar uang jaminan kebersihan" },
    { key: "sewa_gedung_whatsapp", value: "6281234567890" },
    { key: "sewa_gedung_description", value: "BUMDes mengelola dan menyewakan Gedung Serbaguna Desa sebagai pusat fasilitas olahraga kemasyarakatan, resepsi pernikahan, pertemuan/rapat warga, serta acara hiburan seni budaya. Kami berkomitmen memberikan tempat yang bersih, nyaman, dan bertarif terjangkau demi menunjang kegiatan sosial-ekonomi warga desa setempat." },
    { key: "sewa_gedung_facilities", value: "Area Hall utama luas dengan kapasitas hingga 800 orang tamu berdiri.\nLapangan Bulutangkis (Badminton) indoor aktif sebanyak 2 line lapangan.\nPanggung permanen, toilet bersih, ruang ganti pakaian, dan area parkir memadai." },
    { key: "sewa_gedung_rates", value: "Olahraga Bulutangkis: Rp 20.000 / jam per lapangan\nAcara Resepsi / Pesta Pernikahan: Mulai dari Rp 1.500.000 / hari\nRapat / Seminar / Sosialisasi: Rp 500.000 / hari" },
    { key: "simpan_pinjam_whatsapp", value: "6281234567890" },
    { key: "simpan_pinjam_description", value: "Unit Simpan Pinjam didirikan khusus untuk memberikan akses permodalan yang mudah, cepat, dan aman bagi masyarakat desa serta kelompok tani (Poktan). Kami berfokus untuk menunjang produktivitas ekonomi pedesaan dan memberantas ketergantungan warga pada pinjaman liar dengan suku bunga yang menjerat." },
    { key: "simpan_pinjam_benefits", value: "Suku bunga flat kompetitif yang ditentukan oleh hasil Musyawarah Desa (Musdes).\nProses pengajuan transparan, kekeluargaan, dan bebas biaya administrasi siluman.\nDana simpanan diputar kembali untuk membiayai usaha produktif warga lokal." },
    { key: "simpan_pinjam_rates", value: "Plafon Usaha: Maksimal pinjaman Rp 10.000.000 (disesuaikan dengan skala usaha).\nTenor Waktu: Fleksibel mulai dari 3 bulan s/d 12 bulan.\nPeminjam wajib terdaftar sebagai anggota aktif BUMDes." },
    { key: "simpan_pinjam_requirements", value: "Fotokopi KTP suami/istri (bagi yang sudah menikah) dan Kartu Keluarga (KK).\nSurat Keterangan Usaha (SKU) dari RT/RW atau Kantor Desa.\nPas foto ukuran 3x4 sebanyak 2 lembar.\nSimpanan Pokok & Wajib sebagai anggota aktif." },
    { key: "ppob_whatsapp", value: "6281234567890" },
    { key: "ppob_description", value: "Unit PPOB (Payment Point Online Bank) BUMDes adalah pusat layanan pembayaran digital warga desa yang dekat dan terpercaya. Kini warga tidak perlu menempuh perjalanan jauh ke kota kecamatan hanya untuk mengantre membayar tagihan. Cukup kunjungi loket BUMDes atau agen pos desa kami untuk melunasi tagihan bulanan Anda secara cepat." },
    { key: "ppob_billings", value: "Listrik PLN: Pembelian token prabayar dan pelunasan tagihan listrik pascabayar.\nPDAM: Pembayaran tagihan air bersih bulanan PDAM kabupaten setempat.\nBPJS Kesehatan: Pembayaran iuran jaminan kesehatan mandiri untuk keluarga." },
    { key: "ppob_services", value: "Isi ulang pulsa reguler, paket data internet seluruh operator seluler (Telkomsel, Indosat, XL, Smartfren, dll).\nTop-up saldo e-wallet (DANA, OVO, ShopeePay, GoPay, LinkAja) untuk kebutuhan belanja digital.\nPembayaran cicilan pembiayaan (motor/mobil) dan transfer antar bank nasional." },
    { key: "ppob_reasons", value: "Aman & Terbuka: Setiap pembayaran menghasilkan struk bukti fisik resmi berstempel BUMDes.\nDekat & Hemat Waktu: Loket berlokasi di Kantor BUMDes atau agen pos desa.\nMembangun Desa: Sebagian biaya admin disalurkan kembali sebagai Pendapatan Asli Desa (PADes)." },
    {
      key: "umkm_list",
      value: JSON.stringify([
        {
          id: 1,
          name: "Kripik Singkong Renyah Desa",
          category: "Makanan Ringan",
          description: "Diproduksi langsung oleh Ibu-Ibu kelompok tani desa. Renyah, gurih, dan dibuat tanpa bahan pengawet.",
          phone: "6281234567890",
          imageUrl: "/umkm/kripik_singkong.png"
        },
        {
          id: 2,
          name: "Madu Hutan Asli Desa",
          category: "Kesehatan",
          description: "Madu murni hasil budidaya lebah hutan lokal. Terbukti menjaga imun tubuh, dipanen secara higienis dan berkala.",
          phone: "6281234567890",
          imageUrl: "/umkm/madu_desa.png"
        },
        {
          id: 3,
          name: "Batik Tulis Khas Desa",
          category: "Kerajinan",
          description: "Karya seni batik tulis buatan perajin lokal desa dengan motif khas alam pedesaan. Premium dan bernilai seni tinggi.",
          phone: "6281234567890",
          imageUrl: "/umkm/batik_desa.png"
        },
        {
          id: 4,
          name: "Kopi Robusta Lereng Desa",
          category: "Minuman",
          description: "Biji kopi robusta pilihan hasil kebun warga lereng bukit desa. Dipanggang dengan tingkat kematangan medium-dark.",
          phone: "6281234567890",
          imageUrl: "/umkm/kopi_desa.png"
        },
        {
          id: 5,
          name: "Keripik Tempe Gurih Sagu",
          category: "Makanan Ringan",
          description: "Keripik tempe sagu khas desa yang tipis, renyah, dan digoreng dengan minyak kelapa berkualitas tinggi.",
          phone: "6281234567890",
          imageUrl: "/umkm/keripik_tempe.png"
        },
        {
          id: 6,
          name: "Minyak Kelapa Asli (VCO)",
          category: "Kesehatan",
          description: "Minyak kelapa murni yang diproses dingin tanpa pemanasan suhu tinggi. Sangat baik untuk suplemen kesehatan dan kecantikan.",
          phone: "6281234567890",
          imageUrl: "/umkm/vco_desa.png"
        },
        {
          id: 7,
          name: "Gula Aren Cetak Murni",
          category: "Bahan Dapur",
          description: "Gula aren asli dari sadapan nira pohon enau di hutan desa. Manis alami tanpa campuran gula pasir.",
          phone: "6281234567890",
          imageUrl: "/umkm/gula_aren.png"
        },
        {
          id: 8,
          name: "Tas Anyaman Bambu Cantik",
          category: "Kerajinan",
          description: "Kerajinan tangan tas anyaman bambu multifungsi yang ramah lingkungan, awet, dan bernilai seni.",
          phone: "6281234567890",
          imageUrl: "/umkm/tas_bambu.png"
        },
        {
          id: 9,
          name: "Sambal Kemasan Khas Desa",
          category: "Makanan Ringan",
          description: "Sambal ulek tradisional dengan bahan cabai segar dari ladang desa. Dikemas higienis dan praktis.",
          phone: "6281234567890",
          imageUrl: "/umkm/sambal_desa.png"
        },
        {
          id: 10,
          name: "Susu Kambing Etawa Segar",
          category: "Kesehatan",
          description: "Susu kambing etawa segar hasil perahan peternakan desa. Kaya nutrisi dan higienis tanpa bau prengus.",
          phone: "6281234567890",
          imageUrl: "/umkm/susu_etawa.png"
        }
      ])
    }
  ]

  for (const s of settingsData) {
    await prisma.setting.create({
      data: s
    })
  }

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
    { key: "module_persuratan", value: "true" },
    { key: "sewa_lahan_whatsapp", value: "6281234567890" },
    { key: "sewa_gedung_whatsapp", value: "6281234567891" },
    { key: "simpan_pinjam_whatsapp", value: "6281234567892" },
    { key: "ppob_whatsapp", value: "6281234567893" },
    { key: "umkm_list", value: JSON.stringify([
      {
        id: "umkm-1",
        name: "Kripik Singkong Barokah",
        owner: "Ibu Aminah",
        category: "Makanan Ringan",
        description: "Kripik singkong renyah dengan berbagai varian rasa tradisional tanpa bahan pengawet.",
        phone: "6281234567894",
        imageUrl: "/umkm/kripik_singkong.png"
      },
      {
        id: "umkm-2",
        name: "Madu Hutan Lestari",
        owner: "Pak Joko",
        category: "Kesehatan & Herbal",
        description: "Madu murni hasil budidaya lebah liar di hutan Sukamaju yang kaya khasiat alami.",
        phone: "6281234567895",
        imageUrl: "/umkm/madu_desa.png"
      },
      {
        id: "umkm-3",
        name: "Batik Tulis Sukamaju",
        owner: "Ibu Hesti",
        category: "Kerajinan & Fashion",
        description: "Batik motif khas Sukamaju yang ditulis manual menggunakan canting tradisional.",
        phone: "6281234567896",
        imageUrl: "/umkm/batik_desa.png"
      },
      {
        id: "umkm-4",
        name: "Kopi Robusta Lereng Desa",
        owner: "Pak Wawan",
        category: "Minuman",
        description: "Biji kopi robusta pilihan hasil kebun warga lereng bukit desa. Dipanggang dengan tingkat kematangan medium-dark.",
        phone: "6281234567890",
        imageUrl: "/umkm/kopi_desa.png"
      },
      {
        id: "umkm-5",
        name: "Keripik Tempe Gurih Sagu",
        owner: "Ibu Marni",
        category: "Makanan Ringan",
        description: "Keripik tempe sagu khas desa yang tipis, renyah, dan digoreng dengan minyak kelapa berkualitas tinggi.",
        phone: "6281234567890",
        imageUrl: "/umkm/keripik_tempe.png"
      },
      {
        id: "umkm-6",
        name: "Minyak Kelapa Asli (VCO)",
        owner: "Pak Budi",
        category: "Kesehatan",
        description: "Minyak kelapa murni yang diproses dingin tanpa pemanasan suhu tinggi. Sangat baik untuk suplemen kesehatan dan kecantikan.",
        phone: "6281234567890",
        imageUrl: "/umkm/vco_desa.png"
      },
      {
        id: "umkm-7",
        name: "Gula Aren Cetak Murni",
        owner: "Pak Edi",
        category: "Bahan Dapur",
        description: "Gula aren asli dari sadapan nira pohon enau di hutan desa. Manis alami tanpa campuran gula pasir.",
        phone: "6281234567890",
        imageUrl: "/umkm/gula_aren.png"
      },
      {
        id: "umkm-8",
        name: "Tas Anyaman Bambu Cantik",
        owner: "Ibu Sri",
        category: "Kerajinan",
        description: "Kerajinan tangan tas anyaman bambu multifungsi yang ramah lingkungan, awet, dan bernilai seni.",
        phone: "6281234567890",
        imageUrl: "/umkm/tas_bambu.png"
      },
      {
        id: "umkm-9",
        name: "Sambal Kemasan Khas Desa",
        owner: "Ibu Tutik",
        category: "Makanan Ringan",
        description: "Sambal ulek tradisional dengan bahan cabai segar dari ladang desa. Dikemas higienis dan praktis.",
        phone: "6281234567890",
        imageUrl: "/umkm/sambal_desa.png"
      },
      {
        id: "umkm-10",
        name: "Susu Kambing Etawa Segar",
        owner: "Pak Heri",
        category: "Kesehatan",
        description: "Susu kambing etawa segar hasil perahan peternakan desa. Kaya nutrisi dan higienis tanpa bau prengus.",
        phone: "6281234567890",
        imageUrl: "/umkm/susu_etawa.png"
      }
    ])}
  ]

  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s
    })
  }

  // 4. Seed Mock Members (Minimal 10)
  console.log("Seeding mock members (10 total)...")
  const membersData = [
    { code: "P-001", name: "Budi Utomo", pokok: 50000, wajib: 120000 },
    { code: "P-002", name: "Siti Aminah", pokok: 50000, wajib: 90000 },
    { code: "P-003", name: "Joko Susilo", pokok: 50000, wajib: 60000 },
    { code: "P-004", name: "Anisa Rahma", pokok: 50000, wajib: 30000 },
    { code: "P-005", name: "Bambang Pamungkas", pokok: 50000, wajib: 150000 },
    { code: "P-006", name: "Dewi Lestari", pokok: 50000, wajib: 100000 },
    { code: "P-007", name: "Eko Prasetyo", pokok: 50000, wajib: 80000 },
    { code: "P-008", name: "Fitri Handayani", pokok: 50000, wajib: 50000 },
    { code: "P-009", name: "Gunawan Wibisono", pokok: 50000, wajib: 110000 },
    { code: "P-010", name: "Hesti Purwanti", pokok: 50000, wajib: 70000 }
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

  // 5. Seed Mock Saving Transactions (Minimal 10)
  console.log("Seeding mock saving transactions (12 total)...")
  const savingTransactionsData = [
    { memberId: dbMembers[0].id, type: "POKOK", amount: 50000, flow: "MASUK", date: new Date("2026-01-05T08:00:00Z"), description: "Setoran Awal Pokok" },
    { memberId: dbMembers[0].id, type: "WAJIB", amount: 120000, flow: "MASUK", date: new Date("2026-01-05T08:10:00Z"), description: "Setoran Wajib Terakumulasi" },
    { memberId: dbMembers[1].id, type: "POKOK", amount: 50000, flow: "MASUK", date: new Date("2026-01-10T09:00:00Z"), description: "Setoran Awal Pokok" },
    { memberId: dbMembers[1].id, type: "WAJIB", amount: 90000, flow: "MASUK", date: new Date("2026-01-10T09:15:00Z"), description: "Setoran Wajib Terakumulasi" },
    { memberId: dbMembers[2].id, type: "POKOK", amount: 50000, flow: "MASUK", date: new Date("2026-01-12T10:00:00Z"), description: "Setoran Awal Pokok" },
    { memberId: dbMembers[3].id, type: "POKOK", amount: 50000, flow: "MASUK", date: new Date("2026-01-15T09:00:00Z"), description: "Setoran Awal Pokok" },
    { memberId: dbMembers[4].id, type: "POKOK", amount: 50000, flow: "MASUK", date: new Date("2026-01-20T11:00:00Z"), description: "Setoran Awal Pokok" },
    { memberId: dbMembers[5].id, type: "POKOK", amount: 50000, flow: "MASUK", date: new Date("2026-01-22T08:30:00Z"), description: "Setoran Awal Pokok" },
    { memberId: dbMembers[6].id, type: "POKOK", amount: 50000, flow: "MASUK", date: new Date("2026-01-25T14:00:00Z"), description: "Setoran Awal Pokok" },
    { memberId: dbMembers[7].id, type: "POKOK", amount: 50000, flow: "MASUK", date: new Date("2026-02-01T09:00:00Z"), description: "Setoran Awal Pokok" },
    { memberId: dbMembers[8].id, type: "POKOK", amount: 50000, flow: "MASUK", date: new Date("2026-02-05T10:30:00Z"), description: "Setoran Awal Pokok" },
    { memberId: dbMembers[9].id, type: "POKOK", amount: 50000, flow: "MASUK", date: new Date("2026-02-10T11:15:00Z"), description: "Setoran Awal Pokok" }
  ]

  for (const st of savingTransactionsData) {
    await prisma.savingTransaction.create({ data: st })
  }

  // 6. Seed Mock Loans (Minimal 10)
  console.log("Seeding mock loans (10 total)...")
  const loansData = [
    { memberIndex: 0, type: "MASYARAKAT", principal: 5000000, interestRate: 1.5, monthlyInstallment: 575000, termMonths: 10, status: "ACTIVE", date: "2026-01-10T00:00:00Z" },
    { memberIndex: 1, type: "MASYARAKAT", principal: 3000000, interestRate: 1.5, monthlyInstallment: 345000, termMonths: 10, status: "ACTIVE", date: "2026-02-15T00:00:00Z" },
    { memberIndex: 2, type: "POKTAN", principal: 10000000, interestRate: 1.0, monthlyInstallment: 933333, termMonths: 12, status: "ACTIVE", date: "2026-01-05T00:00:00Z" },
    { memberIndex: 3, type: "MASYARAKAT", principal: 2000000, interestRate: 1.5, monthlyInstallment: 230000, termMonths: 10, status: "PAID", date: "2025-05-10T00:00:00Z" },
    { memberIndex: 4, type: "MASYARAKAT", principal: 4000000, interestRate: 1.5, monthlyInstallment: 460000, termMonths: 10, status: "ACTIVE", date: "2026-03-01T00:00:00Z" },
    { memberIndex: 5, type: "POKTAN", principal: 8000000, interestRate: 1.0, monthlyInstallment: 746667, termMonths: 12, status: "ACTIVE", date: "2026-02-20T00:00:00Z" },
    { memberIndex: 6, type: "MASYARAKAT", principal: 1500000, interestRate: 1.5, monthlyInstallment: 272500, termMonths: 6, status: "LATE", date: "2025-11-10T00:00:00Z" },
    { memberIndex: 7, type: "MASYARAKAT", principal: 6000000, interestRate: 1.5, monthlyInstallment: 690000, termMonths: 10, status: "ACTIVE", date: "2026-04-05T00:00:00Z" },
    { memberIndex: 8, type: "POKTAN", principal: 15000000, interestRate: 1.0, monthlyInstallment: 1400000, termMonths: 12, status: "ACTIVE", date: "2026-03-10T00:00:00Z" },
    { memberIndex: 9, type: "MASYARAKAT", principal: 2500000, interestRate: 1.5, monthlyInstallment: 287500, termMonths: 10, status: "ACTIVE", date: "2026-04-12T00:00:00Z" }
  ]

  const dbLoans = []
  for (const ld of loansData) {
    const loan = await prisma.loan.create({
      data: {
        memberId: dbMembers[ld.memberIndex].id,
        type: ld.type,
        principal: ld.principal,
        interestRate: ld.interestRate,
        monthlyInstallment: ld.monthlyInstallment,
        termMonths: ld.termMonths,
        status: ld.status,
        createdAt: new Date(ld.date)
      }
    })
    dbLoans.push(loan)
  }

  // 7. Seed Loan Repayments (Minimal 10)
  console.log("Seeding loan repayments (10 total)...")
  const repaymentsData = [
    { loanIndex: 0, principalPaid: 500000, interestPaid: 75000, date: "2026-02-10T08:00:00Z", desc: "Angsuran ke-1 Sdr. Budi Utomo" },
    { loanIndex: 0, principalPaid: 500000, interestPaid: 75000, date: "2026-03-10T08:30:00Z", desc: "Angsuran ke-2 Sdr. Budi Utomo" },
    { loanIndex: 1, principalPaid: 300000, interestPaid: 45000, date: "2026-03-15T09:00:00Z", desc: "Angsuran ke-1 Sdr. Siti Aminah" },
    { loanIndex: 2, principalPaid: 833333, interestPaid: 100000, date: "2026-02-05T10:00:00Z", desc: "Angsuran ke-1 POKTAN Makmur Sdr. Joko" },
    { loanIndex: 2, principalPaid: 833333, interestPaid: 100000, date: "2026-03-05T11:00:00Z", desc: "Angsuran ke-2 POKTAN Makmur Sdr. Joko" },
    { loanIndex: 4, principalPaid: 400000, interestPaid: 60000, date: "2026-04-01T09:15:00Z", desc: "Angsuran ke-1 Sdr. Bambang Pamungkas" },
    { loanIndex: 5, principalPaid: 666667, interestPaid: 80000, date: "2026-03-20T10:30:00Z", desc: "Angsuran ke-1 POKTAN Subur Sdri. Dewi" },
    { loanIndex: 7, principalPaid: 600000, interestPaid: 90000, date: "2026-05-05T08:45:00Z", desc: "Angsuran ke-1 Sdri. Fitri Handayani" },
    { loanIndex: 8, principalPaid: 1250000, interestPaid: 150000, date: "2026-04-10T09:00:00Z", desc: "Angsuran ke-1 POKTAN Jaya Sdr. Gunawan" },
    { loanIndex: 9, principalPaid: 250000, interestPaid: 37500, date: "2026-05-12T10:00:00Z", desc: "Angsuran ke-1 Sdri. Hesti Purwanti" }
  ]

  for (const rep of repaymentsData) {
    await prisma.loanRepayment.create({
      data: {
        loanId: dbLoans[rep.loanIndex].id,
        principalPaid: rep.principalPaid,
        interestPaid: rep.interestPaid,
        date: new Date(rep.date),
        description: rep.desc
      }
    })
  }

  // 8. Seed Gedung Bookings (Minimal 10)
  console.log("Seeding mock gedung bookings (10 total)...")
  const gedungBookingsData = [
    { customerName: "Rian Hidayat", type: "PESTA", dateStart: "2026-06-20T08:00:00Z", dateEnd: "2026-06-20T22:00:00Z", totalFee: 2500000, dpAmount: 1000000, status: "BOOKED", createdAt: "2026-05-01T09:00:00Z" },
    { customerName: "Komunitas Badminton Sukamaju", type: "BADMINTON", dateStart: "2026-05-15T15:00:00Z", dateEnd: "2026-05-15T17:00:00Z", totalFee: 100000, dpAmount: 100000, status: "PAID", createdAt: "2026-05-14T10:00:00Z" },
    { customerName: "Karang Taruna Sukamaju", type: "RAPAT", dateStart: "2026-05-20T13:00:00Z", dateEnd: "2026-05-20T17:00:00Z", totalFee: 300000, dpAmount: 150000, status: "BOOKED", createdAt: "2026-05-10T08:00:00Z" },
    { customerName: "Ibu Hartati (Pernikahan)", type: "PESTA", dateStart: "2026-07-05T07:00:00Z", dateEnd: "2026-07-05T23:00:00Z", totalFee: 2500000, dpAmount: 2500000, status: "PAID", createdAt: "2026-05-18T14:30:00Z" },
    { customerName: "Klub Badminton Harapan", type: "BADMINTON", dateStart: "2026-05-18T19:00:00Z", dateEnd: "2026-05-18T21:00:00Z", totalFee: 100000, dpAmount: 100000, status: "PAID", createdAt: "2026-05-17T11:00:00Z" },
    { customerName: "Bapak Supardi (Khitanan)", type: "PESTA", dateStart: "2026-08-12T08:00:00Z", dateEnd: "2026-08-12T22:00:00Z", totalFee: 2500000, dpAmount: 500000, status: "BOOKED", createdAt: "2026-05-20T09:00:00Z" },
    { customerName: "Rapat Koordinasi RT/RW", type: "RAPAT", dateStart: "2026-05-25T19:30:00Z", dateEnd: "2026-05-25T22:00:00Z", totalFee: 300000, dpAmount: 300000, status: "PAID", createdAt: "2026-05-24T08:00:00Z" },
    { customerName: "Badminton Sore Sukamaju", type: "BADMINTON", dateStart: "2026-05-22T16:00:00Z", dateEnd: "2026-05-22T18:00:00Z", totalFee: 100000, dpAmount: 0, status: "CANCELLED", createdAt: "2026-05-20T10:00:00Z" },
    { customerName: "Bapak Hendra (Arisan Keluarga)", type: "PESTA", dateStart: "2026-09-02T09:00:00Z", dateEnd: "2026-09-02T18:00:00Z", totalFee: 2000000, dpAmount: 1000000, status: "BOOKED", createdAt: "2026-05-25T13:00:00Z" },
    { customerName: "Klub Voli Sukamaju (Latihan Indor)", type: "BADMINTON", dateStart: "2026-05-26T14:00:00Z", dateEnd: "2026-05-26T16:00:00Z", totalFee: 100000, dpAmount: 100000, status: "PAID", createdAt: "2026-05-25T15:00:00Z" }
  ]

  for (const gb of gedungBookingsData) {
    await prisma.gedungBooking.create({
      data: {
        customerName: gb.customerName,
        type: gb.type,
        dateStart: new Date(gb.dateStart),
        dateEnd: new Date(gb.dateEnd),
        totalFee: gb.totalFee,
        dpAmount: gb.dpAmount,
        status: gb.status,
        createdAt: new Date(gb.createdAt)
      }
    })
  }

  // 9. Seed Lahan Contracts (Minimal 10)
  console.log("Seeding mock land contracts (10 total)...")
  const landContractsData = [
    { type: "LAPAK", number: "LPK-01", tenantName: "Warteg Barokah", phone: "08123456789", shift: "PAGI", fee: 150000, start: "2026-01-01T00:00:00Z", end: "2026-12-31T00:00:00Z", status: "ACTIVE" },
    { type: "LAPAK", number: "LPK-02", tenantName: "Soto Lamongan Pak Eko", phone: "08129876543", shift: "MALAM", fee: 150000, start: "2026-01-01T00:00:00Z", end: "2026-12-31T00:00:00Z", status: "ACTIVE" },
    { type: "WARUNG", number: "WRG-01", tenantName: "Kios Kelontong Madura", phone: "08138888777", shift: "NONE", fee: 1500000, start: "2026-01-01T00:00:00Z", end: "2026-12-31T00:00:00Z", status: "ACTIVE" },
    { type: "LAPAK", number: "LPK-03", tenantName: "Martabak Terang Bulan", phone: "08124445556", shift: "MALAM", fee: 150000, start: "2026-02-01T00:00:00Z", end: "2026-08-31T00:00:00Z", status: "ACTIVE" },
    { type: "LAPAK", number: "LPK-04", tenantName: "Gorengan Ceria", phone: "08155566677", shift: "PAGI", fee: 100000, start: "2026-02-01T00:00:00Z", end: "2026-07-31T00:00:00Z", status: "ACTIVE" },
    { type: "LAPAK", number: "LPK-05", tenantName: "Es Kelapa Muda Segar", phone: "08213333444", shift: "PAGI", fee: 100000, start: "2026-03-01T00:00:00Z", end: "2026-09-30T00:00:00Z", status: "ACTIVE" },
    { type: "WARUNG", number: "WRG-02", tenantName: "Warung Kopi & Indomie", phone: "08778899001", shift: "NONE", fee: 1200000, start: "2026-01-01T00:00:00Z", end: "2026-12-31T00:00:00Z", status: "ACTIVE" },
    { type: "LAPAK", number: "LPK-06", tenantName: "Nasi Goreng Spesial", phone: "08191212131", shift: "MALAM", fee: 120000, start: "2026-03-01T00:00:00Z", end: "2026-08-31T00:00:00Z", status: "ACTIVE" },
    { type: "LAPAK", number: "LPK-07", tenantName: "Bakso & Mie Ayam Solo", phone: "08234567890", shift: "PAGI", fee: 150000, start: "2026-01-01T00:00:00Z", end: "2026-12-31T00:00:00Z", status: "ACTIVE" },
    { type: "LAPAK", number: "LPK-08", tenantName: "Sate Ayam Madura", phone: "08567890123", shift: "MALAM", fee: 120000, start: "2026-04-01T00:00:00Z", end: "2026-09-30T00:00:00Z", status: "ACTIVE" }
  ]

  const dbContracts = []
  for (const lcd of landContractsData) {
    const contract = await prisma.lahanContract.create({
      data: {
        type: lcd.type,
        number: lcd.number,
        tenantName: lcd.tenantName,
        phone: lcd.phone,
        shift: lcd.shift,
        fee: lcd.fee,
        periodStart: new Date(lcd.start),
        periodEnd: new Date(lcd.end),
        status: lcd.status
      }
    })
    dbContracts.push(contract)
  }

  // 10. Seed Lahan Payments (Minimal 10)
  console.log("Seeding mock land payments (10 total)...")
  const landPaymentsData = [
    { contractIndex: 0, amount: 150000, date: "2026-01-05T09:00:00Z", period: "Januari 2026" },
    { contractIndex: 0, amount: 150000, date: "2026-02-04T10:00:00Z", period: "Februari 2026" },
    { contractIndex: 1, amount: 150000, date: "2026-01-06T09:30:00Z", period: "Januari 2026" },
    { contractIndex: 1, amount: 150000, date: "2026-02-05T08:30:00Z", period: "Februari 2026" },
    { contractIndex: 2, amount: 1500000, date: "2026-01-02T10:00:00Z", period: "Tahun 2026 (Lunas)" },
    { contractIndex: 3, amount: 150000, date: "2026-02-02T11:00:00Z", period: "Februari 2026" },
    { contractIndex: 4, amount: 100000, date: "2026-02-05T14:00:00Z", period: "Februari 2026" },
    { contractIndex: 5, amount: 100000, date: "2026-03-03T10:00:00Z", period: "Maret 2026" },
    { contractIndex: 6, amount: 1200000, date: "2026-01-03T11:30:00Z", period: "Tahun 2026 (Lunas)" },
    { contractIndex: 7, amount: 120000, date: "2026-03-05T15:00:00Z", period: "Maret 2026" }
  ]

  for (const lpd of landPaymentsData) {
    await prisma.lahanPayment.create({
      data: {
        contractId: dbContracts[lpd.contractIndex].id,
        amount: lpd.amount,
        date: new Date(lpd.date),
        periodCovered: lpd.period
      }
    })
  }

  // 11. Seed PPOB Rekap (Minimal 10)
  console.log("Seeding PPOB rekap entries (10 total)...")
  const ppobRekapsData = [
    { date: "2025-08-31T17:00:00Z", total: 12000000, commission: 360000, desc: "Rekap Komisi PPOB Agustus 2025" },
    { date: "2025-09-30T17:00:00Z", total: 13500000, commission: 405000, desc: "Rekap Komisi PPOB September 2025" },
    { date: "2025-10-31T17:00:00Z", total: 14000000, commission: 420000, desc: "Rekap Komisi PPOB Oktober 2025" },
    { date: "2025-11-30T17:00:00Z", total: 11000000, commission: 330000, desc: "Rekap Komisi PPOB November 2025" },
    { date: "2025-12-31T17:00:00Z", total: 16000000, commission: 480000, desc: "Rekap Komisi PPOB Desember 2025" },
    { date: "2026-01-31T17:00:00Z", total: 15000000, commission: 450000, desc: "Rekap Komisi PPOB Januari 2026" },
    { date: "2026-02-28T17:00:00Z", total: 14500000, commission: 435000, desc: "Rekap Komisi PPOB Februari 2026" },
    { date: "2026-03-31T17:00:00Z", total: 17000000, commission: 510000, desc: "Rekap Komisi PPOB Maret 2026" },
    { date: "2026-04-30T17:00:00Z", total: 18500000, commission: 555000, desc: "Rekap Komisi PPOB April 2026" },
    { date: "2026-05-31T17:00:00Z", total: 19000000, commission: 570000, desc: "Rekap Komisi PPOB Mei 2026" }
  ]

  for (const ppob of ppobRekapsData) {
    await prisma.ppobRekap.create({
      data: {
        date: new Date(ppob.date),
        totalRevenue: ppob.total,
        totalCommission: ppob.commission,
        description: ppob.desc
      }
    })
  }

  // 12. Seed Fixed Assets (Minimal 10)
  console.log("Seeding fixed assets (10 total)...")
  const fixedAssetsData = [
    { code: "AST-001", name: "Laptop HP Kantor", date: "2025-01-02T10:00:00Z", cost: 8500000, life: 4, rate: 25 },
    { code: "AST-002", name: "Printer Epson L3210", date: "2025-01-05T11:00:00Z", cost: 2400000, life: 3, rate: 33.3 },
    { code: "AST-003", name: "Meja Rapat Kayu Jati", date: "2025-02-10T09:00:00Z", cost: 5000000, life: 10, rate: 10 },
    { code: "AST-004", name: "Kursi Plastik Napolly (40 Pcs)", date: "2025-02-12T10:00:00Z", cost: 3200000, life: 5, rate: 20 },
    { code: "AST-005", name: "AC Sharp 1 PK", date: "2025-03-01T14:00:00Z", cost: 4100000, life: 5, rate: 20 },
    { code: "AST-006", name: "Sound System GSG", date: "2025-04-15T10:30:00Z", cost: 15000000, life: 8, rate: 12.5 },
    { code: "AST-007", name: "Lemari Arsip Besi", date: "2025-05-20T09:00:00Z", cost: 2800000, life: 5, rate: 20 },
    { code: "AST-008", name: "Genset Honda 5000 Watt", date: "2025-06-12T11:00:00Z", cost: 12500000, life: 8, rate: 12.5 },
    { code: "AST-009", name: "Sepeda Motor Honda Revo Inventaris", date: "2025-08-01T10:00:00Z", cost: 16800000, life: 8, rate: 12.5 },
    { code: "AST-010", name: "Papan Tulis Whiteboard & Stand", date: "2025-08-15T09:00:00Z", cost: 750000, life: 5, rate: 20 }
  ]

  for (const fa of fixedAssetsData) {
    await prisma.fixedAsset.create({
      data: {
        code: fa.code,
        name: fa.name,
        purchaseDate: new Date(fa.date),
        purchaseCost: fa.cost,
        economicLife: fa.life,
        depreciationRate: fa.rate,
        accumDep: 0,
        createdAt: new Date(fa.date)
      }
    })
  }

  // 13. Post Journal Entries (Minimal 10)
  console.log("Posting Journal Entries for FY 2026 (10 total)...")
  
  const journalEntries = [
    {
      date: "2026-01-01T00:00:00Z",
      description: "Jurnal Pembuka Saldo Awal Tahun Anggaran 2026",
      unitUsaha: "UMUM",
      lines: [
        { accountCode: "1-1100", type: "DEBIT", amount: 150000000 },
        { accountCode: "1-1200", type: "DEBIT", amount: 25000000 },
        { accountCode: "1-1300", type: "DEBIT", amount: 15000000 },
        { accountCode: "1-2100", type: "DEBIT", amount: 20000000 },
        { accountCode: "3-1100", type: "CREDIT", amount: 210000000 }
      ]
    },
    {
      date: "2026-01-05T09:00:00Z",
      description: "Penerimaan Sewa Lapak Bulanan (LPK-01) Warteg Barokah",
      unitUsaha: "LAHAN",
      lines: [
        { accountCode: "1-1300", type: "DEBIT", amount: 150000 },
        { accountCode: "4-1300", type: "CREDIT", amount: 150000 }
      ]
    },
    {
      date: "2026-01-10T08:00:00Z",
      description: "Pencairan Pinjaman Baru Sdr. Budi Utomo",
      unitUsaha: "SP",
      lines: [
        { accountCode: "1-1400", type: "DEBIT", amount: 5000000 },
        { accountCode: "1-1100", type: "CREDIT", amount: 5000000 }
      ]
    },
    {
      date: "2026-01-15T09:00:00Z",
      description: "Penerimaan Simpanan Pokok & Wajib Anggota Baru Sdri. Anisa Rahma",
      unitUsaha: "SP",
      lines: [
        { accountCode: "1-1100", type: "DEBIT", amount: 80000 },
        { accountCode: "2-1100", type: "CREDIT", amount: 50000 },
        { accountCode: "2-1200", type: "CREDIT", amount: 30000 }
      ]
    },
    {
      date: "2026-01-31T17:00:00Z",
      description: "Penerimaan Komisi Agen Pos PPOB Periode Januari 2026",
      unitUsaha: "UMUM",
      lines: [
        { accountCode: "1-1100", type: "DEBIT", amount: 450000 },
        { accountCode: "4-1400", type: "CREDIT", amount: 450000 }
      ]
    },
    {
      date: "2026-02-02T10:00:00Z",
      description: "Pembelian Kertas HVS & ATK Kantor BUMDES",
      unitUsaha: "UMUM",
      lines: [
        { accountCode: "5-1100", type: "DEBIT", amount: 120000 },
        { accountCode: "1-1100", type: "CREDIT", amount: 120000 }
      ]
    },
    {
      date: "2026-02-10T08:00:00Z",
      description: "Penerimaan Angsuran Ke-1 Sdr. Budi Utomo",
      unitUsaha: "SP",
      lines: [
        { accountCode: "1-1100", type: "DEBIT", amount: 575000 },
        { accountCode: "1-1400", type: "CREDIT", amount: 500000 },
        { accountCode: "4-1100", type: "CREDIT", amount: 75000 }
      ]
    },
    {
      date: "2026-02-15T10:00:00Z",
      description: "Pembayaran Biaya Listrik Kantor BUMDES",
      unitUsaha: "UMUM",
      lines: [
        { accountCode: "5-1100", type: "DEBIT", amount: 230000 },
        { accountCode: "1-1100", type: "CREDIT", amount: 230000 }
      ]
    },
    {
      date: "2026-05-01T09:00:00Z",
      description: "Penerimaan Uang Muka Sewa Gedung Pesta (Rian)",
      unitUsaha: "GEDUNG",
      lines: [
        { accountCode: "1-1200", type: "DEBIT", amount: 1000000 },
        { accountCode: "4-1200", type: "CREDIT", amount: 1000000 }
      ]
    },
    {
      date: "2026-05-14T10:00:00Z",
      description: "Penerimaan Sewa Gedung Lapangan Bulutangkis (Klub Badminton)",
      unitUsaha: "GEDUNG",
      lines: [
        { accountCode: "1-1200", type: "DEBIT", amount: 100000 },
        { accountCode: "4-1200", type: "CREDIT", amount: 100000 }
      ]
    }
  ]

  for (const entry of journalEntries) {
    const dbEntry = await prisma.journalEntry.create({
      data: {
        date: new Date(entry.date),
        description: entry.description,
        unitUsaha: entry.unitUsaha
      }
    })

    for (const line of entry.lines) {
      await prisma.journalLine.create({
        data: {
          journalEntryId: dbEntry.id,
          accountCode: line.accountCode,
          type: line.type,
          amount: line.amount
        }
      })
    }
  }

  // 14. Seed Documents (Minimal 10)
  console.log("Seeding documents (10 total)...")
  const documentsData = [
    { docNumber: "001/SK/BUMDES/I/2026", type: "SK", subject: "SK Pengangkatan Pengurus BUMDes 2026-2029", sender: null, recipient: "Pengurus BUMDes", file: "/documents/sk_pengurus.pdf" },
    { docNumber: "002/SK/BUMDES/I/2026", type: "SK", subject: "SK Penetapan Suku Bunga Simpan Pinjam", sender: null, recipient: "Unit Usaha SP", file: null },
    { docNumber: "120/PEM-DS/II/2026", type: "SURAT_MASUK", subject: "Pemberitahuan Penyaluran Modal Desa Tahap 1", sender: "Pemerintah Desa Sukamaju", recipient: "Direktur BUMDes", file: "/documents/surat_masuk_modal.pdf" },
    { docNumber: "003/OUT/BUMDES/II/2026", type: "SURAT_KELUAR", subject: "Undangan Rapat Pleno Unit Usaha Sewa Lahan", sender: "Sekretaris BUMDes", recipient: "Seluruh Pedagang Lapak", file: null },
    { docNumber: "004/OUT/BUMDES/III/2026", type: "SURAT_KELUAR", subject: "Laporan Bulanan Keuangan Februari 2026", sender: "Bendahara BUMDes", recipient: "Kepala Desa / Dewan Pengawas", file: "/documents/laporan_feb_2026.pdf" },
    { docNumber: "451/KEC-KM/III/2026", type: "SURAT_MASUK", subject: "Permintaan Data UMKM Binaan BUMDes", sender: "Kecamatan Kemakmuran", recipient: "Direktur BUMDes", file: null },
    { docNumber: "005/SK/BUMDES/IV/2026", type: "SK", subject: "SK SOP Sewa Gedung Serba Guna", sender: null, recipient: "Unit Usaha Gedung", file: null },
    { docNumber: "006/OUT/BUMDES/IV/2026", type: "SURAT_KELUAR", subject: "Pengajuan Kerja Sama Agen Pos PPOB Baru", sender: "Direktur BUMDes", recipient: "PT Pos Indonesia Cab. Harapan", file: null },
    { docNumber: "230/DISMAS/V/2026", type: "SURAT_MASUK", subject: "Undangan Pelatihan Manajemen Keuangan BUMDes", sender: "Dinas Pemberdayaan Masyarakat", recipient: "Bendahara BUMDes", file: null },
    { docNumber: "007/OUT/BUMDES/V/2026", type: "SURAT_KELUAR", subject: "Jawaban Permintaan Data UMKM Sukamaju", sender: "Sekretaris BUMDes", recipient: "Kecamatan Kemakmuran", file: null }
  ]

  for (const doc of documentsData) {
    await prisma.document.create({
      data: {
        docNumber: doc.docNumber,
        type: doc.type,
        subject: doc.subject,
        sender: doc.sender,
        recipient: doc.recipient,
        fileUrl: doc.file,
        date: new Date()
      }
    })
  }

  // 15. Seed Posts (Minimal 10)
  console.log("Seeding posts/news (10 total)...")
  const postsData = [
    { title: "Rapat Pleno BUMDes Sukamaju Sepakati Target Pendapatan Tahun 2026", slug: "rapat-pleno-bumdes-2026", content: "Sukamaju - BUMDes Maju Sejahtera Sukamaju melaksanakan Rapat Pleno untuk membahas target pendapatan unit usaha di tahun 2026. Semua pengurus optimistis mencapai target.", published: true },
    { title: "Kini Warga Bisa Bayar Tagihan Listrik & BPJS di Kantor BUMDes", slug: "pembayaran-listrik-bpjs-bumdes", content: "Sukamaju - BUMDes kini menyediakan layanan PPOB bekerja sama dengan Pos Indonesia. Warga Sukamaju tidak perlu pergi jauh ke kota untuk membayar tagihan bulanan.", published: true },
    { title: "Optimalisasi Aset Desa Melalui Sewa Lahan Lapak Dagang Modern", slug: "optimalisasi-aset-sewa-lahan", content: "Sukamaju - Unit usaha sewa lahan lapak kini menampung lebih dari 8 UMKM lokal. Program ini bertujuan memberdayakan perekonomian warga secara berkesinambungan.", published: true },
    { title: "Program Pinjaman POKTAN Dukung Ketahanan Pangan Desa", slug: "pinjaman-poktan-ketahanan-pangan", content: "Sukamaju - Unit Simpan Pinjam meluncurkan program pembiayaan murah bagi Kelompok Tani (POKTAN) guna membeli pupuk dan bibit unggul menjelang musim tanam.", published: true },
    { title: "Kunjungan Studi Banding BUMDes Sukses dari Kabupaten Tetangga", slug: "kunjungan-studi-banding", content: "Sukamaju - Pengurus BUMDes menerima rombongan studi banding dari Desa sebelah yang ingin mempelajari tata kelola keuangan berbasis digital dan transparansi.", published: true },
    { title: "Minyak Goreng Murah BUMDes Sukamaju Ludes dalam Dua Jam", slug: "minyak-goreng-murah-bumdes", content: "Sukamaju - Operasi pasar murah minyak goreng diselenggarakan BUMDes bekerja sama dengan distributor daerah. Ratusan liter minyak goreng tersalurkan merata.", published: true },
    { title: "Gedung Serba Guna Sukamaju Siap Jadi Sentra Olahraga Remaja", slug: "gedung-serba-guna-sentra-olahraga", content: "Sukamaju - Penyewaan lapangan bulutangkis di Gedung Serba Guna BUMDes terus mengalami kenaikan okupansi, khususnya dari kalangan pelajar dan remaja.", published: true },
    { title: "Kripik Singkong Barokah Binaan BUMDes Tembus Pasar Provinsi", slug: "kripik-singkong-barokah-provinsi", content: "Sukamaju - Salah satu UMKM binaan Pojok UMKM BUMDes Sukamaju, Kripik Singkong Barokah, berhasil melakukan pengiriman perdana ke supermarket di tingkat provinsi.", published: true },
    { title: "Pelatihan Pembukuan Keuangan Berbasis Akuntansi bagi Staf BUMDes", slug: "pelatihan-pembukuan-keuangan-staf", content: "Sukamaju - Seluruh operator unit usaha BUMDes dibekali pelatihan pembukuan transaksi harian demi menghasilkan jurnal umum yang kredibel dan bebas kekeliruan.", published: true },
    { title: "Persiapan Laporan Pertanggungjawaban Tahunan (LPJ) Akhir Tahun 2026", slug: "persiapan-lpj-tahunan-2026", content: "Sukamaju - Pengurus BUMDes mulai merangkum laporan manajemen dan kinerja operasional unit usaha untuk dipresentasikan dalam forum Musyawarah Desa mendatang.", published: true }
  ]

  for (const post of postsData) {
    await prisma.post.create({
      data: {
        title: post.title,
        slug: post.slug,
        content: post.content,
        published: post.published,
        createdAt: new Date()
      }
    })
  }

  // 16. Seed Tax Transactions (Minimal 10)
  console.log("Seeding tax transactions (10 total)...")
  const taxData = [
    { description: "Penyetoran PPh 21 Karyawan Kantor BUMDes", taxType: "PPh 21", amount: 150000, flow: "SETOR" },
    { description: "Pemotongan PPh 23 atas Jasa Konstruksi Lapak", taxType: "PPh 23", amount: 450000, flow: "POTONG" },
    { description: "Setoran PPN Kegiatan Sewa Gedung Pesta", taxType: "PPN", amount: 250000, flow: "SETOR" },
    { description: "Penyetoran PPh 25 Masa Januari 2026", taxType: "PPh 25", amount: 200000, flow: "SETOR" },
    { description: "Pemotongan Pajak Bunga Bank Kas Utama", taxType: "PPh 23", amount: 25000, flow: "POTONG" },
    { description: "Penyetoran PPh 21 Direktur BUMDes", taxType: "PPh 21", amount: 75000, flow: "SETOR" },
    { description: "Penyetoran PPh 25 Masa Februari 2026", taxType: "PPh 25", amount: 200000, flow: "SETOR" },
    { description: "Pemotongan PPh 23 atas Pengadaan AC Kantor", taxType: "PPh 23", amount: 82000, flow: "POTONG" },
    { description: "Setoran PPN Pengadaan Laptop Inventaris Kantor", taxType: "PPN", amount: 850000, flow: "SETOR" },
    { description: "Penyetoran PPh 25 Masa Maret 2026", taxType: "PPh 25", amount: 200000, flow: "SETOR" }
  ]

  for (const tx of taxData) {
    await prisma.taxTransaction.create({
      data: {
        description: tx.description,
        taxType: tx.taxType,
        amount: tx.amount,
        flow: tx.flow,
        date: new Date()
      }
    })
  }

  // 17. Seed Meeting Minutes (Minimal 10)
  console.log("Seeding meeting minutes (10 total)...")
  const meetingMinutesData = [
    { title: "Musyawarah Desa (Musdes) Rencana Kerja BUMDes 2026", category: "MUSDES", attendees: 45, minutes: "Menyepakati penambahan unit usaha PPOB dan perluasan area sewa lahan pedagang.", notes: "Dihadiri Kades, BPD, tokoh masyarakat." },
    { title: "Rapat Koordinasi Bulanan Pengurus BUMDes Januari", category: "INTERN", attendees: 8, minutes: "Evaluasi kinerja unit Simpan Pinjam dan persiapan audit triwulan.", notes: "Operator SP diinstruksikan menindaklanjuti keterlambatan angsuran." },
    { title: "Rapat Pengawas dan Penyerahan Laporan Keuangan Tahunan", category: "PENGAWAS", attendees: 5, minutes: "Pemeriksaan berkas pembukuan tahun buku 2025 dan penyerahan SHU.", notes: "Laporan dinyatakan wajar tanpa catatan khusus." },
    { title: "Rapat Intern Koordinasi Unit Sewa Gedung Serba Guna", category: "INTERN", attendees: 6, minutes: "Penyusunan jadwal sewa badminton dan perbaikan fasilitas toilet gedung.", notes: "Dana operasional dialokasikan sebesar 500 ribu rupiah." },
    { title: "Sosialisasi Program Kredit POKTAN kepada Kelompok Tani", category: "LAINNYA", attendees: 25, minutes: "Penyampaian syarat pinjaman murah khusus sektor pertanian menjelang musim tanam.", notes: "POKTAN Makmur dan Subur menyatakan minat." },
    { title: "Rapat Pleno Penyusunan SOP Penilaian Kelayakan Kredit", category: "INTERN", attendees: 7, minutes: "Menetapkan batas maksimal pinjaman masyarakat umum sebesar 5 juta rupiah.", notes: "Berlaku efektif sejak ditandatangani Direktur." },
    { title: "Rapat Koordinasi Bulanan Pengurus BUMDes Februari", category: "INTERN", attendees: 8, minutes: "Pembahasan laporan realisasi pendapatan unit usaha sewa lapak dan warung.", notes: "Seluruh pedagang aktif membayar tepat waktu." },
    { title: "Rapat Kerja Sama Keagenan bersama Pihak Pos Indonesia", category: "LAINNYA", attendees: 4, minutes: "Finalisasi komisi transaksi PPOB dan instalasi sistem aplikasi pos online.", notes: "Lokasi pelayanan disepakati di loket kantor BUMDes." },
    { title: "Rapat Pleno Evaluasi Kinerja Semester I Tahun 2026", category: "INTERN", attendees: 9, minutes: "Membahas progres pencapaian target pendapatan masing-masing unit usaha.", notes: "Unit PPOB dan Gedung melampaui target bulanan." },
    { title: "Rapat Koordinasi Evaluasi Keamanan Pasar Lapak Desa", category: "INTERN", attendees: 12, minutes: "Menunjuk petugas kebersihan dan keamanan malam tambahan untuk kompleks lapak.", notes: "Iuran ditanggung bersama lewat dana operasional unit." }
  ]

  for (const mm of meetingMinutesData) {
    await prisma.meetingMinutes.create({
      data: {
        title: mm.title,
        category: mm.category,
        attendees: mm.attendees,
        minutes: mm.minutes,
        notes: mm.notes,
        date: new Date()
      }
    })
  }

  // 18. Seed Audit Logs (Minimal 10)
  console.log("Seeding audit logs (10 total)...")
  const auditLogsData = [
    { username: "admin", name: "Administrator", role: "ADMIN", action: "LOGIN", detail: "Berhasil masuk ke dashboard sistem BUMDes" },
    { username: "bendahara", name: "Bendahara Keuangan", role: "BENDAHARA", action: "CREATE_JOURNAL", detail: "Membuat jurnal pembuka anggaran tahun 2026" },
    { username: "operator_sp", name: "Operator Simpan Pinjam", role: "OPERATOR_SP", action: "CREATE_MEMBER", detail: "Mendaftarkan anggota baru atas nama Anisa Rahma (P-004)" },
    { username: "operator_sewa", name: "Operator Sewa Gedung & Lahan", role: "OPERATOR_SEWA", action: "CREATE_BOOKING", detail: "Mencatat pesanan sewa gedung pesta Sdr. Rian Hidayat" },
    { username: "bendahara", name: "Bendahara Keuangan", role: "BENDAHARA", action: "POST_PAYMENT", detail: "Menerima setoran angsuran ke-1 Sdr. Budi Utomo" },
    { username: "operator_sewa", name: "Operator Sewa Gedung & Lahan", role: "OPERATOR_SEWA", action: "CREATE_CONTRACT", detail: "Menerbitkan kontrak lapak LPK-01 penyewa Warteg Barokah" },
    { username: "admin", name: "Administrator", role: "ADMIN", action: "UPDATE_SETTINGS", detail: "Mengubah konfigurasi umum nama BUMDes menjadi BUMDES MAJU SEJAHTERA" },
    { username: "sekretaris", name: "Sekretaris", role: "SEKRETARIS", action: "CREATE_DOCUMENT", detail: "Mengarsipkan SK Pengangkatan Pengurus BUMDes 2026-2029" },
    { username: "sekretaris", name: "Sekretaris", role: "SEKRETARIS", action: "CREATE_POST", detail: "Mempublikasikan artikel berita Rapat Pleno BUMDes 2026" },
    { username: "admin", name: "Administrator", role: "ADMIN", action: "LOCK_PERIOD", detail: "Melakukan penguncian periode laporan keuangan tahun buku 2025" }
  ]

  for (const al of auditLogsData) {
    await prisma.auditLog.create({
      data: {
        userId: "system-seed-user-id",
        username: al.username,
        name: al.name,
        role: al.role,
        action: al.action,
        detail: al.detail,
        timestamp: new Date()
      }
    })
  }

  // 19. Seed Default LPJ Narrative template
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
  console.log("Database initialized with rich demo data (at least 10 items for every model/menu).")
  console.log("Access the app at: http://localhost:3000")
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

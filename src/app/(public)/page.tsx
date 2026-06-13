import React from "react"
import Link from "next/link"
import { db } from "@/lib/db"
import { getSettings } from "@/lib/settings"
import {
  Coins,
  Building2,
  Map,
  CreditCard,
  ArrowRight,
  TrendingUp,
  Users,
  Award,
  Calendar,
  ChevronRight,
  ShieldCheck,
  Zap,
  Globe
} from "lucide-react"

import type { Metadata } from "next"
import { formatRupiah } from "@/lib/utils"

export const revalidate = 0 // Disable cache for live stats

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings()
  const name = settings.bumdes_name || "BUMDES Desa"
  const village = settings.village_name || ""
  const district = settings.district_name || ""
  const regency = settings.regency_name || ""
  const locationParts = [village, district, regency].filter(Boolean).join(", ")
  return {
    title: `${name} - Menggerakkan Ekonomi Desa`,
    description: `Portal resmi ${name}${locationParts ? `, ${locationParts}` : ""}. Informasi unit usaha simpan pinjam, sewa gedung, sewa lahan, PPOB dan berita kegiatan desa.`,
    keywords: ["BUMDES", village, regency, "Simpan Pinjam Desa", "Sewa Gedung", "Lapak UMKM", "Laporan Pertanggungjawaban Desa"].filter(Boolean),
    openGraph: {
      title: `${name} - Menggerakkan Ekonomi Desa`,
      description: `Portal resmi ${name}${locationParts ? `, ${locationParts}` : ""}.`,
      type: "website",
    }
  }
}

export default async function PublicHomePage() {
  const settings = await getSettings()
  const bumdesName = settings.bumdes_name || "BUMDES Desa"
  const villageName = settings.village_name || ""
  const districtName = settings.district_name || ""
  const regencyName = settings.regency_name || ""
  const locationParts = [villageName, districtName, regencyName].filter(Boolean)
  const locationShort = locationParts.length > 0 ? locationParts.join(", ") : ""

  // Parse UMKM list
  let umkmList = []
  try {
    if (settings.umkm_list) {
      umkmList = JSON.parse(settings.umkm_list)
    }
  } catch (e) {
    console.error("Error parsing umkm_list in public home page", e)
  }

  // Fetch live stats from the database
  const memberCount = await db.member.count()
  const postCount = await db.post.count({ where: { published: true } })
  const bookingCount = await db.gedungBooking.count({ where: { status: "PAID" } })
  
  // Fetch latest 3 published articles
  const latestPosts = await db.post.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    take: 3,
  })

  // Fetch financial data dynamically
  const [journalLines, ledgerAccounts] = await Promise.all([
    db.journalLine.findMany({
      select: {
        accountCode: true,
        type: true,
        amount: true,
      }
    }),
    db.ledgerAccount.findMany({
      select: {
        code: true,
        type: true,
      }
    })
  ])

  const accountTypes: Record<string, string> = {}
  ledgerAccounts.forEach(acc => {
    accountTypes[acc.code] = acc.type
  })

  let totalRevenue = 0
  let totalExpense = 0

  journalLines.forEach(line => {
    const accType = accountTypes[line.accountCode]
    if (accType === "REVENUE") {
      if (line.type === "CREDIT") {
        totalRevenue += line.amount
      } else {
        totalRevenue -= line.amount
      }
    } else if (accType === "EXPENSE") {
      if (line.type === "DEBIT") {
        totalExpense += line.amount
      } else {
        totalExpense -= line.amount
      }
    }
  })

  const netProfit = Math.max(totalRevenue - totalExpense, 0)
  const padesPct = parseFloat(settings.shu_desa_pct || "25")
  const padesAmount = netProfit * (padesPct / 100)

  const stats = [
    { label: "Anggota Aktif", value: memberCount, icon: Users, suffix: "Orang" },
    { label: "Transaksi Sewa", value: bookingCount, icon: TrendingUp, suffix: "Sewa" },
    { label: "Artikel Rilis", value: postCount, icon: Award, suffix: "Publikasi" },
  ]

  const businessUnits = [
    {
      name: "Unit Simpan Pinjam",
      description: "Penyediaan akses permodalan bagi usaha mikro masyarakat desa dan kelompok tani untuk menunjang produktivitas.",
      icon: Coins,
      color: "from-emerald-500 to-teal-600",
      textColor: "text-emerald-700",
      bgColor: "bg-emerald-50/20 hover:bg-emerald-50/40",
      borderColor: "border-emerald-100/60",
      shadowColor: "shadow-emerald-500/10",
      slug: "simpan-pinjam"
    },
    {
      name: "Unit Sewa Gedung",
      description: "Penyewaan Gedung Serbaguna Desa untuk sarana olahraga, resepsi pernikahan, rapat, dan acara kemasyarakatan.",
      icon: Building2,
      color: "from-blue-500 to-indigo-600",
      textColor: "text-blue-700",
      bgColor: "bg-blue-50/20 hover:bg-blue-50/40",
      borderColor: "border-blue-100/60",
      shadowColor: "shadow-blue-500/10",
      slug: "sewa-gedung"
    },
    {
      name: "Unit Sewa Lahan",
      description: "Penyewaan kavling lapak dan warung bagi pedagang lokal di area strategis desa guna mendongkrak UMKM desa.",
      icon: Map,
      color: "from-amber-500 to-orange-600",
      textColor: "text-amber-700",
      bgColor: "bg-amber-50/20 hover:bg-amber-50/40",
      borderColor: "border-amber-100/60",
      shadowColor: "shadow-amber-500/10",
      slug: "sewa-lahan"
    },
    {
      name: "Unit Pembayaran Tagihan (PPOB)",
      description: "Pusat pembayaran tagihan digital masyarakat mulai dari listrik PLN, PDAM, BPJS, hingga pulsa secara cepat dan dekat.",
      icon: CreditCard,
      color: "from-violet-500 to-purple-600",
      textColor: "text-violet-700",
      bgColor: "bg-violet-50/20 hover:bg-violet-50/40",
      borderColor: "border-violet-100/60",
      shadowColor: "shadow-violet-500/10",
      slug: "ppob"
    },
  ]

  return (
    <div className="space-y-20 pb-20 bg-slate-50/30 overflow-x-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative bg-slate-950 text-white overflow-hidden py-24 lg:py-36">
        {/* Modern Mesh Glow Background */}
        <div className="absolute top-0 left-1/4 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-emerald-500/10 rounded-full blur-[100px] -translate-y-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] sm:w-[700px] h-[500px] sm:h-[700px] bg-teal-500/10 rounded-full blur-[120px] translate-y-1/3 pointer-events-none"></div>
        
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_80%,transparent_100%)] opacity-35 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Text Content */}
            <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Portal Resmi {bumdesName}
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none text-white">
                Menggerakkan Ekonomi, <br />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                  Membangun Kemandirian Desa
                </span>
              </h1>
              <p className="text-slate-400 text-sm sm:text-base lg:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                {bumdesName} mengelola unit usaha strategis secara terintegrasi untuk mendukung percepatan pemulihan ekonomi, UMKM desa, dan pendapatan asli desa secara berkelanjutan.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/berita"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-lg shadow-emerald-500/20 active:scale-95 transition-all duration-200"
                >
                  Lihat Berita & Kegiatan
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="#units"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold rounded-2xl text-xs sm:text-sm border border-slate-800 active:scale-95 transition-all duration-200"
                >
                  Jelajahi Unit Usaha
                </Link>
              </div>
            </div>
            
            {/* Visual Glassmorphism Callout */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md bg-white/[0.02] border border-white/10 backdrop-blur-xl p-8 rounded-[36px] shadow-2xl space-y-6 overflow-hidden">
                {/* Visual glow element inside the card */}
                <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-sm sm:text-base leading-none">{bumdesName}</h3>
                    {locationShort && (
                      <p className="text-[10px] text-slate-500 font-bold mt-1.5 tracking-wide uppercase">{locationShort}</p>
                    )}
                  </div>
                </div>
                
                <div className="border-t border-white/10 pt-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                      <Zap className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-400">Layanan Aktif</span>
                      <span className="text-emerald-400">4 Unit Bisnis</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-400">Keamanan Sistem</span>
                      <span className="text-emerald-400">Data Aman & Terlindungi</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                      <Globe className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-400">Sistem Laporan</span>
                      <span className="text-emerald-400">Terbuka & Transparan</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. BUSINESS UNITS SECTION (Floating Cards with Shadows) */}
      <section id="units" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {businessUnits.map((unit, idx) => {
            const Icon = unit.icon
            return (
              <div
                key={idx}
                className="group relative p-6 bg-white border border-slate-100/80 rounded-[28px] shadow-[0_15px_35px_-15px_rgba(15,23,42,0.08)] hover:shadow-[0_20px_40px_-10px_rgba(16,185,129,0.12)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden min-h-[260px]"
              >
                {/* Subtle colored shadow hover background */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-slate-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[28px] pointer-events-none"></div>
                
                <div className="space-y-4 relative z-10">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${unit.color} text-white flex items-center justify-center shrink-0 shadow-md ${unit.shadowColor} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-extrabold text-slate-800 text-sm leading-snug">{unit.name}</h3>
                    <p className="text-slate-500 text-[11px] leading-relaxed font-semibold line-clamp-3">
                      {unit.description}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/layanan/${unit.slug}`}
                  className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-emerald-600 hover:text-emerald-700 relative z-10"
                >
                  <span>Detail Layanan</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </div>
            )
          })}
        </div>
      </section>

      {/* 3. STATS SECTION (Kinerja & Dampak) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pt-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50/60 px-3.5 py-1.5 rounded-full border border-emerald-100/50 inline-block">
            Kinerja & Dampak
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Statistik Aktivitas BUMDes
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm font-semibold leading-relaxed">
            Realisasi kinerja operasional dan statistik berjalan BUMDes Desa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((s, idx) => {
            const Icon = s.icon
            return (
              <div
                key={idx}
                className="bg-white border border-slate-100/70 p-6 sm:p-8 rounded-[30px] shadow-[0_15px_35px_-15px_rgba(15,23,42,0.06)] hover:shadow-[0_20px_40px_-10px_rgba(16,185,129,0.08)] hover:-translate-y-1 transition-all duration-300 flex items-center gap-5 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-50/50 border border-emerald-100/50 text-emerald-600 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-300">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">
                    {s.label}
                  </span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-black text-slate-900 tracking-tight">{s.value}</span>
                    <span className="text-xs text-slate-400 font-bold tracking-wide">{s.suffix}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* TRANSPARANSI KEUANGAN SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pt-8">
        <div className="bg-slate-900 border border-slate-800 rounded-[36px] p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none"></div>
          
          <div className="max-w-3xl mx-auto text-center space-y-4 relative z-10">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full inline-block">
              Transparansi Publik
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Realisasi Keuangan & Kontribusi Desa
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed font-semibold">
              Sebagai wujud akuntabilitas, berikut adalah ringkasan pendapatan, laba bersih, serta dana pembangunan yang disalurkan langsung ke Pendapatan Asli Desa (PADes) tahun berjalan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 relative z-10">
            <div className="bg-white/[0.03] border border-white/5 p-6 rounded-[24px] space-y-4">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Pendapatan BUMDes</span>
              <div className="text-xl sm:text-2xl font-black text-white">{formatRupiah(totalRevenue)}</div>
              <p className="text-[10px] text-slate-400 leading-normal">Omset dari seluruh unit bisnis terintegrasi.</p>
            </div>

            <div className="bg-white/[0.03] border border-white/5 p-6 rounded-[24px] space-y-4">
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">Laba Bersih (SHU)</span>
              <div className="text-xl sm:text-2xl font-black text-emerald-400">{formatRupiah(netProfit)}</div>
              <p className="text-[10px] text-slate-400 leading-normal">Keuntungan bersih setelah dikurangi seluruh biaya operasional.</p>
            </div>

            <div className="bg-emerald-600 border border-emerald-500 p-6 rounded-[24px] space-y-4 text-white">
              <span className="text-[10px] text-emerald-100 font-bold uppercase tracking-wider block">Disetor ke Kas Desa (PADes)</span>
              <div className="text-xl sm:text-2xl font-black">{formatRupiah(padesAmount)}</div>
              <p className="text-[10px] text-emerald-100 leading-normal">Kontribusi langsung sebesar {padesPct}% untuk pembangunan desa.</p>
            </div>
          </div>

          {/* Simple Visual Progress Bar */}
          <div className="mt-10 bg-white/[0.04] border border-white/5 p-6 rounded-[28px] space-y-4 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-bold">
              <span className="text-slate-400">Distribusi Keuntungan BUMDes untuk Desa</span>
              <span className="text-emerald-400">{formatRupiah(padesAmount)} dari total {formatRupiah(netProfit)} SHU</span>
            </div>
            <div className="w-full bg-white/[0.08] h-3.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${netProfit > 0 ? (padesAmount / netProfit) * 100 : 0}%` }}
              ></div>
            </div>
            <div className="text-[9px] text-slate-500 font-semibold leading-normal">
              * Perhitungan ini diperbarui secara langsung sesuai dengan pencatatan buku kas BUMDes dan alokasi dana desa yang disetujui dalam Musyawarah Desa (Musdes).
            </div>
          </div>
        </div>
      </section>

      {/* PANDUAN LAYANAN & KONTAK WHATSAPP */}
      <section id="guide" className="scroll-mt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pt-8">
        <div className="bg-white border border-slate-100 rounded-[40px] shadow-[0_20px_50px_-20px_rgba(15,23,42,0.05)] p-8 sm:p-12 md:p-16 relative overflow-hidden">
          {/* Decorative gradients */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
            <div className="lg:col-span-7 space-y-6">
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50/60 px-3.5 py-1.5 rounded-full border border-emerald-100/50 inline-block">
                Panduan Warga
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Cara Mudah Mengajukan Layanan BUMDes
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed font-semibold">
                Kami siap membantu kebutuhan Anda. Berikut alur pelayanan BUMDes untuk seluruh warga desa:
              </p>

              <div className="space-y-5 pt-2">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm sm:text-base">Pilih Layanan</h4>
                    <p className="text-slate-500 text-xs sm:text-sm">Pilih unit usaha yang ingin Anda gunakan (Simpan Pinjam, Sewa Gedung, Sewa Lahan, atau Pembayaran Digital).</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm sm:text-base">Hubungi Admin BUMDes</h4>
                    <p className="text-slate-500 text-xs sm:text-sm">Hubungi kontak WhatsApp resmi kami untuk menanyakan syarat lengkap atau ketersediaan jadwal sewa.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm sm:text-base">Penyelesaian di Kantor</h4>
                    <p className="text-slate-500 text-xs sm:text-sm">Datang ke kantor BUMDes pada jam kerja dengan membawa dokumen persyaratan (KTP/KK) untuk penyelesaian administrasi.</p>
                  </div>
                </div>
              </div>

              {/* Syarat & Jam Kerja detail accordion */}
              <div className="pt-4 border-t border-slate-100">
                <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                  * Untuk informasi lengkap syarat pendaftaran, tarif rinci, dan prosedur pengajuan masing-masing unit usaha, silakan kunjungi halaman detail layanan masing-masing melalui menu di atas.
                </p>
              </div>
            </div>

            <div className="lg:col-span-5 bg-slate-50 border border-slate-100 p-8 rounded-[32px] space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="font-extrabold text-slate-900 text-lg leading-tight">Hubungi Admin Resmi</h3>
                <p className="text-slate-500 text-xs sm:text-sm font-semibold leading-relaxed">
                  Punya pertanyaan seputar peminjaman modal, sewa gedung/lahan, atau keluhan layanan? Hubungi kami langsung via WhatsApp untuk respon cepat.
                </p>
                <div className="pt-2 space-y-3">
                  <div className="p-4 bg-white rounded-2xl border border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-bold uppercase">Jam Kerja</span>
                    <span className="text-xs text-slate-700 font-extrabold">Senin - Jumat (08:00 - 15:00)</span>
                  </div>
                </div>
              </div>

              <a
                href={`https://wa.me/${settings.sewa_lahan_whatsapp || settings.sewa_gedung_whatsapp || "6281234567890"}?text=Halo%20Admin%20BUMDES%2C%20saya%20warga%20ingin%20bertanya%20mengenai%20layanan%20BUMDES...`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-lg shadow-emerald-500/20 active:scale-95 transition-all duration-200 cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
                Tanya Admin via WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* POJOK UMKM & LAPAK WARGA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pt-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 border-b border-slate-100 pb-6">
          <div className="space-y-2.5">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50/60 px-3.5 py-1.5 rounded-full border border-emerald-100/50 inline-block">
              Ekonomi Kreatif Desa
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Pojok UMKM & Lapak Warga
            </h2>
          </div>
          <Link
            href="/umkm"
            className="flex items-center gap-1 text-xs sm:text-sm font-bold text-emerald-600 hover:text-emerald-700 hover:gap-2 transition-all shrink-0 w-fit"
          >
            Lihat Semua Produk UMKM
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {umkmList.length > 0 ? (
            umkmList.slice(0, 3).map((item: any) => (
              <div key={item.id} className="group bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm hover:shadow-[0_25px_45px_-20px_rgba(15,23,42,0.06)] hover:-translate-y-1.5 transition-all duration-500 flex flex-col justify-between h-full">
                <div className="space-y-5">
                  <div className="w-full h-52 overflow-hidden bg-slate-50 relative">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="px-6 pb-4 space-y-2">
                    <span className="inline-flex px-2.5 py-1 rounded-full bg-amber-50 border border-amber-100 text-amber-700 text-[10px] font-bold">{item.category}</span>
                    <h3 className="font-extrabold text-slate-800 text-sm sm:text-base leading-snug">
                      {item.name}
                    </h3>
                    <p className="text-slate-500 text-xs leading-relaxed font-semibold">
                      {item.description}
                    </p>
                    <p className="text-[10px] text-slate-400 font-semibold">Pemilik: {item.owner}</p>
                  </div>
                </div>
                <div className="p-6 pt-0">
                  <a
                    href={`https://wa.me/${item.phone}?text=Halo%20${item.owner}%2C%20saya%20tertarik%20membeli%20${item.name}...`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-500 transition-colors"
                  >
                    Hubungi Penjual
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 py-12 text-center text-slate-400 font-semibold text-xs">
              Belum ada produk UMKM terdaftar di Pojok UMKM.
            </div>
          )}
        </div>
      </section>

      {/* 4. RECENT NEWS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pt-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 border-b border-slate-100 pb-6">
          <div className="space-y-2.5">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50/60 px-3.5 py-1.5 rounded-full border border-emerald-100/50 inline-block">
              Portal Berita
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Kabar Desa & Kegiatan
            </h2>
          </div>
          <Link
            href="/berita"
            className="flex items-center gap-1 text-xs sm:text-sm font-bold text-emerald-600 hover:text-emerald-700 hover:gap-2 transition-all shrink-0 w-fit"
          >
            Lihat Semua Berita
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {latestPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {latestPosts.map((post) => {
              const date = new Date(post.createdAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })
              const snippet = post.content.length > 130 ? `${post.content.substring(0, 130)}...` : post.content
              return (
                <div
                  key={post.id}
                  className="group bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm hover:shadow-[0_25px_45px_-20px_rgba(15,23,42,0.06)] hover:-translate-y-1.5 transition-all duration-500 flex flex-col justify-between h-full"
                >
                  <div className="space-y-5">
                    {post.imageUrl ? (
                      <div className="w-full h-52 overflow-hidden bg-slate-50 relative">
                        <img
                          src={post.imageUrl}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-52 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 flex items-center justify-center text-emerald-700/60">
                        <Building2 className="w-12 h-12 opacity-30" />
                      </div>
                    )}
                    <div className="px-6 pb-2 space-y-3">
                      <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                        <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{date}</span>
                      </div>
                      <h3 className="font-extrabold text-slate-800 text-sm sm:text-base leading-snug group-hover:text-emerald-600 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-slate-500 text-xs sm:text-sm font-semibold leading-relaxed line-clamp-3">
                        {snippet}
                      </p>
                    </div>
                  </div>
                  <div className="p-6 pt-2">
                    <Link
                      href={`/berita/${post.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-500 transition-colors"
                    >
                      Baca Selengkapnya
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-100 text-center p-14 rounded-[32px] text-slate-400 font-bold text-xs sm:text-sm tracking-wide">
            Belum ada rilis berita saat ini.
          </div>
        )}
      </section>
    </div>
  )
}

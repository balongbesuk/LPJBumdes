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
      shadowColor: "shadow-emerald-500/10"
    },
    {
      name: "Unit Sewa Gedung",
      description: "Penyewaan Gedung Serbaguna Desa untuk sarana olahraga, resepsi pernikahan, rapat, dan acara kemasyarakatan.",
      icon: Building2,
      color: "from-blue-500 to-indigo-600",
      textColor: "text-blue-700",
      bgColor: "bg-blue-50/20 hover:bg-blue-50/40",
      borderColor: "border-blue-100/60",
      shadowColor: "shadow-blue-500/10"
    },
    {
      name: "Unit Sewa Lahan",
      description: "Penyewaan kavling lapak dan warung bagi pedagang lokal di area strategis desa guna mendongkrak UMKM desa.",
      icon: Map,
      color: "from-amber-500 to-orange-600",
      textColor: "text-amber-700",
      bgColor: "bg-amber-50/20 hover:bg-amber-50/40",
      borderColor: "border-amber-100/60",
      shadowColor: "shadow-amber-500/10"
    },
    {
      name: "Unit PPOB Desa",
      description: "Pusat pembayaran tagihan digital masyarakat mulai dari listrik PLN, PDAM, BPJS, hingga pulsa secara cepat dan dekat.",
      icon: CreditCard,
      color: "from-violet-500 to-purple-600",
      textColor: "text-violet-700",
      bgColor: "bg-violet-50/20 hover:bg-violet-50/40",
      borderColor: "border-violet-100/60",
      shadowColor: "shadow-violet-500/10"
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
                      <span className="text-slate-400">Keamanan Transaksi</span>
                      <span className="text-emerald-400">Terproteksi Sesi</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                      <Globe className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-400">Sistem Laporan</span>
                      <span className="text-emerald-400">Terbuka & Akuntabel</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS SECTION (Floating Cards with Shadows) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((s, idx) => {
            const Icon = s.icon
            return (
              <div
                key={idx}
                className="bg-white border border-slate-100/70 p-6 sm:p-8 rounded-[30px] shadow-[0_15px_35px_-15px_rgba(15,23,42,0.08)] hover:shadow-[0_20px_40px_-10px_rgba(16,185,129,0.12)] hover:-translate-y-1 transition-all duration-300 flex items-center gap-5 group"
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

      {/* 3. BUSINESS UNITS SECTION */}
      <section id="units" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pt-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50/60 px-3.5 py-1.5 rounded-full border border-emerald-100/50 inline-block">
            Unit Bisnis Utama
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Unit Usaha Terintegrasi
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm font-semibold leading-relaxed">
            Mengelola berbagai unit usaha secara profesional demi memajukan ekonomi masyarakat lokal desa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {businessUnits.map((unit, idx) => {
            const Icon = unit.icon
            return (
              <div
                key={idx}
                className={`group relative p-8 sm:p-10 bg-white border border-slate-100 rounded-[36px] shadow-sm hover:shadow-[0_20px_50px_-20px_rgba(15,23,42,0.07)] hover:-translate-y-1.5 transition-all duration-500 overflow-hidden flex flex-col justify-between`}
              >
                {/* Subtle colored shadow hover background */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-slate-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[36px] pointer-events-none"></div>
                
                <div className="space-y-6 relative z-10">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${unit.color} text-white flex items-center justify-center shrink-0 shadow-lg ${unit.shadowColor} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="space-y-2.5">
                    <h3 className="font-bold text-slate-800 text-lg leading-tight">{unit.name}</h3>
                    <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-semibold">
                      {unit.description}
                    </p>
                  </div>
                </div>

                <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer relative z-10">
                  <span>Lihat Detail Layanan</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
                </div>
              </div>
            )
          })}
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

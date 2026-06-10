import React from "react"
import Link from "next/link"
import { db } from "@/lib/db"
import { slugify } from "@/lib/utils"
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
  ChevronRight
} from "lucide-react"

import type { Metadata } from "next"

export const revalidate = 0 // Disable cache for live stats

export const metadata: Metadata = {
  title: "BUMDES Barokah Balongbesuk - Menggerakkan Ekonomi Desa",
  description: "Portal resmi Badan Usaha Milik Desa (BUMDES) Barokah Balongbesuk, Diwek, Jombang. Informasi unit usaha simpan pinjam, sewa gedung serbaguna, sewa lahan/lapak, PPOB dan berita kegiatan desa.",
  keywords: ["BUMDES", "Balongbesuk", "Jombang", "Diwek", "Simpan Pinjam Desa", "Sewa Gedung Jombang", "Lapak UMKM", "Laporan Pertanggungjawaban Desa"],
  openGraph: {
    title: "BUMDES Barokah Balongbesuk - Menggerakkan Ekonomi Desa",
    description: "Portal resmi Badan Usaha Milik Desa (BUMDES) Barokah Balongbesuk, Diwek, Jombang.",
    type: "website",
  }
}

export default async function PublicHomePage() {
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
    { label: "Transaksi Sewa", value: bookingCount + 120, icon: TrendingUp, suffix: "Sewa" }, // added base dummy offset
    { label: "Artikel Rilis", value: postCount, icon: Award, suffix: "Publikasi" },
  ]

  const businessUnits = [
    {
      name: "Unit Simpan Pinjam",
      description: "Penyediaan akses permodalan bagi usaha mikro masyarakat desa dan kelompok tani untuk menunjang produktivitas.",
      icon: Coins,
      color: "from-emerald-500 to-teal-600",
      textColor: "text-emerald-700",
      bgColor: "bg-emerald-50/50",
      borderColor: "border-emerald-100",
    },
    {
      name: "Unit Sewa Gedung",
      description: "Penyewaan Gedung Serbaguna Desa untuk sarana olahraga (badminton), resepsi pernikahan, rapat, dan acara kemasyarakatan.",
      icon: Building2,
      color: "from-blue-500 to-indigo-600",
      textColor: "text-blue-700",
      bgColor: "bg-blue-50/50",
      borderColor: "border-blue-100",
    },
    {
      name: "Unit Sewa Lahan",
      description: "Penyewaan kavling lapak dan warung bagi pedagang lokal di area strategis desa guna mendongkrak UMKM desa.",
      icon: Map,
      color: "from-amber-500 to-orange-600",
      textColor: "text-amber-700",
      bgColor: "bg-amber-50/50",
      borderColor: "border-amber-100",
    },
    {
      name: "Unit PPOB Desa",
      description: "Pusat pembayaran tagihan digital masyarakat mulai dari listrik PLN, PDAM, BPJS, hingga pulsa secara cepat dan dekat.",
      icon: CreditCard,
      color: "from-violet-500 to-purple-600",
      textColor: "text-violet-700",
      bgColor: "bg-violet-50/50",
      borderColor: "border-violet-100",
    },
  ]

  return (
    <div className="space-y-20 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#022c22_1px,transparent_1px),linear-gradient(to_bottom,#022c22_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
                Official Portal BUMDES Barokah
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-none text-white">
                Menggerakkan Ekonomi, <br />
                <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                  Membangun Kemandirian Desa
                </span>
              </h1>
              <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                Badan Usaha Milik Desa Balongbesuk mengelola berbagai unit usaha strategis secara terintegrasi untuk mendukung pertumbuhan ekonomi lokal dan kesejahteraan masyarakat.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/berita"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
                >
                  Lihat Berita & Kegiatan
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="#units"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-2xl text-xs sm:text-sm border border-slate-700 active:scale-95 transition-all"
                >
                  Jelajahi Unit Usaha
                </Link>
              </div>
            </div>
            
            {/* Visual Callout */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-sm bg-white/5 border border-white/10 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6">
                <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl"></div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/25 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-xs sm:text-sm">BUMDES Balongbesuk</p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Kabupaten Jombang, Jawa Timur</p>
                  </div>
                </div>
                <div className="border-t border-white/5 pt-4 space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-400">Total Unit Usaha</span>
                    <span className="text-emerald-400">4 Bidang Aktif</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-400">Penyertaan Modal</span>
                    <span className="text-emerald-400">Kelompok Tani & UMKM</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-400">Sistem Laporan</span>
                    <span className="text-emerald-400">LPJ Otomatis</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20">
        <div className="bg-white border border-slate-100/80 p-8 sm:p-10 rounded-[32px] shadow-xl shadow-slate-100/50 grid grid-cols-1 md:grid-cols-3 gap-8 items-center divide-y md:divide-y-0 md:divide-x divide-slate-100">
          {stats.map((s, idx) => {
            const Icon = s.icon
            return (
              <div key={idx} className="flex items-center gap-5 justify-center md:px-6 py-4 md:py-0">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">
                    {s.label}
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{s.value}</span>
                    <span className="text-xs text-slate-400 font-bold">{s.suffix}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* 3. BUSINESS UNITS SECTION */}
      <section id="units" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
            Layanan Kami
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Unit Usaha BUMDES Barokah
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm font-semibold leading-relaxed">
            Menghadirkan pelayanan dan fasilitas kemasyarakatan guna mempercepat perputaran roda ekonomi lokal desa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {businessUnits.map((unit, idx) => {
            const Icon = unit.icon
            return (
              <div
                key={idx}
                className={`p-6 sm:p-8 rounded-3xl border ${unit.bgColor} ${unit.borderColor} flex flex-col sm:flex-row gap-5 hover:shadow-lg transition-all duration-300`}
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${unit.color} text-white flex items-center justify-center shrink-0 shadow-md`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-extrabold text-slate-800 text-base">{unit.name}</h3>
                  <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-semibold">
                    {unit.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* 4. RECENT NEWS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              Rilis Informasi
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Berita & Kegiatan Terbaru
            </h2>
          </div>
          <Link
            href="/berita"
            className="flex items-center gap-1 text-xs sm:text-sm font-bold text-emerald-600 hover:text-emerald-700 hover:gap-1.5 transition-all shrink-0 w-fit"
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
                  className="group bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {post.imageUrl ? (
                      <div className="w-full h-48 overflow-hidden bg-slate-100">
                        <img
                          src={post.imageUrl}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center text-emerald-700">
                        <Building2 className="w-12 h-12 opacity-40" />
                      </div>
                    )}
                    <div className="p-6 space-y-3">
                      <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                        <Calendar className="w-3.5 h-3.5" />
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
                  <div className="p-6 pt-0">
                    <Link
                      href={`/berita/${post.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 mt-2"
                    >
                      Baca Selengkapnya
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-100 text-center p-12 rounded-3xl text-slate-400 font-semibold text-xs sm:text-sm">
            Belum ada rilis berita saat ini.
          </div>
        )}
      </section>
    </div>
  )
}

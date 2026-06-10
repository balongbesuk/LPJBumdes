"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import {
  Coins,
  Building2,
  Map,
  CreditCard,
  Users,
  Wallet,
  AlertTriangle,
  ChevronRight,
  BookOpen,
  Activity,
  ArrowUpRight,
  Clock,
  Banknote,
  Landmark,
  ShieldCheck,
  Zap,
  CircleDollarSign,
} from "lucide-react"
import { formatRupiah } from "@/lib/utils"
import { useSettings } from "@/context/SettingsContext"
import { DashboardStatsData } from "@/lib/dashboard-stats"

const DashboardCharts = dynamic(() => import("./DashboardCharts"), {
  ssr: false,
  loading: () => <ChartSkeleton />,
})

function ChartSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="h-[380px] bg-slate-100 rounded-3xl lg:col-span-2 animate-pulse flex items-center justify-center text-slate-400 font-medium">
        Memuat Grafik Pendapatan...
      </div>
      <div className="h-[380px] bg-slate-100 rounded-3xl animate-pulse flex items-center justify-center text-slate-400 font-medium">
        Memuat Distribusi...
      </div>
    </div>
  )
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 11) return "Selamat Pagi"
  if (hour < 15) return "Selamat Siang"
  if (hour < 18) return "Selamat Sore"
  return "Selamat Malam"
}

function getFormattedDate(): string {
  return new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function AnimatedNumber({ value, prefix = "" }: { value: number; prefix?: string }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const duration = 800
    const steps = 30
    const increment = value / steps
    let current = 0
    let step = 0

    const timer = setInterval(() => {
      step++
      current = Math.min(Math.round(increment * step), value)
      setDisplay(current)
      if (step >= steps) clearInterval(timer)
    }, duration / steps)

    return () => clearInterval(timer)
  }, [value])

  return <>{prefix}{formatRupiah(display)}</>
}

interface DashboardClientProps {
  stats: DashboardStatsData
  initialUserName?: string
}

export default function DashboardClient({ stats, initialUserName = "Admin" }: DashboardClientProps) {
  const settings = useSettings()
  const [userName, setUserName] = useState(initialUserName)

  useEffect(() => {
    // Attempt local storage sync if client has custom name set
    try {
      const stored = localStorage.getItem("bumdes_user")
      if (stored) {
        const user = JSON.parse(stored)
        if (user.name) {
          setUserName(user.name)
        }
      }
    } catch {}
  }, [])

  const quickActions = [
    { name: "Simpan Pinjam", href: "/simpan-pinjam", icon: Coins, color: "from-emerald-500 to-teal-600", bg: "bg-emerald-50", border: "border-emerald-100", text: "text-emerald-700" },
    { name: "Sewa Gedung", href: "/sewa-gedung", icon: Building2, color: "from-blue-500 to-indigo-600", bg: "bg-blue-50", border: "border-blue-100", text: "text-blue-700" },
    { name: "Sewa Lahan", href: "/sewa-lahan", icon: Map, color: "from-amber-500 to-orange-600", bg: "bg-amber-50", border: "border-amber-100", text: "text-amber-700" },
    { name: "Keuangan", href: "/keuangan", icon: BookOpen, color: "from-violet-500 to-purple-600", bg: "bg-violet-50", border: "border-violet-100", text: "text-violet-700" },
  ]

  const metrics = [
    {
      label: "Total Kas & Bank",
      value: stats.totalCash,
      icon: Wallet,
      iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600",
      trend: "up" as const,
      sub: "Kas BUMDES, GSG & Lapak",
    },
    {
      label: "Piutang Pinjaman",
      value: stats.totalReceivables,
      icon: Banknote,
      iconBg: "bg-gradient-to-br from-blue-500 to-indigo-600",
      trend: "neutral" as const,
      sub: `${stats.activeLoansCount} pinjaman aktif`,
    },
    {
      label: "Tabungan Anggota",
      value: stats.totalSavings,
      icon: Landmark,
      iconBg: "bg-gradient-to-br from-violet-500 to-purple-600",
      trend: "up" as const,
      sub: "Simpanan Pokok & Wajib",
    },
    {
      label: "Total Pendapatan",
      value: stats.totalRevenue,
      icon: CircleDollarSign,
      iconBg: "bg-gradient-to-br from-amber-500 to-orange-600",
      trend: "up" as const,
      sub: "Akumulasi 4 unit usaha",
    },
  ]

  return (
    <div className="space-y-8">
      {/* ===== WELCOME HEADER ===== */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Live Dashboard</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            {getGreeting()}, {userName} 👋
          </h1>
          <p className="text-slate-400 text-xs font-semibold mt-1.5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {getFormattedDate()}
          </p>
        </div>

        {/* Summary pill */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-4 py-2.5 rounded-2xl">
            <Users className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-emerald-800">{stats.memberCount} Anggota</span>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 px-4 py-2.5 rounded-2xl">
            <Activity className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-blue-800">{stats.activeLoansCount} Pinjaman Aktif</span>
          </div>
        </div>
      </div>

      {/* ===== ALERT BANNER ===== */}
      {stats.expiringLeasesCount > 0 && (
        <div className="relative overflow-hidden p-5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 text-amber-900 rounded-3xl flex items-center justify-between gap-4 shadow-sm">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-200/20 rounded-full blur-2xl"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-400/30">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold leading-tight">Kontrak Sewa Mendekati Kedaluwarsa</p>
              <p className="text-xs text-amber-700 font-semibold mt-0.5">
                {stats.expiringLeasesCount} kavling warung akan habis masa sewanya dalam 30 hari ke depan
              </p>
            </div>
          </div>
          <Link
            href="/sewa-lahan"
            className="relative z-10 flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:text-amber-900 bg-white/80 hover:bg-white px-4 py-2.5 rounded-2xl border border-amber-200 shadow-sm shrink-0 transition-all active:scale-[0.97]"
          >
            Tinjau Sewa
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* ===== METRICS GRID ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {metrics.map((m, i) => {
          const Icon = m.icon
          return (
            <div
              key={i}
              className="group relative bg-white border border-slate-100 p-6 rounded-3xl shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden animate-fade-in"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="absolute -right-6 -top-6 w-20 h-20 bg-slate-900/5 opacity-[0.07] rounded-full blur-xl group-hover:opacity-[0.12] transition-opacity"></div>

              <div className="flex items-start justify-between relative z-10">
                <div className="space-y-3 flex-1">
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">
                    {m.label}
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-none">
                    <AnimatedNumber value={m.value} />
                  </h2>
                  <div className="flex items-center gap-1.5">
                    {m.trend === "up" && (
                      <span className="flex items-center gap-0.5 text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md text-[9px] font-bold">
                        <ArrowUpRight className="w-3 h-3" />
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400 font-semibold">{m.sub}</span>
                  </div>
                </div>
                <div className={`w-11 h-11 rounded-2xl ${m.iconBg} text-white flex items-center justify-center shadow-md shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ===== CHARTS ROW ===== */}
      <DashboardCharts stats={stats} />

      {/* ===== BOTTOM ROW: Quick Actions, Member & Loan summary ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Member Stats */}
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm tracking-tight">Anggota BUMDES</h3>
                <p className="text-[10px] text-slate-400 font-semibold">Nasabah aktif terdaftar</p>
              </div>
            </div>
            <div className="text-center py-4">
              <span className="text-5xl font-bold text-slate-900">{stats.memberCount}</span>
              <span className="text-lg text-slate-400 font-semibold ml-1">orang</span>
            </div>
          </div>
          <Link
            href="/simpan-pinjam"
            className="flex items-center justify-center gap-1.5 w-full py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-2xl border border-emerald-100 transition-all mt-4"
          >
            Lihat Daftar Anggota
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Savings breakdown */}
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-violet-600/20">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm tracking-tight">Tabungan Anggota</h3>
                <p className="text-[10px] text-slate-400 font-semibold">Simpanan pokok & wajib</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-violet-50/50 rounded-2xl border border-violet-100/50">
                <span className="text-xs font-semibold text-slate-600">Total Simpanan</span>
                <span className="text-sm font-bold text-violet-700">{formatRupiah(stats.totalSavings)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50/80 rounded-2xl border border-slate-100/50">
                <span className="text-xs font-semibold text-slate-600">Piutang Pinjaman</span>
                <span className="text-sm font-bold text-blue-700">{formatRupiah(stats.totalReceivables)}</span>
              </div>
            </div>
          </div>
          <Link
            href="/simpan-pinjam"
            className="flex items-center justify-center gap-1.5 w-full py-3 bg-violet-50 hover:bg-violet-100 text-violet-700 font-bold text-xs rounded-2xl border border-violet-100 transition-all mt-4"
          >
            Kelola Simpan Pinjam
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Quick Actions & System Info */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
            <h3 className="font-bold text-slate-800 text-sm tracking-tight mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Akses Cepat
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-2xl ${action.bg} hover:opacity-80 border ${action.border} transition-all text-center group active:scale-[0.96]`}
                  >
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${action.color} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <span className={`text-[10px] font-bold ${action.text} mt-2`}>{action.name}</span>
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-3xl shadow-sm text-white relative overflow-hidden">
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-xs tracking-tight">Sistem BUMDES</h3>
                  <p className="text-[9px] text-slate-400 font-semibold">{settings?.bumdes_name || "BUMDES"}</p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-semibold">Status</span>
                  <span className="flex items-center gap-1.5 font-bold text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Online
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-semibold">Database</span>
                  <span className="font-bold text-slate-300">SQLite 3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-semibold">Unit Usaha</span>
                  <span className="font-bold text-slate-300">4 unit aktif</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

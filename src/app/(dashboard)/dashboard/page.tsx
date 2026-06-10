"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import {
  Coins,
  Building2,
  Map,
  CreditCard,
  Users,
  Wallet,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ChevronRight,
  BookOpen,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart as PieChartIcon,
  Clock,
  FileText,
  Banknote,
  Landmark,
  ShieldCheck,
  Zap,
  CircleDollarSign,
} from "lucide-react"
import { formatRupiah } from "@/lib/utils"
import { useSettings } from "@/context/SettingsContext"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
  PieChart,
  Pie,
  Legend,
  AreaChart,
  Area,
} from "recharts"

interface DashboardStats {
  memberCount: number
  totalCash: number
  totalReceivables: number
  totalSavings: number
  totalRevenue: number
  revenueData: { name: string; value: number; color: string }[]
  expiringLeasesCount: number
  activeLoansCount: number
}

// Greeting helper
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

// Animated number display
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

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-100 shadow-xl">
        <p className="text-xs font-bold text-slate-800 mb-1">{label}</p>
        <p className="text-sm font-bold text-emerald-600">{formatRupiah(payload[0].value)}</p>
      </div>
    )
  }
  return null
}

export default function DashboardPage() {
  const settings = useSettings()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userName, setUserName] = useState("")

  useEffect(() => {
    // Get user name
    try {
      const stored = localStorage.getItem("bumdes_user")
      if (stored) {
        const user = JSON.parse(stored)
        setUserName(user.name || "")
      }
    } catch {}

    async function fetchStats() {
      try {
        const res = await fetch("/api/dashboard/stats")
        const result = await res.json()
        if (result.success) {
          setStats(result.data)
        } else {
          throw new Error(result.error || "Gagal mengambil data statistik")
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Skeleton header */}
        <div className="animate-pulse space-y-3">
          <div className="h-8 bg-slate-200 rounded-xl w-72"></div>
          <div className="h-4 bg-slate-200 rounded-lg w-48"></div>
        </div>
        {/* Skeleton cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-36 bg-slate-200 rounded-3xl animate-pulse" style={{ animationDelay: `${i * 100}ms` }}></div>
          ))}
        </div>
        {/* Skeleton charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-[380px] bg-slate-200 rounded-3xl lg:col-span-2 animate-pulse"></div>
          <div className="h-[380px] bg-slate-200 rounded-3xl animate-pulse"></div>
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-100 rounded-3xl text-rose-800">
        <p className="font-bold flex items-center gap-2 text-sm">
          <AlertTriangle className="w-5 h-5 text-rose-500" />
          Gagal Memuat Dashboard
        </p>
        <p className="mt-1 text-xs font-semibold text-rose-600">{error || "Koneksi ke server terputus."}</p>
      </div>
    )
  }

  // Compute pie chart data
  const pieData = stats.revenueData.map((item) => ({
    name: item.name,
    value: item.value,
    fill: item.color,
  }))

  // Compute revenue percentages
  const revenueWithPct = stats.revenueData.map((item) => ({
    ...item,
    pct: stats.totalRevenue > 0 ? ((item.value / stats.totalRevenue) * 100).toFixed(1) : "0",
  }))

  // Quick action items
  const quickActions = [
    { name: "Simpan Pinjam", href: "/simpan-pinjam", icon: Coins, color: "from-emerald-500 to-teal-600", bg: "bg-emerald-50", border: "border-emerald-100", text: "text-emerald-700" },
    { name: "Sewa Gedung", href: "/sewa-gedung", icon: Building2, color: "from-blue-500 to-indigo-600", bg: "bg-blue-50", border: "border-blue-100", text: "text-blue-700" },
    { name: "Sewa Lahan", href: "/sewa-lahan", icon: Map, color: "from-amber-500 to-orange-600", bg: "bg-amber-50", border: "border-amber-100", text: "text-amber-700" },
    { name: "Keuangan", href: "/keuangan", icon: BookOpen, color: "from-violet-500 to-purple-600", bg: "bg-violet-50", border: "border-violet-100", text: "text-violet-700" },
  ]

  // Metric cards data
  const metrics = [
    {
      label: "Total Kas & Bank",
      value: stats.totalCash,
      icon: Wallet,
      iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600",
      trend: "up" as const,
      sub: "Kas BUMDES, GSG & Lapak",
      ringColor: "ring-emerald-500/10",
    },
    {
      label: "Piutang Pinjaman",
      value: stats.totalReceivables,
      icon: Banknote,
      iconBg: "bg-gradient-to-br from-blue-500 to-indigo-600",
      trend: "neutral" as const,
      sub: `${stats.activeLoansCount} pinjaman aktif`,
      ringColor: "ring-blue-500/10",
    },
    {
      label: "Tabungan Anggota",
      value: stats.totalSavings,
      icon: Landmark,
      iconBg: "bg-gradient-to-br from-violet-500 to-purple-600",
      trend: "up" as const,
      sub: "Simpanan Pokok & Wajib",
      ringColor: "ring-violet-500/10",
    },
    {
      label: "Total Pendapatan",
      value: stats.totalRevenue,
      icon: CircleDollarSign,
      iconBg: "bg-gradient-to-br from-amber-500 to-orange-600",
      trend: "up" as const,
      sub: "Akumulasi 4 unit usaha",
      ringColor: "ring-amber-500/10",
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
            {getGreeting()}, {userName || "Admin"} 👋
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
              className="group relative bg-white border border-slate-100 p-6 rounded-3xl shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {/* Decorative blob */}
              <div className={`absolute -right-6 -top-6 w-20 h-20 ${m.iconBg} opacity-[0.07] rounded-full blur-xl group-hover:opacity-[0.12] transition-opacity`}></div>

              <div className="flex items-start justify-between relative z-10">
                <div className="space-y-3 flex-1">
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">
                    {m.label}
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-none">
                    {formatRupiah(m.value)}
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Bar Chart */}
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm tracking-tight">Pendapatan Unit Usaha</h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Komparasi performa setiap unit bisnis</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-3 py-2 rounded-2xl text-xs font-bold border border-emerald-100">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{formatRupiah(stats.totalRevenue)}</span>
            </div>
          </div>

          <div className="flex-1 w-full h-72 min-h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  dy={8}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={9}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${(v / 1000000).toFixed(0)}jt`}
                  width={45}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={48}>
                  {stats.revenueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue legend */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-5 mt-2 border-t border-slate-50">
            {revenueWithPct.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></div>
                <div>
                  <span className="text-[9px] text-slate-500 font-semibold block leading-tight">{item.name}</span>
                  <span className="text-[10px] text-slate-700 font-bold">{item.pct}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Pie + Quick Actions */}
        <div className="space-y-6">
          {/* Pie Chart Distribution */}
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                <PieChartIcon className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm tracking-tight">Distribusi Pendapatan</h3>
                <p className="text-[10px] text-slate-400 font-semibold">Proporsi kontribusi per unit</p>
              </div>
            </div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`pie-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [formatRupiah(value), "Pendapatan"]}
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderRadius: "12px",
                      border: "1px solid #f1f5f9",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
                      fontSize: "11px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Pie legend */}
            <div className="space-y-2 pt-2">
              {revenueWithPct.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-slate-600 font-semibold">{item.name}</span>
                  </div>
                  <span className="text-slate-800 font-bold">{item.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
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
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl ${action.bg} hover:opacity-80 border ${action.border} transition-all text-center group active:scale-[0.96]`}
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-bold ${action.text} mt-2.5`}>{action.name}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ===== BOTTOM ROW: Member & Loan summary ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Member Stats */}
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
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
          <Link
            href="/simpan-pinjam"
            className="flex items-center justify-center gap-1.5 w-full py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-2xl border border-emerald-100 transition-all mt-2"
          >
            Lihat Daftar Anggota
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Savings breakdown */}
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-violet-600/20">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm tracking-tight">Tabungan Anggota</h3>
              <p className="text-[10px] text-slate-400 font-semibold">Simpanan pokok & wajib</p>
            </div>
          </div>
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between p-3 bg-violet-50/50 rounded-2xl border border-violet-100/50">
              <span className="text-xs font-semibold text-slate-600">Total Simpanan</span>
              <span className="text-sm font-bold text-violet-700">{formatRupiah(stats.totalSavings)}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50/80 rounded-2xl border border-slate-100/50">
              <span className="text-xs font-semibold text-slate-600">Piutang Pinjaman</span>
              <span className="text-sm font-bold text-blue-700">{formatRupiah(stats.totalReceivables)}</span>
            </div>
          </div>
          <Link
            href="/simpan-pinjam"
            className="flex items-center justify-center gap-1.5 w-full py-3 bg-violet-50 hover:bg-violet-100 text-violet-700 font-bold text-xs rounded-2xl border border-violet-100 transition-all mt-2"
          >
            Kelola Simpan Pinjam
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* System Info */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-3xl shadow-sm text-white relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -left-4 -top-4 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-tight">Sistem BUMDES</h3>
                <p className="text-[10px] text-slate-400 font-semibold">{settings?.bumdes_name || "BUMDES"}</p>
              </div>
            </div>

            <div className="space-y-3 py-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold">Status</span>
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold">Versi</span>
                <span className="text-xs font-bold text-slate-300">v2.0.0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold">Database</span>
                <span className="text-xs font-bold text-slate-300">SQLite 3</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold">Unit Usaha</span>
                <span className="text-xs font-bold text-slate-300">4 unit aktif</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-[10px] text-slate-500 font-semibold text-center">
                {settings?.bumdes_name || "BUMDES"} © {new Date().getFullYear()} — SIM Terintegrasi
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

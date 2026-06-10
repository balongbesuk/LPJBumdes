"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import {
  History,
  ArrowLeft,
  Search,
  RefreshCw,
  User,
  Activity,
  Calendar,
  Layers,
  Filter
} from "lucide-react"

interface AuditLog {
  id: string
  userId: string
  username: string
  name: string
  role: string
  action: string
  detail: string
  timestamp: string
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("ALL")
  const [actionFilter, setActionFilter] = useState("ALL")

  const fetchLogs = async () => {
    setLoading(true)
    setErrorMsg(null)
    try {
      const res = await fetch("/api/audit-logs")
      const result = await res.json()
      if (result.success) {
        setLogs(result.data || [])
      } else {
        throw new Error(result.error || "Gagal memuat log audit")
      }
    } catch (err: any) {
      setErrorMsg(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  // Filter logic
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.detail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesRole = roleFilter === "ALL" || log.role === roleFilter
    const matchesAction = actionFilter === "ALL" || log.action === actionFilter

    return matchesSearch && matchesRole && matchesAction
  })

  // Get unique actions for filter dropdown
  const uniqueActions = Array.from(new Set(logs.map((l) => l.action)))

  const getRoleColor = (role: string) => {
    switch (role.toUpperCase()) {
      case "ADMIN":
        return "bg-rose-50 border border-rose-100 text-rose-700"
      case "BENDAHARA":
        return "bg-emerald-50 border border-emerald-100 text-emerald-700"
      case "SEKRETARIS":
        return "bg-cyan-50 border border-cyan-100 text-cyan-700"
      default:
        return "bg-slate-50 border border-slate-200 text-slate-655"
    }
  }

  const getActionColor = (action: string) => {
    if (action.includes("LOCK") || action.includes("TUTUP")) {
      return "bg-amber-50 border border-amber-200 text-amber-800"
    }
    if (action.includes("RESTORE")) {
      return "bg-red-50 border border-red-200 text-red-800"
    }
    if (action.includes("BACKUP")) {
      return "bg-blue-50 border border-blue-200 text-blue-800"
    }
    if (action.includes("CREATE") || action.includes("ADD") || action.includes("SIMPAN")) {
      return "bg-emerald-55 border border-emerald-100 text-emerald-800"
    }
    return "bg-slate-100 border border-slate-200 text-slate-700"
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Back link & Header */}
      <div className="space-y-2">
        <Link
          href="/pengaturan"
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 font-bold text-xs transition w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Pengaturan
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <History className="w-6 h-6 text-emerald-600" />
              Jejak Audit Aktivitas (Audit Trail)
            </h1>
            <p className="text-slate-400 text-xs font-semibold mt-1">
              Catatan riwayat transaksi keuangan, proses tutup buku, serta pencadangan data BUMDES.
            </p>
          </div>
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-bold rounded-2xl text-xs transition active:scale-98 shadow-sm self-start md:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Segarkan
          </button>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white border border-slate-105 p-5 md:p-6 rounded-3xl shadow-sm space-y-4">
        <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-slate-400">
          <Filter className="w-4 h-4 text-slate-450" />
          Filter Log Audit
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search Input */}
          <div className="md:col-span-2 relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Cari berdasarkan nama, deskripsi log, aksi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl text-sm transition-all focus:outline-none focus:ring-4 focus:ring-emerald-500/10 placeholder:text-slate-400 text-slate-800 font-semibold"
            />
          </div>

          {/* Role Filter */}
          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl text-sm transition-all focus:outline-none focus:ring-4 focus:ring-emerald-500/10 text-slate-700 font-semibold cursor-pointer appearance-none"
            >
              <option value="ALL">Semua Jabatan (Role)</option>
              <option value="ADMIN">ADMIN (Kepala BUMDES)</option>
              <option value="BENDAHARA">BENDAHARA</option>
              <option value="SEKRETARIS">SEKRETARIS</option>
              <option value="OPERATOR_SP">OPERATOR_SP</option>
              <option value="OPERATOR_SEWA">OPERATOR_SEWA</option>
            </select>
          </div>

          {/* Action Filter */}
          <div className="relative">
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl text-sm transition-all focus:outline-none focus:ring-4 focus:ring-emerald-500/10 text-slate-700 font-semibold cursor-pointer appearance-none"
            >
              <option value="ALL">Semua Jenis Aksi</option>
              {uniqueActions.map((act) => (
                <option key={act} value={act}>
                  {act}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Logs Table / View */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-2xl text-xs font-bold">
          {errorMsg}
        </div>
      )}

      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-4 animate-pulse">
                  <div className="h-10 bg-slate-200 rounded-xl w-32"></div>
                  <div className="h-10 bg-slate-200 rounded-xl flex-1"></div>
                  <div className="h-10 bg-slate-200 rounded-xl w-24"></div>
                </div>
              ))}
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-16 px-4 space-y-3">
              <History className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-slate-400 font-semibold text-sm">Tidak ada log audit yang sesuai filter.</p>
            </div>
          ) : (
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-450 uppercase tracking-wider">Waktu & Tanggal</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-450 uppercase tracking-wider">Pengguna</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-450 uppercase tracking-wider">Jabatan (Role)</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-450 uppercase tracking-wider">Aksi</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-450 uppercase tracking-wider">Detail Aktivitas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredLogs.map((log) => {
                  const logDate = new Date(log.timestamp).toLocaleString("id-ID", {
                    dateStyle: "medium",
                    timeStyle: "short"
                  })

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Timestamp */}
                      <td className="px-6 py-4.5 whitespace-nowrap text-xs font-bold text-slate-500 font-mono">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {logDate}
                        </div>
                      </td>

                      {/* User Info */}
                      <td className="px-6 py-4.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200">
                            <User className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800 leading-tight">{log.name}</p>
                            <p className="text-[10px] text-slate-400 font-semibold leading-none">@{log.username}</p>
                          </div>
                        </div>
                      </td>

                      {/* User Role */}
                      <td className="px-6 py-4.5 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-lg text-[9px] font-bold ${getRoleColor(log.role)}`}>
                          {log.role}
                        </span>
                      </td>

                      {/* Action Code */}
                      <td className="px-6 py-4.5 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-lg text-[9px] font-mono font-bold ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>

                      {/* Detail Activity */}
                      <td className="px-6 py-4.5 text-xs text-slate-655 font-semibold leading-relaxed max-w-xs md:max-w-md break-words">
                        {log.detail}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

"use client"

import React, { useState, useEffect } from "react"
import { Lock, Unlock, ShieldAlert, Loader2, AlertCircle } from "lucide-react"

interface PeriodLock {
  id: string
  year: number
  month: number
  locked: boolean
  lockedBy: string
  createdAt: string
}

export default function TutupBukuTab() {
  const [locks, setLocks] = useState<PeriodLock[]>([])
  const [selectedYear, setSelectedYear] = useState<number>(2026)
  const [togglingLock, setTogglingLock] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchLocks = async () => {
    try {
      const res = await fetch("/api/pengaturan/period-lock")
      const result = await res.json()
      if (result.success) {
        setLocks(result.data || [])
      }
    } catch (err: any) {
      console.error("Gagal memuat status kunci periode:", err)
    }
  }

  useEffect(() => {
    fetchLocks()
  }, [])

  const handleToggleLock = async (month: number, currentLocked: boolean) => {
    const key = `${month}-${selectedYear}`
    setTogglingLock(key)
    setError(null)
    try {
      const res = await fetch("/api/pengaturan/period-lock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year: selectedYear,
          month,
          locked: !currentLocked
        })
      })
      const result = await res.json()
      if (result.success) {
        await fetchLocks()
      } else {
        throw new Error(result.error || "Gagal mengubah status kunci periode")
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setTogglingLock(null)
    }
  }

  return (
    <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-3xl shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="font-bold text-slate-800 text-sm tracking-tight flex items-center gap-2">
            <Lock className="w-4.5 h-4.5 text-amber-600 animate-pulse" />
            Manajemen Kunci Periode Bulanan (Tutup Buku)
          </h3>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
            Kunci pembukuan bulanan untuk mencegah pengisian, pengeditan, atau penghapusan transaksi pada bulan yang bersangkutan.
          </p>
        </div>
        {/* Year Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tahun Buku:</span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
            <option value={2027}>2027</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Warning banner */}
      <div className="p-4 bg-amber-50/60 border border-amber-100 rounded-2xl text-xs font-semibold text-amber-800 flex items-start gap-2.5">
        <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">INFORMASI PENTING:</span> Menutup buku atau mengunci bulan tertentu akan memblokir seluruh API pembuatan/pembaruan transaksi harian pada modul Simpan Pinjam, Sewa Gedung, Sewa Lahan, dan PPOB. Pastikan seluruh rekonsiliasi kas dan jurnal pembukuan bulan tersebut telah seimbang (balanced) sebelum dikunci.
        </div>
      </div>

      {/* Month grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => {
          const lockRecord = locks.find((l) => l.year === selectedYear && l.month === month)
          const isLocked = !!lockRecord?.locked
          const lockedBy = lockRecord?.lockedBy
          const lockedAt = lockRecord?.createdAt
            ? new Date(lockRecord.createdAt).toLocaleDateString("id-ID", { dateStyle: "short" })
            : ""

          const monthName = [
            "Januari", "Februari", "Maret", "April", "Mei", "Juni",
            "Juli", "Agustus", "September", "Oktober", "November", "Desember"
          ][month - 1]

          const key = `${month}-${selectedYear}`
          const isPending = togglingLock === key

          return (
            <div
              key={month}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between h-40 ${
                isLocked
                  ? "bg-amber-50/20 border-amber-200 shadow-sm"
                  : "bg-white border-slate-150 hover:border-slate-350"
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs">{monthName}</span>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                    isLocked ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                  }`}>
                    {isLocked ? "Terkunci" : "Terbuka"}
                  </span>
                </div>
                {isLocked && (
                  <p className="text-[9px] text-slate-400 font-semibold leading-relaxed">
                    Dikunci oleh: <span className="text-slate-600 font-bold">{lockedBy || "-"}</span>
                    <br />
                    Pada: <span className="text-slate-650 font-mono">{lockedAt}</span>
                  </p>
                )}
                {!isLocked && (
                  <p className="text-[9px] text-slate-400 font-semibold leading-relaxed">
                    Periode terbuka. Anggota/Operator dapat menginput transaksi.
                  </p>
                )}
              </div>

              <button
                type="button"
                disabled={isPending}
                onClick={() => handleToggleLock(month, isLocked)}
                className={`w-full mt-3 py-2.5 px-3 rounded-xl text-[10px] font-bold transition flex items-center justify-center gap-1.5 active:scale-95 border ${
                  isLocked
                    ? "bg-white hover:bg-slate-50 border-amber-200 text-amber-700 hover:text-amber-800 shadow-sm"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white border-transparent shadow-sm shadow-emerald-600/10"
                }`}
              >
                {isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : isLocked ? (
                  <>
                    <Unlock className="w-3.5 h-3.5" />
                    Buka Kunci Buku
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    Kunci Buku (Tutup)
                  </>
                )}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

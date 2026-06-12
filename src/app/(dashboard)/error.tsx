'use client'

import React, { useEffect } from 'react'
import { AlertTriangle, RotateCcw, Home } from 'lucide-react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Dashboard layout error:', error)
  }, [error])

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white border border-slate-100 rounded-3xl p-8 text-center shadow-lg space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-50 border border-rose-100 text-rose-500 mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">Halaman Gagal Dimuat</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Terjadi kesalahan saat memuat komponen halaman ini. Anda dapat mencoba memuat kembali halaman atau kembali ke dashboard utama.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-xs active:scale-95 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Coba Lagi
          </button>
          <a
            href="/dashboard"
            className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs active:scale-95 transition-all text-center"
          >
            <Home className="w-3.5 h-3.5" />
            Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}

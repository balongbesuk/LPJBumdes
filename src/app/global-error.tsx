'use client'

import React, { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Unhandled global error:', error)
  }, [error])

  return (
    <html>
      <body className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-white font-sans">
        <div className="max-w-md w-full bg-slate-800 border border-slate-700/50 rounded-3xl p-8 text-center shadow-2xl space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 text-3xl font-bold mx-auto">
            !
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold tracking-tight">Terjadi Kesalahan Sistem</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Aplikasi mengalami kendala teknis yang tidak terduga. Silakan coba memuat ulang sistem atau kembali ke dashboard.
            </p>
          </div>
          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => reset()}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs active:scale-95 transition-all cursor-pointer"
            >
              Muat Ulang Aplikasi
            </button>
            <a
              href="/dashboard"
              className="w-full py-3 bg-slate-700 hover:bg-slate-650 text-slate-200 font-bold rounded-2xl text-xs active:scale-95 transition-all text-center block"
            >
              Kembali ke Dashboard
            </a>
          </div>
        </div>
      </body>
    </html>
  )
}

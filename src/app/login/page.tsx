"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Building2, Lock, User, AlertCircle, Loader2, CheckCircle2, ShieldCheck, BarChart3, HelpCircle } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [bumdesName, setBumdesName] = useState("Sistem Informasi BUMDES")
  const [locationText, setLocationText] = useState("")

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    const storedUser = localStorage.getItem("bumdes_user")
    if (storedUser) {
      router.push("/dashboard")
    }
    // Fetch settings for dynamic branding
    fetch("/api/setup")
      .then((r) => r.json())
      .then((result) => {
        if (result.success) {
          if (!result.isComplete) {
            router.replace("/setup")
            return
          }
          if (result.data) {
            if (result.data.bumdes_name) setBumdesName(result.data.bumdes_name)
            const parts = [result.data.village_name, result.data.district_name, result.data.regency_name].filter(Boolean)
            if (parts.length > 0) setLocationText(parts.join(", "))
          }
        }
      })
      .catch(() => {})
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || "Gagal masuk ke sistem")
      }

      // Save user to localStorage
      localStorage.setItem("bumdes_user", JSON.stringify(result.data))
      router.push("/dashboard")
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Koneksi ke server gagal")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col md:flex-row select-none">
      
      {/* Sisi Kiri: Panel Formulir (40% Lebar Desktop, Penuh di Mobile) - Clean & Bright */}
      <div className="w-full md:w-[40%] lg:w-[35%] min-h-screen bg-white flex flex-col justify-between p-6 sm:p-10 md:p-12 lg:p-16 relative z-10 border-r border-slate-200/60 shadow-xl bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.06),transparent_45%)]">
        
        {/* Header Branding */}
        <div className="space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-600/15 border border-emerald-400/20">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {bumdesName}
            </h1>
            {locationText ? (
              <p className="text-emerald-600 text-[10px] font-bold mt-1.5 uppercase tracking-wider">{locationText}</p>
            ) : (
              <p className="text-slate-400 text-xs font-semibold mt-1">Sistem Informasi Manajemen BUMDES</p>
            )}
          </div>
        </div>

        {/* Formulir Inti */}
        <div className="my-auto py-8 sm:py-10 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Portal Administrasi BUMDes</h2>
            <p className="text-xs text-slate-500 mt-1.5 font-medium leading-relaxed">Silakan autentikasi akun Anda untuk mengelola keuangan dan unit usaha secara akuntabel hari ini.</p>
          </div>

          {/* Error notification */}
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-2xl text-xs font-semibold flex items-center gap-2.5 animate-fade-in">
              <AlertCircle className="w-4.5 h-4.5 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="Masukkan username"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-100/70 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 rounded-2xl text-sm transition-all focus:outline-none placeholder:text-slate-400 text-slate-800 font-semibold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Kata Sandi</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="Masukkan kata sandi"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-100/70 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 rounded-2xl text-sm transition-all focus:outline-none placeholder:text-slate-400 text-slate-800 font-semibold"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-4 mt-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-2xl text-sm shadow-lg shadow-emerald-600/15 hover:shadow-emerald-700/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 border border-emerald-500/10"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4.5 h-4.5 animate-spin" />
                  Membuka Sesi...
                </>
              ) : (
                "Masuk ke Sistem"
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-left text-[9px] text-slate-400 font-bold uppercase tracking-widest pt-4 border-t border-slate-200/60 leading-normal">
          Dedikasi Digital untuk Kemandirian Ekonomi Desa.
        </div>
      </div>

      {/* Sisi Kanan: Large Enterprise Presentation (60% Lebar Desktop, Tersembunyi di Mobile) - Gorgeous Fluid Gradient Mesh */}
      <div className="hidden md:flex md:w-[60%] lg:w-[65%] min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 items-center justify-center p-12 lg:p-20 relative overflow-hidden">
        
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-50"></div>
        
        {/* Glowing Ambient Mesh Orbs */}
        <div className="absolute top-[10%] left-[10%] w-[600px] h-[600px] bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[10%] right-[-10%] w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute top-[40%] right-[20%] w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Typography & Presentation Content */}
        <div className="relative z-10 max-w-xl space-y-10 text-left">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Portal Akuntabilitas Publik
          </div>

          {/* Heading */}
          <div className="space-y-4">
            <h2 className="text-3xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Menggerakkan Ekonomi, <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-350 to-cyan-300 bg-clip-text text-transparent">
                Membangun Kemandirian Desa
              </span>
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-medium">
              Sistem manajemen terintegrasi untuk mengelola seluruh unit usaha Simpan Pinjam, Sewa Gedung, Sewa Lahan, dan Rekapitulasi PPOB BUMDes secara transparan, modern, dan akurat.
            </p>
          </div>

          {/* Features Column */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
            
            <div className="flex gap-3 items-start">
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Standar SAK EMKM</h4>
                <p className="text-[11px] text-slate-400 leading-normal font-semibold">Pencatatan pembukuan otomatis ganda menghasilkan neraca keuangan yang seimbang.</p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Keamanan & Kontrol</h4>
                <p className="text-[11px] text-slate-400 leading-normal font-semibold">Fitur kunci periode buku mencegah manipulasi data transaksi historis.</p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 shrink-0">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Analitik Terpadu</h4>
                <p className="text-[11px] text-slate-400 leading-normal font-semibold">Dasbor keuangan real-time untuk memantau kinerja laba bulanan setiap unit.</p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400 shrink-0">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Bantuan Operator</h4>
                <p className="text-[11px] text-slate-400 leading-normal font-semibold">Sistem bantuan terintegrasi untuk memudahkan operator unit menginput data.</p>
              </div>
            </div>

          </div>

          {/* Slogan Footer */}
          <div className="pt-8 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">
            <span>Standar Pelayanan Prima</span>
            <span>BUMDES Unggul</span>
          </div>

        </div>

      </div>

    </div>
  )
}

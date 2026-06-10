"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Building2, Lock, User, AlertCircle, Loader2 } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    const storedUser = localStorage.getItem("bumdes_user")
    if (storedUser) {
      router.push("/dashboard")
    }
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      {/* Background visual shapes */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-200/40 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl -z-10" />

      <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-200/50 p-8 md:p-10 transition-all">
        {/* Logo and header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30 mb-4">
            <Building2 className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">BUMDES "BAROKAH"</h1>
          <p className="text-slate-400 text-xs font-semibold mt-1">Balongbesuk, Diwek, Jombang</p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Login form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Username</label>
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
                placeholder="Masukkan username Anda"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-2xl text-sm transition-all focus:outline-none focus:ring-4 focus:ring-emerald-500/10 placeholder:text-slate-400 text-slate-800"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Kata Sandi</label>
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
                placeholder="Masukkan kata sandi Anda"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-2xl text-sm transition-all focus:outline-none focus:ring-4 focus:ring-emerald-500/10 placeholder:text-slate-400 text-slate-800"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-sm shadow-lg shadow-emerald-600/20 hover:shadow-emerald-700/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Membuka Sesi...
              </>
            ) : (
              "Masuk ke Sistem"
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-[10px] text-slate-400 font-semibold">
          Sistem Informasi Manajemen BUMDES &bull; T.A 2026
        </div>
      </div>
    </div>
  )
}

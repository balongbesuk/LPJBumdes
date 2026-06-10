"use client"

import React, { useState, useEffect } from "react"
import {
  UserCircle,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Shield,
  Mail,
  Calendar,
} from "lucide-react"

interface UserData {
  id: string
  username: string
  name: string
  role: string
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Kepala BUMDES (Admin)",
  BENDAHARA: "Bendahara",
  SEKRETARIS: "Sekretaris",
  OPERATOR_SEWA: "Operator Sewa",
  OPERATOR_SP: "Operator Simpan Pinjam",
}

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-amber-50 text-amber-700 border-amber-200",
  BENDAHARA: "bg-emerald-50 text-emerald-700 border-emerald-200",
  SEKRETARIS: "bg-blue-50 text-blue-700 border-blue-200",
  OPERATOR_SEWA: "bg-violet-50 text-violet-700 border-violet-200",
  OPERATOR_SP: "bg-rose-50 text-rose-700 border-rose-200",
}

export default function ProfilPage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [changingPassword, setChangingPassword] = useState(false)
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    // Read user from cookie
    try {
      const cookieStr = document.cookie.split("; ").find((c) => c.startsWith("bumdes_user="))
      if (cookieStr) {
        const userData = JSON.parse(decodeURIComponent(cookieStr.split("=").slice(1).join("=")))
        setUser(userData)
      }
    } catch {
      // fallback to localStorage
      const stored = localStorage.getItem("bumdes_user")
      if (stored) setUser(JSON.parse(stored))
    }
  }, [])

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccessMsg(null)
    setErrorMsg(null)

    if (newPassword !== confirmPassword) {
      setErrorMsg("Konfirmasi password baru tidak cocok")
      return
    }

    if (newPassword.length < 6) {
      setErrorMsg("Password baru minimal 6 karakter")
      return
    }

    if (!user) {
      setErrorMsg("Sesi login tidak ditemukan. Silakan login ulang.")
      return
    }

    setChangingPassword(true)
    try {
      const res = await fetch("/api/profil/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          currentPassword,
          newPassword,
        }),
      })
      const result = await res.json()
      if (!result.success) throw new Error(result.error)

      setSuccessMsg("Password berhasil diubah! Anda dapat melanjutkan sesi saat ini.")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setTimeout(() => setSuccessMsg(null), 5000)
    } catch (err: any) {
      setErrorMsg(err.message)
    } finally {
      setChangingPassword(false)
    }
  }

  if (!user) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-xl w-64"></div>
        <div className="h-64 bg-slate-200 rounded-3xl"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <UserCircle className="w-6 h-6 text-emerald-600" />
          Profil Saya
        </h1>
        <p className="text-slate-400 text-xs font-semibold mt-1">
          Lihat informasi akun Anda dan ubah password login.
        </p>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in">
          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Profile Info Card */}
      <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-3xl shadow-sm space-y-6">
        <h2 className="text-slate-800 font-bold text-sm tracking-tight border-b border-slate-50 pb-3 flex items-center gap-2">
          <UserCircle className="w-4 h-4 text-emerald-600" />
          Informasi Akun
        </h2>

        <div className="space-y-4">
          {/* Name */}
          <div className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold text-2xl shadow-md shadow-emerald-600/20 shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-slate-800 font-bold text-base">{user.name}</p>
              <span className="text-xs text-slate-400 font-semibold">@{user.username}</span>
            </div>
          </div>

          {/* Role */}
          <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
                <Shield className="w-4 h-4 text-slate-500" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Jabatan / Role</p>
                <p className="text-sm font-bold text-slate-700">{ROLE_LABELS[user.role] || user.role}</p>
              </div>
            </div>
            <span
              className={`text-[10px] font-bold px-3 py-1.5 rounded-full border ${
                ROLE_COLORS[user.role] || "bg-slate-50 text-slate-600 border-slate-200"
              }`}
            >
              {user.role}
            </span>
          </div>

          {/* Username */}
          <div className="flex items-center gap-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50">
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
              <Mail className="w-4 h-4 text-slate-500" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Username Login</p>
              <p className="text-sm font-bold text-slate-700">@{user.username}</p>
            </div>
          </div>
        </div>

        <div className="pt-2 text-[10px] text-slate-400 font-semibold leading-relaxed">
          Informasi profil hanya bisa diubah oleh admin melalui menu Pengaturan &gt; Manajemen Pengguna.
          Anda hanya dapat mengubah password login melalui form di bawah.
        </div>
      </div>

      {/* Password Change Card */}
      <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-3xl shadow-sm space-y-6">
        <div className="space-y-5">
          <h2 className="text-slate-800 font-bold text-sm tracking-tight border-b border-slate-50 pb-3 flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            Ubah Password
          </h2>
          <p className="text-slate-400 text-xs font-semibold leading-relaxed">
            Ganti password login Anda. Setelah berhasil diubah, Anda tetap bisa melanjutkan sesi saat ini tanpa perlu login ulang.
          </p>

          <form onSubmit={handleChangePassword} className="space-y-4">
            {/* Current Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Password Saat Ini
              </label>
              <div className="relative">
                <input
                  type={showCurrentPw ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="Masukkan password saat ini"
                  className="w-full px-4 py-2.5 pr-10 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl text-sm transition-all focus:outline-none focus:ring-4 focus:ring-emerald-500/10 placeholder:text-slate-400 text-slate-800 font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                >
                  {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Password Baru
              </label>
              <div className="relative">
                <input
                  type={showNewPw ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Minimal 6 karakter"
                  className="w-full px-4 py-2.5 pr-10 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl text-sm transition-all focus:outline-none focus:ring-4 focus:ring-emerald-500/10 placeholder:text-slate-400 text-slate-800 font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(!showNewPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                >
                  {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Konfirmasi Password Baru
              </label>
              <div className="relative">
                <input
                  type={showConfirmPw ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Ketik ulang password baru"
                  className="w-full px-4 py-2.5 pr-10 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl text-sm transition-all focus:outline-none focus:ring-4 focus:ring-emerald-500/10 placeholder:text-slate-400 text-slate-800 font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPw(!showConfirmPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                >
                  {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <span className="text-[10px] text-rose-500 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Password tidak cocok
                </span>
              )}
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={
                  changingPassword ||
                  !currentPassword ||
                  !newPassword ||
                  !confirmPassword ||
                  newPassword !== confirmPassword
                }
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold rounded-2xl text-xs shadow-md shadow-emerald-600/10 transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
              >
                {changingPassword ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Mengubah Password...
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    Ubah Password
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

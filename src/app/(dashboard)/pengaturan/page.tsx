"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import {
  Settings as SettingsIcon,
  Building,
  MapPin,
  DollarSign,
  Save,
  CheckCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Database,
  Download,
  Upload,
  History,
  ShieldAlert,
  FileCode,
  ArrowRight,
  Users
} from "lucide-react"
import { invalidateSettingsCache } from "@/context/SettingsContext"
import UsersTab from "./UsersTab"

export default function PengaturanPage() {
  const [activeTab, setActiveTab] = useState<"profil" | "backup" | "users">("profil")
  
  const [formData, setFormData] = useState({
    bumdes_name: "",
    village_name: "",
    district_name: "",
    regency_name: "",
    shu_pengurus_pct: "0",
    shu_pengawas_pct: "0",
    shu_sosial_pct: "0",
    shu_modal_pct: "0",
    shu_desa_pct: "0",
    leader_name: "",
    leader_nip: "",
    director_name: "",
    director_nip: "",
    treasurer_name: "",
    treasurer_nip: "",
    supervisor_name: "",
    supervisor_nip: "",
    module_sp: "true",
    module_gedung: "true",
    module_lahan: "true",
    module_ppob: "true",
    module_persuratan: "true"
  })
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [restoring, setRestoring] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showConfirmRestore, setShowConfirmRestore] = useState(false)
  const [showConfirmReset, setShowConfirmReset] = useState(false)
  const [resetConfirmInput, setResetConfirmInput] = useState("")
  const [resetting, setResetting] = useState(false)
  
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const fetchSettings = async () => {
    setLoading(true)
    setErrorMsg(null)
    try {
      const res = await fetch("/api/pengaturan")
      const result = await res.json()
      if (result.success) {
        setFormData({
          bumdes_name: result.data.bumdes_name || "",
          village_name: result.data.village_name || "",
          district_name: result.data.district_name || "",
          regency_name: result.data.regency_name || "",
          shu_pengurus_pct: result.data.shu_pengurus_pct || "0",
          shu_pengawas_pct: result.data.shu_pengawas_pct || "0",
          shu_sosial_pct: result.data.shu_sosial_pct || "0",
          shu_modal_pct: result.data.shu_modal_pct || "0",
          shu_desa_pct: result.data.shu_desa_pct || "0",
          leader_name: result.data.leader_name || "",
          leader_nip: result.data.leader_nip || "",
          director_name: result.data.director_name || "",
          director_nip: result.data.director_nip || "",
          treasurer_name: result.data.treasurer_name || "",
          treasurer_nip: result.data.treasurer_nip || "",
          supervisor_name: result.data.supervisor_name || "",
          supervisor_nip: result.data.supervisor_nip || "",
          module_sp: result.data.module_sp !== "false" ? "true" : "false",
          module_gedung: result.data.module_gedung !== "false" ? "true" : "false",
          module_lahan: result.data.module_lahan !== "false" ? "true" : "false",
          module_ppob: result.data.module_ppob !== "false" ? "true" : "false",
          module_persuratan: result.data.module_persuratan !== "false" ? "true" : "false"
        })
      } else {
        throw new Error(result.error || "Gagal memuat pengaturan")
      }
    } catch (err: any) {
      setErrorMsg(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  // Calculate live sum of SHU percentages
  const pPengurus = parseFloat(formData.shu_pengurus_pct) || 0
  const pPengawas = parseFloat(formData.shu_pengawas_pct) || 0
  const pSosial = parseFloat(formData.shu_sosial_pct) || 0
  const pModal = parseFloat(formData.shu_modal_pct) || 0
  const pDesa = parseFloat(formData.shu_desa_pct) || 0
  const totalShuPct = pPengurus + pPengawas + pSosial + pModal + pDesa
  const isShuBalanced = Math.abs(totalShuPct - 100) < 0.01

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccessMsg(null)
    setErrorMsg(null)

    // Revalidate SHU sum
    if (Math.abs(totalShuPct - 100) > 0.01) {
      setErrorMsg(`Total alokasi SHU harus tepat 100% (saat ini: ${totalShuPct}%)`)
      return
    }

    setSaving(true)
    try {
      const res = await fetch("/api/pengaturan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })
      const result = await res.json()
      if (result.success) {
        invalidateSettingsCache()
        setSuccessMsg("Pengaturan berhasil disimpan!")
        setTimeout(() => setSuccessMsg(null), 3000)
      } else {
        throw new Error(result.error || "Gagal menyimpan pengaturan")
      }
    } catch (err: any) {
      setErrorMsg(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDownloadBackup = async () => {
    setDownloading(true)
    setErrorMsg(null)
    setSuccessMsg(null)
    try {
      const res = await fetch("/api/pengaturan/backup")
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || "Gagal mengunduh file cadangan")
      }
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      
      const contentDisposition = res.headers.get("content-disposition")
      let filename = `bumdes_backup_${new Date().toISOString().slice(0, 10).replace(/-/g, "")}.db`
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/)
        if (match) filename = match[1]
      }
      
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      setSuccessMsg("Database berhasil dicadangkan dan diunduh!")
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (err: any) {
      setErrorMsg(err.message)
    } finally {
      setDownloading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      if (!file.name.endsWith(".db")) {
        setErrorMsg("Harap pilih file dengan ekstensi .db (database SQLite)")
        setSelectedFile(null)
        return
      }
      setErrorMsg(null)
      setSelectedFile(file)
    }
  }

  const handleRestoreDatabase = async () => {
    if (!selectedFile) return
    setRestoring(true)
    setErrorMsg(null)
    setSuccessMsg(null)
    try {
      const data = new FormData()
      data.append("file", selectedFile)

      const res = await fetch("/api/pengaturan/restore", {
        method: "POST",
        body: data
      })
      const result = await res.json()
      if (result.success) {
        setSuccessMsg(result.message || "Database berhasil dipulihkan!")
        setSelectedFile(null)
        setShowConfirmRestore(false)
      } else {
        throw new Error(result.error || "Gagal memulihkan database")
      }
    } catch (err: any) {
      setErrorMsg(err.message)
      setShowConfirmRestore(false)
    } finally {
      setRestoring(false)
    }
  }

  const handleResetDatabase = async () => {
    if (resetConfirmInput !== "RESET") return
    setResetting(true)
    setErrorMsg(null)
    setSuccessMsg(null)
    try {
      const res = await fetch("/api/pengaturan/reset", {
        method: "POST"
      })
      const result = await res.json()
      if (result.success) {
        setSuccessMsg("Database berhasil di-reset! Mengalihkan ke login...")
        localStorage.removeItem("bumdes_user")
        setShowConfirmReset(false)
        setTimeout(() => {
          window.location.href = "/login"
        }, 2000)
      } else {
        throw new Error(result.error || "Gagal mereset database")
      }
    } catch (err: any) {
      setErrorMsg(err.message)
      setShowConfirmReset(false)
    } finally {
      setResetting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-xl w-64"></div>
        <div className="h-12 bg-slate-200 rounded-2xl w-96"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-96 bg-slate-200 rounded-3xl"></div>
          <div className="h-96 bg-slate-200 rounded-3xl"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-emerald-600 animate-spin-slow" />
            Pengaturan Sistem & Profil
          </h1>
          <p className="text-slate-400 text-xs font-semibold mt-1">
            Atur data profil nama desa, persentase SHU tahunan, pencadangan database, dan pantau jejak audit.
          </p>
        </div>

        {/* Audit Log Quick Link */}
        <Link
          href="/pengaturan/audit"
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-700 font-bold rounded-2xl text-xs transition border border-emerald-100 w-fit self-start md:self-auto"
        >
          <History className="w-4 h-4 text-emerald-600" />
          Lihat Log Audit
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Tabs Switcher */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("profil")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "profil"
              ? "bg-white text-slate-800 shadow-sm"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Building className="w-4 h-4" />
          Profil & Alokasi SHU
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("backup")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "backup"
              ? "bg-white text-slate-800 shadow-sm"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Database className="w-4 h-4" />
          Pencadangan & Pemulihan
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "users"
              ? "bg-white text-slate-800 shadow-sm"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Users className="w-4 h-4" />
          Manajemen Pengguna
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-850 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in">
          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Tab: Profil & SHU */}
      {activeTab === "profil" && (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Village Profile */}
          <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-3xl shadow-sm flex flex-col justify-between">
            <div className="space-y-5">
              <h2 className="text-slate-800 font-bold text-sm tracking-tight border-b border-slate-50 pb-3 flex items-center gap-2">
                <Building className="w-4 h-4 text-emerald-600" />
                Profil BUMDES & Lembaga Desa
              </h2>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Nama BUMDES
                  </label>
                  <input
                    type="text"
                    name="bumdes_name"
                    value={formData.bumdes_name}
                    onChange={handleInputChange}
                    required
                    placeholder='Contoh: BUMDES "BAROKAH"'
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl text-sm transition-all focus:outline-none focus:ring-4 focus:ring-emerald-500/10 placeholder:text-slate-450 text-slate-800 font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Nama Desa
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <MapPin className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      name="village_name"
                      value={formData.village_name}
                      onChange={handleInputChange}
                      required
                      placeholder="Contoh: Desa Balongbesuk"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl text-sm transition-all focus:outline-none focus:ring-4 focus:ring-emerald-500/10 placeholder:text-slate-450 text-slate-800 font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      Kecamatan
                    </label>
                    <input
                      type="text"
                      name="district_name"
                      value={formData.district_name}
                      onChange={handleInputChange}
                      required
                      placeholder="Contoh: Diwek"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl text-sm transition-all focus:outline-none focus:ring-4 focus:ring-emerald-500/10 placeholder:text-slate-450 text-slate-800 font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      Kabupaten
                    </label>
                    <input
                      type="text"
                      name="regency_name"
                      value={formData.regency_name}
                      onChange={handleInputChange}
                      required
                      placeholder="Contoh: Jombang"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl text-sm transition-all focus:outline-none focus:ring-4 focus:ring-emerald-500/10 placeholder:text-slate-450 text-slate-800 font-semibold"
                    />
                  </div>
                </div>
              {/* Active Modules Settings */}
              <div className="pt-5 border-t border-slate-100/80 space-y-4">
                <div>
                  <h3 className="text-slate-800 font-bold text-xs uppercase tracking-wider block">
                    Aktifkan Modul & Unit Usaha
                  </h3>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                    Centang modul usaha yang aktif di BUMDES Anda untuk menampilkannya di navigasi sidebar.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  {[
                    { key: "module_sp", label: "Simpan Pinjam" },
                    { key: "module_gedung", label: "Sewa Gedung (GSG)" },
                    { key: "module_lahan", label: "Sewa Lahan & Lapak" },
                    { key: "module_ppob", label: "Rekap PPOB" },
                    { key: "module_persuratan", label: "Persuratan & SK" }
                  ].map((mod) => (
                    <label key={mod.key} className="flex items-center gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        name={mod.key}
                        checked={formData[mod.key as keyof typeof formData] !== "false"}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            [mod.key]: e.target.checked ? "true" : "false"
                          }))
                        }}
                        className="w-4.5 h-4.5 rounded-lg text-emerald-600 focus:ring-emerald-500/20 border-slate-350 bg-slate-50 cursor-pointer"
                      />
                      <span className="text-xs font-semibold text-slate-700">{mod.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-50 text-[10px] text-slate-400 font-semibold leading-relaxed">
                Data profil desa akan digunakan pada kop surat resmi dalam administrasi modul Persuratan dan judul cetak laporan keuangan LPJ.
              </div>
            </div>
          </div>
        </div>

          {/* Right Column: SHU Allocations */}
          <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-3xl shadow-sm space-y-6">
            <div className="space-y-4">
              <h2 className="text-slate-800 font-bold text-sm tracking-tight border-b border-slate-50 pb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                Alokasi Pembagian SHU BUMDES (%)
              </h2>

              <div className="space-y-3.5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block">Jasa Pengurus & Pelaksana</label>
                    <span className="text-[9px] text-slate-400 font-semibold leading-none">Insentif operasional kerja</span>
                  </div>
                  <div className="w-24 shrink-0 relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      name="shu_pengurus_pct"
                      value={formData.shu_pengurus_pct}
                      onChange={handleInputChange}
                      className="w-full pr-8 pl-3 py-2 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl text-sm text-right font-bold text-slate-850"
                    />
                    <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400 text-xs font-bold">%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block">Jasa Pengawas & Penasihat</label>
                    <span className="text-[9px] text-slate-400 font-semibold leading-none">Untuk Kades & Pengawas BUMDES</span>
                  </div>
                  <div className="w-24 shrink-0 relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      name="shu_pengawas_pct"
                      value={formData.shu_pengawas_pct}
                      onChange={handleInputChange}
                      className="w-full pr-8 pl-3 py-2 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl text-sm text-right font-bold text-slate-850"
                    />
                    <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400 text-xs font-bold">%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block">Dana Sosial & Pendidikan</label>
                    <span className="text-[9px] text-slate-400 font-semibold leading-none">Pendidikan warga & kas sosial</span>
                  </div>
                  <div className="w-24 shrink-0 relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      name="shu_sosial_pct"
                      value={formData.shu_sosial_pct}
                      onChange={handleInputChange}
                      className="w-full pr-8 pl-3 py-2 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl text-sm text-right font-bold text-slate-850"
                    />
                    <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400 text-xs font-bold">%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block">Penambahan Cadangan Modal</label>
                    <span className="text-[9px] text-slate-400 font-semibold leading-none">Diputar kembali menjadi modal</span>
                  </div>
                  <div className="w-24 shrink-0 relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      name="shu_modal_pct"
                      value={formData.shu_modal_pct}
                      onChange={handleInputChange}
                      className="w-full pr-8 pl-3 py-2 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl text-sm text-right font-bold text-slate-850"
                    />
                    <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400 text-xs font-bold">%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block">Kas Desa (PADes)</label>
                    <span className="text-[9px] text-slate-400 font-semibold leading-none">Sumbangan untuk PAD Desa</span>
                  </div>
                  <div className="w-24 shrink-0 relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      name="shu_desa_pct"
                      value={formData.shu_desa_pct}
                      onChange={handleInputChange}
                      className="w-full pr-8 pl-3 py-2 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl text-sm text-right font-bold text-slate-850"
                    />
                    <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400 text-xs font-bold">%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Real-time Math sum block */}
            <div className={`p-4 border rounded-2xl flex items-center justify-between text-xs transition-all ${
              isShuBalanced
                ? "bg-emerald-50/50 border-emerald-100 text-emerald-800"
                : "bg-rose-50/50 border-rose-100 text-rose-800"
            }`}>
              <div className="flex items-center gap-2 font-bold">
                {isShuBalanced ? (
                  <>
                    <CheckCircle className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                    <span>Alokasi Seimbang</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4.5 h-4.5 text-rose-500 shrink-0" />
                    <span>Alokasi Tidak Seimbang</span>
                  </>
                )}
              </div>
              <div className="font-bold text-sm">
                Total: {totalShuPct}%
              </div>
            </div>

            </div>

          {/* Third Card (Spanning 2 columns): Signatures Settings */}
          <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-3xl shadow-sm md:col-span-2 space-y-6">
            <div>
              <h2 className="text-slate-800 font-bold text-sm tracking-tight border-b border-slate-50 pb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                Pejabat Penandatangan Dokumen (LPJ & Laporan Keuangan)
              </h2>
              <p className="text-slate-400 text-xs font-semibold mt-1">
                Atur nama lengkap dan NIK/NIP pejabat desa dan BUMDES yang akan dicetak di Lembar Pengesahan LPJ.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Kepala Desa / Penasihat */}
              <div className="space-y-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">Penasihat (Kepala Desa)</h3>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Nama Lengkap</label>
                    <input
                      type="text"
                      name="leader_name"
                      value={formData.leader_name}
                      onChange={handleInputChange}
                      placeholder="Contoh: Budi Santoso, S.Sos."
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 focus:border-emerald-500 rounded-xl text-xs font-semibold text-slate-850 placeholder:text-slate-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">NIK / NIP</label>
                    <input
                      type="text"
                      name="leader_nip"
                      value={formData.leader_nip}
                      onChange={handleInputChange}
                      placeholder="Contoh: 19800812 201001 1 003"
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 focus:border-emerald-500 rounded-xl text-xs font-semibold text-slate-850 placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>

              {/* Direktur BUMDES */}
              <div className="space-y-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">Direktur / Ketua BUMDes</h3>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Nama Lengkap</label>
                    <input
                      type="text"
                      name="director_name"
                      value={formData.director_name}
                      onChange={handleInputChange}
                      placeholder="Contoh: Ahmad Fauzi, M.Ak."
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 focus:border-emerald-500 rounded-xl text-xs font-semibold text-slate-850 placeholder:text-slate-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">NIK / NIP</label>
                    <input
                      type="text"
                      name="director_nip"
                      value={formData.director_nip}
                      onChange={handleInputChange}
                      placeholder="Contoh: 3517123456780001"
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 focus:border-emerald-500 rounded-xl text-xs font-semibold text-slate-850 placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>

              {/* Bendahara Keuangan */}
              <div className="space-y-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">Bendahara Keuangan</h3>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Nama Lengkap</label>
                    <input
                      type="text"
                      name="treasurer_name"
                      value={formData.treasurer_name}
                      onChange={handleInputChange}
                      placeholder="Contoh: Siti Rahmawati, S.E."
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 focus:border-emerald-500 rounded-xl text-xs font-semibold text-slate-850 placeholder:text-slate-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">NIK / NIP</label>
                    <input
                      type="text"
                      name="treasurer_nip"
                      value={formData.treasurer_nip}
                      onChange={handleInputChange}
                      placeholder="Contoh: 3517098765430002"
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 focus:border-emerald-500 rounded-xl text-xs font-semibold text-slate-850 placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>

              {/* Ketua Badan Pengawas */}
              <div className="space-y-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">Ketua Badan Pengawas</h3>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Nama Lengkap</label>
                    <input
                      type="text"
                      name="supervisor_name"
                      value={formData.supervisor_name}
                      onChange={handleInputChange}
                      placeholder="Contoh: Drs. Joko Wahyono"
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 focus:border-emerald-500 rounded-xl text-xs font-semibold text-slate-850 placeholder:text-slate-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">NIK / NIP</label>
                    <input
                      type="text"
                      name="supervisor_nip"
                      value={formData.supervisor_nip}
                      onChange={handleInputChange}
                      placeholder="Contoh: 3517112233440003"
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 focus:border-emerald-500 rounded-xl text-xs font-semibold text-slate-850 placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="md:col-span-2 flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={fetchSettings}
              disabled={saving}
              className="px-6 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold border border-slate-200 hover:border-slate-350 rounded-2xl text-xs transition-all flex items-center justify-center gap-1.5 active:scale-98"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${saving ? "animate-spin" : ""}`} />
              Reset
            </button>
            <button
              type="submit"
              disabled={saving || !isShuBalanced}
              className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-100 disabled:shadow-none text-white font-bold rounded-2xl text-xs shadow-md shadow-emerald-600/10 transition-all flex items-center justify-center gap-1.5 active:scale-98"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  Simpan Pengaturan
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Tab: Pencadangan & Pemulihan */}
      {activeTab === "backup" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
          {/* Card: Unduh Backup */}
          <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-3xl shadow-sm space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Download className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-slate-800 font-bold text-sm tracking-tight">
                  Cadangkan Database (Backup)
                </h2>
                <p className="text-slate-400 text-xs font-semibold mt-1 leading-relaxed">
                  Unduh salinan berkas database aktif BUMDES (`dev.db`). Kami menyarankan Anda mencadangkan database secara berkala sebelum melakukan perubahan besar atau tutup buku akhir tahun.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2 text-xs font-semibold text-slate-500">
                <div className="flex justify-between">
                  <span>Nama Engine:</span>
                  <span className="text-slate-700 font-bold">SQLite 3</span>
                </div>
                <div className="flex justify-between">
                  <span>Lokasi Lokal:</span>
                  <span className="text-slate-750 font-mono text-[10px]">prisma/dev.db</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-50">
              <button
                type="button"
                onClick={handleDownloadBackup}
                disabled={downloading}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold rounded-2xl text-xs shadow-md shadow-emerald-600/10 transition-all flex items-center justify-center gap-2 active:scale-98 font-bold"
              >
                {downloading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Mengunduh Data...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Unduh Cadangan Database (.db)
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Card: Restore Backup */}
          <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-3xl shadow-sm space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-slate-800 font-bold text-sm tracking-tight">
                  Pulihkan Database (Restore)
                </h2>
                <p className="text-slate-400 text-xs font-semibold mt-1 leading-relaxed">
                  Unggah berkas cadangan database (`.db`) untuk memulihkan seluruh data sistem BUMDES ke keadaan sebelumnya.
                </p>
              </div>

              {/* Warning box */}
              <div className="p-4 bg-rose-50/50 border border-rose-100 rounded-2xl text-xs font-semibold text-rose-800 flex items-start gap-2.5">
                <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">PERINGATAN:</span> Tindakan ini bersifat destruktif. Database aktif saat ini akan tertimpa sepenuhnya oleh berkas yang diunggah.
                </div>
              </div>

              {/* File input section */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Pilih Berkas Cadangan (.db)
                </label>
                {!selectedFile ? (
                  <div className="relative border-2 border-dashed border-slate-200 hover:border-emerald-500/50 transition bg-slate-50/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer">
                    <input
                      type="file"
                      accept=".db"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <FileCode className="w-8 h-8 text-slate-400 mb-2" />
                    <span className="text-xs font-bold text-slate-650">Pilih berkas dari komputer Anda</span>
                    <span className="text-[10px] text-slate-400 mt-1 font-semibold">Hanya berkas hasil backup SQLite (.db)</span>
                  </div>
                ) : (
                  <div className="p-4 border border-slate-200 bg-slate-50 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileCode className="w-6 h-6 text-emerald-600" />
                      <div className="text-left">
                        <p className="text-xs font-bold text-slate-700 truncate max-w-[200px]">
                          {selectedFile.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-semibold">
                          {(selectedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="text-xs font-bold text-rose-600 hover:text-rose-700 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-100 hover:bg-rose-100/55 transition"
                    >
                      Batal
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-50">
              <button
                type="button"
                disabled={!selectedFile}
                onClick={() => setShowConfirmRestore(true)}
                className="w-full py-3.5 px-4 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold rounded-2xl text-xs shadow-md shadow-amber-600/10 transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                <Upload className="w-4 h-4" />
                Unggah & Pulihkan Database
              </button>
            </div>
          </div>

          {/* Card: Reset Database */}
          <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-3xl shadow-sm space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-slate-800 font-bold text-sm tracking-tight">
                  Reset Database (Mulai Baru)
                </h2>
                <p className="text-slate-400 text-xs font-semibold mt-1 leading-relaxed">
                  Hapus permanen seluruh transaksi keuangan, simpanan, pinjaman, sewa, surat, inventaris, dan audit log. Profil BUMDES akan di-reset untuk menampilkan kembali Setup Wizard.
                </p>
              </div>

              {/* Hard warning box */}
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs font-semibold text-rose-800 flex items-start gap-2.5">
                <ShieldAlert className="w-5 h-5 text-rose-655 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <span className="font-bold text-rose-900 block">DANGER ZONE:</span> Tindakan ini tidak dapat dibatalkan. Seluruh data BUMDES akan dikembalikan ke kondisi awal pabrik.
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-50">
              <button
                type="button"
                onClick={() => {
                  setResetConfirmInput("")
                  setShowConfirmReset(true)
                }}
                className="w-full py-3.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl text-xs shadow-md shadow-rose-600/10 transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                <RefreshCw className="w-4 h-4" />
                Reset Seluruh Database
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Manajemen Pengguna */}
      {activeTab === "users" && (
        <UsersTab />
      )}

      {/* Confirmation Restore Dialog Overlay */}
      {showConfirmRestore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white border border-slate-150 p-6 md:p-8 rounded-3xl shadow-2xl space-y-6">
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-2xl bg-rose-55 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-slate-900 font-bold text-base tracking-tight">
                  Konfirmasi Pemulihan Database
                </h3>
                <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                  Apakah Anda benar-benar yakin ingin memulihkan database? Tindakan ini akan **menghapus permanen** data transaksi aktif Anda saat ini dan menggantinya dengan data dari file cadangan.
                </p>
              </div>
            </div>

            <div className="p-4 bg-rose-50/40 rounded-2xl border border-rose-100/50 space-y-2 text-xs font-semibold text-rose-850">
              <div className="flex justify-between">
                <span>File yang diunggah:</span>
                <span className="font-bold">{selectedFile?.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Ukuran Berkas:</span>
                <span className="font-bold">{(selectedFile!.size / 1024).toFixed(1)} KB</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={restoring}
                onClick={() => setShowConfirmRestore(false)}
                className="flex-1 py-3 px-4 bg-slate-50 hover:bg-slate-100 disabled:opacity-50 text-slate-600 font-bold border border-slate-200 rounded-2xl text-xs transition"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={restoring}
                onClick={handleRestoreDatabase}
                className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold rounded-2xl text-xs shadow-md shadow-rose-600/10 transition flex items-center justify-center gap-1.5"
              >
                {restoring ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Memulihkan...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Ya, Pulihkan Data
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Reset Dialog Overlay */}
      {showConfirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white border border-slate-150 p-6 md:p-8 rounded-3xl shadow-2xl space-y-6">
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 rounded-2xl bg-rose-55 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 className="text-slate-900 font-bold text-base tracking-tight">
                  Hapus Permanen Seluruh Database?
                </h3>
                <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                  Tindakan ini akan menghapus seluruh data transaksi, simpanan, pinjaman, sewa, aset, dokumen, dan riwayat audit log. Anda akan dialihkan kembali ke Setup Wizard.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Ketik kata <span className="text-rose-600 font-extrabold">RESET</span> untuk mengonfirmasi:
              </label>
              <input
                type="text"
                value={resetConfirmInput}
                onChange={(e) => setResetConfirmInput(e.target.value)}
                placeholder="RESET"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-rose-500 focus:bg-white focus:outline-none rounded-xl text-sm font-bold text-slate-800 tracking-wider text-center"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={resetting}
                onClick={() => setShowConfirmReset(false)}
                className="flex-1 py-3 px-4 bg-slate-50 hover:bg-slate-100 disabled:opacity-50 text-slate-600 font-bold border border-slate-200 rounded-2xl text-xs transition"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={resetting || resetConfirmInput !== "RESET"}
                onClick={handleResetDatabase}
                className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-transparent text-white font-bold rounded-2xl text-xs shadow-md shadow-rose-600/10 transition flex items-center justify-center gap-1.5"
              >
                {resetting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Mereset Data...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Ya, Reset Semua
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

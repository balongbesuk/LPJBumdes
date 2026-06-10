"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Building2,
  MapPin,
  DollarSign,
  Landmark,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Sparkles,
  ArrowRight
} from "lucide-react"

const STEPS = [
  { id: 1, title: "Profil BUMDES", icon: Building2 },
  { id: 2, title: "Alokasi SHU", icon: DollarSign },
  { id: 3, title: "Saldo Awal", icon: Landmark },
]

export default function SetupPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Step 1: Profile
  const [bumdesName, setBumdesName] = useState("")
  const [villageName, setVillageName] = useState("")
  const [districtName, setDistrictName] = useState("")
  const [regencyName, setRegencyName] = useState("")

  // Step 2: SHU
  const [shuPengurus, setShuPengurus] = useState("30")
  const [shuPengawas, setShuPengawas] = useState("10")
  const [shuSosial, setShuSosial] = useState("10")
  const [shuModal, setShuModal] = useState("25")
  const [shuDesa, setShuDesa] = useState("25")

  // Step 3: Opening Balances
  const [ob, setOb] = useState({
    kas_bumdes: "",
    kas_gedung: "",
    kas_lapak: "",
    piutang_masyarakat: "",
    piutang_gapoktan: "",
    peralatan: "",
    akum_penyusutan: "",
    simpanan_pokok: "",
    simpanan_wajib: "",
    hutang_shu: "",
    modal_desa: "",
  })

  useEffect(() => {
    const checkSetup = async () => {
      try {
        const res = await fetch("/api/setup")
        const result = await res.json()
        if (result.success && result.isComplete) {
          router.replace("/dashboard")
          return
        }
        // Pre-fill from existing settings if any
        if (result.data) {
          if (result.data.bumdes_name) setBumdesName(result.data.bumdes_name)
          if (result.data.village_name) setVillageName(result.data.village_name)
          if (result.data.district_name) setDistrictName(result.data.district_name)
          if (result.data.regency_name) setRegencyName(result.data.regency_name)
          if (result.data.shu_pengurus_pct) setShuPengurus(result.data.shu_pengurus_pct)
          if (result.data.shu_pengawas_pct) setShuPengawas(result.data.shu_pengawas_pct)
          if (result.data.shu_sosial_pct) setShuSosial(result.data.shu_sosial_pct)
          if (result.data.shu_modal_pct) setShuModal(result.data.shu_modal_pct)
          if (result.data.shu_desa_pct) setShuDesa(result.data.shu_desa_pct)
        }
      } catch {
        // Ignore, proceed with empty form
      } finally {
        setLoading(false)
      }
    }
    checkSetup()
  }, [router])

  const totalShu =
    (parseFloat(shuPengurus) || 0) +
    (parseFloat(shuPengawas) || 0) +
    (parseFloat(shuSosial) || 0) +
    (parseFloat(shuModal) || 0) +
    (parseFloat(shuDesa) || 0)
  const isShuBalanced = Math.abs(totalShu - 100) < 0.01

  const handleObChange = (key: string, value: string) => {
    setOb((prev) => ({ ...prev, [key]: value }))
  }

  const handleNext = () => {
    setError(null)
    if (step === 1) {
      if (!bumdesName.trim()) {
        setError("Nama BUMDES wajib diisi")
        return
      }
      if (!villageName.trim()) {
        setError("Nama Desa wajib diisi")
        return
      }
    }
    if (step === 2 && !isShuBalanced) {
      setError(`Total alokasi SHU harus tepat 100% (saat ini: ${totalShu}%)`)
      return
    }
    setStep((s) => Math.min(s + 1, 3))
  }

  const handleBack = () => {
    setError(null)
    setStep((s) => Math.max(s - 1, 1))
  }

  const handleSubmit = async () => {
    setError(null)
    setSaving(true)
    try {
      // Build opening balances object (only non-empty values)
      const openingBalances: Record<string, string> = {}
      let hasAnyOb = false
      for (const [key, val] of Object.entries(ob)) {
        if (val.trim() && parseFloat(val) > 0) {
          openingBalances[key] = val
          hasAnyOb = true
        }
      }

      const payload: Record<string, any> = {
        bumdes_name: bumdesName.trim(),
        village_name: villageName.trim(),
        district_name: districtName.trim(),
        regency_name: regencyName.trim(),
        shu_pengurus_pct: shuPengurus,
        shu_pengawas_pct: shuPengawas,
        shu_sosial_pct: shuSosial,
        shu_modal_pct: shuModal,
        shu_desa_pct: shuDesa,
      }
      if (hasAnyOb) {
        payload.openingBalances = openingBalances
      }

      const res = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const result = await res.json()
      if (!result.success) {
        throw new Error(result.error || "Gagal menyimpan konfigurasi")
      }
      // Success — redirect to login
      router.replace("/login")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const formatNumber = (val: string) => {
    const num = parseInt(val.replace(/[^\d]/g, ""), 10)
    if (isNaN(num)) return ""
    return num.toLocaleString("id-ID")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 flex items-center justify-center p-4 sm:p-6 selection:bg-emerald-500 selection:text-white">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#022c22_1px,transparent_1px),linear-gradient(to_bottom,#022c22_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20"></div>

      <div className="relative z-10 w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8 space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30 mx-auto">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Selamat Datang!
          </h1>
          <p className="text-slate-400 text-sm font-medium max-w-md mx-auto">
            Mari konfigurasikan Sistem Informasi BUMDES Anda. Proses ini hanya dilakukan sekali saat pertama kali pemakaian.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, idx) => {
            const Icon = s.icon
            const isActive = step === s.id
            const isDone = step > s.id
            return (
              <React.Fragment key={s.id}>
                {idx > 0 && (
                  <div className={`w-8 sm:w-12 h-0.5 rounded-full transition-colors ${isDone ? "bg-emerald-500" : "bg-slate-700"}`} />
                )}
                <div className="flex items-center gap-2">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                      isDone
                        ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
                        : isActive
                        ? "bg-white text-emerald-700 shadow-lg shadow-white/20"
                        : "bg-slate-800 text-slate-500 border border-slate-700"
                    }`}
                  >
                    {isDone ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span className={`text-xs font-bold hidden sm:block ${isActive ? "text-white" : isDone ? "text-emerald-400" : "text-slate-500"}`}>
                    {s.title}
                  </span>
                </div>
              </React.Fragment>
            )
          })}
        </div>

        {/* Main Card */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6">
          {/* Error */}
          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs font-bold flex items-center gap-2 animate-fade-in">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Step 1: Profil */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-white font-bold text-lg flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-emerald-400" />
                  Profil BUMDES & Desa
                </h2>
                <p className="text-slate-400 text-xs font-semibold mt-1">
                  Identitas lembaga yang akan tampil di seluruh dokumen, kuitansi, dan halaman publik.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Nama BUMDES <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={bumdesName}
                    onChange={(e) => setBumdesName(e.target.value)}
                    placeholder='Contoh: BUMDES "MAJU JAYA"'
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 focus:border-emerald-500 rounded-2xl text-sm text-white placeholder:text-slate-500 font-semibold transition-all focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Nama Desa <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <MapPin className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={villageName}
                      onChange={(e) => setVillageName(e.target.value)}
                      placeholder="Contoh: Desa Sukamaju"
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 focus:border-emerald-500 rounded-2xl text-sm text-white placeholder:text-slate-500 font-semibold transition-all focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Kecamatan</label>
                    <input
                      type="text"
                      value={districtName}
                      onChange={(e) => setDistrictName(e.target.value)}
                      placeholder="Contoh: Kecamatan Maju"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 focus:border-emerald-500 rounded-2xl text-sm text-white placeholder:text-slate-500 font-semibold transition-all focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Kabupaten</label>
                    <input
                      type="text"
                      value={regencyName}
                      onChange={(e) => setRegencyName(e.target.value)}
                      placeholder="Contoh: Kabupaten Jaya"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 focus:border-emerald-500 rounded-2xl text-sm text-white placeholder:text-slate-500 font-semibold transition-all focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: SHU */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-white font-bold text-lg flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                  Alokasi Pembagian SHU (%)
                </h2>
                <p className="text-slate-400 text-xs font-semibold mt-1">
                  Distribusi Sisa Hasil Usaha tahunan. Total harus tepat 100%.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  { label: "Jasa Pengurus & Pelaksana", desc: "Insentif operasional kerja", value: shuPengurus, setter: setShuPengurus },
                  { label: "Jasa Pengawas & Penasihat", desc: "Untuk Kades & Pengawas BUMDES", value: shuPengawas, setter: setShuPengawas },
                  { label: "Dana Sosial & Pendidikan", desc: "Pendidikan warga & kas sosial", value: shuSosial, setter: setShuSosial },
                  { label: "Penambahan Cadangan Modal", desc: "Diputar kembali menjadi modal", value: shuModal, setter: setShuModal },
                  { label: "Kas Desa (PADes)", desc: "Sumbangan untuk PAD Desa", value: shuDesa, setter: setShuDesa },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold text-white block">{item.label}</span>
                      <span className="text-[10px] text-slate-500 font-semibold">{item.desc}</span>
                    </div>
                    <div className="w-24 shrink-0 relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={item.value}
                        onChange={(e) => item.setter(e.target.value)}
                        className="w-full pr-8 pl-3 py-2.5 bg-white/5 border border-white/10 focus:border-emerald-500 rounded-xl text-sm text-right font-bold text-white transition-all focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                      />
                      <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-500 text-xs font-bold">%</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total indicator */}
              <div className={`p-4 border rounded-2xl flex items-center justify-between text-xs transition-all ${
                isShuBalanced
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : "bg-rose-500/10 border-rose-500/20 text-rose-400"
              }`}>
                <div className="flex items-center gap-2 font-bold">
                  {isShuBalanced ? (
                    <><CheckCircle className="w-4 h-4" /><span>Alokasi Seimbang</span></>
                  ) : (
                    <><AlertTriangle className="w-4 h-4" /><span>Alokasi Tidak Seimbang</span></>
                  )}
                </div>
                <span className="font-bold text-sm">Total: {totalShu}%</span>
              </div>
            </div>
          )}

          {/* Step 3: Opening Balances */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-white font-bold text-lg flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-emerald-400" />
                  Saldo Awal Neraca
                </h2>
                <p className="text-slate-400 text-xs font-semibold mt-1">
                  Opsional. Masukkan saldo awal jika BUMDES sudah berjalan. Kosongkan jika BUMDES baru.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3">Aktiva (Harta)</h3>
                  <div className="space-y-2.5">
                    {[
                      { key: "kas_bumdes", label: "Kas/Bank BUMDES", code: "1-1100" },
                      { key: "kas_gedung", label: "Kas Unit Gedung", code: "1-1200" },
                      { key: "kas_lapak", label: "Kas Unit Lapak/Warung", code: "1-1300" },
                      { key: "piutang_masyarakat", label: "Piutang Pinjaman Masyarakat", code: "1-1400" },
                      { key: "piutang_gapoktan", label: "Piutang Pinjaman Gapoktan", code: "1-1500" },
                      { key: "peralatan", label: "Peralatan & Inventaris", code: "1-2100" },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-semibold text-white block truncate">{item.label}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{item.code}</span>
                        </div>
                        <div className="relative w-40 shrink-0">
                          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500 text-xs font-bold">Rp</span>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={ob[item.key as keyof typeof ob]}
                            onChange={(e) => handleObChange(item.key, e.target.value.replace(/[^\d]/g, ""))}
                            placeholder="0"
                            className="w-full pl-10 pr-3 py-2 bg-white/5 border border-white/10 focus:border-emerald-500 rounded-xl text-sm text-right font-bold text-white transition-all focus:outline-none focus:ring-4 focus:ring-emerald-500/10 placeholder:text-slate-600"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-white/5 pt-4">
                  <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">Pasiva (Kewajiban & Modal)</h3>
                  <div className="space-y-2.5">
                    {[
                      { key: "akum_penyusutan", label: "Akum. Penyusutan Peralatan", code: "1-2200" },
                      { key: "simpanan_pokok", label: "Tabungan Simpanan Pokok", code: "2-1100" },
                      { key: "simpanan_wajib", label: "Tabungan Simpanan Wajib", code: "2-1200" },
                      { key: "hutang_shu", label: "Hutang SHU Belum Dibagi", code: "2-1300" },
                      { key: "modal_desa", label: "Modal Awal Desa", code: "3-1100" },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-semibold text-white block truncate">{item.label}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{item.code}</span>
                        </div>
                        <div className="relative w-40 shrink-0">
                          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500 text-xs font-bold">Rp</span>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={ob[item.key as keyof typeof ob]}
                            onChange={(e) => handleObChange(item.key, e.target.value.replace(/[^\d]/g, ""))}
                            placeholder="0"
                            className="w-full pl-10 pr-3 py-2 bg-white/5 border border-white/10 focus:border-emerald-500 rounded-xl text-sm text-right font-bold text-white transition-all focus:outline-none focus:ring-4 focus:ring-emerald-500/10 placeholder:text-slate-600"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-[10px] text-slate-400 font-semibold leading-relaxed">
                  💡 Jika BUMDES baru berdiri dan belum memiliki saldo awal, Anda dapat melewati langkah ini. Saldo awal juga bisa diinput nanti melalui menu Jurnal Umum di dashboard.
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center gap-3 pt-2">
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                disabled={saving}
                className="flex-1 py-3 px-4 bg-white/5 hover:bg-white/10 text-slate-300 font-bold border border-white/10 rounded-2xl text-xs transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
              >
                <ChevronLeft className="w-4 h-4" />
                Kembali
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex-[2] py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
              >
                Lanjutkan
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="flex-[2] py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold rounded-2xl text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4" />
                    Selesaikan Setup & Mulai
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-slate-500 font-semibold mt-6">
          Sistem Informasi Manajemen BUMDES — Konfigurasi Awal
        </p>
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

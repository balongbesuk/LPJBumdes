"use client"

import React, { useState, useEffect } from "react"
import {
  BookOpen,
  TrendingUp,
  Scale,
  DollarSign,
  Printer,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Lock,
  Unlock,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Plus,
  Trash2,
  FileText,
  AlertCircle,
  X
} from "lucide-react"
import { formatRupiah } from "@/lib/utils"
import { useSettings } from "@/context/SettingsContext"

interface ReportData {
  labaRugi: {
    revenues: { code: string; name: string; amount: number }[]
    expenses: { code: string; name: string; amount: number }[]
    totalRevenue: number
    totalExpense: number
    netProfit: number
  }
  neraca: {
    currentAssets: { name: string; amount: number }[]
    totalCurrentAssets: number
    fixedAssets: {
      peralatan: number
      akumulasiPenyusutan: number
      net: number
    }
    totalAssets: number
    liabilities: { name: string; amount: number }[]
    totalLiabilities: number
    equity: { name: string; amount: number }[]
    totalEquity: number
    totalLiabilitiesAndEquity: number
  }
  shuSettings: {
    pengurus: number
    pengawas: number
    sosial: number
    modal: number
    desa: number
  }
}

interface PeriodLock {
  id: string
  year: number
  month: number
  locked: boolean
  lockedBy: string
  createdAt: string
}

export default function KeuanganPage() {
  const settings = useSettings()
  const [activeTab, setActiveTab] = useState<"labarugi" | "neraca" | "aruskasmodal" | "bku" | "pajak" | "aset" | "shu" | "tutupbuku">("labarugi")
  const [report, setReport] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Period locking states
  const [locks, setLocks] = useState<PeriodLock[]>([])
  const [selectedYear, setSelectedYear] = useState<number>(2026)
  const [togglingLock, setTogglingLock] = useState<string | null>(null)

  // Cash Book (BKU) states
  const [cashBook, setCashBook] = useState<any[]>([])
  const [loadingBku, setLoadingBku] = useState(false)
  const [showAddBkuModal, setShowAddBkuModal] = useState(false)
  
  // BKU Form states
  const [bkuDesc, setBkuDesc] = useState("")
  const [bkuUnit, setBkuUnit] = useState<"SP" | "GEDUNG" | "LAHAN" | "PPOB" | "UMUM">("UMUM")
  const [bkuCashAccount, setBkuCashAccount] = useState("1-1100") // Kas/Bank BUMDES
  const [bkuExpenseAccount, setBkuExpenseAccount] = useState("5-1100") // Biaya Operasional Pengurus
  const [bkuAmount, setBkuAmount] = useState("")
  const [bkuDate, setBkuDate] = useState("")
  
  // Tax states
  const [taxes, setTaxes] = useState<any[]>([])
  const [loadingTaxes, setLoadingTaxes] = useState(false)
  const [showAddTaxModal, setShowAddTaxModal] = useState(false)
  
  // Tax Form states
  const [taxDesc, setTaxDesc] = useState("")
  const [taxType, setTaxType] = useState("PPh 21")
  const [taxAmount, setTaxAmount] = useState("")
  const [taxFlow, setTaxFlow] = useState<"POTONG" | "SETOR">("POTONG")
  const [taxDate, setTaxDate] = useState("")
  
  // Asset states
  const [assetsList, setAssetsList] = useState<any[]>([])
  const [loadingAssets, setLoadingAssets] = useState(false)
  const [showAddAssetModal, setShowAddAssetModal] = useState(false)
  
  // Asset Form states
  const [assetName, setAssetName] = useState("")
  const [assetCost, setAssetCost] = useState("")
  const [assetLife, setAssetLife] = useState("5")
  const [assetDate, setAssetDate] = useState("")
  
  // Form status
  const [formSubmitLoading, setFormSubmitLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)

  const fetchBku = async () => {
    setLoadingBku(true)
    try {
      const res = await fetch("/api/keuangan/cash-book")
      const result = await res.json()
      if (result.success) setCashBook(result.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingBku(false)
    }
  }

  const fetchTaxes = async () => {
    setLoadingTaxes(true)
    try {
      const res = await fetch("/api/keuangan/taxes")
      const result = await res.json()
      if (result.success) setTaxes(result.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingTaxes(false)
    }
  }

  const fetchAssets = async () => {
    setLoadingAssets(true)
    try {
      const res = await fetch("/api/keuangan/assets")
      const result = await res.json()
      if (result.success) setAssetsList(result.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingAssets(false)
    }
  }

  const handleCreateBku = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormSubmitLoading(true)
    setFormError(null)
    setFormSuccess(null)
    try {
      const amountVal = parseFloat(bkuAmount)
      const res = await fetch("/api/keuangan/cash-book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: bkuDate || undefined,
          description: bkuDesc,
          unitUsaha: bkuUnit,
          lines: [
            { accountCode: bkuExpenseAccount, type: "DEBIT", amount: amountVal },
            { accountCode: bkuCashAccount, type: "CREDIT", amount: amountVal }
          ]
        })
      })
      const result = await res.json()
      if (result.success) {
        setFormSuccess("Transaksi pengeluaran kas berhasil dibukukan!")
        setBkuDesc("")
        setBkuAmount("")
        fetchBku()
        fetchReports()
        setTimeout(() => {
          setShowAddBkuModal(false)
          setFormSuccess(null)
        }, 1500)
      } else {
        throw new Error(result.error)
      }
    } catch (err: any) {
      setFormError(err.message)
    } finally {
      setFormSubmitLoading(false)
    }
  }

  const handleCreateTax = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormSubmitLoading(true)
    setFormError(null)
    setFormSuccess(null)
    try {
      const res = await fetch("/api/keuangan/taxes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: taxDate || undefined,
          description: taxDesc,
          taxType,
          amount: parseFloat(taxAmount),
          flow: taxFlow
        })
      })
      const result = await res.json()
      if (result.success) {
        setFormSuccess(`Pajak berhasil dicatat sebagai ${taxFlow === "POTONG" ? "pemotongan" : "penyetoran"}!`)
        setTaxDesc("")
        setTaxAmount("")
        fetchTaxes()
        fetchReports()
        setTimeout(() => {
          setShowAddTaxModal(false)
          setFormSuccess(null)
        }, 1500)
      } else {
        throw new Error(result.error)
      }
    } catch (err: any) {
      setFormError(err.message)
    } finally {
      setFormSubmitLoading(false)
    }
  }

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormSubmitLoading(true)
    setFormError(null)
    setFormSuccess(null)
    try {
      const res = await fetch("/api/keuangan/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: assetDate || undefined,
          name: assetName,
          purchaseCost: parseFloat(assetCost),
          economicLife: parseInt(assetLife, 10)
        })
      })
      const result = await res.json()
      if (result.success) {
        setFormSuccess(`Inventaris ${result.data.code} berhasil dibeli dan dibukukan!`)
        setAssetName("")
        setAssetCost("")
        fetchAssets()
        fetchReports()
        setTimeout(() => {
          setShowAddAssetModal(false)
          setFormSuccess(null)
        }, 1500)
      } else {
        throw new Error(result.error)
      }
    } catch (err: any) {
      setFormError(err.message)
    } finally {
      setFormSubmitLoading(false)
    }
  }

  const handleRunDepreciation = async () => {
    const year = prompt("Masukkan tahun penyusutan (misal: 2026):", "2026")
    if (!year) return
    
    if (!confirm(`Apakah Anda yakin ingin menjalankan penyusutan otomatis akhir tahun ${year} untuk seluruh aset tetap aktif? Tindakan ini akan memposting biaya depresiasi ke Laporan Keuangan.`)) {
      return
    }

    try {
      const res = await fetch("/api/keuangan/assets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year: parseInt(year, 10) })
      })
      const result = await res.json()
      if (result.success) {
        alert(`Sukses! Berhasil menyusutkan ${result.data.count} aset dengan total beban depresiasi: Rp ${result.data.totalDeprecAmount.toLocaleString("id-ID")}`)
        fetchAssets()
        fetchReports()
      } else {
        alert(result.error || "Gagal memproses penyusutan.")
      }
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan koneksi")
    }
  }

  const fetchReports = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/keuangan/reports")
      const result = await res.json()
      if (result.success) {
        setReport(result.data)
      } else {
        throw new Error(result.error || "Gagal mengambil laporan keuangan")
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

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
    fetchReports()
    fetchLocks()
  }, [])

  useEffect(() => {
    if (activeTab === "bku") fetchBku()
    if (activeTab === "pajak") fetchTaxes()
    if (activeTab === "aset") fetchAssets()
  }, [activeTab])

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

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-xl w-64"></div>
        <div className="h-44 bg-slate-200 rounded-3xl"></div>
        <div className="h-96 bg-slate-200 rounded-3xl"></div>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-100 rounded-2xl text-rose-800 text-sm">
        <p className="font-bold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-500" />
          Gagal Memuat Laporan Keuangan
        </p>
        <p className="mt-1 text-xs">{error || "Koneksi ke database terputus."}</p>
        <button
          onClick={() => {
            fetchReports()
            fetchLocks()
          }}
          className="mt-4 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl"
        >
          Coba Lagi
        </button>
      </div>
    )
  }

  const handlePrint = () => {
    window.print()
  }

  // Double-entry balancing check
  const isNeracaBalanced = Math.abs(report.neraca.totalAssets - report.neraca.totalLiabilitiesAndEquity) < 0.1

  // Calculate dynamic SHU allocations
  const calculateShuAllocation = (percentage: number) => {
    const profit = Math.max(report.labaRugi.netProfit, 0)
    return profit * (percentage / 100)
  }

  return (
    <div className="space-y-6">
      {/* Printable CSS Override */}
      <style jsx global>{`
        @media print {
          aside, header, nav, button, .no-print, select {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
          }
          .print-container {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            background: transparent !important;
          }
          .print-title {
            display: block !important;
            text-align: center;
            margin-bottom: 2rem;
          }
        }
      `}</style>

      {/* Header (No print) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Pembukuan Keuangan & LPJ</h1>
          <p className="text-slate-400 text-xs font-semibold mt-1">
            Unduh laporan neraca formal SAK EMKM, laporan perhitungan laba/rugi per unit usaha, tutup buku bulanan, dan rincian alokasi SHU.
          </p>
        </div>
        {activeTab !== "tutupbuku" && (
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-2xl text-xs shadow-md shadow-emerald-600/10 transition-all active:scale-95 shrink-0 w-fit"
          >
            <Printer className="w-4 h-4" />
            Cetak Laporan / PDF
          </button>
        )}
      </div>

      {/* Document print header */}
      <div className="hidden print-title text-center space-y-1">
        <h1 className="text-xl font-bold uppercase text-slate-900">{settings?.bumdes_name || "BUMDES"}</h1>
        <p className="text-sm font-semibold text-slate-500">
          {settings?.village_name ? `Desa ${settings.village_name}, Kecamatan ${settings.district_name}, Kabupaten ${settings.regency_name}` : ""}
        </p>
        <div className="border-b-2 border-slate-900 my-4" />
        <h2 className="text-sm font-bold uppercase text-slate-800 mt-2">
          {activeTab === "labarugi" && "Laporan Perhitungan Sisa Hasil Usaha (Laba / Rugi)"}
          {activeTab === "neraca" && "Laporan Posisi Keuangan (Neraca)"}
          {activeTab === "shu" && "Daftar Rencana Pembagian Hasil Usaha (SHU)"}
        </h2>
        <p className="text-xs text-slate-400 font-semibold">Tahun Anggaran Berjalan (T.A 2026)</p>
      </div>

      {/* Tabs navigation (No print) */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100 rounded-3xl w-full md:w-fit no-print">
        <button
          onClick={() => setActiveTab("labarugi")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center ${
            activeTab === "labarugi" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
          Laba / Rugi
        </button>
        <button
          onClick={() => setActiveTab("neraca")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center ${
            activeTab === "neraca" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Scale className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
          Neraca SAK EMKM
        </button>
        <button
          onClick={() => setActiveTab("aruskasmodal")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center ${
            activeTab === "aruskasmodal" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <FileText className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
          Arus Kas & Modal
        </button>
        <button
          onClick={() => setActiveTab("bku")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center ${
            activeTab === "bku" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 mr-1.5 text-teal-600" />
          Buku Kas Umum
        </button>
        <button
          onClick={() => setActiveTab("pajak")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center ${
            activeTab === "pajak" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Scale className="w-3.5 h-3.5 mr-1.5 text-rose-600" />
          Buku Pajak
        </button>
        <button
          onClick={() => setActiveTab("aset")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center ${
            activeTab === "aset" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Calendar className="w-3.5 h-3.5 mr-1.5 text-blue-800" />
          Aset & Inventaris
        </button>
        <button
          onClick={() => setActiveTab("shu")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center ${
            activeTab === "shu" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <DollarSign className="w-3.5 h-3.5 mr-1.5 text-purple-655" />
          Pembagian SHU
        </button>
        <button
          onClick={() => setActiveTab("tutupbuku")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center ${
            activeTab === "tutupbuku" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Lock className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
          Tutup Buku
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "labarugi" && (
        <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-3xl shadow-sm print-container space-y-6">
          {/* Revenues Table */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-800 text-sm tracking-tight border-b border-slate-100 pb-2">
              I. PENDAPATAN HASIL USAHA
            </h3>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-slate-400 font-bold border-b border-slate-50">
                  <th className="py-2 w-24">Kode Akun</th>
                  <th className="py-2">Uraian Akun</th>
                  <th className="py-2 text-right">Realisasi (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-semibold text-slate-700">
                {report.labaRugi.revenues.map((rev) => (
                  <tr key={rev.code}>
                    <td className="py-3 text-slate-500 font-bold">{rev.code}</td>
                    <td className="py-3">{rev.name}</td>
                    <td className="py-3 text-right">{formatRupiah(rev.amount)}</td>
                  </tr>
                ))}
                <tr className="bg-slate-50/50 font-bold border-t border-slate-100 text-slate-900">
                  <td className="py-3"></td>
                  <td className="py-3 text-slate-800">TOTAL PENDAPATAN HASIL USAHA</td>
                  <td className="py-3 text-right text-emerald-800">
                    {formatRupiah(report.labaRugi.totalRevenue)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Expenses Table */}
          <div className="space-y-3 pt-4">
            <h3 className="font-bold text-slate-800 text-sm tracking-tight border-b border-slate-100 pb-2">
              II. BEBAN OPERASIONAL & UNIT
            </h3>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-slate-400 font-bold border-b border-slate-50">
                  <th className="py-2 w-24">Kode Akun</th>
                  <th className="py-2">Uraian Akun</th>
                  <th className="py-2 text-right">Realisasi (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-semibold text-slate-700">
                {report.labaRugi.expenses.map((exp) => (
                  <tr key={exp.code}>
                    <td className="py-3 text-slate-500 font-bold">{exp.code}</td>
                    <td className="py-3">{exp.name}</td>
                    <td className="py-3 text-right">{formatRupiah(exp.amount)}</td>
                  </tr>
                ))}
                <tr className="bg-slate-50/50 font-bold border-t border-slate-100 text-slate-900">
                  <td className="py-3"></td>
                  <td className="py-3 text-slate-800">TOTAL BEBAN OPERASIONAL & BIAYA</td>
                  <td className="py-3 text-right text-rose-800">
                    {formatRupiah(report.labaRugi.totalExpense)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Net profit summary Card */}
          <div className="bg-emerald-50/50 border border-emerald-100 p-6 rounded-2xl flex items-center justify-between mt-6">
            <div>
              <h4 className="text-emerald-800 font-bold text-sm leading-none">SISA HASIL USAHA (LABA BERSIH)</h4>
              <p className="text-[10px] text-emerald-600 font-semibold mt-1">Laba bersih operasional berjalan sebelum pembagian</p>
            </div>
            <div className="text-emerald-800 font-bold text-lg">
              {formatRupiah(report.labaRugi.netProfit)}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Neraca SAK EMKM */}
      {activeTab === "neraca" && (
        <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-3xl shadow-sm print-container space-y-6">
          {/* Balancing Alert (No Print) */}
          <div className="no-print flex items-center justify-between p-3 border rounded-xl bg-slate-50 text-xs">
            <div className="flex items-center gap-2 font-semibold">
              {isNeracaBalanced ? (
                <>
                  <CheckCircle className="w-4.5 h-4.5 text-emerald-500" />
                  <span className="text-emerald-800">Neraca Seimbang (Balanced)</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4.5 h-4.5 text-rose-500" />
                  <span className="text-rose-800">Neraca Tidak Seimbang!</span>
                </>
              )}
            </div>
            <div className="text-slate-400 text-[10px] font-bold">
              Total Aset: {formatRupiah(report.neraca.totalAssets)}
            </div>
          </div>

          {/* Neraca Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            {/* Left side: Assets */}
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 text-sm tracking-tight border-b border-slate-100 pb-2">
                AKTIVA (ASET)
              </h3>

              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">A. ASET LANCAR</span>
                <table className="w-full text-xs font-semibold text-slate-700">
                  <tbody>
                    {report.neraca.currentAssets.map((asset, index) => (
                      <tr key={index} className="border-b border-slate-50/50">
                        <td className="py-2.5">{asset.name}</td>
                        <td className="py-2.5 text-right font-medium text-slate-600">{formatRupiah(asset.amount)}</td>
                      </tr>
                    ))}
                    <tr className="font-bold text-slate-800 bg-slate-50/30">
                      <td className="py-2.5">Total Aset Lancar</td>
                      <td className="py-2.5 text-right">{formatRupiah(report.neraca.totalCurrentAssets)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">B. ASET TETAP</span>
                <table className="w-full text-xs font-semibold text-slate-700">
                  <tbody>
                    <tr className="border-b border-slate-50/50">
                      <td className="py-2.5">Peralatan & Inventaris</td>
                      <td className="py-2.5 text-right font-medium text-slate-600">{formatRupiah(report.neraca.fixedAssets.peralatan)}</td>
                    </tr>
                    <tr className="border-b border-slate-50/50 text-slate-400 italic">
                      <td className="py-2.5">Akumulasi Penyusutan Aset Tetap</td>
                      <td className="py-2.5 text-right font-medium">({formatRupiah(report.neraca.fixedAssets.akumulasiPenyusutan)})</td>
                    </tr>
                    <tr className="font-bold text-slate-800 bg-slate-50/30">
                      <td className="py-2.5">Total Aset Tetap (Net)</td>
                      <td className="py-2.5 text-right">{formatRupiah(report.neraca.fixedAssets.net)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="border-t border-slate-200/60 pt-4 flex justify-between font-bold text-slate-900 bg-emerald-50/30 p-3 rounded-xl">
                <span>TOTAL AKTIVA (ASET)</span>
                <span>{formatRupiah(report.neraca.totalAssets)}</span>
              </div>
            </div>

            {/* Right side: Liabilities and Equity */}
            <div className="space-y-4 md:pl-8 pt-6 md:pt-0">
              <h3 className="font-bold text-slate-800 text-sm tracking-tight border-b border-slate-100 pb-2">
                PASIVA (LIABILITAS & EKUITAS)
              </h3>

              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">A. LIABILITAS (KEWAJIBAN)</span>
                <table className="w-full text-xs font-semibold text-slate-700">
                  <tbody>
                    {report.neraca.liabilities.map((liab, index) => (
                      <tr key={index} className="border-b border-slate-50/50">
                        <td className="py-2.5">{liab.name}</td>
                        <td className="py-2.5 text-right font-medium text-slate-600">{formatRupiah(liab.amount)}</td>
                      </tr>
                    ))}
                    <tr className="font-bold text-slate-800 bg-slate-50/30">
                      <td className="py-2.5">Total Liabilitas</td>
                      <td className="py-2.5 text-right">{formatRupiah(report.neraca.totalLiabilities)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">B. EKUITAS (MODAL)</span>
                <table className="w-full text-xs font-semibold text-slate-700">
                  <tbody>
                    {report.neraca.equity.map((eq, index) => (
                      <tr key={index} className="border-b border-slate-50/50">
                        <td className="py-2.5">{eq.name}</td>
                        <td className="py-2.5 text-right font-medium text-slate-600">{formatRupiah(eq.amount)}</td>
                      </tr>
                    ))}
                    <tr className="font-bold text-slate-800 bg-slate-50/30">
                      <td className="py-2.5">Total Ekuitas</td>
                      <td className="py-2.5 text-right">{formatRupiah(report.neraca.totalEquity)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="border-t border-slate-200/60 pt-4 flex justify-between font-bold text-slate-900 bg-emerald-50/30 p-3 rounded-xl">
                <span>TOTAL PASIVA (LIABILITAS & MODAL)</span>
                <span>{formatRupiah(report.neraca.totalLiabilitiesAndEquity)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: SHU Distribution */}
      {activeTab === "shu" && (
        <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-3xl shadow-sm print-container space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm tracking-tight">Rencana Pembagian Sisa Hasil Usaha</h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                Alokasi pembagian laba bersih berjalan sesuai ketetapan AD/ART BUMDES.
              </p>
            </div>
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-between w-64">
              <span className="text-[10px] font-bold text-emerald-800">Laba Bersih Berjalan:</span>
              <span className="font-bold text-emerald-700 text-sm">{formatRupiah(report.labaRugi.netProfit)}</span>
            </div>
          </div>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="text-slate-400 font-bold border-b border-slate-50">
                <th className="py-2">Rencana Distribusi Alokasi SHU</th>
                <th className="py-2 text-center">Persentase (%)</th>
                <th className="py-2 text-right">Nilai Alokasi (Rp)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-semibold text-slate-700">
              <tr className="hover:bg-slate-50/50">
                <td className="py-3.5">
                  <div className="text-slate-800">Bonus Pengurus / Pelaksana Operasional</div>
                  <span className="text-[9px] text-slate-400 mt-1 block">Insentif kinerja jajaran pengurus</span>
                </td>
                <td className="py-3.5 text-center font-bold text-slate-800">{report.shuSettings.pengurus}%</td>
                <td className="py-3.5 text-right font-bold text-slate-700">
                  {formatRupiah(calculateShuAllocation(report.shuSettings.pengurus))}
                </td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="py-3.5">
                  <div className="text-slate-800">Bonus Pengawas & Penasihat</div>
                  <span className="text-[9px] text-slate-400 mt-1 block">Insentif penasihat (Kades) dan badan pengawas</span>
                </td>
                <td className="py-3.5 text-center font-bold text-slate-800">{report.shuSettings.pengawas}%</td>
                <td className="py-3.5 text-right font-bold text-slate-700">
                  {formatRupiah(calculateShuAllocation(report.shuSettings.pengawas))}
                </td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="py-3.5">
                  <div className="text-slate-800">Dana Sosial, Pendidikan & Pelatihan</div>
                  <span className="text-[9px] text-slate-400 mt-1 block">Alokasi kegiatan kemasyarakatan dan pelatihan warga</span>
                </td>
                <td className="py-3.5 text-center font-bold text-slate-800">{report.shuSettings.sosial}%</td>
                <td className="py-3.5 text-right font-bold text-slate-700">
                  {formatRupiah(calculateShuAllocation(report.shuSettings.sosial))}
                </td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="py-3.5">
                  <div className="text-slate-800">Penambahan Cadangan Modal BUMDES</div>
                  <span className="text-[9px] text-slate-400 mt-1 block">Diputar kembali ke modal usaha BUMDES</span>
                </td>
                <td className="py-3.5 text-center font-bold text-slate-800">{report.shuSettings.modal}%</td>
                <td className="py-3.5 text-right font-bold text-slate-700">
                  {formatRupiah(calculateShuAllocation(report.shuSettings.modal))}
                </td>
              </tr>
              <tr className="hover:bg-slate-50/50">
                <td className="py-3.5">
                  <div className="text-slate-800">Kas Desa (Pendapatan Asli Desa - PADes)</div>
                  <span className="text-[9px] text-slate-400 mt-1 block">Setoran kontribusi langsung ke kas pembangunan desa</span>
                </td>
                <td className="py-3.5 text-center font-bold text-slate-800">{report.shuSettings.desa}%</td>
                <td className="py-3.5 text-right font-bold text-emerald-800">
                  {formatRupiah(calculateShuAllocation(report.shuSettings.desa))}
                </td>
              </tr>
              <tr className="bg-slate-50 font-bold border-t border-slate-100 text-slate-900">
                <td className="py-3.5">TOTAL ALOKASI SHU TERBAGI</td>
                <td className="py-3.5 text-center">100%</td>
                <td className="py-3.5 text-right text-emerald-800">
                  {formatRupiah(
                    report.labaRugi.netProfit > 0 ? report.labaRugi.netProfit : 0
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Tutup Buku (Kunci Periode) */}
      {activeTab === "tutupbuku" && (
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
      )}

      {/* Tab: Arus Kas & Perubahan Modal */}
      {activeTab === "aruskasmodal" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Laporan Arus Kas */}
          <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-3xl shadow-sm print-container space-y-6">
            <h3 className="font-bold text-slate-800 text-sm tracking-tight border-b border-slate-100 pb-2">
              LAPORAN ARUS KAS (CASH FLOW)
            </h3>
            
            <div className="space-y-4 text-xs font-semibold text-slate-700">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">1. Arus Kas dari Aktivitas Operasional</span>
              <table className="w-full">
                <tbody>
                  <tr className="border-b border-slate-50/50">
                    <td className="py-2">Penerimaan dari Pendapatan Unit Usaha</td>
                    <td className="py-2 text-right text-emerald-700">{formatRupiah(report.labaRugi.totalRevenue)}</td>
                  </tr>
                  <tr className="border-b border-slate-50/50 text-slate-400 italic">
                    <td className="py-2">Pembayaran untuk Beban & Biaya Operasional</td>
                    <td className="py-2 text-right">({formatRupiah(report.labaRugi.totalExpense)})</td>
                  </tr>
                  <tr className="bg-slate-50 font-bold text-slate-800">
                    <td className="py-2">Arus Kas Bersih dari Operasional</td>
                    <td className="py-2 text-right">{formatRupiah(report.labaRugi.totalRevenue - report.labaRugi.totalExpense)}</td>
                  </tr>
                </tbody>
              </table>
              
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block pt-2">2. Arus Kas dari Aktivitas Investasi</span>
              <table className="w-full">
                <tbody>
                  <tr className="border-b border-slate-50/50 text-slate-400 italic">
                    <td className="py-2">Pembelian Peralatan & Inventaris Aset Tetap</td>
                    <td className="py-2 text-right">({formatRupiah(report.neraca.fixedAssets.peralatan)})</td>
                  </tr>
                  <tr className="bg-slate-50 font-bold text-slate-800">
                    <td className="py-2">Arus Kas Bersih dari Investasi</td>
                    <td className="py-2 text-right">({formatRupiah(report.neraca.fixedAssets.peralatan)})</td>
                  </tr>
                </tbody>
              </table>

              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block pt-2">3. Arus Kas dari Aktivitas Pendanaan</span>
              <table className="w-full">
                <tbody>
                  <tr className="border-b border-slate-50/50">
                    <td className="py-2">Penerimaan Tabungan Simpanan Pokok Anggota</td>
                    <td className="py-2 text-right text-emerald-700">
                      {formatRupiah(report.neraca.liabilities.find(l => l.name.includes("Pokok"))?.amount || 0)}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-50/50">
                    <td className="py-2">Penerimaan Tabungan Simpanan Wajib Anggota</td>
                    <td className="py-2 text-right text-emerald-700">
                      {formatRupiah(report.neraca.liabilities.find(l => l.name.includes("Wajib"))?.amount || 0)}
                    </td>
                  </tr>
                  <tr className="bg-slate-50 font-bold text-slate-800">
                    <td className="py-2">Arus Kas Bersih dari Pendanaan</td>
                    <td className="py-2 text-right">
                      {formatRupiah(
                        (report.neraca.liabilities.find(l => l.name.includes("Pokok"))?.amount || 0) +
                        (report.neraca.liabilities.find(l => l.name.includes("Wajib"))?.amount || 0)
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="border-t border-slate-250 pt-4 flex justify-between font-bold text-slate-900 bg-emerald-50/30 p-3 rounded-xl mt-6">
                <span>KENAIKAN / PENURUNAN BERSIH KAS</span>
                <span>
                  {formatRupiah(
                    (report.labaRugi.totalRevenue - report.labaRugi.totalExpense) -
                    report.neraca.fixedAssets.peralatan +
                    (report.neraca.liabilities.find(l => l.name.includes("Pokok"))?.amount || 0) +
                    (report.neraca.liabilities.find(l => l.name.includes("Wajib"))?.amount || 0)
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Laporan Perubahan Ekuitas */}
          <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-3xl shadow-sm print-container space-y-6">
            <h3 className="font-bold text-slate-800 text-sm tracking-tight border-b border-slate-100 pb-2">
              LAPORAN PERUBAHAN EKUITAS (MODAL)
            </h3>
            
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-slate-400 font-bold border-b border-slate-50">
                  <th className="py-2">Komponen Ekuitas</th>
                  <th className="py-2 text-right">Saldo Berjalan (Rp)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-semibold text-slate-700">
                <tr>
                  <td className="py-3">Modal Awal Penyertaan Desa</td>
                  <td className="py-3 text-right">{formatRupiah(report.neraca.equity.find(e => e.name.includes("Awal"))?.amount || 0)}</td>
                </tr>
                <tr>
                  <td className="py-3">Laba Ditahan / Penambahan Modal</td>
                  <td className="py-3 text-right">{formatRupiah(report.neraca.equity.find(e => e.name.includes("Ditahan"))?.amount || 0)}</td>
                </tr>
                <tr>
                  <td className="py-3 text-emerald-800 font-bold">Laba Bersih Tahun Berjalan</td>
                  <td className="py-3 text-right text-emerald-700">{formatRupiah(report.labaRugi.netProfit)}</td>
                </tr>
                <tr className="bg-slate-50 font-bold text-slate-900 border-t border-slate-150">
                  <td className="py-3">TOTAL EKUITAS AKHIR</td>
                  <td className="py-3 text-right text-emerald-800">{formatRupiah(report.neraca.totalEquity)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Buku Kas Umum */}
      {activeTab === "bku" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
            <div>
              <h3 className="font-bold text-slate-800 text-sm tracking-tight">Buku Kas Umum (Jurnal Harian)</h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Histori seluruh transaksi Debit & Kredit kas BUMDES secara kronologis.</p>
            </div>
            <button
              onClick={() => {
                setFormError(null)
                setFormSuccess(null)
                setBkuDesc("")
                setBkuAmount("")
                setShowAddBkuModal(true)
              }}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-2xl text-xs shadow-md shadow-emerald-600/10 active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Catat Pengeluaran
            </button>
          </div>

          <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden print-container">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tanggal</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Unit</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Keterangan</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kode Akun</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Debit (Rp)</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Kredit (Rp)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700">
                  {loadingBku ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-slate-400 font-medium">
                        Memuat data Buku Kas Umum...
                      </td>
                    </tr>
                  ) : cashBook.length > 0 ? (
                    cashBook.map((entry) => (
                      <React.Fragment key={entry.id}>
                        {entry.lines.map((line: any, idx: number) => (
                          <tr key={line.id} className="hover:bg-slate-50/30 border-b border-slate-50 text-xs">
                            {idx === 0 ? (
                              <>
                                <td className="px-6 py-4 font-semibold text-slate-655" rowSpan={entry.lines.length}>
                                  {new Date(entry.date).toLocaleDateString("id-ID", { dateStyle: "medium" })}
                                </td>
                                <td className="px-6 py-4 font-bold" rowSpan={entry.lines.length}>
                                  <span className="px-2.5 py-0.5 rounded-full text-[9px] bg-slate-100 border border-slate-200 text-slate-700">
                                    {entry.unitUsaha}
                                  </span>
                                </td>
                                <td className="px-6 py-4 font-medium text-slate-800" rowSpan={entry.lines.length}>
                                  {entry.description}
                                </td>
                              </>
                            ) : null}
                            <td className="px-6 py-3 font-mono text-slate-550 font-bold">{line.accountCode}</td>
                            <td className="px-6 py-3 text-right font-semibold text-slate-700">
                              {line.type === "DEBIT" ? formatRupiah(line.amount) : "-"}
                            </td>
                            <td className="px-6 py-3 text-right font-semibold text-slate-700">
                              {line.type === "CREDIT" ? formatRupiah(line.amount) : "-"}
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-slate-400 font-medium">
                        Tidak ada data jurnal transaksi ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Buku Pembantu Pajak */}
      {activeTab === "pajak" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
            <div>
              <h3 className="font-bold text-slate-800 text-sm tracking-tight">Buku Pembantu Pajak</h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Catatan pemotongan dan penyetoran pajak wajib BUMDES.</p>
            </div>
            <button
              onClick={() => {
                setFormError(null)
                setFormSuccess(null)
                setTaxDesc("")
                setTaxAmount("")
                setShowAddTaxModal(true)
              }}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-2xl text-xs shadow-md shadow-emerald-600/10 active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Catat Transaksi Pajak
            </button>
          </div>

          <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden print-container">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tanggal</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jenis Pajak</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Keterangan</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Status</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Dipotong (Debit)</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Disetor (Kredit)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700 text-xs font-semibold">
                  {loadingTaxes ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-slate-400 font-medium">
                        Memuat data mutasi pajak...
                      </td>
                    </tr>
                  ) : taxes.length > 0 ? (
                    taxes.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-55 transition-all">
                        <td className="px-6 py-4 text-slate-500 font-bold">
                          {new Date(t.date).toLocaleDateString("id-ID", { dateStyle: "medium" })}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-800">{t.taxType}</td>
                        <td className="px-6 py-4 text-slate-700 font-medium">{t.description}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] border font-bold ${
                            t.flow === "POTONG"
                              ? "bg-amber-50 border-amber-200 text-amber-800"
                              : "bg-emerald-55 border-emerald-100 text-emerald-800"
                          }`}>
                            {t.flow === "POTONG" ? "Dipotong" : "Disetor"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-amber-700">
                          {t.flow === "POTONG" ? formatRupiah(t.amount) : "-"}
                        </td>
                        <td className="px-6 py-4 text-right text-emerald-700">
                          {t.flow === "SETOR" ? formatRupiah(t.amount) : "-"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-slate-400 font-medium">
                        Tidak ada data pencatatan pajak.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Aset & Inventaris */}
      {activeTab === "aset" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
            <div>
              <h3 className="font-bold text-slate-800 text-sm tracking-tight">Inventaris & Aset Tetap</h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Kelola aset tetap kantor BUMDES dan depresiasi otomatis.</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleRunDepreciation}
                className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 font-bold px-4 py-2.5 rounded-2xl text-xs shadow-md active:scale-95 transition-all"
              >
                <Scale className="w-3.5 h-3.5" />
                Penyusutan Akhir Tahun
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormError(null)
                  setFormSuccess(null)
                  setAssetName("")
                  setAssetCost("")
                  setShowAddAssetModal(true)
                }}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-2xl text-xs shadow-md shadow-emerald-600/10 active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Beli Aset Baru
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden print-container">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kode</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nama Aset</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tanggal Beli</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Harga Perolehan</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Umur / Tarif</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Akum. Depresiasi</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Nilai Buku (Net)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700 text-xs font-semibold">
                  {loadingAssets ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-10 text-center text-slate-400 font-medium">
                        Memuat data inventaris...
                      </td>
                    </tr>
                  ) : assetsList.length > 0 ? (
                    assetsList.map((asset) => (
                      <tr key={asset.id} className="hover:bg-slate-50/50 transition-all">
                        <td className="px-6 py-4 text-slate-800 font-bold">{asset.code}</td>
                        <td className="px-6 py-4 font-bold text-slate-900">{asset.name}</td>
                        <td className="px-6 py-4 text-slate-500 font-bold">
                          {new Date(asset.purchaseDate).toLocaleDateString("id-ID", { dateStyle: "medium" })}
                        </td>
                        <td className="px-6 py-4 text-right text-slate-700 font-bold">
                          {formatRupiah(asset.purchaseCost)}
                        </td>
                        <td className="px-6 py-4 text-center text-slate-500 font-medium">
                          {asset.economicLife} Thn / {asset.depreciationRate}%
                        </td>
                        <td className="px-6 py-4 text-right text-rose-700">
                          {formatRupiah(asset.accumDep)}
                        </td>
                        <td className="px-6 py-4 text-right text-emerald-800 font-bold">
                          {formatRupiah(Math.max(asset.purchaseCost - asset.accumDep, 0))}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-10 text-center text-slate-400 font-medium">
                        Tidak ada data barang inventaris aset tetap.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --------------------- MODALS EXPANSION FASE 2 --------------------- */}

      {/* A. Modal BKU: Catat Pengeluaran Baru */}
      {showAddBkuModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-md shadow-2xl p-6 relative">
            <button
              type="button"
              onClick={() => setShowAddBkuModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-emerald-600" />
              Catat Transaksi Pengeluaran Kas
            </h3>

            {formError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{formError}</span>
              </div>
            )}
            {formSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateBku} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase block">Tanggal Transaksi</label>
                <input
                  type="date"
                  value={bkuDate}
                  onChange={(e) => setBkuDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-850 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase block">Keperluan / Keterangan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pembelian kertas dan ATK sekretariat"
                  value={bkuDesc}
                  onChange={(e) => setBkuDesc(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white focus:outline-none rounded-xl text-xs text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase block">Unit Pembebanan</label>
                  <select
                    value={bkuUnit}
                    onChange={(e) => setBkuUnit(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none cursor-pointer"
                  >
                    <option value="UMUM">BUMDES Umum</option>
                    <option value="SP">Unit Simpan Pinjam</option>
                    <option value="GEDUNG">Unit Gedung GSG</option>
                    <option value="LAHAN">Unit Sewa Lahan</option>
                    <option value="PPOB">Unit PPOB</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase block">Nominal Rupiah</label>
                  <input
                    type="number"
                    required
                    placeholder="Contoh: 150000"
                    value={bkuAmount}
                    onChange={(e) => setBkuAmount(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white focus:outline-none rounded-xl text-xs text-slate-800 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Kredit Akun Kas</label>
                  <select
                    value={bkuCashAccount}
                    onChange={(e) => setBkuCashAccount(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 focus:outline-none cursor-pointer"
                  >
                    <option value="1-1100">1-1100 Kas/Bank BUMDES</option>
                    <option value="1-1200">1-1200 Kas Unit Gedung</option>
                    <option value="1-1300">1-1300 Kas Unit Lahan</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Debit Akun Beban</label>
                  <select
                    value={bkuExpenseAccount}
                    onChange={(e) => setBkuExpenseAccount(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 focus:outline-none cursor-pointer"
                  >
                    <option value="5-1100">5-1100 Beban Pengurus</option>
                    <option value="5-1200">5-1200 Beban Unit Lahan</option>
                    <option value="5-1300">5-1300 Beban Unit Gedung</option>
                    <option value="5-1500">5-1500 Beban Bank & Pajak</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={formSubmitLoading}
                className="w-full mt-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all active:scale-95"
              >
                {formSubmitLoading ? "Memproses..." : "Bukukan Pengeluaran"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* B. Modal Pajak: Catat Pajak Baru */}
      {showAddTaxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-md shadow-2xl p-6 relative">
            <button
              type="button"
              onClick={() => setShowAddTaxModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-4">
              <Scale className="w-5 h-5 text-rose-600" />
              Catat Transaksi Pajak Baru
            </h3>

            {formError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{formError}</span>
              </div>
            )}
            {formSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateTax} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase block">Tanggal Pajak</label>
                <input
                  type="date"
                  value={taxDate}
                  onChange={(e) => setTaxDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-850 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase block">Deskripsi Transaksi Pajak</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pemotongan PPh 21 dari Gaji Ketua BUMDES"
                  value={taxDesc}
                  onChange={(e) => setTaxDesc(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white focus:outline-none rounded-xl text-xs text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase block">Tipe Pajak</label>
                  <select
                    value={taxType}
                    onChange={(e) => setTaxType(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none cursor-pointer"
                  >
                    <option value="PPh 21">PPh Pasal 21</option>
                    <option value="PPh 23">PPh Pasal 23</option>
                    <option value="PPh 25">PPh Pasal 25</option>
                    <option value="PPN">PPN (Sewa/Penjualan)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase block">Status Aliran</label>
                  <select
                    value={taxFlow}
                    onChange={(e) => setTaxFlow(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none cursor-pointer"
                  >
                    <option value="POTONG">DIPOTONG (Uang Masuk Kas Pajak)</option>
                    <option value="SETOR">DISETOR (Dibayar ke Negara)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase block">Nominal Pajak</label>
                <input
                  type="number"
                  required
                  placeholder="Contoh: 50000"
                  value={taxAmount}
                  onChange={(e) => setTaxAmount(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white focus:outline-none rounded-xl text-xs text-slate-800 font-bold"
                />
              </div>

              <button
                type="submit"
                disabled={formSubmitLoading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all active:scale-95"
              >
                {formSubmitLoading ? "Memproses..." : "Simpan Mutasi Pajak"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* C. Modal Asset: Beli Aset Baru */}
      {showAddAssetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-md shadow-2xl p-6 relative">
            <button
              type="button"
              onClick={() => setShowAddAssetModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-emerald-600" />
              Beli & Catat Aset Tetap Baru
            </h3>

            {formError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{formError}</span>
              </div>
            )}
            {formSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateAsset} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase block">Tanggal Pembelian</label>
                <input
                  type="date"
                  value={assetDate}
                  onChange={(e) => setAssetDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-850 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase block">Nama Barang Inventaris</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: AC GSG 2 PK / Laptop Admin"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white focus:outline-none rounded-xl text-xs text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase block">Harga Perolehan (Rp)</label>
                  <input
                    type="number"
                    required
                    placeholder="Contoh: 4500000"
                    value={assetCost}
                    onChange={(e) => setAssetCost(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white focus:outline-none rounded-xl text-xs text-slate-800 font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase block">Umur Ekonomis (Tahun)</label>
                  <select
                    value={assetLife}
                    onChange={(e) => setAssetLife(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none cursor-pointer"
                  >
                    <option value="3">3 Tahun (Depresiasi 33.3%)</option>
                    <option value="4">4 Tahun (Depresiasi 25%)</option>
                    <option value="5">5 Tahun (Depresiasi 20%)</option>
                    <option value="8">8 Tahun (Depresiasi 12.5%)</option>
                    <option value="10">10 Tahun (Depresiasi 10%)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={formSubmitLoading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all active:scale-95"
              >
                {formSubmitLoading ? "Memproses..." : "Catat & Beli Aset"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tutup Buku Bulanan */}
    </div>
  )
}

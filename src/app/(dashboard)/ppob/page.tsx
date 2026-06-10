"use client"

import React, { useState, useEffect } from "react"
import {
  CreditCard,
  Plus,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertCircle,
  X,
  CalendarDays,
  Printer
} from "lucide-react"
import { formatRupiah } from "@/lib/utils"
import { useSettings } from "@/context/SettingsContext"

interface PpobRecord {
  id: string
  date: string
  totalRevenue: number
  totalCommission: number
  description: string | null
}

export default function PpobPage() {
  const settings = useSettings()
  const [rekaps, setRekaps] = useState<PpobRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal State
  const [activeModal, setActiveModal] = useState<boolean>(false)

  const [printType, setPrintType] = useState<"ppob" | null>(null)

  const handlePrint = () => {
    setPrintType("ppob")
    setTimeout(() => {
      window.print()
    }, 150)
  }

  // Form States
  const [totalRevenue, setTotalRevenue] = useState("")
  const [totalCommission, setTotalCommission] = useState("")
  const [description, setDescription] = useState("")
  const [dateStr, setDateStr] = useState("")

  const [formSubmitLoading, setFormSubmitLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)

  const fetchRekaps = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/ppob")
      const result = await res.json()
      if (result.success) {
        setRekaps(result.data)
      } else {
        throw new Error(result.error || "Gagal mengambil data PPOB")
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRekaps()
  }, [])

  const handleCreateRekap = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormSubmitLoading(true)
    setFormError(null)
    setFormSuccess(null)

    try {
      const res = await fetch("/api/ppob", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          totalRevenue: parseFloat(totalRevenue),
          totalCommission: parseFloat(totalCommission),
          description,
          date: dateStr || undefined
        })
      })

      const result = await res.json()

      if (result.success) {
        setFormSuccess("Rekap komisi bulanan PPOB berhasil dicatat!")
        setTotalRevenue("")
        setTotalCommission("")
        setDescription("")
        setDateStr("")
        fetchRekaps()
        setTimeout(() => {
          setActiveModal(false)
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

  // Pre-filled total commission from database
  const totalCommissionAllTime = rekaps.reduce((sum, r) => sum + r.totalCommission, 0)

  return (
    <div className="space-y-6">
      {/* style tag */}
      <style jsx global>{`
        @media print {
          aside, header, nav, .no-print, button, select, input, .no-print-element {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
          }
          .print-area {
            display: block !important;
            width: 100% !important;
            background: white !important;
            color: black !important;
          }
        }
      `}</style>

      {printType && (
        <div className="fixed top-0 inset-x-0 bg-slate-900/90 text-white py-3 px-6 z-[100] flex items-center justify-between no-print backdrop-blur-sm">
          <span className="font-semibold text-xs flex items-center gap-2">
            <Printer className="w-4 h-4 text-emerald-400" />
            Pratinjau Cetak: Laporan Rekapitulasi Komisi PPOB
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition active:scale-95 shadow-md shadow-emerald-600/10 flex items-center gap-1"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak Dokumen
            </button>
            <button
              onClick={() => setPrintType(null)}
              className="bg-slate-700 hover:bg-slate-655 text-white font-bold px-4 py-2 rounded-xl text-xs transition active:scale-95"
            >
              Tutup Pratinjau
            </button>
          </div>
        </div>
      )}

      {!printType ? (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Rekap Komisi PPOB</h1>
              <p className="text-slate-400 text-xs font-semibold mt-1">
                Catat ringkasan laba bulanan PPOB (aplikasi bawaan pembayaran listrik, air, pulsa, dll.) agar terhitung di pembukuan pusat.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold px-4 py-2.5 rounded-2xl text-xs shadow-sm transition-all active:scale-95 shrink-0 w-fit"
              >
                <Printer className="w-4 h-4 text-emerald-600" />
                Cetak Laporan
              </button>
              <button
                onClick={() => {
                  setTotalRevenue("")
                  setTotalCommission("")
                  setDescription("")
                  setDateStr("")
                  setFormError(null)
                  setFormSuccess(null)
                  setActiveModal(true)
                }}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-2xl text-xs shadow-md shadow-emerald-600/10 transition-all active:scale-95 shrink-0 w-fit"
              >
                <Plus className="w-4 h-4" />
                Rekap Baru
              </button>
            </div>
          </div>

      {/* Metrics Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Total Pendapatan Bersih PPOB</span>
          <div className="mt-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 tracking-tight leading-none">
              {formatRupiah(totalCommissionAllTime)}
            </h2>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <span className="text-[10px] text-slate-400 font-semibold mt-2 block">
            Akumulasi pendapatan komisi yang dibukukan
          </span>
        </div>
      </div>

      {/* Table list */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tanggal</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Keterangan</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Total Volume Omset</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Laba Komisi BUMDES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-slate-700 text-xs font-medium">
              {rekaps.length > 0 ? (
                rekaps.map((rekap) => {
                  const date = new Date(rekap.date).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                  })
                  return (
                    <tr key={rekap.id} className="hover:bg-slate-50/50 transition-all">
                      <td className="px-6 py-4 text-slate-500 font-semibold">{date}</td>
                      <td className="px-6 py-4 text-slate-800 font-bold">{rekap.description || "Rekap PPOB"}</td>
                      <td className="px-6 py-4 text-right text-slate-600 font-semibold">
                        {formatRupiah(rekap.totalRevenue)}
                      </td>
                      <td className="px-6 py-4 text-right text-purple-700 font-bold">
                        {formatRupiah(rekap.totalCommission)}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-slate-400 font-medium">
                    Tidak ada riwayat rekap PPOB tahun berjalan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Rekap */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-md shadow-2xl p-6 relative">
            <button
              onClick={() => setActiveModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              Catat Rekap Bulanan PPOB
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

            <form onSubmit={handleCreateRekap} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Tanggal Rekap</label>
                <input
                  type="date"
                  value={dateStr}
                  onChange={(e) => setDateStr(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Volume Omset (Rp)</label>
                <input
                  type="number"
                  required
                  placeholder="Total nilai penjualan pulsa/tagihan"
                  value={totalRevenue}
                  onChange={(e) => setTotalRevenue(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:outline-none rounded-xl text-xs text-slate-800 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Laba Komisi Bersih BUMDES (Rp)</label>
                <input
                  type="number"
                  required
                  placeholder="Laba bersih komisi/fee yang masuk"
                  value={totalCommission}
                  onChange={(e) => setTotalCommission(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:outline-none rounded-xl text-xs text-slate-800 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Keterangan / Deskripsi</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Fee PPOB PLN, Air & Pulsa Bulan Juni"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:outline-none rounded-xl text-xs text-slate-800"
                />
              </div>

              <button
                type="submit"
                disabled={formSubmitLoading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all active:scale-95"
              >
                {formSubmitLoading ? "Memproses..." : "Simpan Rekap"}
              </button>
            </form>
          </div>
        </div>
      )}

        </div>
      ) : (
        <div className="print-area bg-white text-slate-800 p-8 min-h-screen font-serif text-[11px] leading-relaxed">
          {/* Kop Surat / Letterhead */}
          <div className="text-center space-y-1 border-b-2 border-slate-800 pb-4 mb-6">
            <h1 className="text-xl font-bold uppercase tracking-wide text-slate-900">{settings?.bumdes_name || "BUMDES"}</h1>
            <p className="text-xs font-semibold text-slate-500">
              {settings?.village_name ? `Desa ${settings.village_name}, Kecamatan ${settings.district_name}, Kabupaten ${settings.regency_name}` : ""}
            </p>
          </div>

          <div className="space-y-6">
            <div className="text-center space-y-1.5">
              <h2 className="text-sm font-bold uppercase text-slate-800">
                LAPORAN REKAPITULASI PENDAPATAN KOMISI UNIT PPOB
              </h2>
              <p className="text-[11px] font-semibold text-slate-500">
                Tanggal Cetak: {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>

            <table className="w-full border-collapse border border-slate-350 text-[11px]">
              <thead>
                <tr className="bg-slate-50 text-slate-700">
                  <th className="border border-slate-350 px-3 py-2 text-center w-8">No</th>
                  <th className="border border-slate-350 px-3 py-2 text-left">Tanggal</th>
                  <th className="border border-slate-350 px-3 py-2 text-left">Keterangan / Deskripsi</th>
                  <th className="border border-slate-350 px-3 py-2 text-right">Volume Omset</th>
                  <th className="border border-slate-350 px-3 py-2 text-right font-bold">Laba Komisi Bersih</th>
                </tr>
              </thead>
              <tbody>
                {rekaps.map((r, index) => {
                  const date = new Date(r.date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/50">
                      <td className="border border-slate-355 px-3 py-2 text-center">{index + 1}</td>
                      <td className="border border-slate-355 px-3 py-2 font-semibold text-slate-500">{date}</td>
                      <td className="border border-slate-355 px-3 py-2 font-bold text-slate-800">{r.description || "Rekap PPOB"}</td>
                      <td className="border border-slate-355 px-3 py-2 text-right">{formatRupiah(r.totalRevenue)}</td>
                      <td className="border border-slate-355 px-3 py-2 text-right font-bold text-purple-700">{formatRupiah(r.totalCommission)}</td>
                    </tr>
                  )
                })}
                <tr className="bg-slate-50 font-bold">
                  <td colSpan={3} className="border border-slate-350 px-3 py-2 text-right uppercase">Total Laba Komisi PPOB:</td>
                  <td className="border border-slate-350 px-3 py-2 text-right">
                    {formatRupiah(rekaps.reduce((sum, r) => sum + r.totalRevenue, 0))}
                  </td>
                  <td className="border border-slate-350 px-3 py-2 text-right text-purple-800">
                    {formatRupiah(totalCommissionAllTime)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Tanda Tangan Section */}
          <div className="mt-12 grid grid-cols-2 text-center text-[11px] font-medium leading-relaxed">
            <div>
              <p className="mb-16">Mengetahui,<br /><b>Ketua {settings?.bumdes_name || "BUMDES"}</b></p>
              <p className="underline font-bold">{settings?.village_name ? `Desa ${settings.village_name}` : ""}</p>
            </div>
            <div>
              <p className="mb-16">{settings?.village_name || "Desa"}, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}<br /><b>Operator Unit PPOB</b></p>
              <p className="underline font-bold">{settings?.bumdes_name || "BUMDES"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

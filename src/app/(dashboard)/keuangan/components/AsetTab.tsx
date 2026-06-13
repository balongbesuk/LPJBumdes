"use client"

import React, { useState, useEffect } from "react"
import { Calendar, Scale, Plus, X, AlertCircle, CheckCircle } from "lucide-react"
import { formatRupiah } from "@/lib/utils"

interface AsetTabProps {
  onRefreshReport: () => void
}

export default function AsetTab({ onRefreshReport }: AsetTabProps) {
  // Asset states
  const [assetsList, setAssetsList] = useState<any[]>([])
  const [loadingAssets, setLoadingAssets] = useState(false)
  const [showAddAssetModal, setShowAddAssetModal] = useState(false)
  
  // Asset Form states
  const [assetName, setAssetName] = useState("")
  const [assetCost, setAssetCost] = useState("")
  const [assetLife, setAssetLife] = useState("5")
  const [assetDate, setAssetDate] = useState("")

  const [formSubmitLoading, setFormSubmitLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)

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

  useEffect(() => {
    fetchAssets()
  }, [])

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
        onRefreshReport()
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

  // Depreciation Modal states
  const [showDepModal, setShowDepModal] = useState(false)
  const [depYear, setDepYear] = useState("2026")
  const [depStep, setDepStep] = useState<"input" | "confirm" | "success" | "error">("input")
  const [depResult, setDepResult] = useState<any>(null)
  const [depErrorMsg, setDepErrorMsg] = useState("")
  const [depLoading, setDepLoading] = useState(false)

  const handleRunDepreciationSubmit = async () => {
    setDepLoading(true)
    setDepErrorMsg("")
    try {
      const res = await fetch("/api/keuangan/assets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year: parseInt(depYear, 10) })
      })
      const result = await res.json()
      if (result.success) {
        setDepResult(result.data)
        setDepStep("success")
        fetchAssets()
        onRefreshReport()
      } else {
        throw new Error(result.error || "Gagal memproses penyusutan.")
      }
    } catch (err: any) {
      setDepErrorMsg(err.message || "Terjadi kesalahan")
      setDepStep("error")
    } finally {
      setDepLoading(false)
    }
  }

  const handleOpenDepModal = () => {
    setDepYear("2026")
    setDepStep("input")
    setDepErrorMsg("")
    setDepResult(null)
    setShowDepModal(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h3 className="font-bold text-slate-800 text-sm tracking-tight">Inventaris & Aset Tetap</h3>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Kelola aset tetap kantor BUMDES dan depresiasi otomatis.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleOpenDepModal}
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

      {/* Modal Asset: Beli Aset Baru */}
      {showAddAssetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-md shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
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

      {/* Custom Depreciation Modal */}
      {showDepModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-sm shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setShowDepModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            {depStep === "input" && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Scale className="w-5 h-5 text-blue-600" />
                  Penyusutan Aset Akhir Tahun
                </h3>
                <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                  Masukkan tahun pembukuan penyusutan untuk seluruh aset tetap aktif.
                </p>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Tahun Pembukuan</label>
                  <input
                    type="number"
                    value={depYear}
                    onChange={(e) => setDepYear(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white focus:outline-none rounded-xl text-xs font-bold text-slate-800"
                  />
                </div>
                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowDepModal(false)}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={() => setDepStep("confirm")}
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition shadow-md"
                  >
                    Lanjutkan
                  </button>
                </div>
              </div>
            )}

            {depStep === "confirm" && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  Konfirmasi Penyusutan
                </h3>
                <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                  Apakah Anda yakin ingin menjalankan penyusutan otomatis akhir tahun <strong className="text-slate-800">{depYear}</strong> untuk seluruh aset tetap aktif? 
                  <span className="block mt-2 text-slate-400 font-normal">Tindakan ini akan memposting biaya depresiasi ke Laporan Keuangan secara otomatis.</span>
                </p>
                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setDepStep("input")}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                  >
                    Kembali
                  </button>
                  <button
                    type="button"
                    disabled={depLoading}
                    onClick={handleRunDepreciationSubmit}
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition shadow-md flex items-center justify-center gap-1.5"
                  >
                    {depLoading ? "Memproses..." : "Ya, Susutkan"}
                  </button>
                </div>
              </div>
            )}

            {depStep === "success" && (
              <div className="space-y-4 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Penyusutan Sukses!</h3>
                <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                  Berhasil menyusutkan <strong className="text-slate-800">{depResult?.count}</strong> aset tetap aktif dengan total biaya depresiasi:
                  <span className="block text-emerald-600 font-black text-sm mt-1.5">{formatRupiah(depResult?.totalDeprecAmount)}</span>
                </p>
                <button
                  type="button"
                  onClick={() => setShowDepModal(false)}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition mt-2"
                >
                  Selesai
                </button>
              </div>
            )}

            {depStep === "error" && (
              <div className="space-y-4 text-center">
                <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                  <X className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Penyusutan Gagal</h3>
                <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                  {depErrorMsg || "Terjadi kesalahan saat memproses penyusutan aset."}
                </p>
                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowDepModal(false)}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                  >
                    Tutup
                  </button>
                  <button
                    type="button"
                    onClick={handleRunDepreciationSubmit}
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition shadow-md"
                  >
                    Coba Lagi
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

"use client"

import React, { useState, useEffect } from "react"
import { Scale, Plus, X, AlertCircle, CheckCircle } from "lucide-react"
import { formatRupiah } from "@/lib/utils"

interface PajakTabProps {
  onRefreshReport: () => void
}

export default function PajakTab({ onRefreshReport }: PajakTabProps) {
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

  const [formSubmitLoading, setFormSubmitLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)

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

  useEffect(() => {
    fetchTaxes()
  }, [])

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
        onRefreshReport()
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

  return (
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
                          ? "bg-amber-55 border-amber-200 text-amber-800"
                          : "bg-emerald-55 border-emerald-100 text-emerald-800"
                      }`}>
                        {t.flow === "POTONG" ? "Dipotong" : "Disetor"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-amber-700 font-bold">
                      {t.flow === "POTONG" ? formatRupiah(t.amount) : "-"}
                    </td>
                    <td className="px-6 py-4 text-right text-emerald-700 font-bold">
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

      {/* Modal Pajak: Catat Pajak Baru */}
      {showAddTaxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-md shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setShowAddTaxModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-55 hover:text-slate-600"
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
    </div>
  )
}

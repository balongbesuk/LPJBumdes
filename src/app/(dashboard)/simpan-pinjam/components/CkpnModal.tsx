"use client"

import React, { useState, useEffect } from "react"
import { X, Calculator, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { formatRupiah } from "@/lib/utils"

interface LoanDetail {
  id: string
  memberCode: string
  memberName: string
  type: string
  outstanding: number
  status: string
  rate: number
  targetAllowance: number
}

interface CkpnData {
  loans: LoanDetail[]
  totalTargetAllowance: number
  currentAllowance: number
  adjustmentNeeded: number
}

interface CkpnModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function CkpnModal({ isOpen, onClose, onSuccess }: CkpnModalProps) {
  const [data, setData] = useState<CkpnData | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [txDate, setTxDate] = useState<string>(new Date().toISOString().split("T")[0])

  const fetchCkpnDetails = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/simpan-pinjam/ckpn")
      const result = await res.json()
      if (result.success) {
        setData(result.data)
      } else {
        throw new Error(result.error || "Gagal mengambil data kalkulasi CKPN")
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchCkpnDetails()
      setSuccess(null)
      setError(null)
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch("/api/simpan-pinjam/ckpn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: txDate })
      })
      const result = await res.json()
      if (result.success) {
        setSuccess(result.message)
        await fetchCkpnDetails()
        onSuccess()
      } else {
        throw new Error(result.error || "Gagal memposting jurnal CKPN")
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-2xl shadow-2xl p-6 relative flex flex-col max-h-[85vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-4">
          <Calculator className="w-5 h-5 text-emerald-600" />
          Kalkulasi & Jurnal Penyesuaian CKPN (Cadangan Piutang)
        </h3>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-xs font-semibold flex items-center gap-2 shrink-0">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>{success}</span>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2 grow">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            <span className="text-xs text-slate-500 font-semibold">Mengkalkulasi outstanding piutang...</span>
          </div>
        ) : (
          <>
            {data && (
              <div className="space-y-4 overflow-y-auto pr-1 grow">
                {/* Metrics Summary Cards */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl">
                    <span className="text-[9px] font-bold text-slate-450 uppercase block">Saldo CKPN Berjalan</span>
                    <span className="text-sm font-bold text-slate-700 block mt-1">
                      {formatRupiah(data.currentAllowance)}
                    </span>
                  </div>
                  <div className="bg-emerald-50/40 border border-emerald-100 p-3.5 rounded-2xl">
                    <span className="text-[9px] font-bold text-emerald-800 uppercase block font-semibold">Kebutuhan Cadangan (Target)</span>
                    <span className="text-sm font-bold text-emerald-700 block mt-1">
                      {formatRupiah(data.totalTargetAllowance)}
                    </span>
                  </div>
                  <div className={`border p-3.5 rounded-2xl ${
                    data.adjustmentNeeded > 0
                      ? "bg-amber-50/50 border-amber-100 text-amber-800"
                      : data.adjustmentNeeded < 0
                      ? "bg-sky-50/50 border-sky-100 text-sky-850"
                      : "bg-slate-50 border-slate-100 text-slate-600"
                  }`}>
                    <span className="text-[9px] font-bold uppercase block">Nilai Penyesuaian</span>
                    <span className="text-sm font-bold block mt-1">
                      {data.adjustmentNeeded > 0 ? "+" : ""}
                      {formatRupiah(data.adjustmentNeeded)}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-amber-55/10 border border-amber-100/60 rounded-xl text-[10px] font-semibold text-slate-600 leading-relaxed shrink-0">
                  <span className="font-bold text-slate-700">Ketentuan Cadangan:</span> Pinjaman Lancar disisihkan sebesar <span className="font-bold text-emerald-700">0.5%</span> dari sisa piutang pokok, sedangkan Pinjaman Terlambat/Macet disisihkan sebesar <span className="font-bold text-rose-700">50%</span>.
                </div>

                {/* Loans table */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Daftar Piutang Aktif yang Dinilai</span>
                  <div className="border border-slate-100 rounded-xl overflow-hidden text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-400 font-bold border-b border-slate-100 text-[10px]">
                          <th className="p-2.5">Anggota</th>
                          <th className="p-2.5">Status</th>
                          <th className="p-2.5 text-right">Sisa Pokok</th>
                          <th className="p-2.5 text-center">Tarif (%)</th>
                          <th className="p-2.5 text-right">Cadangan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 font-semibold text-slate-700">
                        {data.loans.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-6 text-center text-slate-450 italic">
                              Tidak ada piutang aktif simpan pinjam berjalan.
                            </td>
                          </tr>
                        ) : (
                          data.loans.map(loan => (
                            <tr key={loan.id} className="hover:bg-slate-50/40">
                              <td className="p-2.5">
                                <div className="text-slate-800">{loan.memberName}</div>
                                <span className="text-[9px] text-slate-400">{loan.memberCode}</span>
                              </td>
                              <td className="p-2.5">
                                <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                                  loan.status === "LATE" ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"
                                }`}>
                                  {loan.status === "LATE" ? "Macet" : "Lancar"}
                                </span>
                              </td>
                              <td className="p-2.5 text-right text-slate-600">{formatRupiah(loan.outstanding)}</td>
                              <td className="p-2.5 text-center text-slate-650">{loan.rate}%</td>
                              <td className="p-2.5 text-right text-slate-800">{formatRupiah(loan.targetAllowance)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Form to submit adjustment */}
                {Math.abs(data.adjustmentNeeded) >= 0.01 && (
                  <form onSubmit={handleSubmit} className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4 shrink-0">
                    <div className="space-y-1 w-full sm:w-60">
                      <label className="text-[10px] font-bold text-slate-500 uppercase block">Tanggal Penjurnalan</label>
                      <input
                        type="date"
                        required
                        value={txDate}
                        onChange={(e) => setTxDate(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white focus:outline-none rounded-xl text-xs text-slate-800 font-semibold"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitLoading}
                      className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      {submitLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Memproses Jurnal...
                        </>
                      ) : (
                        `Posting Jurnal Penyesuaian (${data.adjustmentNeeded > 0 ? "Peningkatan" : "Pemulihan"})`
                      )}
                    </button>
                  </form>
                )}

                {Math.abs(data.adjustmentNeeded) < 0.01 && (
                  <div className="p-3 bg-emerald-50/40 text-emerald-800 border border-emerald-100 rounded-xl text-xs font-semibold text-center shrink-0">
                    Kondisi Cadangan Sesuai. Saldo berjalan saat ini sudah sama dengan kebutuhan cadangan piutang BUMDES.
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

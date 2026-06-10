"use client"

import React, { useState, useEffect } from "react"
import { BookOpen, Plus, X, AlertCircle, CheckCircle, ArrowDownCircle, ArrowUpCircle } from "lucide-react"
import { formatRupiah } from "@/lib/utils"

interface BkuTabProps {
  onRefreshReport: () => void
}

export default function BkuTab({ onRefreshReport }: BkuTabProps) {
  // Cash Book (BKU) states
  const [cashBook, setCashBook] = useState<any[]>([])
  const [loadingBku, setLoadingBku] = useState(false)
  const [showAddBkuModal, setShowAddBkuModal] = useState(false)
  const [modalMode, setModalMode] = useState<"EXPENSE" | "RECEIPT">("EXPENSE")
  
  // BKU Form states
  const [bkuDesc, setBkuDesc] = useState("")
  const [bkuUnit, setBkuUnit] = useState<"SP" | "GEDUNG" | "LAHAN" | "PPOB" | "UMUM">("UMUM")
  const [bkuCashAccount, setBkuCashAccount] = useState("1-1100") // Kas/Bank BUMDES
  const [bkuTargetAccount, setBkuTargetAccount] = useState("5-1100") // Biaya Operasional / Modal Awal
  const [bkuAmount, setBkuAmount] = useState("")
  const [bkuDate, setBkuDate] = useState("")

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

  useEffect(() => {
    fetchBku()
  }, [])

  const openAddModal = (mode: "EXPENSE" | "RECEIPT") => {
    setModalMode(mode)
    setFormError(null)
    setFormSuccess(null)
    setBkuDesc("")
    setBkuAmount("")
    setBkuUnit("UMUM")
    setBkuCashAccount("1-1100")
    setBkuTargetAccount(mode === "EXPENSE" ? "5-1100" : "3-1100")
    setShowAddBkuModal(true)
  }

  const handleCreateBku = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormSubmitLoading(true)
    setFormError(null)
    setFormSuccess(null)
    try {
      const amountVal = parseFloat(bkuAmount)
      
      // Determine Debit & Credit lines based on EXPENSE or RECEIPT
      let lines = []
      if (modalMode === "EXPENSE") {
        lines = [
          { accountCode: bkuTargetAccount, type: "DEBIT", amount: amountVal },
          { accountCode: bkuCashAccount, type: "CREDIT", amount: amountVal }
        ]
      } else {
        lines = [
          { accountCode: bkuCashAccount, type: "DEBIT", amount: amountVal },
          { accountCode: bkuTargetAccount, type: "CREDIT", amount: amountVal }
        ]
      }

      const res = await fetch("/api/keuangan/cash-book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: bkuDate || undefined,
          description: bkuDesc,
          unitUsaha: bkuUnit,
          lines
        })
      })
      const result = await res.json()
      if (result.success) {
        setFormSuccess(
          modalMode === "EXPENSE"
            ? "Transaksi pengeluaran kas berhasil dibukukan!"
            : "Transaksi penerimaan kas / modal berhasil dibukukan!"
        )
        setBkuDesc("")
        setBkuAmount("")
        fetchBku()
        onRefreshReport()
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

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h3 className="font-bold text-slate-800 text-sm tracking-tight">Buku Kas Umum (Jurnal Harian)</h3>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Histori seluruh transaksi Debit & Kredit kas BUMDES secara kronologis.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => openAddModal("RECEIPT")}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-2xl text-xs shadow-md shadow-blue-600/10 active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Catat Penerimaan / Modal
          </button>
          <button
            onClick={() => openAddModal("EXPENSE")}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-2xl text-xs shadow-md shadow-emerald-600/10 active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Catat Pengeluaran
          </button>
        </div>
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

      {/* Modal BKU: Catat Pengeluaran / Penerimaan */}
      {showAddBkuModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-md shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setShowAddBkuModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-55 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-4">
              {modalMode === "EXPENSE" ? (
                <>
                  <ArrowUpCircle className="w-5 h-5 text-emerald-600" />
                  <span>Catat Transaksi Pengeluaran Kas (Beban)</span>
                </>
              ) : (
                <>
                  <ArrowDownCircle className="w-5 h-5 text-blue-600" />
                  <span>Catat Transaksi Penerimaan Kas / Modal</span>
                </>
              )}
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
                  placeholder={modalMode === "EXPENSE" ? "Contoh: Pembelian kertas dan ATK sekretariat" : "Contoh: Setoran modal desa awal / investasi desa"}
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

              {/* Dynamic Account Selectors based on EXPENSE or RECEIPT mode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                {modalMode === "EXPENSE" ? (
                  <>
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
                        value={bkuTargetAccount}
                        onChange={(e) => setBkuTargetAccount(e.target.value)}
                        className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 focus:outline-none cursor-pointer"
                      >
                        <option value="5-1100">5-1100 Beban Pengurus</option>
                        <option value="5-1200">5-1200 Beban Unit Lahan</option>
                        <option value="5-1300">5-1300 Beban Unit Gedung</option>
                        <option value="5-1500">5-1500 Beban Bank & Pajak</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Debit Akun Kas (Masuk)</label>
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
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Kredit Akun Modal/Penerimaan</label>
                      <select
                        value={bkuTargetAccount}
                        onChange={(e) => setBkuTargetAccount(e.target.value)}
                        className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 focus:outline-none cursor-pointer"
                      >
                        <option value="3-1100">3-1100 Modal Awal Desa</option>
                        <option value="3-1200">3-1200 Laba Ditahan / Tambah Modal</option>
                        <option value="4-1100">4-1100 Pendapatan Jasa SP</option>
                        <option value="4-1200">4-1200 Pendapatan Sewa Gedung</option>
                        <option value="4-1300">4-1300 Pendapatan Sewa Lapak</option>
                        <option value="4-1400">4-1400 Pendapatan Komisi PPOB</option>
                        <option value="4-1500">4-1500 Pendapatan Bunga Bank</option>
                        <option value="2-1100">2-1100 Simpanan Pokok Anggota</option>
                        <option value="2-1200">2-1200 Simpanan Wajib Anggota</option>
                      </select>
                    </div>
                  </>
                )}
              </div>

              <button
                type="submit"
                disabled={formSubmitLoading}
                className={`w-full mt-2 py-3 text-white font-bold rounded-xl text-xs shadow-md transition-all active:scale-95 ${
                  modalMode === "EXPENSE" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {formSubmitLoading ? "Memproses..." : modalMode === "EXPENSE" ? "Bukukan Pengeluaran" : "Bukukan Penerimaan / Modal"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

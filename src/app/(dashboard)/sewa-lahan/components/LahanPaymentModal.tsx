"use client"

import React from "react"
import { X, DollarSign, AlertCircle, CheckCircle, Printer } from "lucide-react"
import { formatRupiah } from "@/lib/utils"

interface Payment {
  id: string
  amount: number
  date: string
  periodCovered: string
}

interface Contract {
  id: string
  type: string
  number: string
  tenantName: string
  phone: string | null
  shift: string
  fee: number
  payments: Payment[]
}

interface LahanPaymentModalProps {
  activeModal: "contract" | "payment" | "edit_contract" | null
  selectedContract: Contract | null
  setActiveModal: (m: "contract" | "payment" | "edit_contract" | null) => void
  formError: string | null
  formSuccess: string | null
  formSubmitLoading: boolean
  payAmount: string
  setPayAmount: (a: string) => void
  payPeriod: string
  setPayPeriod: (p: string) => void
  handleCreatePayment: (e: React.FormEvent) => void
  setReceiptData: (d: any) => void
  setShowReceipt: (s: boolean) => void
}

export default function LahanPaymentModal({
  activeModal,
  selectedContract,
  setActiveModal,
  formError,
  formSuccess,
  formSubmitLoading,
  payAmount,
  setPayAmount,
  payPeriod,
  setPayPeriod,
  handleCreatePayment,
  setReceiptData,
  setShowReceipt,
}: LahanPaymentModalProps) {
  if (activeModal !== "payment" || !selectedContract) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-md shadow-2xl p-6 relative">
        <button
          onClick={() => setActiveModal(null)}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600"
        >
          <X className="w-5 h-5" />
        </button>
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-1">
          <DollarSign className="w-5 h-5 text-emerald-600" />
          Penerimaan Iuran Sewa Lahan
        </h3>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">
          Pedagang: {selectedContract.tenantName} ({selectedContract.type} Kav {selectedContract.number})
        </p>

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

        <form onSubmit={handleCreatePayment} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Jumlah Pembayaran Iuran (Rp)</label>
            <input
              type="number"
              required
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:outline-none rounded-xl text-xs text-slate-800 font-bold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Keterangan Periode Pembayaran</label>
            <input
              type="text"
              required
              placeholder="Contoh: Sewa Bulan Juni 2026 / Sewa Tahun Ke-2"
              value={payPeriod}
              onChange={(e) => setPayPeriod(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:outline-none rounded-xl text-xs text-slate-800 font-medium"
            />
          </div>

          {/* History payments */}
          {selectedContract.payments.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Riwayat Pembayaran Sebelumnya:</span>
              <div className="max-h-28 overflow-y-auto space-y-1 pr-1 border border-slate-100 rounded-xl p-2 bg-slate-50 text-[10px] font-semibold text-slate-600">
                {selectedContract.payments.map((p) => (
                  <div key={p.id} className="flex justify-between items-center py-1 border-b border-slate-200/50 last:border-0">
                    <span>{p.periodCovered} ({new Date(p.date).toLocaleDateString("id-ID")})</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-emerald-700">{formatRupiah(p.amount)}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setReceiptData({
                            title: `Iuran Sewa Lahan: ${selectedContract.type} ${selectedContract.number}`,
                            customerName: selectedContract.tenantName,
                            customerCode: `Kavling ${selectedContract.number}`,
                            date: p.date,
                            amount: p.amount,
                            details: [
                              { label: "Kavling Lahan", value: `${selectedContract.type} ${selectedContract.number}` },
                              { label: "Penyewa/Pedagang", value: selectedContract.tenantName },
                              { label: "Periode Sewa Dibayar", value: p.periodCovered }
                            ],
                            accounts: [
                              { code: "1-1100", name: "Kas BUMDES", type: "DEBIT" },
                              { code: "4-1200", name: "Pendapatan Sewa Kios / Tanah Lahan", type: "CREDIT" }
                            ]
                          })
                          setShowReceipt(true)
                        }}
                        className="p-1 px-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded transition"
                        title="Cetak Kuitansi"
                      >
                        <Printer className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={formSubmitLoading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all active:scale-95"
          >
            {formSubmitLoading ? "Memproses..." : "Simpan Transaksi"}
          </button>
        </form>
      </div>
    </div>
  )
}

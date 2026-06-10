"use client"

import React from "react"
import { X, CheckCircle, AlertCircle, Printer } from "lucide-react"
import { formatRupiah } from "@/lib/utils"

interface Repayment {
  principalPaid: number
}

interface Loan {
  id: string
  principal: number
  interestRate: number
  termMonths: number
  status: string
  createdAt: string
  member: {
    code: string
    name: string
  }
  repayments: Repayment[]
}

interface RepaymentModalProps {
  activeModal: "new_member" | "saving" | "loan" | "repayment" | "edit_member" | null
  selectedLoan: Loan | null
  setActiveModal: (m: "new_member" | "saving" | "loan" | "repayment" | "edit_member" | null) => void
  formError: string | null
  formSuccess: string | null
  formSubmitLoading: boolean
  repayPrincipal: string
  setRepayPrincipal: (p: string) => void
  repayInterest: string
  setRepayInterest: (i: string) => void
  handleCreateRepayment: (e: React.FormEvent) => void
  setReceiptData: (d: any) => void
  setShowReceipt: (s: boolean) => void
}

const calculateRemainingPrincipal = (loan: Loan) => {
  const totalPaid = loan.repayments.reduce((sum, r) => sum + r.principalPaid, 0)
  return Math.max(loan.principal - totalPaid, 0)
}

export default function RepaymentModal({
  activeModal,
  selectedLoan,
  setActiveModal,
  formError,
  formSuccess,
  formSubmitLoading,
  repayPrincipal,
  setRepayPrincipal,
  repayInterest,
  setRepayInterest,
  handleCreateRepayment,
  setReceiptData,
  setShowReceipt,
}: RepaymentModalProps) {
  if (activeModal !== "repayment" || !selectedLoan) return null

  const remaining = calculateRemainingPrincipal(selectedLoan)

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
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          Pencatatan Angsuran Kredit
        </h3>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">
          Nasabah: {selectedLoan.member.name} ({selectedLoan.member.code})
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

        <form onSubmit={handleCreateRepayment} className="space-y-4">
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col gap-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Total Pinjaman Awal:</span>
              <span className="font-bold text-slate-700">{formatRupiah(selectedLoan.principal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Sisa Pokok Saat Ini:</span>
              <span className="font-bold text-rose-700">{formatRupiah(remaining)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Bunga per Bulan:</span>
              <span className="font-bold text-slate-700">{selectedLoan.interestRate}%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase block">Bayar Pokok (Rupiah)</label>
              <input
                type="number"
                required
                value={repayPrincipal}
                onChange={(e) => setRepayPrincipal(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-bold focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase block">Bayar Jasa Bunga (Rupiah)</label>
              <input
                type="number"
                required
                value={repayInterest}
                onChange={(e) => setRepayInterest(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-bold focus:outline-none"
              />
            </div>
          </div>

          {/* Total preview */}
          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex justify-between items-center text-xs font-bold">
            <span className="text-slate-600">Total Bayar Kas Masuk:</span>
            <span className="text-emerald-700">
              {formatRupiah((parseFloat(repayPrincipal) || 0) + (parseFloat(repayInterest) || 0))}
            </span>
          </div>

          <button
            type="submit"
            disabled={formSubmitLoading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all active:scale-95"
          >
            {formSubmitLoading ? "Memproses..." : "Simpan Angsuran"}
          </button>
        </form>
      </div>
    </div>
  )
}

"use client"

import React from "react"
import { X, Calculator, AlertCircle, CheckCircle } from "lucide-react"
import { formatRupiah } from "@/lib/utils"

interface Member {
  id: string
  code: string
  name: string
}

interface LoanModalProps {
  activeModal: "new_member" | "saving" | "loan" | "repayment" | "edit_member" | null
  selectedMember: Member | null
  setActiveModal: (m: "new_member" | "saving" | "loan" | "repayment" | "edit_member" | null) => void
  formError: string | null
  formSuccess: string | null
  formSubmitLoading: boolean
  loanType: "MASYARAKAT" | "POKTAN"
  setLoanType: (t: "MASYARAKAT" | "POKTAN") => void
  loanPrincipal: string
  setLoanPrincipal: (p: string) => void
  loanInterest: string
  setLoanInterest: (i: string) => void
  loanTerm: string
  setLoanTerm: (t: string) => void
  handleCreateLoan: (e: React.FormEvent) => void
}

export default function LoanModal({
  activeModal,
  selectedMember,
  setActiveModal,
  formError,
  formSuccess,
  formSubmitLoading,
  loanType,
  setLoanType,
  loanPrincipal,
  setLoanPrincipal,
  loanInterest,
  setLoanInterest,
  loanTerm,
  setLoanTerm,
  handleCreateLoan,
}: LoanModalProps) {
  if (activeModal !== "loan" || !selectedMember) return null

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
          <Calculator className="w-5 h-5 text-blue-600" />
          Pencairan Kredit Baru
        </h3>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">
          Nasabah: {selectedMember.code} - {selectedMember.name}
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

        <form onSubmit={handleCreateLoan} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase block">Kategori Pinjaman</label>
            <select
              value={loanType}
              onChange={(e) => setLoanType(e.target.value as any)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="MASYARAKAT">Pinjaman Masyarakat</option>
              <option value="POKTAN">Pinjaman POKTAN (Kelompok Tani)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Nominal Kredit (Principal)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 text-xs font-bold">Rp</span>
              <input
                type="number"
                required
                placeholder="Contoh: 5000000"
                value={loanPrincipal}
                onChange={(e) => setLoanPrincipal(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white focus:outline-none rounded-xl text-xs text-slate-800 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase block">Bunga Flat / bln (%)</label>
              <input
                type="number"
                step="0.1"
                required
                value={loanInterest}
                onChange={(e) => setLoanInterest(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-bold focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase block">Tenor (Bulan)</label>
              <select
                value={loanTerm}
                onChange={(e) => setLoanTerm(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-bold focus:outline-none cursor-pointer"
              >
                <option value="3">3 Bulan</option>
                <option value="6">6 Bulan</option>
                <option value="10">10 Bulan</option>
                <option value="12">12 Bulan</option>
                <option value="24">24 Bulan</option>
              </select>
            </div>
          </div>

          {/* Installment preview */}
          {loanPrincipal && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Cicilan Pokok Bulanan:</span>
                <span className="font-bold text-slate-700">
                  {formatRupiah(parseFloat(loanPrincipal) / parseInt(loanTerm))}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Jasa Bunga Bulanan:</span>
                <span className="font-bold text-slate-700">
                  {formatRupiah(parseFloat(loanPrincipal) * (parseFloat(loanInterest) / 100))}
                </span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between text-xs font-bold">
                <span className="text-slate-650">Total Angsuran Per Bulan:</span>
                <span className="text-blue-700">
                  {formatRupiah(
                    (parseFloat(loanPrincipal) / parseInt(loanTerm)) +
                    (parseFloat(loanPrincipal) * (parseFloat(loanInterest) / 100))
                  )}
                </span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={formSubmitLoading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition-all active:scale-95"
          >
            {formSubmitLoading ? "Memproses..." : "Cairkan Kredit"}
          </button>
        </form>
      </div>
    </div>
  )
}

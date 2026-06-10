"use client"

import React from "react"
import { X, TrendingDown, AlertCircle, CheckCircle } from "lucide-react"

interface Member {
  id: string
  code: string
  name: string
}

interface SavingModalProps {
  activeModal: "new_member" | "saving" | "loan" | "repayment" | "edit_member" | null
  selectedMember: Member | null
  setActiveModal: (m: "new_member" | "saving" | "loan" | "repayment" | "edit_member" | null) => void
  formError: string | null
  formSuccess: string | null
  formSubmitLoading: boolean
  savingType: "POKOK" | "WAJIB"
  setSavingType: (t: "POKOK" | "WAJIB") => void
  savingFlow: "MASUK" | "KELUAR"
  setSavingFlow: (f: "MASUK" | "KELUAR") => void
  savingAmount: string
  setSavingAmount: (a: string) => void
  savingDesc: string
  setSavingDesc: (d: string) => void
  handleCreateSaving: (e: React.FormEvent) => void
}

export default function SavingModal({
  activeModal,
  selectedMember,
  setActiveModal,
  formError,
  formSuccess,
  formSubmitLoading,
  savingType,
  setSavingType,
  savingFlow,
  setSavingFlow,
  savingAmount,
  setSavingAmount,
  savingDesc,
  setSavingDesc,
  handleCreateSaving,
}: SavingModalProps) {
  if (activeModal !== "saving" || !selectedMember) return null

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
          <TrendingDown className="w-5 h-5 text-emerald-600" />
          Transaksi Simpanan
        </h3>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">
          Anggota: {selectedMember.code} - {selectedMember.name}
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

        <form onSubmit={handleCreateSaving} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase block">Jenis Simpanan</label>
              <select
                value={savingType}
                onChange={(e) => setSavingType(e.target.value as any)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="WAJIB">WAJIB</option>
                <option value="POKOK">POKOK</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase block">Aliran Kas</label>
              <select
                value={savingFlow}
                onChange={(e) => setSavingFlow(e.target.value as any)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="MASUK">SETORAN (MASUK)</option>
                <option value="KELUAR">PENARIKAN (KELUAR)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Nominal Rupiah</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 text-xs font-bold">Rp</span>
              <input
                type="number"
                required
                placeholder="Contoh: 30000"
                value={savingAmount}
                onChange={(e) => setSavingAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white focus:outline-none rounded-xl text-xs text-slate-800 font-bold"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Keterangan (Opsional)</label>
            <input
              type="text"
              placeholder="Contoh: Setoran Wajib Bulan Juni"
              value={savingDesc}
              onChange={(e) => setSavingDesc(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white focus:outline-none rounded-xl text-xs text-slate-800"
            />
          </div>

          <button
            type="submit"
            disabled={formSubmitLoading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all active:scale-95"
          >
            {formSubmitLoading ? "Memproses..." : "Proses Simpanan"}
          </button>
        </form>
      </div>
    </div>
  )
}

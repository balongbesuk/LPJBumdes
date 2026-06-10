"use client"

import React from "react"
import { X, UserPlus, Edit2, AlertCircle, CheckCircle } from "lucide-react"

interface Member {
  id: string
  code: string
  name: string
}

interface MemberModalProps {
  activeModal: "new_member" | "saving" | "loan" | "repayment" | "edit_member" | null
  selectedMember: Member | null
  setActiveModal: (m: "new_member" | "saving" | "loan" | "repayment" | "edit_member" | null) => void
  formError: string | null
  formSuccess: string | null
  formSubmitLoading: boolean
  handleCreateMember: (e: React.FormEvent) => void
  handleUpdateMember: (e: React.FormEvent) => void
  newMemberName: string
  setNewMemberName: (n: string) => void
  newMemberPayPokok: boolean
  setNewMemberPayPokok: (p: boolean) => void
  editMemberName: string
  setEditMemberName: (n: string) => void
}

export default function MemberModal({
  activeModal,
  selectedMember,
  setActiveModal,
  formError,
  formSuccess,
  formSubmitLoading,
  handleCreateMember,
  handleUpdateMember,
  newMemberName,
  setNewMemberName,
  newMemberPayPokok,
  setNewMemberPayPokok,
  editMemberName,
  setEditMemberName,
}: MemberModalProps) {
  if (activeModal === "new_member") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
        <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-md shadow-2xl p-6 relative">
          <button
            onClick={() => setActiveModal(null)}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-4">
            <UserPlus className="w-5 h-5 text-emerald-600" />
            Daftarkan Anggota Baru
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

          <form onSubmit={handleCreateMember} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase block">Nama Lengkap</label>
              <input
                type="text"
                required
                placeholder="Contoh: Budi Santoso"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white focus:outline-none rounded-xl text-xs text-slate-800"
              />
            </div>
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <input
                type="checkbox"
                id="bayar_pokok"
                checked={newMemberPayPokok}
                onChange={(e) => setNewMemberPayPokok(e.target.checked)}
                className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
              />
              <label htmlFor="bayar_pokok" className="text-xs text-slate-700 font-semibold cursor-pointer">
                Bayar Simpanan Pokok awal (Rp 50.000)
              </label>
            </div>

            <button
              type="submit"
              disabled={formSubmitLoading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all active:scale-95"
            >
              {formSubmitLoading ? "Memproses..." : "Daftarkan Anggota"}
            </button>
          </form>
        </div>
      </div>
    )
  }

  if (activeModal === "edit_member" && selectedMember) {
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
            <Edit2 className="w-5 h-5 text-emerald-600" />
            Edit Informasi Anggota
          </h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">
            Kode Anggota: {selectedMember.code}
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

          <form onSubmit={handleUpdateMember} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase block">Nama Lengkap</label>
              <input
                type="text"
                required
                placeholder="Nama Lengkap Anggota"
                value={editMemberName}
                onChange={(e) => setEditMemberName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white focus:outline-none rounded-xl text-xs text-slate-800 font-bold"
              />
            </div>

            <button
              type="submit"
              disabled={formSubmitLoading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all active:scale-95"
            >
              {formSubmitLoading ? "Memproses..." : "Simpan Perubahan"}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return null
}

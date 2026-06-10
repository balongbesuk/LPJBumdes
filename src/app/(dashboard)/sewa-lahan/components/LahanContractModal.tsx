"use client"

import React from "react"
import { X, Map, Edit2, AlertCircle, CheckCircle } from "lucide-react"

interface Contract {
  id: string
  type: string
  number: string
  tenantName: string
  phone: string | null
  shift: string
  fee: number
  periodStart: string
  periodEnd: string
}

interface LahanContractModalProps {
  activeModal: "contract" | "payment" | "edit_contract" | null
  selectedContract: Contract | null
  setActiveModal: (m: "contract" | "payment" | "edit_contract" | null) => void
  formError: string | null
  formSuccess: string | null
  formSubmitLoading: boolean
  handleCreateContract: (e: React.FormEvent) => void
  handleUpdateContract: (e: React.FormEvent) => void

  // New Contract States
  contractType: "WARUNG" | "LAPAK"
  setContractType: (t: "WARUNG" | "LAPAK") => void
  kavlingNumber: string
  setKavlingNumber: (n: string) => void
  lapakShift: "PAGI" | "MALAM"
  setLapakShift: (s: "PAGI" | "MALAM") => void
  tenantName: string
  setTenantName: (n: string) => void
  tenantPhone: string
  setTenantPhone: (p: string) => void
  rentFee: string
  setRentFee: (f: string) => void
  startDateStr: string
  setStartDateStr: (d: string) => void
  endDateStr: string
  initialPayment: string
  setInitialPayment: (p: string) => void
  paymentPeriod: string
  setPaymentPeriod: (p: string) => void

  // Edit Contract States
  editTenantName: string
  setEditTenantName: (n: string) => void
  editTenantPhone: string
  setEditTenantPhone: (p: string) => void
  editRentFee: string
  setEditRentFee: (f: string) => void
}

export default function LahanContractModal({
  activeModal,
  selectedContract,
  setActiveModal,
  formError,
  formSuccess,
  formSubmitLoading,
  handleCreateContract,
  handleUpdateContract,
  contractType,
  setContractType,
  kavlingNumber,
  setKavlingNumber,
  lapakShift,
  setLapakShift,
  tenantName,
  setTenantName,
  tenantPhone,
  setTenantPhone,
  rentFee,
  setRentFee,
  startDateStr,
  setStartDateStr,
  endDateStr,
  initialPayment,
  setInitialPayment,
  paymentPeriod,
  setPaymentPeriod,
  editTenantName,
  setEditTenantName,
  editTenantPhone,
  setEditTenantPhone,
  editRentFee,
  setEditRentFee,
}: LahanContractModalProps) {
  if (activeModal === "contract") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
        <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-md shadow-2xl p-6 relative animate-fade-in">
          <button
            onClick={() => setActiveModal(null)}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-4">
            <Map className="w-5 h-5 text-emerald-600" />
            Kontrak Sewa Lahan Baru
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

          <form onSubmit={handleCreateContract} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase block">Kategori Lahan</label>
                <select
                  value={contractType}
                  onChange={(e) => setContractType(e.target.value as any)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
                >
                  <option value="WARUNG">Warung Desa</option>
                  <option value="LAPAK">Lapak PKL</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase block">Nomor Kavling</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: A-12"
                  value={kavlingNumber}
                  onChange={(e) => setKavlingNumber(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:outline-none rounded-xl text-xs text-slate-800 font-bold"
                />
              </div>
            </div>

            {contractType === "LAPAK" && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase block">Shift Sewa Lapak</label>
                <select
                  value={lapakShift}
                  onChange={(e) => setLapakShift(e.target.value as any)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
                >
                  <option value="PAGI">Pagi (Pasar/Kuliner Pagi)</option>
                  <option value="MALAM">Malam (Kuliner Malam/Angkringan)</option>
                </select>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase block">Nama Pedagang</label>
              <input
                type="text"
                required
                placeholder="Nama lengkap penyewa lahan"
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:outline-none rounded-xl text-xs text-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase block">No HP / WhatsApp</label>
                <input
                  type="text"
                  placeholder="Contoh: 08123456789"
                  value={tenantPhone}
                  onChange={(e) => setTenantPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:outline-none rounded-xl text-xs text-slate-800"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase block">
                  Tarif Sewa ({contractType === "WARUNG" ? "Tahunan" : "Bulanan"})
                </label>
                <input
                  type="number"
                  required
                  placeholder="Rp"
                  value={rentFee}
                  onChange={(e) => setRentFee(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:outline-none rounded-xl text-xs text-slate-800 font-bold"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase block">Tanggal Mulai Kontrak</label>
              <input
                type="date"
                required
                value={startDateStr}
                onChange={(e) => setStartDateStr(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
              />
            </div>

            {endDateStr && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[10px] text-slate-500 font-semibold">
                <span className="font-bold text-slate-700 block text-[9px]">Jatuh Tempo Otomatis:</span>
                Kontrak ini akan berakhir pada tanggal <b>{new Date(endDateStr).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</b>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase block">Pembayaran Awal (Rp)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={initialPayment}
                  onChange={(e) => setInitialPayment(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:outline-none rounded-xl text-xs text-slate-800 font-bold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase block">Keterangan Periode</label>
                <input
                  type="text"
                  placeholder="Contoh: Sewa Th 2026 / Sewa Juni"
                  value={paymentPeriod}
                  onChange={(e) => setPaymentPeriod(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:outline-none rounded-xl text-xs text-slate-800"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={formSubmitLoading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all active:scale-95"
            >
              {formSubmitLoading ? "Memproses..." : "Aktifkan Kontrak"}
            </button>
          </form>
        </div>
      </div>
    )
  }

  if (activeModal === "edit_contract" && selectedContract) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
        <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-md shadow-2xl p-6 relative animate-fade-in">
          <button
            onClick={() => setActiveModal(null)}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-1">
            <Edit2 className="w-5 h-5 text-amber-500" />
            Edit Informasi Kontrak Sewa Lahan
          </h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">
            Kavling: {selectedContract.type} {selectedContract.number}
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

          <form onSubmit={handleUpdateContract} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Nama Pedagang / Penyewa</label>
              <input
                type="text"
                required
                value={editTenantName}
                onChange={(e) => setEditTenantName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:outline-none focus:border-emerald-500 rounded-xl text-xs text-slate-800 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">No HP / WhatsApp</label>
                <input
                  type="text"
                  value={editTenantPhone}
                  onChange={(e) => setEditTenantPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:outline-none focus:border-emerald-500 rounded-xl text-xs text-slate-800"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Tarif Sewa ({selectedContract.type === "WARUNG" ? "Tahunan" : "Bulanan"})
                </label>
                <input
                  type="number"
                  required
                  value={editRentFee}
                  onChange={(e) => setEditRentFee(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:outline-none focus:border-emerald-500 rounded-xl text-xs text-slate-800 font-bold"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all active:scale-95"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={formSubmitLoading}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs shadow-md transition-all active:scale-95"
              >
                {formSubmitLoading ? "Memproses..." : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return null
}

"use client"

import React from "react"
import { TrendingDown, Edit2, Power, MessageCircle } from "lucide-react"
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
  periodStart: string
  periodEnd: string
  status: string
  payments: Payment[]
}

interface LahanTableProps {
  filteredContracts: Contract[]
  activeTab: "warung" | "lapak"
  settings: any
  setSelectedContract: (c: Contract) => void
  setPayAmount: (a: string) => void
  setPayPeriod: (p: string) => void
  setFormError: (e: string | null) => void
  setFormSuccess: (s: string | null) => void
  setActiveModal: (m: "contract" | "payment" | "edit_contract" | null) => void
  setEditTenantName: (n: string) => void
  setEditTenantPhone: (p: string) => void
  setEditRentFee: (f: string) => void
  handleToggleContractStatus: (c: Contract) => void
  setWaModalData: (d: any) => void
  setShowWaModal: (s: boolean) => void
}

const calculateDaysRemaining = (endStr: string) => {
  const end = new Date(endStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diffTime = end.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export default function LahanTable({
  filteredContracts,
  activeTab,
  settings,
  setSelectedContract,
  setPayAmount,
  setPayPeriod,
  setFormError,
  setFormSuccess,
  setActiveModal,
  setEditTenantName,
  setEditTenantPhone,
  setEditRentFee,
  handleToggleContractStatus,
  setWaModalData,
  setShowWaModal,
}: LahanTableProps) {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kavling</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nama Pedagang</th>
              {activeTab === "lapak" && (
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Shift</th>
              )}
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Biaya Sewa</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Periode Kontrak</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Sisa Waktu</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Status</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-slate-700 text-xs">
            {filteredContracts.length > 0 ? (
              filteredContracts.map((contract) => {
                const daysRemaining = calculateDaysRemaining(contract.periodEnd)
                const start = new Date(contract.periodStart).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "2-digit" })
                const end = new Date(contract.periodEnd).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "2-digit" })

                return (
                  <tr key={contract.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {contract.type} {contract.number}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">
                      <div>{contract.tenantName}</div>
                      <span className="text-[10px] text-slate-400 mt-1 block">{contract.phone || "-"}</span>
                    </td>
                    {activeTab === "lapak" && (
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2 py-0.5 rounded-full border text-[9px] font-bold ${
                          contract.shift === "PAGI"
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : "bg-indigo-50 text-indigo-800 border-indigo-200"
                        }`}>
                          {contract.shift}
                        </span>
                      </td>
                    )}
                    <td className="px-6 py-4 text-right font-bold text-slate-800">
                      {formatRupiah(contract.fee)} 
                      <span className="text-[9px] font-semibold text-slate-400 ml-1">
                        /{contract.type === "WARUNG" ? "thn" : "bln"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-slate-600">
                      {start} s.d {end}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {daysRemaining > 0 ? (
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[9px] font-bold ${
                          daysRemaining <= 30
                            ? "bg-amber-50 border border-amber-250 text-amber-800 font-extrabold"
                            : "bg-emerald-50 border border-emerald-100 text-emerald-800"
                        }`}>
                          {daysRemaining} hari lagi
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border bg-rose-50 text-rose-800 border-rose-200 text-[9px] font-bold">
                          Habis Kontrak
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center font-semibold">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        contract.status === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          : contract.status === "TERMINATED"
                            ? "bg-rose-50 text-rose-700 border border-rose-100"
                            : "bg-slate-50 text-slate-400 border border-slate-100"
                      }`}>
                        {contract.status === "ACTIVE" ? "Aktif" : contract.status === "TERMINATED" ? "Nonaktif" : "Selesai"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          disabled={contract.status !== "ACTIVE"}
                          onClick={() => {
                            setSelectedContract(contract)
                            setPayAmount(String(contract.fee))
                            setPayPeriod("")
                            setFormError(null)
                            setFormSuccess(null)
                            setActiveModal("payment")
                          }}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-bold shadow-sm transition-all flex items-center gap-1 ${
                            contract.status === "ACTIVE"
                              ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-150 active:scale-95 cursor-pointer"
                              : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60"
                          }`}
                        >
                          <TrendingDown className="w-3 h-3" />
                          Input Iuran
                        </button>

                        {/* Edit button */}
                        <button
                          onClick={() => {
                            setSelectedContract(contract)
                            setEditTenantName(contract.tenantName)
                            setEditTenantPhone(contract.phone || "")
                            setEditRentFee(String(contract.fee))
                            setFormError(null)
                            setFormSuccess(null)
                            setActiveModal("edit_contract")
                          }}
                          className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-150 rounded-xl transition shadow-sm active:scale-95"
                          title="Edit Kontrak"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Toggle status button (Power) */}
                        <button
                          onClick={() => handleToggleContractStatus(contract)}
                          className={`p-1.5 border rounded-xl transition shadow-sm active:scale-95 ${
                            contract.status === "ACTIVE"
                              ? "bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-150"
                              : "bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-150"
                          }`}
                          title={contract.status === "ACTIVE" ? "Nonaktifkan Kontrak" : "Aktifkan Kontrak"}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>

                        {/* WA Reminder button */}
                        <button
                          type="button"
                          onClick={() => {
                            const remainingText = daysRemaining > 0
                              ? `akan berakhir dalam ${daysRemaining} hari lagi (jatuh tempo pada tanggal ${new Date(contract.periodEnd).toLocaleDateString("id-ID", { dateStyle: "long" })})`
                              : `telah berakhir pada tanggal ${new Date(contract.periodEnd).toLocaleDateString("id-ID", { dateStyle: "long" })}`
                            
                            setWaModalData({
                              recipientName: contract.tenantName,
                              defaultPhone: contract.phone || "",
                              defaultMessage: `Halo *${contract.tenantName}*,\n\nIni adalah pengingat resmi dari pengelola BUMDES "${settings?.bumdes_name || 'BUMDES'}". Masa kontrak sewa untuk *kavling ${contract.type} nomor ${contract.number}* ${remainingText}.\n\nMohon segera mengunjungi kantor BUMDES untuk mengurus perpanjangan sewa atau melunasi iuran Anda. Terima kasih.`
                            })
                            setShowWaModal(true)
                          }}
                          className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-650 hover:text-emerald-700 border border-emerald-150 rounded-xl transition shadow-sm active:scale-95"
                          title="Kirim Notifikasi WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={activeTab === "lapak" ? 8 : 7} className="px-6 py-10 text-center text-slate-400 font-medium">
                  Tidak ada data kontrak aktif untuk sewa {activeTab}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

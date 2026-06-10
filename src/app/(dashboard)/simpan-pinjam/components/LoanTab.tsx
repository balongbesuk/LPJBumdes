"use client"

import React from "react"
import { Clock, CheckCircle, MessageCircle, Printer, Search } from "lucide-react"
import { formatRupiah } from "@/lib/utils"

interface Loan {
  id: string
  memberId: string
  type: string
  principal: number
  interestRate: number
  monthlyInstallment: number
  termMonths: number
  status: string
  createdAt: string
  member: {
    code: string
    name: string
  }
  repayments: {
    principalPaid: number
  }[]
}

interface LoanTabProps {
  filteredLoans: Loan[]
  setSelectedLoan: (l: Loan) => void
  setFormError: (e: string | null) => void
  setFormSuccess: (s: string | null) => void
  setActiveModal: (m: "new_member" | "saving" | "loan" | "repayment" | "edit_member" | null) => void
  setWaModalData: (d: any) => void
  setShowWaModal: (s: boolean) => void
  setReceiptData: (d: any) => void
  setShowReceipt: (s: boolean) => void
  settings: any
  searchQuery: string
  setSearchQuery: (q: string) => void
}

const calculateRemainingPrincipal = (loan: Loan) => {
  const totalPaid = loan.repayments.reduce((sum, r) => sum + r.principalPaid, 0)
  return Math.max(loan.principal - totalPaid, 0)
}

export default function LoanTab({
  filteredLoans,
  setSelectedLoan,
  setFormError,
  setFormSuccess,
  setActiveModal,
  setWaModalData,
  setShowWaModal,
  setReceiptData,
  setShowReceipt,
  settings,
  searchQuery,
  setSearchQuery,
}: LoanTabProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search Input */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-1">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Cari nama atau kode nasabah..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 focus:border-emerald-500 rounded-2xl text-xs focus:outline-none transition-all placeholder:text-slate-400 text-slate-700 shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nasabah</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tipe</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Pokok Awal</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Bunga / Tenor</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Angsuran / bln</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Sisa Hutang</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-slate-700 text-xs">
              {filteredLoans.length > 0 ? (
                filteredLoans.map((loan) => {
                  const remaining = calculateRemainingPrincipal(loan)
                  return (
                    <tr key={loan.id} className="hover:bg-slate-50/50 transition-all">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800 leading-none">{loan.member.name}</div>
                        <span className="text-[10px] font-bold text-slate-400 mt-1 block">{loan.member.code}</span>
                      </td>
                      <td className="px-6 py-4 font-bold">
                        <span className={`inline-block px-2 py-0.5 rounded-full border text-[9px] ${
                          loan.type === "POKTAN"
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : "bg-purple-50 text-purple-800 border-purple-200"
                        }`}>
                          {loan.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-slate-700">
                        {formatRupiah(loan.principal)}
                      </td>
                      <td className="px-6 py-4 text-center font-medium">
                        {loan.interestRate}% / {loan.termMonths} bln
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-slate-855">
                        {formatRupiah(loan.monthlyInstallment)}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-rose-700">
                        {formatRupiah(remaining)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-bold ${
                          loan.status === "ACTIVE"
                            ? "bg-emerald-50 border border-emerald-100 text-emerald-800"
                            : "bg-slate-50 border border-slate-200 text-slate-500"
                        }`}>
                          {loan.status === "ACTIVE" ? (
                            <>
                              <Clock className="w-3 h-3 text-emerald-600" />
                              Aktif
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-3 h-3 text-slate-400" />
                              Lunas
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {loan.status === "ACTIVE" ? (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedLoan(loan)
                                  setFormError(null)
                                  setFormSuccess(null)
                                  setActiveModal("repayment")
                                }}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-[10px] font-bold shadow-sm transition-all active:scale-95"
                              >
                                Bayar Cicilan
                              </button>

                              {/* WhatsApp Reminder Button */}
                              <button
                                type="button"
                                onClick={() => {
                                  setWaModalData({
                                    recipientName: loan.member.name,
                                    defaultPhone: "",
                                    defaultMessage: `Halo *${loan.member.name}*,\n\nIni adalah pengingat resmi dari pengelola unit Simpan Pinjam BUMDES "${settings?.bumdes_name || 'BUMDES'}".\n\nHarap diingat bahwa angsuran bulanan untuk pinjaman *${loan.type}* Anda senilai *${formatRupiah(loan.monthlyInstallment)}* telah jatuh tempo / wajib segera dibayarkan.\n\nSisa pinjaman Anda saat ini adalah *${formatRupiah(remaining)}*.\n\nMohon lakukan pembayaran di kantor BUMDES. Terima kasih.`
                                  })
                                  setShowWaModal(true)
                                }}
                                className="p-1.5 bg-emerald-50 hover:bg-emerald-105 text-emerald-650 hover:text-emerald-750 border border-emerald-150 rounded-xl transition shadow-sm"
                                title="Kirim Notifikasi WhatsApp"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-bold mr-1">Lunas</span>
                          )}

                          {/* Reprint Loan Disbursal Receipt */}
                          <button
                            type="button"
                            onClick={() => {
                              setReceiptData({
                                title: `Pencairan Kredit (${loan.type})`,
                                customerName: loan.member.name,
                                customerCode: loan.member.code,
                                date: loan.createdAt,
                                amount: loan.principal,
                                details: [
                                  { label: "Nama Nasabah", value: loan.member.name },
                                  { label: "Kategori Kredit", value: loan.type },
                                  { label: "Pokok Pinjaman", value: loan.principal },
                                  { label: "Suku Jasa Flat", value: `${loan.interestRate}% / bln` },
                                  { label: "Jangka Waktu", value: `${loan.termMonths} Bulan` },
                                  { label: "Angsuran Bulanan", value: loan.monthlyInstallment }
                                ],
                                accounts: [
                                  { code: loan.type === "MASYARAKAT" ? "1-1400" : "1-1500", name: `Piutang Pinjaman ${loan.type}`, type: "DEBIT" },
                                  { code: "1-1100", name: "Kas BUMDES", type: "CREDIT" }
                                ]
                              })
                              setShowReceipt(true)
                            }}
                            className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl transition shadow-sm"
                            title="Cetak Struk Pencairan"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-slate-400 font-medium">
                    Tidak ada data pinjaman ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

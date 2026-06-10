"use client"

import React from "react"
import { Printer, TrendingDown, Calculator, Edit2, UserMinus, UserCheck, Trash2, Search } from "lucide-react"
import { formatRupiah } from "@/lib/utils"

interface Member {
  id: string
  code: string
  name: string
  simpananPokok: number
  simpananWajib: number
  isActive: boolean
}

interface MemberTabProps {
  filteredMembers: Member[]
  setSelectedMember: (m: Member) => void
  setSavingType: (t: "POKOK" | "WAJIB") => void
  setSavingFlow: (f: "MASUK" | "KELUAR") => void
  setSavingAmount: (a: string) => void
  setSavingDesc: (d: string) => void
  setFormError: (e: string | null) => void
  setFormSuccess: (s: string | null) => void
  setActiveModal: (m: "new_member" | "saving" | "loan" | "repayment" | "edit_member" | null) => void
  setLoanType: (t: "MASYARAKAT" | "POKTAN") => void
  setLoanPrincipal: (p: string) => void
  setLoanInterest: (i: string) => void
  setLoanTerm: (t: string) => void
  setEditMemberName: (n: string) => void
  handleToggleMemberActive: (m: Member, activate: boolean) => void
  handleDeleteMember: (m: Member) => void
  handlePrintSavings: () => void
  handlePrintLoans: () => void
  memberStatusFilter: "active" | "inactive"
  setMemberStatusFilter: (f: "active" | "inactive") => void
  searchQuery: string
  setSearchQuery: (q: string) => void
}

export default function MemberTab({
  filteredMembers,
  setSelectedMember,
  setSavingType,
  setSavingFlow,
  setSavingAmount,
  setSavingDesc,
  setFormError,
  setFormSuccess,
  setActiveModal,
  setLoanType,
  setLoanPrincipal,
  setLoanInterest,
  setLoanTerm,
  setEditMemberName,
  handleToggleMemberActive,
  handleDeleteMember,
  handlePrintSavings,
  handlePrintLoans,
  memberStatusFilter,
  setMemberStatusFilter,
  searchQuery,
  setSearchQuery,
}: MemberTabProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-1">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl w-fit">
          <button
            onClick={() => setMemberStatusFilter("active")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              memberStatusFilter === "active" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Anggota Aktif
          </button>
          <button
            onClick={() => setMemberStatusFilter("inactive")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              memberStatusFilter === "inactive" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Anggota Nonaktif (Keluar)
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
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

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintSavings}
              className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold px-4 py-2.5 rounded-2xl text-xs shadow-sm transition-all active:scale-95 shrink-0"
            >
              <Printer className="w-4 h-4 text-emerald-600" />
              Cetak Buku Bantu Simpanan
            </button>
            <button
              onClick={handlePrintLoans}
              className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold px-4 py-2.5 rounded-2xl text-xs shadow-sm transition-all active:scale-95 shrink-0"
            >
              <Printer className="w-4 h-4 text-blue-600" />
              Cetak Buku Bantu Piutang
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kode</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nama Anggota</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Simpanan Pokok</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Simpanan Wajib</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right font-bold">Total Tabungan</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-slate-700 text-xs">
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="px-6 py-4 font-bold text-slate-800">{member.code}</td>
                    <td className="px-6 py-4 font-semibold text-slate-700">{member.name}</td>
                    <td className="px-6 py-4 text-right font-medium text-slate-600">
                      {formatRupiah(member.simpananPokok)}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-slate-600">
                      {formatRupiah(member.simpananWajib)}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-emerald-700">
                      {formatRupiah(member.simpananPokok + member.simpananWajib)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {member.isActive !== false ? (
                          <>
                            <button
                              onClick={() => {
                                setSelectedMember(member)
                                setSavingType("WAJIB")
                                setSavingFlow("MASUK")
                                setSavingAmount("")
                                setSavingDesc("")
                                setFormError(null)
                                setFormSuccess(null)
                                setActiveModal("saving")
                              }}
                              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-150 px-3 py-1.5 rounded-xl text-[10px] font-bold shadow-sm transition-all"
                            >
                              <TrendingDown className="w-3 h-3 inline-block mr-1" />
                              Simpanan
                            </button>
                            <button
                              onClick={() => {
                                setSelectedMember(member)
                                setLoanType("MASYARAKAT")
                                setLoanPrincipal("")
                                setLoanInterest("1.0")
                                setLoanTerm("10")
                                setFormError(null)
                                setFormSuccess(null)
                                setActiveModal("loan")
                              }}
                              className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-150 px-3 py-1.5 rounded-xl text-[10px] font-bold shadow-sm transition-all"
                            >
                              <Calculator className="w-3 h-3 inline-block mr-1" />
                              Beri Kredit
                            </button>
                            
                            {/* Edit Nama Button */}
                            <button
                              onClick={() => {
                                setSelectedMember(member)
                                setEditMemberName(member.name)
                                setFormError(null)
                                setFormSuccess(null)
                                setActiveModal("edit_member")
                              }}
                              className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200 rounded-xl transition"
                              title="Edit Nama"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Keluarkan Anggota Button */}
                            <button
                              onClick={() => handleToggleMemberActive(member, false)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 border border-rose-150 rounded-xl transition"
                              title="Keluarkan Anggota"
                            >
                              <UserMinus className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <>
                            {/* Aktifkan Kembali Button */}
                            <button
                              onClick={() => handleToggleMemberActive(member, true)}
                              className="bg-emerald-50 hover:bg-emerald-105 text-emerald-800 border border-emerald-150 px-2.5 py-1.5 rounded-xl text-[10px] font-bold shadow-sm transition-all flex items-center gap-1"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              Aktifkan Kembali
                            </button>

                            {/* Delete Member Button */}
                            <button
                              onClick={() => handleDeleteMember(member)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-650 border border-rose-150 rounded-xl transition"
                              title="Hapus Anggota"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400 font-medium">
                    Tidak ada data anggota ditemukan.
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

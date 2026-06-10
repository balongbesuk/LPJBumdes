"use client"

import React, { useState, useEffect } from "react"
import {
  Coins,
  Users,
  Search,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  Calculator,
  UserPlus,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  CreditCard,
  FileText,
  Printer,
  MessageCircle,
  Edit2,
  Trash2,
  UserMinus,
  UserCheck
} from "lucide-react"
import { formatRupiah } from "@/lib/utils"
import KwitansiModal from "@/components/KwitansiModal"
import WaNotificationModal from "@/components/WaNotificationModal"
import { useSettings } from "@/context/SettingsContext"

interface Member {
  id: string
  code: string
  name: string
  simpananPokok: number
  simpananWajib: number
  isActive: boolean
}

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

export default function SimpanPinjamPage() {
  const settings = useSettings()
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<"members" | "loans" | "transactions">("members")
  const [memberStatusFilter, setMemberStatusFilter] = useState<"active" | "inactive">("active")
  
  // Data lists
  const [members, setMembers] = useState<Member[]>([])
  const [loans, setLoans] = useState<Loan[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Modals state
  const [activeModal, setActiveModal] = useState<"new_member" | "saving" | "loan" | "repayment" | "edit_member" | null>(null)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null)

  // Forms states
  const [newMemberName, setNewMemberName] = useState("")
  const [editMemberName, setEditMemberName] = useState("")
  const [newMemberPayPokok, setNewMemberPayPokok] = useState(true)

  const [savingType, setSavingType] = useState<"POKOK" | "WAJIB">("WAJIB")
  const [savingFlow, setSavingFlow] = useState<"MASUK" | "KELUAR">("MASUK")
  const [savingAmount, setSavingAmount] = useState("")
  const [savingDesc, setSavingDesc] = useState("")

  const [loanType, setLoanType] = useState<"MASYARAKAT" | "POKTAN">("MASYARAKAT")
  const [loanPrincipal, setLoanPrincipal] = useState("")
  const [loanInterest, setLoanInterest] = useState("1.0") // 1.0% per month
  const [loanTerm, setLoanTerm] = useState("10")
  
  const [repayPrincipal, setRepayPrincipal] = useState("")
  const [repayInterest, setRepayInterest] = useState("")
  
  const [formSubmitLoading, setFormSubmitLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)

  // POS Thermal Receipt & WhatsApp Reminder states
  const [showReceipt, setShowReceipt] = useState(false)
  const [receiptData, setReceiptData] = useState<any>(null)
  const [showWaModal, setShowWaModal] = useState(false)
  const [waModalData, setWaModalData] = useState<any>(null)

  // Custom Confirmation Modal state
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean
    title: string
    message: string
    confirmText: string
    cancelText: string
    color: "emerald" | "rose" | "blue"
    onConfirm: () => void
  } | null>(null)

  const [printType, setPrintType] = useState<"savings" | "loans" | null>(null)

  const handlePrintSavings = () => {
    setPrintType("savings")
    setTimeout(() => {
      window.print()
    }, 150)
  }

  const handlePrintLoans = () => {
    setPrintType("loans")
    setTimeout(() => {
      window.print()
    }, 150)
  }

  // Fetch initial data
  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [membersRes, loansRes] = await Promise.all([
        fetch("/api/simpan-pinjam/members"),
        fetch("/api/simpan-pinjam/loans")
      ])
      
      const membersResult = await membersRes.json()
      const loansResult = await loansRes.json()

      if (membersResult.success && loansResult.success) {
        setMembers(membersResult.data)
        setLoans(loansResult.data)
      } else {
        throw new Error("Gagal mengambil data BUMDES")
      }
    } catch (err: any) {
      setError(err.message || "Gagal menghubungi server")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Auto calculate repayment fields when selectedLoan changes
  useEffect(() => {
    if (selectedLoan) {
      const remaining = calculateRemainingPrincipal(selectedLoan)
      const monthlyPrincipal = Math.min(selectedLoan.principal / selectedLoan.termMonths, remaining)
      const monthlyInterest = selectedLoan.principal * (selectedLoan.interestRate / 100)
      
      setRepayPrincipal(String(Math.round(monthlyPrincipal)))
      setRepayInterest(String(Math.round(monthlyInterest)))
    }
  }, [selectedLoan])

  // Filter lists based on search and keaktifan status
  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.code.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus =
      memberStatusFilter === "active" ? m.isActive !== false : m.isActive === false
    return matchesSearch && matchesStatus
  })

  const filteredLoans = loans.filter(
    (l) =>
      l.member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.member.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const calculateRemainingPrincipal = (loan: Loan) => {
    const totalPaid = loan.repayments.reduce((sum, r) => sum + r.principalPaid, 0)
    return Math.max(loan.principal - totalPaid, 0)
  }

  const handleUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMember) return
    setFormSubmitLoading(true)
    setFormError(null)
    setFormSuccess(null)
    try {
      const res = await fetch("/api/simpan-pinjam/members", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedMember.id, name: editMemberName })
      })
      const result = await res.json()
      if (result.success) {
        setFormSuccess("Nama anggota berhasil diperbarui!")
        fetchData()
        setTimeout(() => {
          setActiveModal(null)
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

  const handleDeleteMember = (member: Member) => {
    setConfirmState({
      isOpen: true,
      title: "Hapus Profil Anggota",
      message: `Apakah Anda yakin ingin menghapus profil anggota ${member.name} (${member.code}) secara permanen? Tindakan ini tidak dapat dibatalkan.`,
      confirmText: "Hapus Permanen",
      cancelText: "Batal",
      color: "rose",
      onConfirm: async () => {
        setConfirmState(null)
        try {
          const res = await fetch(`/api/simpan-pinjam/members?id=${member.id}`, {
            method: "DELETE"
          })
          const result = await res.json()
          if (result.success) {
            setConfirmState({
              isOpen: true,
              title: "Berhasil Dihapus",
              message: `Profil anggota ${member.name} (${member.code}) berhasil dihapus secara permanen dari sistem.`,
              confirmText: "Tutup",
              cancelText: "",
              color: "emerald",
              onConfirm: () => setConfirmState(null)
            })
            fetchData()
          } else {
            setConfirmState({
              isOpen: true,
              title: "Gagal Menghapus",
              message: result.error || "Gagal menghapus anggota.",
              confirmText: "Tutup",
              cancelText: "",
              color: "rose",
              onConfirm: () => setConfirmState(null)
            })
          }
        } catch (err: any) {
          alert(err.message || "Terjadi kesalahan koneksi")
        }
      }
    })
  }

  const handleToggleMemberActive = (member: Member, activate: boolean) => {
    const verb = activate ? "mengaktifkan kembali" : "menonaktifkan (mengeluarkan)"
    const color = activate ? "emerald" : "rose"
    
    setConfirmState({
      isOpen: true,
      title: activate ? "Aktifkan Kembali Anggota" : "Keluarkan / Nonaktifkan Anggota",
      message: activate
        ? `Apakah Anda yakin ingin mengaktifkan kembali anggota ${member.name} (${member.code})? Anggota akan dapat melakukan simpanan dan pinjaman kembali.`
        : `Apakah Anda yakin ingin mengeluarkan anggota ${member.name} (${member.code})? Status keanggotaan akan diubah menjadi nonaktif, dan anggota tidak dapat bertransaksi kembali sampai diaktifkan ulang.`,
      confirmText: activate ? "Aktifkan Kembali" : "Keluarkan Anggota",
      cancelText: "Batal",
      color: color,
      onConfirm: async () => {
        setConfirmState(null)
        try {
          const res = await fetch("/api/simpan-pinjam/members", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: member.id, isActive: activate })
          })
          const result = await res.json()
          if (result.success) {
            setConfirmState({
              isOpen: true,
              title: "Aksi Berhasil",
              message: `Anggota ${member.name} (${member.code}) berhasil ${activate ? "diaktifkan kembali" : "dinonaktifkan / dikeluarkan"}.`,
              confirmText: "Tutup",
              cancelText: "",
              color: "emerald",
              onConfirm: () => setConfirmState(null)
            })
            fetchData()
          } else {
            setConfirmState({
              isOpen: true,
              title: "Aksi Gagal",
              message: result.error || `Gagal ${activate ? "mengaktifkan" : "menonaktifkan"} anggota.`,
              confirmText: "Tutup",
              cancelText: "",
              color: "rose",
              onConfirm: () => setConfirmState(null)
            })
          }
        } catch (err: any) {
          alert(err.message || "Terjadi kesalahan koneksi")
        }
      }
    })
  }

  // Handle Form Submissions
  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormSubmitLoading(true)
    setFormError(null)
    setFormSuccess(null)
    try {
      const res = await fetch("/api/simpan-pinjam/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newMemberName, bayarPokok: newMemberPayPokok })
      })
      const result = await res.json()
      if (result.success) {
        setFormSuccess(`Anggota baru ${result.data.code} - ${result.data.name} berhasil terdaftar!`)
        
        // Open POS receipt for the initial pokok setoran
        if (newMemberPayPokok) {
          setReceiptData({
            title: `Setoran Simpanan POKOK`,
            customerName: result.data.name,
            customerCode: result.data.code,
            date: new Date(),
            amount: 50000,
            details: [
              { label: "Nasabah", value: `${result.data.name} (${result.data.code})` },
              { label: "Jenis Tabungan", value: "POKOK" },
              { label: "Aliran Kas", value: "SETORAN (MASUK)" },
              { label: "Keterangan", value: "Setoran Pokok Pendaftaran Anggota Baru" }
            ],
            accounts: [
              { code: "1-1100", name: "Kas BUMDES", type: "DEBIT" },
              { code: "2-1100", name: "Simpanan Pokok", type: "CREDIT" }
            ]
          })
          setTimeout(() => {
            setShowReceipt(true)
          }, 800)
        }

        setNewMemberName("")
        fetchData()
        setTimeout(() => {
          setActiveModal(null)
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

  const handleCreateSaving = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMember) return
    setFormSubmitLoading(true)
    setFormError(null)
    setFormSuccess(null)
    try {
      const res = await fetch("/api/simpan-pinjam/savings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: selectedMember.id,
          type: savingType,
          amount: parseFloat(savingAmount),
          flow: savingFlow,
          description: savingDesc
        })
      })
      const result = await res.json()
      if (result.success) {
        setFormSuccess(`Transaksi simpanan ${savingType} berhasil diproses!`)
        
        // Open POS Receipt modal
        setReceiptData({
          title: `${savingFlow === "MASUK" ? "Setoran" : "Penarikan"} Simpanan ${savingType}`,
          customerName: selectedMember.name,
          customerCode: selectedMember.code,
          date: new Date(),
          amount: parseFloat(savingAmount),
          details: [
            { label: "Nasabah", value: `${selectedMember.name} (${selectedMember.code})` },
            { label: "Jenis Tabungan", value: savingType },
            { label: "Aliran Kas", value: savingFlow === "MASUK" ? "SETORAN (MASUK)" : "PENARIKAN (KELUAR)" },
            { label: "Keterangan", value: savingDesc || `${savingFlow === "MASUK" ? "Setoran" : "Penarikan"} Simpanan ${savingType}` }
          ],
          accounts: savingFlow === "MASUK"
            ? [
                { code: "1-1100", name: "Kas BUMDES", type: "DEBIT" },
                { code: savingType === "POKOK" ? "2-1100" : "2-1200", name: `Simpanan ${savingType}`, type: "CREDIT" }
              ]
            : [
                { code: savingType === "POKOK" ? "2-1100" : "2-1200", name: `Simpanan ${savingType}`, type: "DEBIT" },
                { code: "1-1100", name: "Kas BUMDES", type: "CREDIT" }
              ]
        })
        setTimeout(() => {
          setShowReceipt(true)
        }, 800)

        setSavingAmount("")
        setSavingDesc("")
        fetchData()
        setTimeout(() => {
          setActiveModal(null)
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

  const handleCreateLoan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedMember) return
    setFormSubmitLoading(true)
    setFormError(null)
    setFormSuccess(null)
    try {
      const res = await fetch("/api/simpan-pinjam/loans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: selectedMember.id,
          type: loanType,
          principal: parseFloat(loanPrincipal),
          interestRate: parseFloat(loanInterest),
          termMonths: parseInt(loanTerm, 10)
        })
      })
      const result = await res.json()
      if (result.success) {
        setFormSuccess(`Pencairan pinjaman senilai ${formatRupiah(result.data.principal)} berhasil disetujui!`)
        
        // Open POS Receipt modal
        setReceiptData({
          title: `Pencairan Kredit (${loanType})`,
          customerName: selectedMember.name,
          customerCode: selectedMember.code,
          date: new Date(),
          amount: parseFloat(loanPrincipal),
          details: [
            { label: "Nama Nasabah", value: selectedMember.name },
            { label: "Kategori Kredit", value: loanType },
            { label: "Pokok Pinjaman", value: parseFloat(loanPrincipal) },
            { label: "Suku Jasa Flat", value: `${loanInterest}% / bln` },
            { label: "Jangka Waktu", value: `${loanTerm} Bulan` }
          ],
          accounts: [
            { code: loanType === "MASYARAKAT" ? "1-1400" : "1-1500", name: `Piutang Pinjaman ${loanType}`, type: "DEBIT" },
            { code: "1-1100", name: "Kas BUMDES", type: "CREDIT" }
          ]
        })
        setTimeout(() => {
          setShowReceipt(true)
        }, 800)

        setLoanPrincipal("")
        fetchData()
        setTimeout(() => {
          setActiveModal(null)
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

  const handleCreateRepayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedLoan) return
    setFormSubmitLoading(true)
    setFormError(null)
    setFormSuccess(null)
    try {
      const res = await fetch("/api/simpan-pinjam/repayments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loanId: selectedLoan.id,
          principalPaid: parseFloat(repayPrincipal),
          interestPaid: parseFloat(repayInterest)
        })
      })
      const result = await res.json()
      if (result.success) {
        setFormSuccess(`Angsuran pinjaman berhasil dicatat!`)
        
        // Open POS Receipt modal
        const principalPaidVal = parseFloat(repayPrincipal) || 0
        const interestPaidVal = parseFloat(repayInterest) || 0
        const totalRepayVal = principalPaidVal + interestPaidVal

        setReceiptData({
          title: `Angsuran Kredit (${selectedLoan.type})`,
          customerName: selectedLoan.member.name,
          customerCode: selectedLoan.member.code,
          date: new Date(),
          amount: totalRepayVal,
          details: [
            { label: "Nama Nasabah", value: selectedLoan.member.name },
            { label: "Tipe Kredit", value: selectedLoan.type },
            { label: "Pembayaran Pokok", value: principalPaidVal },
            { label: "Pembayaran Jasa", value: interestPaidVal },
            { label: "Sisa Pokok Hutang", value: Math.max(calculateRemainingPrincipal(selectedLoan) - principalPaidVal, 0) }
          ],
          accounts: [
            { code: "1-1100", name: "Kas BUMDES", type: "DEBIT" },
            ...(principalPaidVal > 0 ? [{ code: selectedLoan.type === "MASYARAKAT" ? "1-1400" : "1-1500", name: `Piutang Pinjaman ${selectedLoan.type}`, type: "CREDIT" as const }] : []),
            ...(interestPaidVal > 0 ? [{ code: "4-1100", name: "Pendapatan Jasa Simpan Pinjam", type: "CREDIT" as const }] : [])
          ]
        })
        setTimeout(() => {
          setShowReceipt(true)
        }, 800)

        fetchData()
        setTimeout(() => {
          setActiveModal(null)
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
    <div className="space-y-6">
      {/* style tag */}
      <style jsx global>{`
        @media print {
          aside, header, nav, .no-print, button, select, input, .no-print-element {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
          }
          .print-area {
            display: block !important;
            width: 100% !important;
            background: white !important;
            color: black !important;
          }
        }
      `}</style>

      {printType && (
        <div className="fixed top-0 inset-x-0 bg-slate-900/90 text-white py-3 px-6 z-[100] flex items-center justify-between no-print backdrop-blur-sm">
          <span className="font-semibold text-xs flex items-center gap-2">
            <Printer className="w-4 h-4 text-emerald-400" />
            Pratinjau Cetak: {printType === "savings" ? "Buku Bantu Simpanan" : "Buku Bantu Piutang"}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition active:scale-95 shadow-md shadow-emerald-600/10 flex items-center gap-1"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak Dokumen
            </button>
            <button
              onClick={() => setPrintType(null)}
              className="bg-slate-700 hover:bg-slate-650 text-white font-bold px-4 py-2 rounded-xl text-xs transition active:scale-95"
            >
              Tutup Pratinjau
            </button>
          </div>
        </div>
      )}

      {!printType ? (
        <div className="space-y-6">
          {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Unit Simpan Pinjam</h1>
          <p className="text-slate-400 text-xs font-semibold mt-1">
            Kelola keanggotaan nasabah desa, tabungan wajib/pokok, serta pencairan dan angsuran pinjaman.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setNewMemberName("")
              setNewMemberPayPokok(true)
              setFormError(null)
              setFormSuccess(null)
              setActiveModal("new_member")
            }}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-2xl text-xs shadow-md shadow-emerald-600/10 transition-all active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            Anggota Baru
          </button>
        </div>
      </div>

      {/* Tabs & Search Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-1">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl w-fit">
          <button
            onClick={() => setActiveTab("members")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "members" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Users className="w-3.5 h-3.5 inline-block mr-1.5" />
            Daftar Anggota
          </button>
          <button
            onClick={() => setActiveTab("loans")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "loans" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Calculator className="w-3.5 h-3.5 inline-block mr-1.5" />
            Kredit / Pinjaman
          </button>
        </div>

        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Cari anggota atau nomor kode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 focus:border-emerald-500 rounded-2xl text-xs focus:outline-none transition-all placeholder:text-slate-400 text-slate-700 shadow-sm"
          />
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === "members" ? (
        <div className="space-y-4 animate-fade-in">
          {/* Sub-tabs for Member Status & Print Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
            <div className="flex gap-2">
              <button
                onClick={() => setMemberStatusFilter("active")}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all border ${
                  memberStatusFilter === "active"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-250 shadow-sm"
                    : "bg-white text-slate-500 border-slate-200 hover:text-slate-900"
                }`}
              >
                Anggota Aktif
              </button>
              <button
                onClick={() => setMemberStatusFilter("inactive")}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all border ${
                  memberStatusFilter === "inactive"
                    ? "bg-rose-50 text-rose-700 border-rose-250 shadow-sm"
                    : "bg-white text-slate-500 border-slate-200 hover:text-slate-900"
                }`}
              >
                Anggota Nonaktif (Keluar)
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePrintSavings()}
                className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold px-4 py-2 rounded-2xl text-xs shadow-sm transition-all active:scale-95 animate-fade-in"
              >
                <Printer className="w-4 h-4 text-emerald-600" />
                Cetak Buku Bantu Simpanan
              </button>
              <button
                onClick={() => handlePrintLoans()}
                className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold px-4 py-2 rounded-2xl text-xs shadow-sm transition-all active:scale-95 animate-fade-in"
              >
                <Printer className="w-4 h-4 text-blue-600" />
                Cetak Buku Bantu Piutang
              </button>
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
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Total Tabungan</th>
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
                                className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-550 border border-slate-200 rounded-xl transition"
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
                                className="bg-emerald-55 hover:bg-emerald-100 text-emerald-800 border border-emerald-150 px-2.5 py-1.5 rounded-xl text-[10px] font-bold shadow-sm transition-all flex items-center gap-1"
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
      ) : (
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
                        <td className="px-6 py-4 text-right font-bold text-slate-850">
                          {formatRupiah(loan.monthlyInstallment)}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-rose-700">
                          {formatRupiah(remaining)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-bold ${
                            loan.status === "ACTIVE"
                              ? "bg-emerald-55 border border-emerald-100 text-emerald-800"
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
                                  className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-650 hover:text-emerald-700 border border-emerald-150 rounded-xl transition shadow-sm"
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
      )}

      {/* --------------------- MODALS --------------------- */}

      {/* 1. Modal: New Member */}
      {activeModal === "new_member" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
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
      )}

      {/* 2. Modal: Savings Deposit/Withdrawal */}
      {activeModal === "saving" && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
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
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
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
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
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
      )}

      {/* 3. Modal: Disburse Loan */}
      {activeModal === "loan" && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
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
                    <span className="text-slate-600">Total Angsuran Per Bulan:</span>
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
      )}

      {/* 4. Modal: Loan Repayment */}
      {activeModal === "repayment" && selectedLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
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
                  <span className="font-bold text-rose-700">{formatRupiah(calculateRemainingPrincipal(selectedLoan))}</span>
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
                <span className="text-slate-650">Total Bayar Kas Masuk:</span>
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
      )}

      {/* 5. Modal: Edit Member */}
      {activeModal === "edit_member" && selectedMember && (
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
      )}

      {/* POS Thermal Receipt Dialog Overlay */}
      <KwitansiModal
        isOpen={showReceipt}
        onClose={() => setShowReceipt(false)}
        bumdesName={settings?.bumdes_name}
        locationText={settings?.village_name ? `Desa ${settings.village_name}, Kec. ${settings.district_name}` : ""}
        {...receiptData}
      />

      {/* 6. Custom Confirmation / Alert Modal */}
      {confirmState && confirmState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-sm shadow-2xl p-6 relative">
            <button
              onClick={() => setConfirmState(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex flex-col items-center text-center space-y-3 mt-2">
              {confirmState.color === "rose" ? (
                <div className="p-3 bg-rose-50 rounded-2xl border border-rose-100 text-rose-600">
                  <AlertCircle className="w-7 h-7" />
                </div>
              ) : confirmState.color === "emerald" ? (
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-600">
                  <CheckCircle className="w-7 h-7" />
                </div>
              ) : (
                <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100 text-blue-600">
                  <AlertCircle className="w-7 h-7" />
                </div>
              )}
              
              <h3 className="font-bold text-slate-900 text-sm">
                {confirmState.title}
              </h3>
              
              <p className="text-slate-500 text-xs leading-relaxed">
                {confirmState.message}
              </p>
            </div>
            
            <div className="flex gap-2.5 mt-6">
              {confirmState.cancelText && (
                <button
                  type="button"
                  onClick={() => setConfirmState(null)}
                  className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-650 font-bold border border-slate-200 rounded-xl text-[11px] transition-all active:scale-95"
                >
                  {confirmState.cancelText}
                </button>
              )}
              <button
                type="button"
                onClick={confirmState.onConfirm}
                className={`flex-1 py-2.5 text-white font-bold rounded-xl text-[11px] shadow-md transition-all active:scale-95 ${
                  confirmState.color === "rose"
                    ? "bg-rose-600 hover:bg-rose-700 shadow-rose-600/10"
                    : confirmState.color === "emerald"
                    ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/10"
                    : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/10"
                }`}
              >
                {confirmState.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Message Reminder Dialog */}
      {waModalData && (
        <WaNotificationModal
          isOpen={showWaModal}
          onClose={() => {
            setShowWaModal(false)
            setWaModalData(null)
          }}
          {...waModalData}
        />
      )}

        </div>
      ) : (
        <div className="print-area bg-white text-slate-800 p-8 min-h-screen font-serif text-[11px] leading-relaxed">
          {/* Kop Surat / Letterhead */}
          <div className="text-center space-y-1 border-b-2 border-slate-800 pb-4 mb-6">
            <h1 className="text-xl font-bold uppercase tracking-wide text-slate-900">{settings?.bumdes_name || "BUMDES"}</h1>
            <p className="text-xs font-semibold text-slate-500">
              {settings?.village_name ? `Desa ${settings.village_name}, Kecamatan ${settings.district_name}, Kabupaten ${settings.regency_name}` : ""}
            </p>
          </div>

          {printType === "savings" ? (
            <div className="space-y-6">
              <div className="text-center space-y-1.5">
                <h2 className="text-sm font-bold uppercase text-slate-800">BUKU BANTU MUTASI SIMPANAN ANGGOTA</h2>
                <p className="text-[11px] font-semibold text-slate-500">
                  Tanggal Cetak: {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>

              <table className="w-full border-collapse border border-slate-350 text-[11px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-700">
                    <th className="border border-slate-350 px-3 py-2 text-center w-8">No</th>
                    <th className="border border-slate-350 px-3 py-2 text-left">Kode Anggota</th>
                    <th className="border border-slate-350 px-3 py-2 text-left">Nama Anggota</th>
                    <th className="border border-slate-350 px-3 py-2 text-right">Simpanan Pokok</th>
                    <th className="border border-slate-350 px-3 py-2 text-right">Simpanan Wajib</th>
                    <th className="border border-slate-350 px-3 py-2 text-right font-bold">Total Tabungan</th>
                    <th className="border border-slate-350 px-3 py-2 text-center">Keaktifan</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member, index) => (
                    <tr key={member.id} className="hover:bg-slate-50/50">
                      <td className="border border-slate-355 px-3 py-2 text-center">{index + 1}</td>
                      <td className="border border-slate-355 px-3 py-2 font-bold">{member.code}</td>
                      <td className="border border-slate-355 px-3 py-2 font-medium">{member.name}</td>
                      <td className="border border-slate-355 px-3 py-2 text-right">{formatRupiah(member.simpananPokok)}</td>
                      <td className="border border-slate-355 px-3 py-2 text-right">{formatRupiah(member.simpananWajib)}</td>
                      <td className="border border-slate-355 px-3 py-2 text-right font-bold text-emerald-800">
                        {formatRupiah(member.simpananPokok + member.simpananWajib)}
                      </td>
                      <td className="border border-slate-355 px-3 py-2 text-center">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${member.isActive !== false ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                          {member.isActive !== false ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-bold">
                    <td colSpan={3} className="border border-slate-350 px-3 py-2 text-right uppercase">Total Seluruh Simpanan:</td>
                    <td className="border border-slate-350 px-3 py-2 text-right">
                      {formatRupiah(members.reduce((sum, m) => sum + m.simpananPokok, 0))}
                    </td>
                    <td className="border border-slate-350 px-3 py-2 text-right">
                      {formatRupiah(members.reduce((sum, m) => sum + m.simpananWajib, 0))}
                    </td>
                    <td className="border border-slate-350 px-3 py-2 text-right text-emerald-800">
                      {formatRupiah(members.reduce((sum, m) => sum + m.simpananPokok + m.simpananWajib, 0))}
                    </td>
                    <td className="border border-slate-350 px-3 py-2"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center space-y-1.5">
                <h2 className="text-sm font-bold uppercase text-slate-800">BUKU BANTU REKAPITULASI PIUTANG KREDIT ANGGOTA</h2>
                <p className="text-[11px] font-semibold text-slate-500">
                  Tanggal Cetak: {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>

              <table className="w-full border-collapse border border-slate-350 text-[11px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-700">
                    <th className="border border-slate-350 px-3 py-2 text-center w-8">No</th>
                    <th className="border border-slate-350 px-3 py-2 text-left">Nasabah</th>
                    <th className="border border-slate-350 px-3 py-2 text-center">Tipe Kredit</th>
                    <th className="border border-slate-350 px-3 py-2 text-right">Pokok Awal</th>
                    <th className="border border-slate-350 px-3 py-2 text-center">Jasa / Tenor</th>
                    <th className="border border-slate-350 px-3 py-2 text-right">Angsuran / Bln</th>
                    <th className="border border-slate-350 px-3 py-2 text-right font-bold">Sisa Piutang Pokok</th>
                    <th className="border border-slate-350 px-3 py-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loans.map((loan, index) => {
                    const remaining = calculateRemainingPrincipal(loan)
                    return (
                      <tr key={loan.id} className="hover:bg-slate-50/50">
                        <td className="border border-slate-355 px-3 py-2 text-center">{index + 1}</td>
                        <td className="border border-slate-355 px-3 py-2 font-medium">
                          <div>{loan.member.name}</div>
                          <div className="text-[9px] text-slate-400 font-bold">{loan.member.code}</div>
                        </td>
                        <td className="border border-slate-355 px-3 py-2 text-center font-bold">
                          <span className={`px-2 py-0.5 rounded text-[9px] ${loan.type === "POKTAN" ? "bg-amber-50 text-amber-800" : "bg-purple-50 text-purple-800"}`}>
                            {loan.type}
                          </span>
                        </td>
                        <td className="border border-slate-355 px-3 py-2 text-right">{formatRupiah(loan.principal)}</td>
                        <td className="border border-slate-355 px-3 py-2 text-center font-medium">
                          {loan.interestRate}% / {loan.termMonths} bln
                        </td>
                        <td className="border border-slate-355 px-3 py-2 text-right">{formatRupiah(loan.monthlyInstallment)}</td>
                        <td className="border border-slate-355 px-3 py-2 text-right font-bold text-slate-900">
                          {formatRupiah(remaining)}
                        </td>
                        <td className="border border-slate-355 px-3 py-2 text-center">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${loan.status === "LUNAS" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"}`}>
                            {loan.status}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                  <tr className="bg-slate-50 font-bold">
                    <td colSpan={3} className="border border-slate-350 px-3 py-2 text-right uppercase">Total Seluruh Piutang:</td>
                    <td className="border border-slate-350 px-3 py-2 text-right">
                      {formatRupiah(loans.reduce((sum, l) => sum + l.principal, 0))}
                    </td>
                    <td className="border border-slate-350 px-3 py-2"></td>
                    <td className="border border-slate-350 px-3 py-2"></td>
                    <td className="border border-slate-350 px-3 py-2 text-right text-slate-900">
                      {formatRupiah(loans.reduce((sum, l) => sum + calculateRemainingPrincipal(l), 0))}
                    </td>
                    <td className="border border-slate-350 px-3 py-2"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Tanda Tangan Section */}
          <div className="mt-12 grid grid-cols-2 text-center text-[11px] font-medium leading-relaxed">
            <div>
              <p className="mb-16">Mengetahui,<br /><b>Ketua {settings?.bumdes_name || "BUMDES"}</b></p>
              <p className="underline font-bold">{settings?.village_name ? `Desa ${settings.village_name}` : ""}</p>
            </div>
            <div>
              <p className="mb-16">{settings?.village_name || "Desa"}, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}<br /><b>Bendahara BUMDES</b></p>
              <p className="underline font-bold">{settings?.bumdes_name || "BUMDES"}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

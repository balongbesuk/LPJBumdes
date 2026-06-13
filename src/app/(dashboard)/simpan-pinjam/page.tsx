"use client"

import React, { useState, useEffect } from "react"
import {
  Coins,
  Search,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  Calculator,
  UserPlus,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  Printer,
  Edit2,
  Trash2,
  UserMinus,
  UserCheck,
} from "lucide-react"
import { formatRupiah } from "@/lib/utils"
import KwitansiModal from "@/components/KwitansiModal"
import WaNotificationModal from "@/components/WaNotificationModal"
import { useSettings } from "@/context/SettingsContext"

// Subcomponents
import MemberTab from "./components/MemberTab"
import LoanTab from "./components/LoanTab"
import MemberModal from "./components/MemberModal"
import SavingModal from "./components/SavingModal"
import LoanModal from "./components/LoanModal"
import RepaymentModal from "./components/RepaymentModal"
import CkpnModal from "./components/CkpnModal"
import SpSettingsTab from "./components/SpSettingsTab"

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
  const [activeTab, setActiveTab] = useState<"members" | "loans" | "pengaturan">("members")
  const [memberStatusFilter, setMemberStatusFilter] = useState<"active" | "inactive">("active")
  
  // Data lists
  const [members, setMembers] = useState<Member[]>([])
  const [loans, setLoans] = useState<Loan[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Modals state
  const [activeModal, setActiveModal] = useState<"new_member" | "saving" | "loan" | "repayment" | "edit_member" | null>(null)
  const [isCkpnOpen, setIsCkpnOpen] = useState(false)
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
          termMonths: parseInt(loanTerm)
        })
      })
      const result = await res.json()
      if (result.success) {
        setFormSuccess(`Kredit baru senilai ${formatRupiah(parseFloat(loanPrincipal))} berhasil dicairkan!`)
        
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
            { label: "Jangka Waktu", value: `${loanTerm} Bulan` },
            {
              label: "Angsuran Bulanan",
              value: (parseFloat(loanPrincipal) / parseInt(loanTerm)) + (parseFloat(loanPrincipal) * (parseFloat(loanInterest) / 100))
            }
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
        setFormSuccess("Setoran angsuran kredit berhasil dicatat!")
        
        // Open POS Receipt modal
        setReceiptData({
          title: `Angsuran Pinjaman (${selectedLoan.type})`,
          customerName: selectedLoan.member.name,
          customerCode: selectedLoan.member.code,
          date: new Date(),
          amount: parseFloat(repayPrincipal) + parseFloat(repayInterest),
          details: [
            { label: "Nasabah", value: `${selectedLoan.member.name} (${selectedLoan.member.code})` },
            { label: "Kategori Kredit", value: selectedLoan.type },
            { label: "Pokok Angsuran", value: parseFloat(repayPrincipal) },
            { label: "Jasa Bunga", value: parseFloat(repayInterest) },
            { label: "Total Dibayarkan", value: parseFloat(repayPrincipal) + parseFloat(repayInterest) }
          ],
          accounts: [
            { code: "1-1100", name: "Kas BUMDES", type: "DEBIT" },
            { code: selectedLoan.type === "MASYARAKAT" ? "1-1400" : "1-1500", name: `Piutang Pinjaman ${selectedLoan.type}`, type: "CREDIT" },
            { code: "4-1100", name: "Pendapatan Bunga Pinjaman (Unit SP)", type: "CREDIT" }
          ]
        })
        setTimeout(() => {
          setShowReceipt(true)
        }, 800)

        setRepayPrincipal("")
        setRepayInterest("")
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
            Pratinjau Cetak: Buku Pembantu Unit Simpan Pinjam
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
              className="bg-slate-700 hover:bg-slate-600 text-white font-bold px-4 py-2 rounded-xl text-xs transition active:scale-95"
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
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Simpan Pinjam BUMDES</h1>
              <p className="text-slate-400 text-xs font-semibold mt-1">
                Kelola pendaftaran anggota, tabungan simpanan wajib & pokok nasabah, serta pinjaman kredit masyarakat & POKTAN.
              </p>
            </div>
             <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCkpnOpen(true)}
                className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-bold px-4 py-2.5 rounded-2xl text-xs border border-slate-200 shadow-sm transition-all active:scale-95 shrink-0 w-fit"
              >
                <Calculator className="w-4 h-4 text-emerald-600" />
                Cadangan Piutang (CKPN)
              </button>
              <button
                onClick={() => {
                  setNewMemberName("")
                  setNewMemberPayPokok(true)
                  setFormError(null)
                  setFormSuccess(null)
                  setActiveModal("new_member")
                }}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-2xl text-xs shadow-md shadow-emerald-600/10 transition-all active:scale-95 shrink-0 w-fit"
              >
                <Plus className="w-4 h-4" />
                Registrasi Anggota
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-1">
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl w-fit">
              <button
                onClick={() => {
                  setActiveTab("members")
                  setSearchQuery("")
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "members" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Keanggotaan & Tabungan
              </button>
              <button
                onClick={() => {
                  setActiveTab("loans")
                  setSearchQuery("")
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "loans" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Piutang Pinjaman Kredit
              </button>
              <button
                onClick={() => {
                  setActiveTab("pengaturan")
                  setSearchQuery("")
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "pengaturan" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Pengaturan
              </button>
            </div>
          </div>

          {/* Table Container */}
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 border-4 border-emerald-650 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-400 font-semibold text-xs animate-pulse">Memproses data BUMDES...</p>
            </div>
          ) : error ? (
            <div className="p-6 bg-rose-50 border border-rose-100 rounded-3xl text-rose-800">
              <p className="font-bold text-sm">Terjadi Kesalahan</p>
              <p className="mt-1 text-xs font-semibold text-rose-600">{error}</p>
            </div>
          ) : activeTab === "members" ? (
            <MemberTab
              filteredMembers={filteredMembers}
              setSelectedMember={setSelectedMember}
              setSavingType={setSavingType}
              setSavingFlow={setSavingFlow}
              setSavingAmount={setSavingAmount}
              setSavingDesc={setSavingDesc}
              setFormError={setFormError}
              setFormSuccess={setFormSuccess}
              setActiveModal={setActiveModal}
              setLoanType={setLoanType}
              setLoanPrincipal={setLoanPrincipal}
              setLoanInterest={setLoanInterest}
              setLoanTerm={setLoanTerm}
              setEditMemberName={setEditMemberName}
              handleToggleMemberActive={handleToggleMemberActive}
              handleDeleteMember={handleDeleteMember}
              handlePrintSavings={handlePrintSavings}
              handlePrintLoans={handlePrintLoans}
              memberStatusFilter={memberStatusFilter}
              setMemberStatusFilter={setMemberStatusFilter}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          ) : activeTab === "pengaturan" ? (
            <SpSettingsTab />
          ) : (
            <LoanTab
              filteredLoans={filteredLoans}
              setSelectedLoan={setSelectedLoan}
              setFormError={setFormError}
              setFormSuccess={setFormSuccess}
              setActiveModal={setActiveModal}
              setWaModalData={setWaModalData}
              setShowWaModal={setShowWaModal}
              setReceiptData={setReceiptData}
              setShowReceipt={setShowReceipt}
              settings={settings}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          )}

          {/* Modals Container */}
          <CkpnModal
            isOpen={isCkpnOpen}
            onClose={() => setIsCkpnOpen(false)}
            onSuccess={fetchData}
          />

          <MemberModal
            activeModal={activeModal}
            selectedMember={selectedMember}
            setActiveModal={setActiveModal}
            formError={formError}
            formSuccess={formSuccess}
            formSubmitLoading={formSubmitLoading}
            handleCreateMember={handleCreateMember}
            handleUpdateMember={handleUpdateMember}
            newMemberName={newMemberName}
            setNewMemberName={setNewMemberName}
            newMemberPayPokok={newMemberPayPokok}
            setNewMemberPayPokok={setNewMemberPayPokok}
            editMemberName={editMemberName}
            setEditMemberName={setEditMemberName}
          />

          <SavingModal
            activeModal={activeModal}
            selectedMember={selectedMember}
            setActiveModal={setActiveModal}
            formError={formError}
            formSuccess={formSuccess}
            formSubmitLoading={formSubmitLoading}
            savingType={savingType}
            setSavingType={setSavingType}
            savingFlow={savingFlow}
            setSavingFlow={setSavingFlow}
            savingAmount={savingAmount}
            setSavingAmount={setSavingAmount}
            savingDesc={savingDesc}
            setSavingDesc={setSavingDesc}
            handleCreateSaving={handleCreateSaving}
          />

          <LoanModal
            activeModal={activeModal}
            selectedMember={selectedMember}
            setActiveModal={setActiveModal}
            formError={formError}
            formSuccess={formSuccess}
            formSubmitLoading={formSubmitLoading}
            loanType={loanType}
            setLoanType={setLoanType}
            loanPrincipal={loanPrincipal}
            setLoanPrincipal={setLoanPrincipal}
            loanInterest={loanInterest}
            setLoanInterest={setLoanInterest}
            loanTerm={loanTerm}
            setLoanTerm={setLoanTerm}
            handleCreateLoan={handleCreateLoan}
          />

          <RepaymentModal
            activeModal={activeModal}
            selectedLoan={selectedLoan}
            setActiveModal={setActiveModal}
            formError={formError}
            formSuccess={formSuccess}
            formSubmitLoading={formSubmitLoading}
            repayPrincipal={repayPrincipal}
            setRepayPrincipal={setRepayPrincipal}
            repayInterest={repayInterest}
            setRepayInterest={setRepayInterest}
            handleCreateRepayment={handleCreateRepayment}
            setReceiptData={setReceiptData}
            setShowReceipt={setShowReceipt}
          />

          {/* Kwitansi Modal */}
          <KwitansiModal
            isOpen={showReceipt}
            onClose={() => setShowReceipt(false)}
            bumdesName={settings?.bumdes_name}
            locationText={settings?.village_name ? `Desa ${settings.village_name}, Kec. ${settings.district_name}` : ""}
            {...receiptData}
          />

          {/* Custom Confirmation / Alert Modal */}
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
                      className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold border border-slate-200 rounded-xl text-[11px] transition-all active:scale-95"
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

              <table className="w-full border-collapse border border-slate-300 text-[11px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-bold">
                    <th className="border border-slate-300 px-3 py-2 text-center w-8">No</th>
                    <th className="border border-slate-300 px-3 py-2 text-left">Kode Anggota</th>
                    <th className="border border-slate-300 px-3 py-2 text-left">Nama Anggota</th>
                    <th className="border border-slate-300 px-3 py-2 text-right">Simpanan Pokok</th>
                    <th className="border border-slate-300 px-3 py-2 text-right">Simpanan Wajib</th>
                    <th className="border border-slate-300 px-3 py-2 text-right font-bold">Total Tabungan</th>
                    <th className="border border-slate-300 px-3 py-2 text-center">Keaktifan</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member, index) => (
                    <tr key={member.id} className="hover:bg-slate-50/50">
                      <td className="border border-slate-300 px-3 py-2 text-center">{index + 1}</td>
                      <td className="border border-slate-300 px-3 py-2 font-bold">{member.code}</td>
                      <td className="border border-slate-300 px-3 py-2 font-medium">{member.name}</td>
                      <td className="border border-slate-300 px-3 py-2 text-right">{formatRupiah(member.simpananPokok)}</td>
                      <td className="border border-slate-300 px-3 py-2 text-right">{formatRupiah(member.simpananWajib)}</td>
                      <td className="border border-slate-300 px-3 py-2 text-right font-bold text-emerald-800">
                        {formatRupiah(member.simpananPokok + member.simpananWajib)}
                      </td>
                      <td className="border border-slate-300 px-3 py-2 text-center">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${member.isActive !== false ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                          {member.isActive !== false ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-bold">
                    <td colSpan={3} className="border border-slate-300 px-3 py-2 text-right uppercase">Total Seluruh Simpanan:</td>
                    <td className="border border-slate-300 px-3 py-2 text-right">
                      {formatRupiah(members.reduce((sum, m) => sum + m.simpananPokok, 0))}
                    </td>
                    <td className="border border-slate-300 px-3 py-2 text-right">
                      {formatRupiah(members.reduce((sum, m) => sum + m.simpananWajib, 0))}
                    </td>
                    <td className="border border-slate-300 px-3 py-2 text-right text-emerald-800">
                      {formatRupiah(members.reduce((sum, m) => sum + m.simpananPokok + m.simpananWajib, 0))}
                    </td>
                    <td className="border border-slate-300 px-3 py-2"></td>
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

              <table className="w-full border-collapse border border-slate-300 text-[11px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-bold">
                    <th className="border border-slate-300 px-3 py-2 text-center w-8">No</th>
                    <th className="border border-slate-300 px-3 py-2 text-left">Nasabah</th>
                    <th className="border border-slate-300 px-3 py-2 text-center">Tipe Kredit</th>
                    <th className="border border-slate-300 px-3 py-2 text-right">Pokok Awal</th>
                    <th className="border border-slate-300 px-3 py-2 text-center">Jasa / Tenor</th>
                    <th className="border border-slate-300 px-3 py-2 text-right">Angsuran / Bln</th>
                    <th className="border border-slate-300 px-3 py-2 text-right font-bold">Sisa Piutang Pokok</th>
                    <th className="border border-slate-300 px-3 py-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loans.map((loan, index) => {
                    const remaining = calculateRemainingPrincipal(loan)
                    return (
                      <tr key={loan.id} className="hover:bg-slate-50/50">
                        <td className="border border-slate-300 px-3 py-2 text-center">{index + 1}</td>
                        <td className="border border-slate-300 px-3 py-2 font-medium">
                          <div>{loan.member.name}</div>
                          <div className="text-[9px] text-slate-400 font-bold">{loan.member.code}</div>
                        </td>
                        <td className="border border-slate-300 px-3 py-2 text-center font-bold">
                          <span className={`px-2 py-0.5 rounded text-[9px] ${loan.type === "POKTAN" ? "bg-amber-50 text-amber-800" : "bg-purple-50 text-purple-800"}`}>
                            {loan.type}
                          </span>
                        </td>
                        <td className="border border-slate-300 px-3 py-2 text-right">{formatRupiah(loan.principal)}</td>
                        <td className="border border-slate-300 px-3 py-2 text-center font-medium">
                          {loan.interestRate}% / {loan.termMonths} bln
                        </td>
                        <td className="border border-slate-300 px-3 py-2 text-right">{formatRupiah(loan.monthlyInstallment)}</td>
                        <td className="border border-slate-300 px-3 py-2 text-right font-bold text-slate-900">
                          {formatRupiah(remaining)}
                        </td>
                        <td className="border border-slate-300 px-3 py-2 text-center">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${loan.status === "LUNAS" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"}`}>
                            {loan.status}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                  <tr className="bg-slate-50 font-bold">
                    <td colSpan={3} className="border border-slate-300 px-3 py-2 text-right uppercase">Total Seluruh Piutang:</td>
                    <td className="border border-slate-300 px-3 py-2 text-right">
                      {formatRupiah(loans.reduce((sum, l) => sum + l.principal, 0))}
                    </td>
                    <td className="border border-slate-300 px-3 py-2"></td>
                    <td className="border border-slate-300 px-3 py-2"></td>
                    <td className="border border-slate-300 px-3 py-2 text-right text-slate-900 font-bold">
                      {formatRupiah(loans.reduce((sum, l) => sum + calculateRemainingPrincipal(l), 0))}
                    </td>
                    <td className="border border-slate-300 px-3 py-2"></td>
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

"use client"

import React, { useState, useEffect } from "react"
import {
  Map,
  Plus,
  Search,
  Calendar,
  User,
  Phone,
  DollarSign,
  CheckCircle,
  AlertCircle,
  X,
  Clock,
  TrendingDown,
  Info,
  CalendarDays,
  MessageCircle,
  Printer,
  Edit2,
  Power
} from "lucide-react"
import { formatRupiah } from "@/lib/utils"
import KwitansiModal from "@/components/KwitansiModal"
import WaNotificationModal from "@/components/WaNotificationModal"

interface Payment {
  id: string
  amount: number
  date: string
  periodCovered: string
}

interface Contract {
  id: string
  type: string // WARUNG, LAPAK
  number: string // Kavling number
  tenantName: string
  phone: string | null
  shift: string // NONE, PAGI, MALAM
  fee: number
  periodStart: string
  periodEnd: string
  status: string // ACTIVE, EXPIRED, TERMINATED
  payments: Payment[]
}

export default function SewaLahanPage() {
  const [activeTab, setActiveTab] = useState<"warung" | "lapak" | "laporan">("warung")
  const [contracts, setContracts] = useState<Contract[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Laporan & Rekap states
  const [reportMonth, setReportMonth] = useState<string>("all")
  const [reportYear, setReportYear] = useState<string>("2026")
  const [lahanReportData, setLahanReportData] = useState<{
    payments: any[]
    expenses: any[]
  }>({ payments: [], expenses: [] })
  const [reportLoading, setReportLoading] = useState<boolean>(false)

  // Modals state
  const [activeModal, setActiveModal] = useState<"contract" | "payment" | "edit_contract" | null>(null)
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)

  // Form states
  const [contractType, setContractType] = useState<"WARUNG" | "LAPAK">("WARUNG")
  const [kavlingNumber, setKavlingNumber] = useState("")
  const [tenantName, setTenantName] = useState("")
  const [tenantPhone, setTenantPhone] = useState("")
  const [lapakShift, setLapakShift] = useState<"PAGI" | "MALAM">("PAGI")
  const [rentFee, setRentFee] = useState("")
  const [startDateStr, setStartDateStr] = useState("")
  const [endDateStr, setEndDateStr] = useState("")
  const [initialPayment, setInitialPayment] = useState("")
  const [paymentPeriod, setPaymentPeriod] = useState("")

  const [payAmount, setPayAmount] = useState("")
  const [payPeriod, setPayPeriod] = useState("")

  // Edit states
  const [editTenantName, setEditTenantName] = useState("")
  const [editTenantPhone, setEditTenantPhone] = useState("")
  const [editRentFee, setEditRentFee] = useState("")

  // Custom confirmation modal state
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean
    title: string
    message: string
    confirmText: string
    cancelText: string
    color: "emerald" | "rose" | "amber"
    onConfirm: () => void
  }>({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Ya",
    cancelText: "Batal",
    color: "emerald",
    onConfirm: () => {}
  })

  const [formSubmitLoading, setFormSubmitLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)

  // POS Receipt & WA notification modal states
  const [showReceipt, setShowReceipt] = useState(false)
  const [receiptData, setReceiptData] = useState<any>(null)
  const [showWaModal, setShowWaModal] = useState(false)
  const [waModalData, setWaModalData] = useState<any>(null)

  const [printType, setPrintType] = useState<"contracts" | "laporan_lahan" | null>(null)

  const handlePrint = (type: "contracts" | "laporan_lahan" = "contracts") => {
    setPrintType(type)
    setTimeout(() => {
      window.print()
    }, 150)
  }

  const fetchContracts = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/sewa-lahan/contracts")
      const result = await res.json()
      if (result.success) {
        setContracts(result.data)
      } else {
        throw new Error(result.error || "Gagal mengambil data kontrak sewa")
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchReportData = async () => {
    setReportLoading(true)
    try {
      const res = await fetch(`/api/sewa-lahan/reports?month=${reportMonth}&year=${reportYear}`)
      const result = await res.json()
      if (result.success) {
        setLahanReportData(result.data)
      } else {
        console.error("Gagal memuat laporan:", result.error)
      }
    } catch (err) {
      console.error("Kesalahan memuat laporan:", err)
    } finally {
      setReportLoading(false)
    }
  }

  useEffect(() => {
    fetchContracts()
  }, [])

  useEffect(() => {
    if (activeTab === "laporan") {
      fetchReportData()
    }
  }, [activeTab, reportMonth, reportYear])

  // Auto calculate expiration date (1 year for warung, 1 month for lapak)
  useEffect(() => {
    if (startDateStr) {
      const start = new Date(startDateStr)
      if (contractType === "WARUNG") {
        start.setFullYear(start.getFullYear() + 1)
      } else {
        start.setMonth(start.getMonth() + 1)
      }
      start.setDate(start.getDate() - 1)
      
      const year = start.getFullYear()
      const month = String(start.getMonth() + 1).padStart(2, "0")
      const day = String(start.getDate()).padStart(2, "0")
      setEndDateStr(`${year}-${month}-${day}`)
    }
  }, [startDateStr, contractType])

  // Filters based on tab and search
  const filteredContracts = contracts.filter((c) => {
    const matchesTab = c.type.toLowerCase() === activeTab
    const matchesSearch =
      c.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.number.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesSearch
  })

  // Calculate days remaining in contract
  const calculateDaysRemaining = (periodEnd: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const end = new Date(periodEnd)
    end.setHours(0, 0, 0, 0)
    
    const diffTime = end.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Handle submissions
  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormSubmitLoading(true)
    setFormError(null)
    setFormSuccess(null)

    try {
      const res = await fetch("/api/sewa-lahan/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: contractType,
          number: kavlingNumber,
          tenantName,
          phone: tenantPhone,
          shift: lapakShift,
          fee: parseFloat(rentFee),
          periodStart: startDateStr,
          periodEnd: endDateStr,
          initialPaymentAmount: parseFloat(initialPayment || "0"),
          periodCovered: paymentPeriod
        })
      })

      const result = await res.json()

      if (result.success) {
        setFormSuccess("Kontrak sewa lahan baru berhasil dicatat!")
        setKavlingNumber("")
        setTenantName("")
        setTenantPhone("")
        setRentFee("")
        setInitialPayment("")
        setPaymentPeriod("")
        
        // Open POS receipt for the initial payment
        const initialPayAmt = parseFloat(initialPayment || "0")
        if (initialPayAmt > 0) {
          setReceiptData({
            title: `Kontrak Sewa Lahan: ${contractType} ${kavlingNumber}`,
            customerName: tenantName,
            customerCode: `Kavling ${kavlingNumber}`,
            date: new Date(),
            amount: initialPayAmt,
            details: [
              { label: "Kategori Lahan", value: contractType },
              { label: "Nomor Kavling", value: kavlingNumber },
              { label: "Penyewa/Pedagang", value: tenantName },
              { label: "Tarif Sewa Acuan", value: parseFloat(rentFee) },
              { label: "Periode Kontrak", value: `${startDateStr} s.d ${endDateStr}` },
              { label: "Masa Iuran Dibayar", value: paymentPeriod || "-" }
            ],
            accounts: [
              { code: "1-1100", name: "Kas BUMDES", type: "DEBIT" },
              { code: "4-1200", name: "Pendapatan Sewa Kios / Tanah Lahan", type: "CREDIT" }
            ]
          })
          setTimeout(() => {
            setShowReceipt(true)
          }, 800)
        }

        fetchContracts()
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

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedContract) return
    setFormSubmitLoading(true)
    setFormError(null)
    setFormSuccess(null)

    try {
      const res = await fetch("/api/sewa-lahan/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractId: selectedContract.id,
          amount: parseFloat(payAmount),
          periodCovered: payPeriod
        })
      })

      const result = await res.json()

      if (result.success) {
        setFormSuccess("Pembayaran sewa berhasil dicatat!")
        setPayAmount("")
        setPayPeriod("")

        // Open POS Receipt modal
        setReceiptData({
          title: `Iuran Sewa Lahan: ${selectedContract.type} ${selectedContract.number}`,
          customerName: selectedContract.tenantName,
          customerCode: `Kavling ${selectedContract.number}`,
          date: new Date(),
          amount: parseFloat(payAmount),
          details: [
            { label: "Kavling Lahan", value: `${selectedContract.type} ${selectedContract.number}` },
            { label: "Penyewa/Pedagang", value: selectedContract.tenantName },
            { label: "Periode Sewa Dibayar", value: payPeriod },
            { label: "Tarif Sewa Bulanan/Tahunan", value: selectedContract.fee }
          ],
          accounts: [
            { code: "1-1100", name: "Kas BUMDES", type: "DEBIT" },
            { code: "4-1200", name: "Pendapatan Sewa Kios / Tanah Lahan", type: "CREDIT" }
          ]
        })
        setTimeout(() => {
          setShowReceipt(true)
        }, 800)

        fetchContracts()
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

  const handleUpdateContract = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedContract) return
    setFormSubmitLoading(true)
    setFormError(null)
    setFormSuccess(null)

    try {
      const res = await fetch("/api/sewa-lahan/contracts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedContract.id,
          tenantName: editTenantName,
          phone: editTenantPhone,
          fee: parseFloat(editRentFee)
        })
      })

      const result = await res.json()

      if (result.success) {
        setFormSuccess("Kontrak sewa lahan berhasil diperbarui!")
        fetchContracts()
        setTimeout(() => {
          setActiveModal(null)
          setFormSuccess(null)
        }, 1500)
      } else {
        throw new Error(result.error || "Gagal memperbarui kontrak")
      }
    } catch (err: any) {
      setFormError(err.message)
    } finally {
      setFormSubmitLoading(false)
    }
  }

  const handleToggleContractStatus = (contract: Contract) => {
    const isDeactivating = contract.status === "ACTIVE"
    const targetStatus = isDeactivating ? "TERMINATED" : "ACTIVE"
    
    setConfirmState({
      isOpen: true,
      title: isDeactivating ? "Nonaktifkan Kontrak" : "Aktifkan Kembali Kontrak",
      message: isDeactivating
        ? `Apakah Anda yakin ingin menonaktifkan kontrak untuk ${contract.tenantName} (${contract.type} Kav ${contract.number})? Pedagang tidak akan dapat menginput iuran baru setelah ini.`
        : `Apakah Anda yakin ingin mengaktifkan kembali kontrak untuk ${contract.tenantName} (${contract.type} Kav ${contract.number})?`,
      confirmText: isDeactivating ? "Ya, Nonaktifkan" : "Ya, Aktifkan",
      cancelText: "Batal",
      color: isDeactivating ? "rose" : "emerald",
      onConfirm: async () => {
        try {
          const res = await fetch("/api/sewa-lahan/contracts", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: contract.id,
              status: targetStatus
            })
          })
          const result = await res.json()
          if (result.success) {
            fetchContracts()
          } else {
            alert(result.error || "Gagal mengubah status kontrak")
          }
        } catch (err: any) {
          console.error(err)
          alert("Terjadi kesalahan koneksi.")
        } finally {
          setConfirmState((prev) => ({ ...prev, isOpen: false }))
        }
      }
    })
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
            Pratinjau Cetak: Laporan Kontrak Sewa Lahan ({activeTab === "warung" ? "Warung Desa" : "Lapak PKL"})
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
              className="bg-slate-700 hover:bg-slate-655 text-white font-bold px-4 py-2 rounded-xl text-xs transition active:scale-95"
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
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sewa Lahan Warung & Lapak</h1>
              <p className="text-slate-400 text-xs font-semibold mt-1">
                Kelola kavling sewa warung tahunan dan kavling lapak PKL bulanan (terbagi shift pagi dan shift malam).
              </p>
            </div>
             <div className="flex items-center gap-2">
              <button
                onClick={() => handlePrint(activeTab === "laporan" ? "laporan_lahan" : "contracts")}
                className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold px-4 py-2.5 rounded-2xl text-xs shadow-sm transition-all active:scale-95 shrink-0 w-fit"
              >
                <Printer className="w-4 h-4 text-emerald-600" />
                Cetak Laporan
              </button>
              <button
                onClick={() => {
                  setTenantName("")
                  setKavlingNumber("")
                  setRentFee("")
                  setInitialPayment("")
                  setFormError(null)
                  setFormSuccess(null)
                  setActiveModal("contract")
                }}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-2xl text-xs shadow-md shadow-emerald-600/10 transition-all active:scale-95 shrink-0 w-fit"
              >
                <Plus className="w-4 h-4" />
                Kontrak Baru
              </button>
            </div>
          </div>

          {/* Navigation & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-1">
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl w-fit">
              <button
                onClick={() => setActiveTab("warung")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "warung" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Warung Desa (Tahunan)
              </button>
              <button
                onClick={() => setActiveTab("lapak")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "lapak" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Lapak PKL (Bulanan)
              </button>
              <button
                onClick={() => setActiveTab("laporan")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "laporan" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Laporan & Rekap
              </button>
            </div>

            {activeTab !== "laporan" && (
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Cari nama pedagang atau kavling..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 focus:border-emerald-500 rounded-2xl text-xs focus:outline-none transition-all placeholder:text-slate-400 text-slate-700 shadow-sm"
                />
              </div>
            )}
          </div>

      {/* Grid List */}
      {activeTab === "laporan" ? (
        <div className="space-y-6 animate-fade-in">
          {/* Filter Bar */}
          <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm flex flex-wrap gap-4 items-center justify-between no-print">
            <div className="flex gap-3 items-center">
              <span className="text-xs font-bold text-slate-500 uppercase">Filter Laporan:</span>
              <select
                value={reportMonth}
                onChange={(e) => setReportMonth(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
              >
                <option value="all">Semua Bulan</option>
                <option value="1">Januari</option>
                <option value="2">Februari</option>
                <option value="3">Maret</option>
                <option value="4">April</option>
                <option value="5">Mei</option>
                <option value="6">Juni</option>
                <option value="7">Juli</option>
                <option value="8">Agustus</option>
                <option value="9">September</option>
                <option value="10">Oktober</option>
                <option value="11">November</option>
                <option value="12">Desember</option>
              </select>
              <select
                value={reportYear}
                onChange={(e) => setReportYear(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
              >
                <option value="all">Semua Tahun</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
              </select>
            </div>
            
            {reportLoading && (
              <span className="text-xs text-slate-400 font-semibold animate-pulse">
                Memuat data laporan...
              </span>
            )}
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Pendapatan Unit</span>
                <span className="text-xl font-bold text-emerald-600 mt-1 block">
                  {formatRupiah(lahanReportData.payments.reduce((sum, p) => sum + p.amount, 0))}
                </span>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                <TrendingDown className="w-6 h-6 rotate-180" />
              </div>
            </div>

            <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Pengeluaran Unit</span>
                <span className="text-xl font-bold text-rose-600 mt-1 block">
                  {formatRupiah(lahanReportData.expenses.reduce((sum, e) => sum + e.amount, 0))}
                </span>
              </div>
              <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
                <TrendingDown className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Laba Bersih Unit</span>
                {(() => {
                  const net = lahanReportData.payments.reduce((sum, p) => sum + p.amount, 0) - 
                              lahanReportData.expenses.reduce((sum, e) => sum + e.amount, 0)
                  return (
                    <span className={`text-xl font-bold mt-1 block ${net >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                      {formatRupiah(net)}
                    </span>
                  )
                })()}
              </div>
              <div className="p-3 bg-slate-50 text-slate-600 rounded-2xl">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pemasukan Table */}
            <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden flex flex-col">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  Rincian Penerimaan Iuran Sewa Lahan
                </h4>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                  {lahanReportData.payments.length} Transaksi
                </span>
              </div>
              <div className="overflow-x-auto flex-1 max-h-[400px]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50">
                      <th className="px-4 py-3">Tanggal</th>
                      <th className="px-4 py-3">Pedagang</th>
                      <th className="px-4 py-3">Kavling</th>
                      <th className="px-4 py-3">Periode</th>
                      <th className="px-4 py-3 text-right">Jumlah</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-[11px] text-slate-700">
                    {lahanReportData.payments.length > 0 ? (
                      lahanReportData.payments.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3">{new Date(p.date).toLocaleDateString("id-ID")}</td>
                          <td className="px-4 py-3 font-semibold">{p.tenantName}</td>
                          <td className="px-4 py-3 font-bold text-slate-655">{p.type} {p.kavlingNumber}</td>
                          <td className="px-4 py-3">{p.periodCovered}</td>
                          <td className="px-4 py-3 text-right font-bold text-emerald-655">{formatRupiah(p.amount)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-slate-400 font-semibold">
                          Tidak ada pemasukan tercatat pada periode ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pengeluaran Table */}
            <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden flex flex-col">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                  Rincian Pengeluaran Operasional Unit
                </h4>
                <span className="text-[10px] bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full font-bold">
                  {lahanReportData.expenses.length} Transaksi
                </span>
              </div>
              <div className="overflow-x-auto flex-1 max-h-[400px]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50">
                      <th className="px-4 py-3">Tanggal</th>
                      <th className="px-4 py-3">Keterangan Pengeluaran</th>
                      <th className="px-4 py-3">Kode Akun</th>
                      <th className="px-4 py-3 text-right">Jumlah</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-[11px] text-slate-700">
                    {lahanReportData.expenses.length > 0 ? (
                      lahanReportData.expenses.map((e) => (
                        <tr key={e.id} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3">{new Date(e.date).toLocaleDateString("id-ID")}</td>
                          <td className="px-4 py-3 font-semibold text-slate-700">{e.description}</td>
                          <td className="px-4 py-3 font-medium text-slate-400">{e.accountCode}</td>
                          <td className="px-4 py-3 text-right font-bold text-rose-600">{formatRupiah(e.amount)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-slate-400 font-semibold">
                          Tidak ada pengeluaran operasional tercatat pada periode ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
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
                                ? "bg-amber-55 border border-amber-200 text-amber-805"
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
                                  defaultMessage: `Halo *${contract.tenantName}*,\n\nIni adalah pengingat resmi dari pengelola BUMDES "Barokah" Balongbesuk. Masa kontrak sewa untuk *kavling ${contract.type} nomor ${contract.number}* ${remainingText}.\n\nMohon segera mengunjungi kantor BUMDES Balongbesuk untuk mengurus perpanjangan sewa atau melunasi iuran Anda. Terima kasih.`
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
      )}

      {/* --------------------- MODALS --------------------- */}

      {/* 1. Modal: Create Contract */}
      {activeModal === "contract" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-md shadow-2xl p-6 relative">
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
      )}

      {/* 2. Modal: Pay Lease Rent */}
      {activeModal === "payment" && selectedContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-md shadow-2xl p-6 relative">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-1">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              Penerimaan Iuran Sewa Lahan
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">
              Pedagang: {selectedContract.tenantName} ({selectedContract.type} Kav {selectedContract.number})
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

            <form onSubmit={handleCreatePayment} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Jumlah Pembayaran Iuran (Rp)</label>
                <input
                  type="number"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:outline-none rounded-xl text-xs text-slate-800 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Keterangan Periode Pembayaran</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Sewa Bulan Juni 2026 / Sewa Tahun Ke-2"
                  value={payPeriod}
                  onChange={(e) => setPayPeriod(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:outline-none rounded-xl text-xs text-slate-800 font-medium"
                />
              </div>

              {/* History payments */}
              {selectedContract.payments.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Riwayat Pembayaran Sebelumnya:</span>
                  <div className="max-h-28 overflow-y-auto space-y-1 pr-1 border border-slate-100 rounded-xl p-2 bg-slate-50 text-[10px] font-semibold text-slate-655">
                    {selectedContract.payments.map((p) => (
                      <div key={p.id} className="flex justify-between items-center py-1 border-b border-slate-200/50 last:border-0">
                        <span>{p.periodCovered} ({new Date(p.date).toLocaleDateString("id-ID")})</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-emerald-700">{formatRupiah(p.amount)}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setReceiptData({
                                title: `Iuran Sewa Lahan: ${selectedContract.type} ${selectedContract.number}`,
                                customerName: selectedContract.tenantName,
                                customerCode: `Kavling ${selectedContract.number}`,
                                date: p.date,
                                amount: p.amount,
                                details: [
                                  { label: "Kavling Lahan", value: `${selectedContract.type} ${selectedContract.number}` },
                                  { label: "Penyewa/Pedagang", value: selectedContract.tenantName },
                                  { label: "Periode Sewa Dibayar", value: p.periodCovered }
                                ],
                                accounts: [
                                  { code: "1-1100", name: "Kas BUMDES", type: "DEBIT" },
                                  { code: "4-1200", name: "Pendapatan Sewa Kios / Tanah Lahan", type: "CREDIT" }
                                ]
                              })
                              setShowReceipt(true)
                            }}
                            className="p-1.5 bg-slate-250 hover:bg-slate-200 text-slate-600 rounded transition"
                            title="Cetak Kuitansi"
                          >
                            <Printer className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={formSubmitLoading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all active:scale-95"
              >
                {formSubmitLoading ? "Memproses..." : "Simpan Transaksi"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. Modal: Edit Contract */}
      {activeModal === "edit_contract" && selectedContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-md shadow-2xl p-6 relative">
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
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all active:scale-95"
                >
                  {formSubmitLoading ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Modal: Custom Confirmation */}
      {confirmState.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-sm shadow-2xl p-6 relative">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className={`p-3.5 rounded-full ${
                confirmState.color === "rose" ? "bg-rose-50 text-rose-600" :
                confirmState.color === "amber" ? "bg-amber-50 text-amber-600" :
                "bg-emerald-50 text-emerald-600"
              }`}>
                {confirmState.color === "rose" ? (
                  <AlertCircle className="w-8 h-8" />
                ) : confirmState.color === "amber" ? (
                  <Info className="w-8 h-8" />
                ) : (
                  <CheckCircle className="w-8 h-8" />
                )}
              </div>
              
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 text-base">{confirmState.title}</h3>
                <p className="text-slate-500 text-xs font-medium px-2 leading-relaxed">
                  {confirmState.message}
                </p>
              </div>

              <div className="flex w-full gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmState((prev) => ({ ...prev, isOpen: false }))}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all active:scale-95"
                >
                  {confirmState.cancelText}
                </button>
                <button
                  type="button"
                  onClick={confirmState.onConfirm}
                  className={`flex-1 py-2.5 text-white font-bold rounded-xl text-xs transition-all active:scale-95 shadow-sm ${
                    confirmState.color === "rose" ? "bg-rose-600 hover:bg-rose-700 shadow-rose-600/10" :
                    confirmState.color === "amber" ? "bg-amber-600 hover:bg-amber-700 shadow-amber-600/10" :
                    "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/10"
                  }`}
                >
                  {confirmState.confirmText}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POS Thermal Receipt Render Overlay */}
      <KwitansiModal
        isOpen={showReceipt}
        onClose={() => setShowReceipt(false)}
        {...receiptData}
      />

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
            <h1 className="text-xl font-bold uppercase tracking-wide text-slate-900">BUMDES "BAROKAH" BALONGBESUK</h1>
            <p className="text-xs font-semibold text-slate-500">Desa Balongbesuk, Kecamatan Diwek, Kabupaten Jombang</p>
            <p className="text-[10px] text-slate-400 font-medium">Jawa Timur, Indonesia - Kode Pos 61471</p>
          </div>

          {printType === "laporan_lahan" ? (
            <div className="space-y-6">
              <div className="text-center space-y-1.5">
                <h2 className="text-sm font-bold uppercase text-slate-800">
                  LAPORAN REALISASI KEGIATAN & KEUANGAN UNIT SEWA LAHAN
                </h2>
                <p className="text-[11px] font-semibold text-slate-500">
                  Periode: {reportMonth === "all" ? "Semua Bulan" : new Date(2026, parseInt(reportMonth) - 1, 1).toLocaleDateString("id-ID", { month: "long" })} {reportYear === "all" ? "Semua Tahun" : reportYear}
                </p>
              </div>

              {/* Rincian Pemasukan */}
              <div className="space-y-2">
                <h3 className="font-bold text-xs border-b border-slate-300 pb-1 uppercase">I. PENERIMAAN / PEMASUKAN UNIT</h3>
                <table className="w-full border-collapse border border-slate-350 text-[10px]">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700 font-bold">
                      <th className="border border-slate-350 px-2 py-1.5 text-center w-8">No</th>
                      <th className="border border-slate-350 px-2 py-1.5 text-left">Tanggal</th>
                      <th className="border border-slate-350 px-2 py-1.5 text-left">Pedagang</th>
                      <th className="border border-slate-350 px-2 py-1.5 text-left">Kavling</th>
                      <th className="border border-slate-350 px-2 py-1.5 text-left">Keterangan Periode</th>
                      <th className="border border-slate-350 px-2 py-1.5 text-right">Nominal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lahanReportData.payments.length > 0 ? (
                      lahanReportData.payments.map((p, index) => (
                        <tr key={p.id}>
                          <td className="border border-slate-350 px-2 py-1.5 text-center">{index + 1}</td>
                          <td className="border border-slate-350 px-2 py-1.5">{new Date(p.date).toLocaleDateString("id-ID")}</td>
                          <td className="border border-slate-350 px-2 py-1.5 font-bold">{p.tenantName}</td>
                          <td className="border border-slate-350 px-2 py-1.5">{p.type} {p.kavlingNumber}</td>
                          <td className="border border-slate-350 px-2 py-1.5">{p.periodCovered}</td>
                          <td className="border border-slate-350 px-2 py-1.5 text-right">{formatRupiah(p.amount)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="border border-slate-350 px-2 py-8 text-center text-slate-400">Tidak ada pemasukan tercatat.</td>
                      </tr>
                    )}
                    <tr className="font-bold bg-slate-50">
                      <td colSpan={5} className="border border-slate-350 px-2 py-1.5 text-right uppercase">Total Pemasukan:</td>
                      <td className="border border-slate-350 px-2 py-1.5 text-right">{formatRupiah(lahanReportData.payments.reduce((sum, p) => sum + p.amount, 0))}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Rincian Pengeluaran */}
              <div className="space-y-2">
                <h3 className="font-bold text-xs border-b border-slate-300 pb-1 uppercase">II. PENGELUARAN OPERASIONAL UNIT</h3>
                <table className="w-full border-collapse border border-slate-350 text-[10px]">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700 font-bold">
                      <th className="border border-slate-350 px-2 py-1.5 text-center w-8">No</th>
                      <th className="border border-slate-350 px-2 py-1.5 text-left">Tanggal</th>
                      <th className="border border-slate-350 px-2 py-1.5 text-left">Keterangan</th>
                      <th className="border border-slate-350 px-2 py-1.5 text-left">Kode Akun</th>
                      <th className="border border-slate-350 px-2 py-1.5 text-right">Nominal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lahanReportData.expenses.length > 0 ? (
                      lahanReportData.expenses.map((e, index) => (
                        <tr key={e.id}>
                          <td className="border border-slate-350 px-2 py-1.5 text-center">{index + 1}</td>
                          <td className="border border-slate-350 px-2 py-1.5">{new Date(e.date).toLocaleDateString("id-ID")}</td>
                          <td className="border border-slate-350 px-2 py-1.5">{e.description}</td>
                          <td className="border border-slate-350 px-2 py-1.5">{e.accountCode}</td>
                          <td className="border border-slate-350 px-2 py-1.5 text-right">{formatRupiah(e.amount)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="border border-slate-350 px-2 py-8 text-center text-slate-400">Tidak ada pengeluaran operasional tercatat.</td>
                      </tr>
                    )}
                    <tr className="font-bold bg-slate-50">
                      <td colSpan={4} className="border border-slate-350 px-2 py-1.5 text-right uppercase">Total Pengeluaran:</td>
                      <td className="border border-slate-350 px-2 py-1.5 text-right">{formatRupiah(lahanReportData.expenses.reduce((sum, e) => sum + e.amount, 0))}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Ringkasan Bersih */}
              <div className="p-3 bg-slate-50 border border-slate-300 rounded-lg flex justify-between items-center text-[11px] font-bold">
                <span>LABA BERSIH OPERASIONAL UNIT (SURPLUS/DEFISIT):</span>
                <span>
                  {formatRupiah(
                    lahanReportData.payments.reduce((sum, p) => sum + p.amount, 0) - 
                    lahanReportData.expenses.reduce((sum, e) => sum + e.amount, 0)
                  )}
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center space-y-1.5">
                <h2 className="text-sm font-bold uppercase text-slate-800">
                  LAPORAN REKAPITULASI KONTRAK SEWA LAHAN ({activeTab === "warung" ? "WARUNG DESA" : "LAPAK PKL"})
                </h2>
                <p className="text-[11px] font-semibold text-slate-500">
                  Tanggal Cetak: {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>

              <table className="w-full border-collapse border border-slate-350 text-[11px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-bold">
                    <th className="border border-slate-350 px-3 py-2 text-center w-8">No</th>
                    <th className="border border-slate-350 px-3 py-2 text-center">No. Kavling</th>
                    <th className="border border-slate-350 px-3 py-2 text-left">Nama Penyewa / Pedagang</th>
                    <th className="border border-slate-350 px-3 py-2 text-left">No. Telepon</th>
                    {activeTab === "lapak" && (
                      <th className="border border-slate-350 px-3 py-2 text-center">Shift</th>
                    )}
                    <th className="border border-slate-350 px-3 py-2 text-right">Tarif Sewa</th>
                    <th className="border border-slate-350 px-3 py-2 text-left">Periode Sewa (Masa Kontrak)</th>
                    <th className="border border-slate-350 px-3 py-2 text-center">Sisa Hari</th>
                    <th className="border border-slate-350 px-3 py-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContracts.map((c, index) => {
                    const pStart = new Date(c.periodStart).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                    const pEnd = new Date(c.periodEnd).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                    const daysRemaining = calculateDaysRemaining(c.periodEnd)
                    return (
                      <tr key={c.id} className="hover:bg-slate-50/50">
                        <td className="border border-slate-355 px-3 py-2 text-center">{index + 1}</td>
                        <td className="border border-slate-355 px-3 py-2 text-center font-bold text-slate-800">{c.number}</td>
                        <td className="border border-slate-355 px-3 py-2 font-medium">{c.tenantName}</td>
                        <td className="border border-slate-355 px-3 py-2">{c.phone || "-"}</td>
                        {activeTab === "lapak" && (
                          <td className="border border-slate-355 px-3 py-2 text-center font-semibold">{c.shift}</td>
                        )}
                        <td className="border border-slate-355 px-3 py-2 text-right font-medium">{formatRupiah(c.fee)}</td>
                        <td className="border border-slate-355 px-3 py-2">
                          {pStart} s.d {pEnd}
                        </td>
                        <td className="border border-slate-355 px-3 py-2 text-center font-semibold">
                          {daysRemaining > 0 ? `${daysRemaining} Hari` : "Habis"}
                        </td>
                        <td className="border border-slate-355 px-3 py-2 text-center">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${c.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                  <tr className="bg-slate-50 font-bold">
                    <td colSpan={activeTab === "lapak" ? 5 : 4} className="border border-slate-350 px-3 py-2 text-right uppercase">Total Seluruh Sewa:</td>
                    <td className="border border-slate-350 px-3 py-2 text-right">
                      {formatRupiah(filteredContracts.reduce((sum, c) => sum + c.fee, 0))}
                    </td>
                    <td className="border border-slate-350 px-3 py-2"></td>
                    <td className="border border-slate-350 px-3 py-2"></td>
                    <td className="border border-slate-350 px-3 py-2"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Tanda Tangan Section */}
          <div className="mt-12 grid grid-cols-2 text-center text-[11px] font-medium leading-relaxed">
            <div>
              <p className="mb-16">Mengetahui,<br /><b>Ketua BUMDES "Barokah"</b></p>
              <p className="underline font-bold">Desa Balongbesuk</p>
            </div>
            <div>
              <p className="mb-16">Balongbesuk, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}<br /><b>Operator Unit Sewa Lahan</b></p>
              <p className="underline font-bold">BUMDES Barokah</p>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

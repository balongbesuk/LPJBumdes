"use client"

import React, { useState, useEffect } from "react"
import {
  Map,
  Plus,
  Search,
  Printer,
  CheckCircle,
  AlertCircle,
  Info,
} from "lucide-react"
import { formatRupiah } from "@/lib/utils"
import KwitansiModal from "@/components/KwitansiModal"
import WaNotificationModal from "@/components/WaNotificationModal"
import { useSettings } from "@/context/SettingsContext"

// Sub-components
import LahanTable from "./components/LahanTable"
import LahanReportTab from "./components/LahanReportTab"
import LahanContractModal from "./components/LahanContractModal"
import LahanPaymentModal from "./components/LahanPaymentModal"

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
  const settings = useSettings()
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

          {/* Loader or dynamic tabs */}
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 border-4 border-emerald-650 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-400 font-semibold text-xs animate-pulse">Memproses data sewa lahan...</p>
            </div>
          ) : error ? (
            <div className="p-6 bg-rose-50 border border-rose-100 rounded-3xl text-rose-800">
              <p className="font-bold text-sm">Terjadi Kesalahan</p>
              <p className="mt-1 text-xs font-semibold text-rose-600">{error}</p>
            </div>
          ) : activeTab === "laporan" ? (
            <LahanReportTab
              reportMonth={reportMonth}
              setReportMonth={setReportMonth}
              reportYear={reportYear}
              setReportYear={setReportYear}
              reportLoading={reportLoading}
              lahanReportData={lahanReportData}
            />
          ) : (
            <LahanTable
              filteredContracts={filteredContracts}
              activeTab={activeTab}
              settings={settings}
              setSelectedContract={setSelectedContract}
              setPayAmount={setPayAmount}
              setPayPeriod={setPayPeriod}
              setFormError={setFormError}
              setFormSuccess={setFormSuccess}
              setActiveModal={setActiveModal}
              setEditTenantName={setEditTenantName}
              setEditTenantPhone={setEditTenantPhone}
              setEditRentFee={setEditRentFee}
              handleToggleContractStatus={handleToggleContractStatus}
              setWaModalData={setWaModalData}
              setShowWaModal={setShowWaModal}
            />
          )}

          {/* Modals Container */}
          <LahanContractModal
            activeModal={activeModal}
            selectedContract={selectedContract}
            setActiveModal={setActiveModal}
            formError={formError}
            formSuccess={formSuccess}
            formSubmitLoading={formSubmitLoading}
            handleCreateContract={handleCreateContract}
            handleUpdateContract={handleUpdateContract}
            contractType={contractType}
            setContractType={setContractType}
            kavlingNumber={kavlingNumber}
            setKavlingNumber={setKavlingNumber}
            lapakShift={lapakShift}
            setLapakShift={setLapakShift}
            tenantName={tenantName}
            setTenantName={setTenantName}
            tenantPhone={tenantPhone}
            setTenantPhone={setTenantPhone}
            rentFee={rentFee}
            setRentFee={setRentFee}
            startDateStr={startDateStr}
            setStartDateStr={setStartDateStr}
            endDateStr={endDateStr}
            initialPayment={initialPayment}
            setInitialPayment={setInitialPayment}
            paymentPeriod={paymentPeriod}
            setPaymentPeriod={setPaymentPeriod}
            editTenantName={editTenantName}
            setEditTenantName={setEditTenantName}
            editTenantPhone={editTenantPhone}
            setEditTenantPhone={setEditTenantPhone}
            editRentFee={editRentFee}
            setEditRentFee={setEditRentFee}
          />

          <LahanPaymentModal
            activeModal={activeModal}
            selectedContract={selectedContract}
            setActiveModal={setActiveModal}
            formError={formError}
            formSuccess={formSuccess}
            formSubmitLoading={formSubmitLoading}
            payAmount={payAmount}
            setPayAmount={setPayAmount}
            payPeriod={payPeriod}
            setPayPeriod={setPayPeriod}
            handleCreatePayment={handleCreatePayment}
            setReceiptData={setReceiptData}
            setShowReceipt={setShowReceipt}
          />

          {/* Custom Confirmation Modal */}
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

          {/* POS Receipt Overlay */}
          <KwitansiModal
            isOpen={showReceipt}
            onClose={() => setShowReceipt(false)}
            bumdesName={settings?.bumdes_name}
            locationText={settings?.village_name ? `Desa ${settings.village_name}, Kec. ${settings.district_name}` : ""}
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
            <h1 className="text-xl font-bold uppercase tracking-wide text-slate-900">{settings?.bumdes_name || "BUMDES"}</h1>
            <p className="text-xs font-semibold text-slate-500">
              {settings?.village_name ? `Desa ${settings.village_name}, Kecamatan ${settings.district_name}, Kabupaten ${settings.regency_name}` : ""}
            </p>
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
                <table className="w-full border-collapse border border-slate-300 text-[10px]">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700 font-bold">
                      <th className="border border-slate-300 px-2 py-1.5 text-center w-8">No</th>
                      <th className="border border-slate-300 px-2 py-1.5 text-left">Tanggal</th>
                      <th className="border border-slate-300 px-2 py-1.5 text-left">Pedagang</th>
                      <th className="border border-slate-300 px-2 py-1.5 text-left">Kavling</th>
                      <th className="border border-slate-300 px-2 py-1.5 text-left">Keterangan Periode</th>
                      <th className="border border-slate-300 px-2 py-1.5 text-right">Nominal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lahanReportData.payments.length > 0 ? (
                      lahanReportData.payments.map((p, index) => (
                        <tr key={p.id}>
                          <td className="border border-slate-300 px-2 py-1.5 text-center">{index + 1}</td>
                          <td className="border border-slate-300 px-2 py-1.5">{new Date(p.date).toLocaleDateString("id-ID")}</td>
                          <td className="border border-slate-300 px-2 py-1.5 font-bold">{p.tenantName}</td>
                          <td className="border border-slate-300 px-2 py-1.5">{p.type} {p.kavlingNumber}</td>
                          <td className="border border-slate-300 px-2 py-1.5">{p.periodCovered}</td>
                          <td className="border border-slate-300 px-2 py-1.5 text-right">{formatRupiah(p.amount)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="border border-slate-300 px-2 py-8 text-center text-slate-400">Tidak ada pemasukan tercatat.</td>
                      </tr>
                    )}
                    <tr className="font-bold bg-slate-50">
                      <td colSpan={5} className="border border-slate-300 px-2 py-1.5 text-right uppercase">Total Pemasukan:</td>
                      <td className="border border-slate-300 px-2 py-1.5 text-right">{formatRupiah(lahanReportData.payments.reduce((sum, p) => sum + p.amount, 0))}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Rincian Pengeluaran */}
              <div className="space-y-2">
                <h3 className="font-bold text-xs border-b border-slate-300 pb-1 uppercase">II. PENGELUARAN OPERASIONAL UNIT</h3>
                <table className="w-full border-collapse border border-slate-300 text-[10px]">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700 font-bold">
                      <th className="border border-slate-300 px-2 py-1.5 text-center w-8">No</th>
                      <th className="border border-slate-300 px-2 py-1.5 text-left">Tanggal</th>
                      <th className="border border-slate-300 px-2 py-1.5 text-left">Keterangan</th>
                      <th className="border border-slate-300 px-2 py-1.5 text-left">Kode Akun</th>
                      <th className="border border-slate-300 px-2 py-1.5 text-right">Nominal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lahanReportData.expenses.length > 0 ? (
                      lahanReportData.expenses.map((e, index) => (
                        <tr key={e.id}>
                          <td className="border border-slate-300 px-2 py-1.5 text-center">{index + 1}</td>
                          <td className="border border-slate-300 px-2 py-1.5">{new Date(e.date).toLocaleDateString("id-ID")}</td>
                          <td className="border border-slate-300 px-2 py-1.5">{e.description}</td>
                          <td className="border border-slate-300 px-2 py-1.5">{e.accountCode}</td>
                          <td className="border border-slate-300 px-2 py-1.5 text-right">{formatRupiah(e.amount)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="border border-slate-300 px-2 py-8 text-center text-slate-400">Tidak ada pengeluaran operasional tercatat.</td>
                      </tr>
                    )}
                    <tr className="font-bold bg-slate-50">
                      <td colSpan={4} className="border border-slate-300 px-2 py-1.5 text-right uppercase">Total Pengeluaran:</td>
                      <td className="border border-slate-300 px-2 py-1.5 text-right">{formatRupiah(lahanReportData.expenses.reduce((sum, e) => sum + e.amount, 0))}</td>
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

              <table className="w-full border-collapse border border-slate-300 text-[11px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-bold">
                    <th className="border border-slate-300 px-3 py-2 text-center w-8">No</th>
                    <th className="border border-slate-300 px-3 py-2 text-center">No. Kavling</th>
                    <th className="border border-slate-300 px-3 py-2 text-left">Nama Penyewa / Pedagang</th>
                    <th className="border border-slate-300 px-3 py-2 text-left">No. Telepon</th>
                    {activeTab === "lapak" && (
                      <th className="border border-slate-300 px-3 py-2 text-center">Shift</th>
                    )}
                    <th className="border border-slate-300 px-3 py-2 text-right">Tarif Sewa</th>
                    <th className="border border-slate-300 px-3 py-2 text-left">Periode Sewa (Masa Kontrak)</th>
                    <th className="border border-slate-300 px-3 py-2 text-center">Sisa Hari</th>
                    <th className="border border-slate-300 px-3 py-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContracts.map((c, index) => {
                    const pStart = new Date(c.periodStart).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                    const pEnd = new Date(c.periodEnd).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                    const daysRemaining = calculateDaysRemaining(c.periodEnd)
                    return (
                      <tr key={c.id} className="hover:bg-slate-50/50">
                        <td className="border border-slate-300 px-3 py-2 text-center">{index + 1}</td>
                        <td className="border border-slate-300 px-3 py-2 text-center font-bold text-slate-800">{c.number}</td>
                        <td className="border border-slate-300 px-3 py-2 font-medium">{c.tenantName}</td>
                        <td className="border border-slate-300 px-3 py-2">{c.phone || "-"}</td>
                        {activeTab === "lapak" && (
                          <td className="border border-slate-300 px-3 py-2 text-center font-semibold">{c.shift}</td>
                        )}
                        <td className="border border-slate-300 px-3 py-2 text-right font-medium">{formatRupiah(c.fee)}</td>
                        <td className="border border-slate-300 px-3 py-2">
                          {pStart} s.d {pEnd}
                        </td>
                        <td className="border border-slate-300 px-3 py-2 text-center font-semibold">
                          {daysRemaining > 0 ? `${daysRemaining} Hari` : "Habis"}
                        </td>
                        <td className="border border-slate-300 px-3 py-2 text-center">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${c.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                  <tr className="bg-slate-50 font-bold">
                    <td colSpan={activeTab === "lapak" ? 5 : 4} className="border border-slate-300 px-3 py-2 text-right uppercase">Total Seluruh Sewa:</td>
                    <td className="border border-slate-300 px-3 py-2 text-right">
                      {formatRupiah(filteredContracts.reduce((sum, c) => sum + c.fee, 0))}
                    </td>
                    <td className="border border-slate-300 px-3 py-2"></td>
                    <td className="border border-slate-300 px-3 py-2"></td>
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
              <p className="mb-16">{settings?.village_name || "Desa"}, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}<br /><b>Operator Unit Sewa Lahan</b></p>
              <p className="underline font-bold">{settings?.bumdes_name || "BUMDES"}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

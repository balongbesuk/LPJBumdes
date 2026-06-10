import React from "react"
import { X, Printer } from "lucide-react"
import { formatRupiah } from "@/lib/utils"

interface KwitansiModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  customerName: string
  customerCode?: string | null
  date: string | Date
  amount: number
  details: { label: string; value: string | number }[]
  accounts?: { code: string; name: string; type: "DEBIT" | "CREDIT" }[]
}

export default function KwitansiModal({
  isOpen,
  onClose,
  title,
  customerName,
  customerCode,
  date,
  amount,
  details,
  accounts
}: KwitansiModalProps) {
  if (!isOpen) return null

  const formattedDate = new Date(date).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short"
  })

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm no-print">
      {/* Modal Container */}
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-50">
          <span className="text-sm font-bold text-slate-800">Pratinjau Kuitansi</span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content - Receipt Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 flex justify-center bg-slate-50/50">
          {/* Thermal Slip */}
          <div className="print-receipt-content w-[76mm] bg-white border border-slate-200 p-5 shadow-sm font-mono text-[11px] text-slate-800 space-y-4">
            {/* Header POS */}
            <div className="text-center space-y-1">
              <h2 className="text-xs font-bold uppercase tracking-tight text-slate-900">BUMDES "BAROKAH"</h2>
              <p className="text-[9px] text-slate-500 uppercase leading-none font-bold">BALONGBESUK DIWEK JOMBANG</p>
              <p className="text-[8px] text-slate-400 font-semibold leading-tight">Telepon: - | Kantor Desa Balongbesuk</p>
              <div className="border-b border-dashed border-slate-300 my-2 pt-1" />
            </div>

            {/* Receipt Info */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>TANGGAL:</span>
                <span className="font-bold">{formattedDate}</span>
              </div>
              <div className="flex justify-between">
                <span>URAIAN:</span>
                <span className="font-bold text-right uppercase max-w-[150px] truncate">{title}</span>
              </div>
              <div className="flex justify-between">
                <span>PENERIMA:</span>
                <span className="font-bold uppercase">{customerName} {customerCode ? `(${customerCode})` : ""}</span>
              </div>
              <div className="border-b border-dashed border-slate-300 my-2 pt-1" />
            </div>

            {/* Receipt Details */}
            <div className="space-y-1.5">
              <span className="font-bold text-[9px] uppercase tracking-wider block text-slate-400">RINCIAN TRANSAKSI</span>
              {details.map((d, index) => (
                <div key={index} className="flex justify-between leading-snug">
                  <span className="uppercase text-slate-500">{d.label}:</span>
                  <span className="font-bold text-slate-900">
                    {typeof d.value === "number" && (d.label.toLowerCase().includes("jumlah") || d.label.toLowerCase().includes("pokok") || d.label.toLowerCase().includes("bunga") || d.label.toLowerCase().includes("jasa") || d.label.toLowerCase().includes("biaya") || d.label.toLowerCase().includes("bayar") || d.label.toLowerCase().includes("tarif"))
                      ? formatRupiah(d.value)
                      : d.value}
                  </span>
                </div>
              ))}
              <div className="border-b border-dashed border-slate-300 my-2 pt-1" />
            </div>

            {/* Receipt Total */}
            <div className="flex justify-between items-center text-xs font-bold text-slate-900 bg-slate-50 p-2 rounded border border-slate-100">
              <span>TOTAL BAYAR:</span>
              <span>{formatRupiah(amount)}</span>
            </div>

            {/* Ledger postings */}
            {accounts && accounts.length > 0 && (
              <div className="space-y-1 pt-1">
                <span className="font-bold text-[8px] uppercase tracking-wider block text-slate-400 font-mono">POSTING JURNAL BUKU BESAR</span>
                {accounts.map((acc, index) => (
                  <div key={index} className="flex justify-between text-[8px] text-slate-500 font-semibold font-mono leading-none">
                    <span>{acc.type === "DEBIT" ? "DR" : "CR"}: {acc.code}</span>
                    <span className="truncate max-w-[130px]">{acc.name}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Footer POS */}
            <div className="text-center pt-4 space-y-1">
              <div className="border-b border-dashed border-slate-300 my-2" />
              <p className="font-bold text-[9px] text-slate-800 uppercase">TERIMA KASIH</p>
              <p className="text-[8px] text-slate-400 font-semibold">Simpan bukti pembayaran ini sebagai tanda bukti sah.</p>
              <p className="text-[7.5px] text-slate-300 font-semibold leading-none mt-1">Sistem Informasi BUMDES Barokah</p>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-5 border-t border-slate-50 bg-slate-50/50 rounded-b-3xl flex items-center justify-end">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-2xl text-xs shadow-md shadow-emerald-600/10 transition active:scale-95 no-print-button"
          >
            <Printer className="w-4 h-4" />
            Cetak Kuitansi
          </button>
        </div>

        {/* Scoped CSS for print layout */}
        <style jsx global>{`
          @media print {
            body * {
              visibility: hidden;
            }
            .print-receipt-content, .print-receipt-content * {
              visibility: visible;
            }
            .print-receipt-content {
              position: absolute;
              left: 50%;
              top: 0;
              transform: translateX(-50%);
              width: 76mm !important;
              padding: 10px !important;
              margin: 0 !important;
              box-shadow: none !important;
              border: none !important;
              background: white !important;
              color: black !important;
            }
            .no-print-button {
              display: none !important;
            }
          }
        `}</style>
      </div>
    </div>
  )
}

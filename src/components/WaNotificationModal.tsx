import React, { useState, useEffect } from "react"
import { X, Send, Phone, MessageSquare } from "lucide-react"

interface WaNotificationModalProps {
  isOpen: boolean
  onClose: () => void
  recipientName: string
  defaultPhone: string
  defaultMessage: string
}

export default function WaNotificationModal({
  isOpen,
  onClose,
  recipientName,
  defaultPhone,
  defaultMessage
}: WaNotificationModalProps) {
  const [phone, setPhone] = useState("")
  const [message, setMessage] = useState("")

  useEffect(() => {
    // Format phone to 628...
    let formattedPhone = defaultPhone || ""
    // Remove all non-numeric characters
    formattedPhone = formattedPhone.replace(/\D/g, "")
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "62" + formattedPhone.slice(1)
    } else if (formattedPhone && !formattedPhone.startsWith("62")) {
      formattedPhone = "62" + formattedPhone
    }
    
    setPhone(formattedPhone)
    setMessage(defaultMessage || "")
  }, [defaultPhone, defaultMessage, isOpen])

  if (!isOpen) return null

  const handleSend = () => {
    // Basic phone validation
    let finalPhone = phone.replace(/\D/g, "")
    if (!finalPhone) {
      alert("Harap masukkan nomor WhatsApp yang valid")
      return
    }

    const waUrl = `https://api.whatsapp.com/send?phone=${finalPhone}&text=${encodeURIComponent(message)}`
    window.open(waUrl, "_blank")
    onClose()
  }

  return (
    <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
            <span className="font-bold text-slate-800 text-sm">Kirim Pengingat WhatsApp</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div className="text-xs text-slate-500 font-semibold leading-relaxed">
            Kirimkan notifikasi tagihan secara manual untuk nasabah <span className="font-bold text-slate-700">{recipientName}</span>. Sistem akan menyusun tautan template percakapan instan.
          </div>

          {/* Input Phone */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Nomor WhatsApp Tujuan
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Phone className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Contoh: 628123456789"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl text-xs transition-all focus:outline-none focus:ring-4 focus:ring-emerald-500/10 text-slate-850 font-bold"
              />
            </div>
            <span className="text-[9px] text-slate-400 block font-medium leading-none">
              Format internasional (awali dengan 62). Contoh: 628123456789
            </span>
          </div>

          {/* Input Message */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Pesan Notifikasi
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl text-xs transition-all focus:outline-none focus:ring-4 focus:ring-emerald-500/10 text-slate-750 font-semibold"
            />
          </div>

          {/* Info Banner */}
          <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-2xl text-[10px] text-emerald-800 font-semibold">
            Pemberitahuan: Sistem menggunakan metode 100% offline Click-to-Chat. Tautan ini akan membuka halaman browser WhatsApp Web atau aplikasi WhatsApp Anda untuk menyelesaikan pengiriman pesan.
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold border border-slate-200 rounded-xl text-xs transition"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSend}
            className="flex-[2] py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-650/10 transition-all flex items-center justify-center gap-1.5 active:scale-98"
          >
            <Send className="w-3.5 h-3.5" />
            Buka WhatsApp & Kirim
          </button>
        </div>

      </div>
    </div>
  )
}

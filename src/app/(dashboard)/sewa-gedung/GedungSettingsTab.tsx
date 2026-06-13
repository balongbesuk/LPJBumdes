"use client"

import React, { useState, useEffect } from "react"
import { useSettings, invalidateSettingsCache } from "@/context/SettingsContext"
import { Save, Loader2, CheckCircle, AlertCircle } from "lucide-react"

export default function GedungSettingsTab() {
  const settings = useSettings() as any
  const [waNumber, setWaNumber] = useState("")
  
  // Page Content Settings
  const [descriptionPage, setDescriptionPage] = useState("")
  const [facilitiesPage, setFacilitiesPage] = useState("")
  const [ratesPage, setRatesPage] = useState("")

  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    if (settings) {
      setWaNumber(settings.sewa_gedung_whatsapp || "")
      setDescriptionPage(settings.sewa_gedung_description || "")
      setFacilitiesPage(settings.sewa_gedung_facilities || "")
      setRatesPage(settings.sewa_gedung_rates || "")
    }
  }, [settings])

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      const payload = {
        sewa_gedung_whatsapp: waNumber,
        sewa_gedung_description: descriptionPage,
        sewa_gedung_facilities: facilitiesPage,
        sewa_gedung_rates: ratesPage
      }
      
      const res = await fetch("/api/pengaturan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      
      const result = await res.json()
      if (result.success) {
        invalidateSettingsCache()
        setMessage({ type: "success", text: "Pengaturan unit Sewa Gedung berhasil disimpan!" })
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        throw new Error(result.error || "Gagal menyimpan pengaturan")
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Terjadi kesalahan" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-lg animate-fade-in">
      {message && (
        <div className={`p-4 border rounded-2xl flex items-center gap-2.5 text-xs font-bold shadow-sm ${
          message.type === "success" ? "bg-emerald-50 border-emerald-100 text-emerald-800" : "bg-rose-50 border-rose-100 text-rose-805"
        }`}>
          {message.type === "success" ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <AlertCircle className="w-5 h-5 text-rose-500" />}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-sm">Pengaturan Konten & Kontak</h3>
        <p className="text-slate-400 text-[11px] font-semibold leading-relaxed">
          Masukkan informasi kontak dan isi konten untuk halaman detail Sewa Gedung Serba Guna.
        </p>
        
        <div className="space-y-3 pt-2">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">No. WhatsApp Petugas</label>
            <input
              type="text"
              value={waNumber}
              onChange={(e) => setWaNumber(e.target.value)}
              placeholder="Contoh: 6281234567891"
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl text-xs font-semibold text-slate-800"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Deskripsi Layanan</label>
            <textarea
              value={descriptionPage}
              onChange={(e) => setDescriptionPage(e.target.value)}
              placeholder="Deskripsi ringkas unit usaha sewa gedung..."
              rows={4}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl text-xs text-slate-800 font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Fasilitas Gedung (Pisahkan dengan baris baru)</label>
            <textarea
              value={facilitiesPage}
              onChange={(e) => setFacilitiesPage(e.target.value)}
              placeholder="Contoh:&#10;Area Hall kapasitas 800 orang&#10;Lapangan Badminton Indoor (2 line)&#10;Toilet bersih & area parkir luas"
              rows={3}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl text-xs text-slate-800 font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Jenis Acara & Tarif (Pisahkan dengan baris baru)</label>
            <textarea
              value={ratesPage}
              onChange={(e) => setRatesPage(e.target.value)}
              placeholder="Contoh:&#10;Olahraga Bulutangkis: Rp 20.000 / jam per lapangan&#10;Acara Resepsi Pernikahan: Rp 1.500.000 / hari&#10;Rapat / Seminar Desa: Rp 500.000 / hari"
              rows={3}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl text-xs text-slate-800 font-medium"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold px-6 py-3 rounded-2xl text-xs shadow-md shadow-emerald-600/10 transition active:scale-98"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                Simpan Pengaturan
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

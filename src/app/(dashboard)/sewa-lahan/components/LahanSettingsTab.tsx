"use client"

import React, { useState, useEffect } from "react"
import { useSettings, invalidateSettingsCache } from "@/context/SettingsContext"
import { Save, Loader2, CheckCircle, AlertCircle, Trash2, Plus, Edit, Upload } from "lucide-react"

interface UmkmItem {
  id: string
  name: string
  owner: string
  category: string
  description: string
  phone: string
  imageUrl: string
}

export default function LahanSettingsTab() {
  const settings = useSettings() as any
  const [waNumber, setWaNumber] = useState("")
  
  // Page Content Settings
  const [descriptionPage, setDescriptionPage] = useState("")
  const [ratesPage, setRatesPage] = useState("")
  const [requirementsPage, setRequirementsPage] = useState("")
  
  const [umkmList, setUmkmList] = useState<UmkmItem[]>([])
  
  // UMKM Editor Modal/Form State
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  // Form fields
  const [name, setName] = useState("")
  const [owner, setOwner] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [phone, setPhone] = useState("")
  const [imageUrl, setImageUrl] = useState("/umkm/kripik_singkong.png") // default

  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    if (settings) {
      setWaNumber(settings.sewa_lahan_whatsapp || "")
      setDescriptionPage(settings.sewa_lahan_description || "")
      setRatesPage(settings.sewa_lahan_rates || "")
      setRequirementsPage(settings.sewa_lahan_requirements || "")
      try {
        if (settings.umkm_list) {
          setUmkmList(JSON.parse(settings.umkm_list))
        } else {
          setUmkmList([])
        }
      } catch (e) {
        console.error("Error parsing umkm_list", e)
        setUmkmList([])
      }
    }
  }, [settings])

  const handleOpenAdd = () => {
    setEditingId(null)
    setName("")
    setOwner("")
    setCategory("")
    setDescription("")
    setPhone("")
    setImageUrl("/umkm/kripik_singkong.png")
    setShowForm(true)
  }

  const handleOpenEdit = (item: UmkmItem) => {
    setEditingId(item.id)
    setName(item.name)
    setOwner(item.owner)
    setCategory(item.category)
    setDescription(item.description)
    setPhone(item.phone)
    setImageUrl(item.imageUrl)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus produk UMKM ini dari Pojok UMKM?")) {
      const updated = umkmList.filter(item => item.id !== id)
      setUmkmList(updated)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      })
      const result = await res.json()
      if (result.success && result.url) {
        setImageUrl(result.url)
      } else {
        alert(result.error || "Gagal mengunggah gambar")
      }
    } catch (err) {
      console.error(err)
      alert("Terjadi kesalahan saat mengunggah gambar")
    } finally {
      setUploading(false)
    }
  }

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      const updated = umkmList.map(item => {
        if (item.id === editingId) {
          return { ...item, name, owner, category, description, phone, imageUrl }
        }
        return item
      })
      setUmkmList(updated)
    } else {
      const newItem: UmkmItem = {
        id: `umkm-${Date.now()}`,
        name,
        owner,
        category,
        description,
        phone,
        imageUrl
      }
      setUmkmList([...umkmList, newItem])
    }
    setShowForm(false)
  }

  const handleSaveAllSettings = async () => {
    setSaving(true)
    setMessage(null)
    try {
      const payload = {
        sewa_lahan_whatsapp: waNumber,
        sewa_lahan_description: descriptionPage,
        sewa_lahan_rates: ratesPage,
        sewa_lahan_requirements: requirementsPage,
        umkm_list: JSON.stringify(umkmList)
      }
      
      const res = await fetch("/api/pengaturan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      
      const result = await res.json()
      if (result.success) {
        invalidateSettingsCache()
        setMessage({ type: "success", text: "Pengaturan unit Sewa Lahan & Pojok UMKM berhasil disimpan!" })
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
    <div className="space-y-6">
      {message && (
        <div className={`p-4 border rounded-2xl flex items-center gap-2.5 text-xs font-bold shadow-sm animate-fade-in ${
          message.type === "success" ? "bg-emerald-50 border-emerald-100 text-emerald-800" : "bg-rose-50 border-rose-100 text-rose-805"
        }`}>
          {message.type === "success" ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <AlertCircle className="w-5 h-5 text-rose-500" />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* WhatsApp & Page Content Settings */}
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-4 lg:col-span-1">
          <h3 className="font-bold text-slate-900 text-sm">Pengaturan Konten & Kontak</h3>
          <p className="text-slate-400 text-[11px] font-semibold leading-relaxed">
            Sesuaikan informasi halaman detail layanan Sewa Lahan publik.
          </p>
          
          <div className="space-y-3 pt-2">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">No. WhatsApp Petugas</label>
              <input
                type="text"
                value={waNumber}
                onChange={(e) => setWaNumber(e.target.value)}
                placeholder="Contoh: 6281234567890"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl text-xs transition-all focus:outline-none placeholder:text-slate-450 text-slate-800 font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Deskripsi Layanan</label>
              <textarea
                value={descriptionPage}
                onChange={(e) => setDescriptionPage(e.target.value)}
                placeholder="Deskripsi ringkas unit usaha sewa lahan..."
                rows={4}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl text-xs transition-all focus:outline-none placeholder:text-slate-450 text-slate-800 font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Tarif & Sistem Sewa (Pisahkan dengan baris baru)</label>
              <textarea
                value={ratesPage}
                onChange={(e) => setRatesPage(e.target.value)}
                placeholder="Contoh:&#10;Tarif Lapak Tenda: Rp 150.000 / bulan&#10;Tarif Warung Permanen: Rp 1.500.000 / tahun"
                rows={3}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl text-xs transition-all focus:outline-none placeholder:text-slate-450 text-slate-800 font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Syarat & Ketentuan (Pisahkan dengan baris baru)</label>
              <textarea
                value={requirementsPage}
                onChange={(e) => setRequirementsPage(e.target.value)}
                placeholder="Contoh:&#10;Fotokopi KTP & KK warga desa setempat&#10;Mengisi formulir pengajuan sewa&#10;Membayar uang jaminan kebersihan"
                rows={3}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl text-xs transition-all focus:outline-none placeholder:text-slate-450 text-slate-800 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Pojok UMKM Management Box */}
        <div className="lg:col-span-2 bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Kelola Pojok UMKM</h3>
                <p className="text-slate-400 text-xs font-semibold mt-0.5">
                  Produk-produk UMKM binaan/lapak warga desa yang dipromosikan di halaman depan portal.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenAdd}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow-md shadow-emerald-600/10 transition-all active:scale-95 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah UMKM
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[450px] overflow-y-auto pr-1">
              {umkmList.length > 0 ? (
                umkmList.map((item) => (
                  <div key={item.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between hover:shadow-sm transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center shrink-0 border border-slate-200">
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-xs">{item.name}</h4>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{item.category} &bull; {item.owner}</p>
                        <p className="text-[9px] text-emerald-700 font-bold mt-1">WA: +{item.phone}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 hover:bg-white text-slate-500 hover:text-emerald-700 rounded-lg border border-transparent hover:border-slate-200 transition-all"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 hover:bg-white text-slate-500 hover:text-rose-600 rounded-lg border border-transparent hover:border-slate-200 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 py-8 text-center text-slate-400 font-semibold text-xs">
                  Belum ada produk UMKM terdaftar.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Editor Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-md shadow-2xl p-6 relative">
            <h3 className="font-bold text-slate-900 text-sm mb-4">
              {editingId ? "Edit Produk UMKM" : "Tambah Produk UMKM"}
            </h3>
            <form onSubmit={handleSaveItem} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block">Nama Produk/Usaha</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Kripik Tempe"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block">Pemilik (Owner)</label>
                  <input
                    type="text"
                    required
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    placeholder="Ibu Wati"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block">Kategori</label>
                  <input
                    type="text"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Makanan / Kerajinan"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block">WhatsApp Penjual</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="628xxx"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">Deskripsi Singkat</label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Deskripsikan keunikan produk..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 min-h-[60px]"
                />
              </div>

              {/* Upload Image Section */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">Gambar Produk</label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                    {imageUrl ? (
                      <img src={imageUrl} alt="Pratinjau" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] text-slate-400">No Image</span>
                    )}
                  </div>
                  <label className="flex-1 flex flex-col items-center justify-center px-4 py-3 bg-white text-slate-600 hover:text-emerald-700 border border-slate-200 border-dashed rounded-xl cursor-pointer hover:bg-emerald-50/20 hover:border-emerald-300 transition-all">
                    <span className="flex items-center gap-1.5 text-xs font-bold">
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                          Mengunggah...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 text-slate-400" />
                          Pilih & Unggah Foto
                        </>
                      )}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold rounded-xl text-xs transition shadow-md"
                >
                  Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submit all settings button */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          disabled={saving}
          onClick={handleSaveAllSettings}
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
              Simpan Semua Pengaturan Lahan
            </>
          )}
        </button>
      </div>
    </div>
  )
}

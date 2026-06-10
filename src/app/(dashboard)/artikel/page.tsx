"use client"

import React, { useState, useEffect } from "react"
import {
  Newspaper,
  Plus,
  Search,
  CheckCircle,
  AlertCircle,
  X,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  CalendarDays
} from "lucide-react"

interface Article {
  id: string
  title: string
  content: string
  imageUrl: string | null
  published: boolean
  createdAt: string
}

export default function ArtikelPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal State
  const [activeModal, setActiveModal] = useState<"create" | "edit" | null>(null)
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)

  // Form States
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [published, setPublished] = useState(false)

  const [formSubmitLoading, setFormSubmitLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)

  const fetchArticles = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/artikel")
      const result = await res.json()
      if (result.success) {
        setArticles(result.data)
      } else {
        throw new Error(result.error || "Gagal mengambil data artikel")
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchArticles()
  }, [])

  // Auto-fill form when selectedArticle is set (during edit)
  useEffect(() => {
    if (selectedArticle) {
      setTitle(selectedArticle.title)
      setContent(selectedArticle.content)
      setImageUrl(selectedArticle.imageUrl || "")
      setPublished(selectedArticle.published)
    }
  }, [selectedArticle])

  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormSubmitLoading(true)
    setFormError(null)
    setFormSuccess(null)

    try {
      const res = await fetch("/api/artikel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, imageUrl, published })
      })

      const result = await res.json()

      if (result.success) {
        setFormSuccess("Artikel baru berhasil diterbitkan!")
        setTitle("")
        setContent("")
        setImageUrl("")
        setPublished(false)
        fetchArticles()
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

  const handleUpdateArticle = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedArticle) return
    setFormSubmitLoading(true)
    setFormError(null)
    setFormSuccess(null)

    try {
      const res = await fetch(`/api/artikel/${selectedArticle.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, imageUrl, published })
      })

      const result = await res.json()

      if (result.success) {
        setFormSuccess("Artikel berhasil diperbarui!")
        fetchArticles()
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

  const togglePublishStatus = async (article: Article) => {
    try {
      const res = await fetch(`/api/artikel/${article.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: article.title,
          content: article.content,
          imageUrl: article.imageUrl,
          published: !article.published
        })
      })
      const result = await res.json()
      if (result.success) {
        fetchArticles()
      } else {
        throw new Error(result.error)
      }
    } catch (err: any) {
      alert(err.message || "Gagal mengubah status publish")
    }
  }

  const handleDeleteArticle = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus artikel ini secara permanen?")) return
    try {
      const res = await fetch(`/api/artikel/${id}`, {
        method: "DELETE"
      })
      const result = await res.json()
      if (result.success) {
        fetchArticles()
      } else {
        throw new Error(result.error)
      }
    } catch (err: any) {
      alert(err.message || "Gagal menghapus artikel")
    }
  }

  const filteredArticles = articles.filter((a) =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Kelola Artikel BUMDES</h1>
          <p className="text-slate-400 text-xs font-semibold mt-1">
            Gunakan modul CMS ini untuk mempublikasikan artikel, berita, pengumuman, dan foto kegiatan operasional BUMDES ke website desa.
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedArticle(null)
            setTitle("")
            setContent("")
            setImageUrl("")
            setPublished(false)
            setFormError(null)
            setFormSuccess(null)
            setActiveModal("create")
          }}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-2xl text-xs shadow-md shadow-emerald-600/10 transition-all active:scale-95 shrink-0 w-fit"
        >
          <Plus className="w-4 h-4" />
          Tulis Artikel
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex justify-between items-center pb-1 border-b border-slate-100">
        <h2 className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
          <Newspaper className="w-4 h-4 text-emerald-600" />
          Daftar Konten Rilis
        </h2>
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Cari judul artikel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 focus:border-emerald-500 rounded-2xl text-xs focus:outline-none transition-all placeholder:text-slate-400 text-slate-700 shadow-sm"
          />
        </div>
      </div>

      {/* Grid of Articles */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Judul Artikel</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tanggal Tulis</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-slate-700 text-xs">
              {filteredArticles.length > 0 ? (
                filteredArticles.map((post) => {
                  const date = new Date(post.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                  })
                  return (
                    <tr key={post.id} className="hover:bg-slate-50/50 transition-all">
                      <td className="px-6 py-4 font-bold text-slate-800 max-w-sm truncate">
                        {post.title}
                      </td>
                      <td className="px-6 py-4 text-slate-400 font-semibold">{date}</td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => togglePublishStatus(post)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold shadow-sm transition-all ${
                            post.published
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : "bg-slate-50 text-slate-500 border-slate-200"
                          }`}
                        >
                          {post.published ? (
                            <>
                              <Eye className="w-3.5 h-3.5 text-emerald-600" />
                              Diterbitkan
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                              Draf
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedArticle(post)
                              setFormError(null)
                              setFormSuccess(null)
                              setActiveModal("edit")
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                            title="Edit Artikel"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteArticle(post.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                            title="Hapus Artikel"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-slate-400 font-medium">
                    Belum ada artikel ditulis.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ------------------- MODALS ------------------- */}

      {/* Modal: Create or Edit Article */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-2xl shadow-2xl p-6 relative">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-4">
              <Newspaper className="w-5 h-5 text-emerald-600" />
              {activeModal === "create" ? "Tulis Artikel Baru" : "Edit Artikel"}
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

            <form onSubmit={activeModal === "create" ? handleCreateArticle : handleUpdateArticle} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Judul Berita / Kegiatan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: BUMDES Barokah Salurkan Penyertaan Modal Bagi Kelompok Tani"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:outline-none rounded-xl text-xs text-slate-800 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Foto Kegiatan (Url Link / Path)</label>
                <input
                  type="text"
                  placeholder="/images/kegiatan.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:outline-none rounded-xl text-xs text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Isi Konten Artikel</label>
                <textarea
                  required
                  rows={8}
                  placeholder="Tuliskan berita lengkap mengenai kegiatan BUMDES di sini..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:outline-none rounded-xl text-xs text-slate-800 font-medium resize-none"
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 w-fit">
                <input
                  type="checkbox"
                  id="published"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                />
                <label htmlFor="published" className="text-xs text-slate-700 font-semibold cursor-pointer">
                  Langsung terbitkan ke website (Public)
                </label>
              </div>

              <button
                type="submit"
                disabled={formSubmitLoading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all active:scale-95"
              >
                {formSubmitLoading ? "Memproses..." : activeModal === "create" ? "Publikasikan Artikel" : "Simpan Perubahan"}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

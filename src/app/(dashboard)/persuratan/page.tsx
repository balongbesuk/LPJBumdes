"use client"

import React, { useState, useEffect } from "react"
import {
  Mail,
  Plus,
  Search,
  CheckCircle,
  AlertCircle,
  X,
  FileText,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldAlert,
  CalendarDays,
  Download,
  Users,
  Trash2,
  Eye,
  BookOpen
} from "lucide-react"

interface Document {
  id: string
  docNumber: string
  type: string // SURAT_MASUK, SURAT_KELUAR, SK, KEPUTUSAN
  subject: string
  sender: string | null
  recipient: string | null
  date: string
  fileUrl: string | null
}

interface Meeting {
  id: string
  date: string
  title: string
  category: string // MUSDES, INTERN, PENGAWAS, LAINNYA
  attendees: number
  minutes: string
  notes: string | null
}

export default function PersuratanPage() {
  const [activeTab, setActiveTab] = useState<"incoming" | "outgoing" | "decrees" | "meetings">("incoming")
  const [documents, setDocuments] = useState<Document[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal State for Surat
  const [activeModal, setActiveModal] = useState<boolean>(false)

  // Form States for Surat
  const [docNumber, setDocNumber] = useState("")
  const [docType, setDocType] = useState<"SURAT_MASUK" | "SURAT_KELUAR" | "SK" | "KEPUTUSAN">("SURAT_MASUK")
  const [subject, setSubject] = useState("")
  const [sender, setSender] = useState("")
  const [recipient, setRecipient] = useState("")
  const [dateStr, setDateStr] = useState("")
  const [fileUrl, setFileUrl] = useState("")

  // Meeting Minutes States
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [meetingModal, setMeetingModal] = useState(false)
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)

  // Meeting Form States
  const [meetingDate, setMeetingDate] = useState("")
  const [meetingTitle, setMeetingTitle] = useState("")
  const [meetingCategory, setMeetingCategory] = useState("MUSDES")
  const [meetingAttendees, setMeetingAttendees] = useState("")
  const [meetingMinutes, setMeetingMinutes] = useState("")
  const [meetingNotes, setMeetingNotes] = useState("")

  const [formSubmitLoading, setFormSubmitLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)

  const fetchDocuments = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/persuratan")
      const result = await res.json()
      if (result.success) {
        setDocuments(result.data)
      } else {
        throw new Error(result.error || "Gagal mengambil data persuratan")
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchMeetings = async () => {
    try {
      const res = await fetch("/api/persuratan/meetings")
      const result = await res.json()
      if (result.success) {
        setMeetings(result.data)
      } else {
        throw new Error(result.error || "Gagal mengambil data notulen rapat")
      }
    } catch (err: any) {
      console.error(err.message)
    }
  }

  useEffect(() => {
    const initFetch = async () => {
      setLoading(true)
      await Promise.all([fetchDocuments(), fetchMeetings()])
      setLoading(false)
    }
    initFetch()
  }, [])

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormSubmitLoading(true)
    setFormError(null)
    setFormSuccess(null)

    try {
      const res = await fetch("/api/persuratan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          docNumber,
          type: docType,
          subject,
          sender: docType === "SURAT_MASUK" ? sender : undefined,
          recipient: docType === "SURAT_KELUAR" ? recipient : undefined,
          date: dateStr || undefined,
          fileUrl
        })
      })

      const result = await res.json()

      if (result.success) {
        setFormSuccess("Dokumen / Surat berhasil diregistrasikan!")
        setDocNumber("")
        setSubject("")
        setSender("")
        setRecipient("")
        setFileUrl("")
        setDateStr("")
        fetchDocuments()
        setTimeout(() => {
          setActiveModal(false)
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

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormSubmitLoading(true)
    setFormError(null)
    setFormSuccess(null)

    try {
      const res = await fetch("/api/persuratan/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: meetingDate || undefined,
          title: meetingTitle,
          category: meetingCategory,
          attendees: parseInt(meetingAttendees, 10) || 0,
          minutes: meetingMinutes,
          notes: meetingNotes || undefined
        })
      })

      const result = await res.json()

      if (result.success) {
        setFormSuccess("Notulen rapat berhasil dicatat!")
        setMeetingTitle("")
        setMeetingCategory("MUSDES")
        setMeetingAttendees("")
        setMeetingMinutes("")
        setMeetingNotes("")
        setMeetingDate("")
        fetchMeetings()
        setTimeout(() => {
          setMeetingModal(false)
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

  const handleDeleteMeeting = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus notulen rapat ini?")) return
    try {
      const res = await fetch(`/api/persuratan/meetings?id=${id}`, {
        method: "DELETE"
      })
      const result = await res.json()
      if (result.success) {
        fetchMeetings()
      } else {
        throw new Error(result.error || "Gagal menghapus notulen")
      }
    } catch (err: any) {
      alert("Error: " + err.message)
    }
  }

  // Filter based on active tab and search query
  const filteredDocuments = documents.filter((d) => {
    let matchesTab = false
    if (activeTab === "incoming") matchesTab = d.type === "SURAT_MASUK"
    else if (activeTab === "outgoing") matchesTab = d.type === "SURAT_KELUAR"
    else if (activeTab === "decrees") matchesTab = d.type === "SK" || d.type === "KEPUTUSAN"

    const matchesSearch =
      d.docNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.sender && d.sender.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (d.recipient && d.recipient.toLowerCase().includes(searchQuery.toLowerCase()))

    return matchesTab && matchesSearch
  })

  const filteredMeetings = meetings.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.minutes.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.notes && m.notes.toLowerCase().includes(searchQuery.toLowerCase()))

    return matchesSearch
  })

  const getDocTypeBadge = (type: string) => {
    switch (type) {
      case "SURAT_MASUK":
        return "bg-blue-50 text-blue-800 border-blue-200"
      case "SURAT_KELUAR":
        return "bg-purple-50 text-purple-800 border-purple-200"
      case "SK":
        return "bg-rose-50 text-rose-800 border-rose-200"
      case "KEPUTUSAN":
        return "bg-amber-50 text-amber-800 border-amber-200"
      default:
        return "bg-slate-50 text-slate-850 border-slate-200"
    }
  }

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case "MUSDES":
        return "bg-emerald-50 text-emerald-805 text-emerald-800 border-emerald-200"
      case "INTERN":
        return "bg-blue-50 text-blue-805 text-blue-800 border-blue-200"
      case "PENGAWAS":
        return "bg-rose-50 text-rose-805 text-rose-800 border-rose-200"
      default:
        return "bg-purple-50 text-purple-805 text-purple-800 border-purple-200"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Administrasi Persuratan</h1>
          <p className="text-slate-400 text-xs font-semibold mt-1">
            Kelola pembukuan surat masuk, surat keluar, arsip SK Direktur BUMDES, dan dokumen penting desa secara terorganisir.
          </p>
        </div>
        {activeTab === "meetings" ? (
          <button
            onClick={() => {
              setMeetingDate("")
              setMeetingTitle("")
              setMeetingCategory("MUSDES")
              setMeetingAttendees("")
              setMeetingMinutes("")
              setMeetingNotes("")
              setFormError(null)
              setFormSuccess(null)
              setMeetingModal(true)
            }}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-2xl text-xs shadow-md shadow-emerald-600/10 transition-all active:scale-95 shrink-0 w-fit"
          >
            <Plus className="w-4 h-4" />
            Catat Notulen Rapat
          </button>
        ) : (
          <button
            onClick={() => {
              setDocNumber("")
              setSubject("")
              setSender("")
              setRecipient("")
              setFileUrl("")
              setDateStr("")
              setFormError(null)
              setFormSuccess(null)
              setActiveModal(true)
            }}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-2xl text-xs shadow-md shadow-emerald-600/10 transition-all active:scale-95 shrink-0 w-fit"
          >
            <Plus className="w-4 h-4" />
            Registrasi Surat
          </button>
        )}
      </div>

      {/* Navigation Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-1">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl w-fit overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab("incoming")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "incoming" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5 inline-block mr-1 text-blue-500" />
            Surat Masuk
          </button>
          <button
            onClick={() => setActiveTab("outgoing")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "outgoing" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5 inline-block mr-1 text-purple-500" />
            Surat Keluar
          </button>
          <button
            onClick={() => setActiveTab("decrees")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "decrees" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <FileText className="w-3.5 h-3.5 inline-block mr-1 text-rose-500" />
            SK & Keputusan
          </button>
          <button
            onClick={() => setActiveTab("meetings")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "meetings" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Users className="w-3.5 h-3.5 inline-block mr-1 text-emerald-500" />
            Notulen Rapat
          </button>
        </div>

        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder={activeTab === "meetings" ? "Cari agenda, notulen..." : "Cari perihal, nomor surat..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 focus:border-emerald-500 rounded-2xl text-xs focus:outline-none transition-all placeholder:text-slate-400 text-slate-700 shadow-sm"
          />
        </div>
      </div>

      {/* Table list */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {activeTab === "meetings" ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tanggal</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kategori</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Judul Rapat</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Peserta</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ringkasan</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-slate-400 font-medium">
                      Memuat data notulen...
                    </td>
                  </tr>
                ) : filteredMeetings.length > 0 ? (
                  filteredMeetings.map((meet) => {
                    const date = new Date(meet.date).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric"
                    })
                    return (
                      <tr key={meet.id} className="hover:bg-slate-50/50 transition-all">
                        <td className="px-6 py-4 text-slate-400 font-semibold">{date}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full border text-[9px] font-bold ${getCategoryBadge(meet.category)}`}>
                            {meet.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-800">{meet.title}</td>
                        <td className="px-6 py-4 font-semibold text-slate-600">{meet.attendees} Orang</td>
                        <td className="px-6 py-4 text-slate-400 max-w-xs truncate">{meet.minutes}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setSelectedMeeting(meet)}
                              className="inline-flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold px-2.5 py-1 rounded-lg border border-emerald-200 text-[10px] transition-all"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Detail
                            </button>
                            <button
                              onClick={() => handleDeleteMeeting(meet.id)}
                              className="inline-flex items-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold px-2 py-1 rounded-lg border border-rose-200 text-[10px] transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-slate-400 font-medium">
                      Belum ada notulen rapat terdaftar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">No. Surat</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tanggal</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Perihal</th>
                  {activeTab === "incoming" && (
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pengirim</th>
                  )}
                  {activeTab === "outgoing" && (
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Penerima</th>
                  )}
                  {activeTab === "decrees" && (
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tipe</th>
                  )}
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Berkas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-400 font-medium">
                      Memuat data surat / dokumen...
                    </td>
                  </tr>
                ) : filteredDocuments.length > 0 ? (
                  filteredDocuments.map((doc) => {
                    const date = new Date(doc.date).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric"
                    })
                    return (
                      <tr key={doc.id} className="hover:bg-slate-50/50 transition-all">
                        <td className="px-6 py-4 font-bold text-slate-800">{doc.docNumber}</td>
                        <td className="px-6 py-4 text-slate-400 font-semibold">{date}</td>
                        <td className="px-6 py-4 font-semibold text-slate-700 max-w-xs truncate">{doc.subject}</td>
                        {activeTab === "incoming" && (
                          <td className="px-6 py-4 font-semibold text-slate-600">{doc.sender || "-"}</td>
                        )}
                        {activeTab === "outgoing" && (
                          <td className="px-6 py-4 font-semibold text-slate-600">{doc.recipient || "-"}</td>
                        )}
                        {activeTab === "decrees" && (
                          <td className="px-6 py-4 font-bold">
                            <span className={`inline-block px-2 py-0.5 rounded-full border text-[9px] ${getDocTypeBadge(doc.type)}`}>
                              {doc.type}
                            </span>
                          </td>
                        )}
                        <td className="px-6 py-4 text-center">
                          {doc.fileUrl ? (
                            <a
                              href={doc.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold px-2 py-1 rounded-lg border border-emerald-200 text-[10px]"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Unduh
                            </a>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-semibold italic">Tidak ada file</span>
                          )}
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-400 font-medium">
                      Belum ada surat terdaftar dalam kategori ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal: Register Document */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-md shadow-2xl p-6 relative">
            <button
              onClick={() => setActiveModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-4">
              <Mail className="w-5 h-5 text-emerald-600" />
              Registrasikan Surat / Dokumen Baru
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

            <form onSubmit={handleCreateDocument} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase block">Kategori Dokumen</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value as any)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-805 text-slate-800"
                  >
                    <option value="SURAT_MASUK">Surat Masuk</option>
                    <option value="SURAT_KELUAR">Surat Keluar</option>
                    <option value="SK">Surat Keputusan (SK)</option>
                    <option value="KEPUTUSAN">Surat Tugas / Keputusan Lain</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase block">Tanggal Dokumen</label>
                  <input
                    type="date"
                    value={dateStr}
                    onChange={(e) => setDateStr(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase block">Nomor Surat / Dokumen</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 140/01/BUMDES.BB/VI/2026"
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:outline-none rounded-xl text-xs text-slate-800 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase block">Perihal / Subject</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pengajuan Proposal Bantuan Modal"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:outline-none rounded-xl text-xs text-slate-800 font-semibold"
                />
              </div>

              {docType === "SURAT_MASUK" && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase block">Nama Pengirim</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Dinas Pemberdayaan Masyarakat Desa Jombang"
                    value={sender}
                    onChange={(e) => setSender(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:outline-none rounded-xl text-xs text-slate-800 font-semibold"
                  />
                </div>
              )}

              {docType === "SURAT_KELUAR" && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase block">Penerima Surat</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Kepala Desa Balongbesuk"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:outline-none rounded-xl text-xs text-slate-800 font-semibold"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase block">Link Berkas Digital (File Link)</label>
                <input
                  type="text"
                  placeholder="Link file PDF di server / Drive (Opsional)"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:outline-none rounded-xl text-xs text-slate-800"
                />
              </div>

              <button
                type="submit"
                disabled={formSubmitLoading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all active:scale-95"
              >
                {formSubmitLoading ? "Memproses..." : "Simpan Dokumen"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Meeting Minutes */}
      {meetingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-md shadow-2xl p-6 relative">
            <button
              onClick={() => setMeetingModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-emerald-600" />
              Catat Risalah Rapat / Notulen Baru
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

            <form onSubmit={handleCreateMeeting} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase block">Kategori Rapat</label>
                  <select
                    value={meetingCategory}
                    onChange={(e) => setMeetingCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                  >
                    <option value="MUSDES">Musyawarah Desa (Musdes)</option>
                    <option value="INTERN">Internal Pengurus</option>
                    <option value="PENGAWAS">Rapat Pengawas</option>
                    <option value="LAINNYA">Lainnya</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase block">Tanggal Rapat</label>
                  <input
                    type="date"
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-805 text-slate-800 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase block">Judul Rapat</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Rapat Koordinasi SHU"
                    value={meetingTitle}
                    onChange={(e) => setMeetingTitle(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:outline-none rounded-xl text-xs text-slate-800 font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase block">Jumlah Peserta</label>
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder="25"
                    value={meetingAttendees}
                    onChange={(e) => setMeetingAttendees(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:outline-none rounded-xl text-xs text-slate-805 text-slate-800 font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase block">Ringkasan Jalannya Rapat (Notulen)</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Deskripsikan secara ringkas agenda, pembahasan, dan keputusan yang disepakati..."
                  value={meetingMinutes}
                  onChange={(e) => setMeetingMinutes(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:outline-none rounded-xl text-xs text-slate-800 resize-none font-semibold leading-relaxed"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase block">Catatan Tambahan (Opsional)</label>
                <input
                  type="text"
                  placeholder="Lokasi, berkas lampiran pendukung, dll."
                  value={meetingNotes}
                  onChange={(e) => setMeetingNotes(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:outline-none rounded-xl text-xs text-slate-800 font-semibold"
                />
              </div>

              <button
                type="submit"
                disabled={formSubmitLoading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all active:scale-95"
              >
                {formSubmitLoading ? "Memproses..." : "Simpan Notulen Rapat"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Meeting Minutes Detail */}
      {selectedMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-lg shadow-2xl p-6 relative">
            <button
              onClick={() => setSelectedMeeting(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-2">
              <BookOpen className="w-5 h-5 text-emerald-600" />
              Detail Risalah Rapat
            </h3>
            <span className={`inline-block px-2.5 py-0.5 rounded-full border text-[9px] font-bold mb-4 ${getCategoryBadge(selectedMeeting.category)}`}>
              {selectedMeeting.category}
            </span>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Tanggal Pelaksanaan</span>
                  <span className="font-bold text-slate-700">
                    {new Date(selectedMeeting.date).toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric"
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Kehadiran Peserta</span>
                  <span className="font-bold text-slate-700 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    {selectedMeeting.attendees} Orang
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Agenda / Judul Rapat</span>
                <p className="font-bold text-slate-800 text-sm leading-relaxed">{selectedMeeting.title}</p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Notulen / Ringkasan Rapat</span>
                <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-2xl max-h-48 overflow-y-auto leading-relaxed text-slate-700 font-semibold whitespace-pre-wrap">
                  {selectedMeeting.minutes}
                </div>
              </div>

              {selectedMeeting.notes && (
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Catatan Tambahan</span>
                  <p className="text-slate-650 font-semibold italic bg-amber-50/40 border border-amber-100/50 p-2.5 rounded-xl">
                    {selectedMeeting.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedMeeting(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-205 text-slate-700 font-bold rounded-xl text-xs transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

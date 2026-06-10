"use client"

import React, { useState, useEffect, useCallback } from "react"
import {
  Users,
  Plus,
  Edit3,
  Trash2,
  Loader2,
  CheckCircle,
  AlertTriangle,
  X,
  Eye,
  EyeOff,
  Shield,
  UserPlus,
  Search,
} from "lucide-react"

interface UserItem {
  id: string
  username: string
  name: string
  role: string
  createdAt: string
}

const ROLE_OPTIONS = [
  { value: "ADMIN", label: "Admin (Kepala BUMDES)" },
  { value: "BENDAHARA", label: "Bendahara" },
  { value: "SEKRETARIS", label: "Sekretaris" },
  { value: "OPERATOR_SEWA", label: "Operator Sewa" },
  { value: "OPERATOR_SP", label: "Operator Simpan Pinjam" },
]

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-amber-50 text-amber-700 border-amber-200",
  BENDAHARA: "bg-emerald-50 text-emerald-700 border-emerald-200",
  SEKRETARIS: "bg-blue-50 text-blue-700 border-blue-200",
  OPERATOR_SEWA: "bg-violet-50 text-violet-700 border-violet-200",
  OPERATOR_SP: "bg-rose-50 text-rose-700 border-rose-200",
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Admin",
  BENDAHARA: "Bendahara",
  SEKRETARIS: "Sekretaris",
  OPERATOR_SEWA: "Op. Sewa",
  OPERATOR_SP: "Op. SP",
}

export default function UsersTab() {
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Modal states
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<UserItem | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<UserItem | null>(null)

  // Form states
  const [formUsername, setFormUsername] = useState("")
  const [formName, setFormName] = useState("")
  const [formRole, setFormRole] = useState("OPERATOR_SEWA")
  const [formPassword, setFormPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  // Feedback
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/pengaturan/users")
      const result = await res.json()
      if (result.success) {
        setUsers(result.data)
      } else {
        setErrorMsg(result.error || "Gagal memuat daftar pengguna")
      }
    } catch {
      setErrorMsg("Gagal memuat daftar pengguna")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const openCreateModal = () => {
    setEditingUser(null)
    setFormUsername("")
    setFormName("")
    setFormRole("OPERATOR_SEWA")
    setFormPassword("")
    setShowPassword(false)
    setErrorMsg(null)
    setShowModal(true)
  }

  const openEditModal = (user: UserItem) => {
    setEditingUser(user)
    setFormUsername(user.username)
    setFormName(user.name)
    setFormRole(user.role)
    setFormPassword("")
    setShowPassword(false)
    setErrorMsg(null)
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      if (editingUser) {
        // Update
        const res = await fetch(`/api/pengaturan/users/${editingUser.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formName,
            role: formRole,
            password: formPassword || undefined,
          }),
        })
        const result = await res.json()
        if (!result.success) throw new Error(result.error)
        setSuccessMsg("Pengguna berhasil diperbarui")
      } else {
        // Create
        const res = await fetch("/api/pengaturan/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: formUsername,
            password: formPassword,
            name: formName,
            role: formRole,
          }),
        })
        const result = await res.json()
        if (!result.success) throw new Error(result.error)
        setSuccessMsg("Pengguna baru berhasil ditambahkan")
      }
      setShowModal(false)
      fetchUsers()
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (err: any) {
      setErrorMsg(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (user: UserItem) => {
    setDeleting(user.id)
    setErrorMsg(null)
    setSuccessMsg(null)
    try {
      const res = await fetch(`/api/pengaturan/users/${user.id}`, {
        method: "DELETE",
      })
      const result = await res.json()
      if (!result.success) throw new Error(result.error)
      setSuccessMsg("Pengguna berhasil dihapus")
      setShowDeleteConfirm(null)
      fetchUsers()
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (err: any) {
      setErrorMsg(err.message)
    } finally {
      setDeleting(null)
    }
  }

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ROLE_LABELS[u.role] || u.role).toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Notifications */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && !showModal && (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in">
          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama, username, role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all"
          />
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs shadow-md shadow-emerald-600/10 transition-all active:scale-[0.98] w-fit"
        >
          <UserPlus className="w-4 h-4" />
          Tambah Pengguna
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            <span className="ml-2 text-xs font-semibold text-slate-400">Memuat daftar pengguna...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Users className="w-10 h-10 mb-3 text-slate-300" />
            <span className="text-xs font-bold">
              {searchQuery ? "Tidak ada pengguna yang cocok" : "Belum ada pengguna terdaftar"}
            </span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-50">
                  <th className="text-left px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Nama Lengkap
                  </th>
                  <th className="text-left px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="text-left px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Role / Jabatan
                  </th>
                  <th className="text-left px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Tgl Dibuat
                  </th>
                  <th className="text-right px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-slate-50/80 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center text-emerald-700 font-bold text-sm shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-bold text-slate-800">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg">
                        @{user.username}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-[10px] font-bold px-3 py-1.5 rounded-full border ${
                          ROLE_COLORS[user.role] || "bg-slate-50 text-slate-600 border-slate-200"
                        }`}
                      >
                        {user.role === "ADMIN" && <Shield className="w-3 h-3 inline mr-1 -mt-0.5" />}
                        {ROLE_LABELS[user.role] || user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-400">
                      {new Date(user.createdAt).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(user)}
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                          title="Edit Pengguna"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowDeleteConfirm(user)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                          title="Hapus Pengguna"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info footer */}
      <div className="text-[10px] text-slate-400 font-semibold leading-relaxed">
        Total {users.length} akun pengguna terdaftar. Password disimpan menggunakan hash SHA-256 dan tidak dapat dilihat kembali. Untuk mereset password, gunakan tombol Edit lalu isi field password baru.
      </div>

      {/* ===== CREATE/EDIT MODAL ===== */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div
            className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center">
                  {editingUser ? (
                    <Edit3 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <UserPlus className="w-5 h-5 text-emerald-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-slate-900 font-bold text-sm">
                    {editingUser ? "Edit Pengguna" : "Tambah Pengguna Baru"}
                  </h3>
                  <p className="text-slate-400 text-[10px] font-semibold">
                    {editingUser
                      ? `Mengubah data @${editingUser.username}`
                      : "Buat akun baru untuk mengakses sistem"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                  {errorMsg}
                </div>
              )}

              {/* Username */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Username
                </label>
                <input
                  type="text"
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                  required
                  disabled={!!editingUser}
                  placeholder="contoh: bendahara01"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl text-sm transition-all focus:outline-none focus:ring-4 focus:ring-emerald-500/10 placeholder:text-slate-400 text-slate-800 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {editingUser && (
                  <span className="text-[10px] text-slate-400 font-semibold">
                    Username tidak dapat diubah
                  </span>
                )}
              </div>

              {/* Nama Lengkap */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  placeholder="contoh: Pak Ahmad"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl text-sm transition-all focus:outline-none focus:ring-4 focus:ring-emerald-500/10 placeholder:text-slate-400 text-slate-800 font-semibold"
                />
              </div>

              {/* Role */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Role / Jabatan
                </label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl text-sm transition-all focus:outline-none focus:ring-4 focus:ring-emerald-500/10 text-slate-800 font-semibold appearance-none cursor-pointer"
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  {editingUser ? "Password Baru (opsional)" : "Password"}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    required={!editingUser}
                    minLength={6}
                    placeholder={editingUser ? "Kosongkan jika tidak ingin mengubah" : "Minimal 6 karakter"}
                    className="w-full px-4 py-2.5 pr-10 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl text-sm transition-all focus:outline-none focus:ring-4 focus:ring-emerald-500/10 placeholder:text-slate-400 text-slate-800 font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                  className="flex-1 py-3 px-4 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold border border-slate-200 rounded-2xl text-xs transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-[2] py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold rounded-2xl text-xs shadow-md shadow-emerald-600/10 transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Menyimpan...
                    </>
                  ) : editingUser ? (
                    <>
                      <Edit3 className="w-3.5 h-3.5" />
                      Simpan Perubahan
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      Buat Akun
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== DELETE CONFIRMATION MODAL ===== */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-sm p-6 space-y-5 animate-scale-in">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-slate-900 font-bold text-sm">Hapus Pengguna?</h3>
                <p className="text-slate-400 text-xs font-semibold mt-1 leading-relaxed">
                  Akun <strong className="text-slate-600">@{showDeleteConfirm.username}</strong> ({showDeleteConfirm.name}) akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                {errorMsg}
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={!!deleting}
                onClick={() => {
                  setShowDeleteConfirm(null)
                  setErrorMsg(null)
                }}
                className="flex-1 py-3 px-4 bg-slate-50 hover:bg-slate-100 disabled:opacity-50 text-slate-600 font-bold border border-slate-200 rounded-2xl text-xs transition"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={!!deleting}
                onClick={() => handleDelete(showDeleteConfirm)}
                className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold rounded-2xl text-xs shadow-md shadow-rose-600/10 transition flex items-center justify-center gap-1.5"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Ya, Hapus
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

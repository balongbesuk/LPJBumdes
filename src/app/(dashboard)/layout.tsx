"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Coins,
  Building2,
  Map,
  CreditCard,
  Mail,
  Newspaper,
  BookOpen,
  Settings,
  LogOut,
  Menu,
  X,
  User as UserIcon,
  CalendarDays
} from "lucide-react"

interface User {
  id: string
  username: string
  name: string
  role: string
}

// Define navigation items based on user roles
const allNavItems = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    roles: ["ADMIN", "BENDAHARA", "SEKRETARIS", "OPERATOR_SP", "OPERATOR_SEWA"]
  },
  {
    name: "Simpan Pinjam",
    href: "/simpan-pinjam",
    icon: Coins,
    roles: ["ADMIN", "BENDAHARA", "OPERATOR_SP"]
  },
  {
    name: "Sewa Gedung",
    href: "/sewa-gedung",
    icon: Building2,
    roles: ["ADMIN", "BENDAHARA", "OPERATOR_SEWA"]
  },
  {
    name: "Sewa Lahan",
    href: "/sewa-lahan",
    icon: Map,
    roles: ["ADMIN", "BENDAHARA", "OPERATOR_SEWA"]
  },
  {
    name: "PPOB Rekap",
    href: "/ppob",
    icon: CreditCard,
    roles: ["ADMIN", "BENDAHARA"]
  },
  {
    name: "Persuratan",
    href: "/persuratan",
    icon: Mail,
    roles: ["ADMIN", "SEKRETARIS"]
  },
  {
    name: "Artikel & Berita",
    href: "/artikel",
    icon: Newspaper,
    roles: ["ADMIN", "SEKRETARIS"]
  },
  {
    name: "Pembukuan Keuangan",
    href: "/keuangan",
    icon: BookOpen,
    roles: ["ADMIN", "BENDAHARA"]
  },
  {
    name: "Pengaturan",
    href: "/pengaturan",
    icon: Settings,
    roles: ["ADMIN"]
  },
  {
    name: "Profil Saya",
    href: "/profil",
    icon: UserIcon,
    roles: ["ADMIN", "BENDAHARA", "SEKRETARIS", "OPERATOR_SP", "OPERATOR_SEWA"]
  }
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Client-side authentication check
    const storedUser = localStorage.getItem("bumdes_user")
    if (!storedUser) {
      router.push("/login")
      return
    }
    
    const parsedUser = JSON.parse(storedUser)
    setUser(parsedUser)
    setLoading(false)

    // Enforce role authorization check on pathname transitions
    if (pathname !== "/") {
      const sortedItems = [...allNavItems].sort((a, b) => b.href.length - a.href.length)
      const matchedItem = sortedItems.find(
        (item) => item.href !== "/" && (pathname === item.href || pathname.startsWith(item.href + "/"))
      )
      
      if (matchedItem && !matchedItem.roles.includes(parsedUser.role)) {
        // Redirect unauthorized roles back to the main dashboard
        router.push("/")
      }
    }
  }, [router, pathname])

  const handleLogout = () => {
    localStorage.removeItem("bumdes_user")
    // Delete authentication cookie
    document.cookie = "bumdes_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;"
    router.push("/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Memuat sistem...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  const navItems = allNavItems.filter((item) => item.roles.includes(user.role))

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "Kepala BUMDES"
      case "BENDAHARA":
        return "Bendahara"
      case "SEKRETARIS":
        return "Sekretaris"
      case "OPERATOR_SP":
        return "Staf Simpan Pinjam"
      case "OPERATOR_SEWA":
        return "Staf Sewa"
      default:
        return "Staf BUMDES"
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800"
      case "BENDAHARA":
        return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
      case "SEKRETARIS":
        return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800"
      default:
        return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800"
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-100 shrink-0 sticky top-0 h-screen">
        <div className="p-6 border-b border-slate-50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 tracking-tight text-sm leading-none">BUMDES BAROKAH</h1>
            <p className="text-xs text-slate-400 font-medium mt-1">Balongbesuk Jombang</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-100/50"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600"}`} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50 m-4 rounded-2xl flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <UserIcon className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <p className="font-semibold text-slate-800 text-xs truncate leading-none">{user.name}</p>
              <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border mt-1 leading-none ${getRoleColor(user.role)}`}>
                {getRoleLabel(user.role)}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 px-3 py-2 w-full bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded-xl text-xs font-semibold shadow-sm transition-all duration-200"
          >
            <LogOut className="w-3.5 h-3.5" />
            Keluar Sistem
          </button>
        </div>
      </aside>

      {/* Sidebar Mobile Toggle */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)} />
          <aside className="relative flex flex-col w-64 max-w-xs bg-white h-full shadow-2xl p-6">
            <div className="flex items-center justify-between pb-6 border-b border-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                  <Building2 className="w-4 h-4" />
                </div>
                <span className="font-bold text-slate-900 text-sm">BUMDES BAROKAH</span>
              </div>
              <button onClick={() => setIsMobileOpen(false)} className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 py-6 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive ? "bg-emerald-50 text-emerald-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-emerald-600" : "text-slate-400"}`} />
                    {item.name}
                  </Link>
                )
              })}
            </nav>

            <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <UserIcon className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-xs">{user.name}</p>
                  <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border mt-1 ${getRoleColor(user.role)}`}>
                    {getRoleLabel(user.role)}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 px-3 py-2 w-full bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded-xl text-xs font-semibold transition-all duration-200"
              >
                <LogOut className="w-3.5 h-3.5" />
                Keluar Sistem
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 h-16 flex items-center justify-between px-6 z-40">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-2 -ml-2 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600 md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
              <CalendarDays className="w-3.5 h-3.5 text-emerald-600" />
              <span>Selasa, 9 Juni 2026</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-bold text-slate-800">{user.name}</p>
              <p className="text-[10px] text-slate-400 font-semibold">{getRoleLabel(user.role)}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-sm shadow-emerald-600/20">
              {user.name[0]}
            </div>
          </div>
        </header>

        {/* Dynamic Page Children */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  )
}

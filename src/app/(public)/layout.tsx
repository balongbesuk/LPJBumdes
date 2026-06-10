import React from "react"
import Link from "next/link"
import { Building2, Newspaper, Home, LogIn } from "lucide-react"
import { getSettings } from "@/lib/settings"

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const settings = await getSettings()
  const bumdesName = settings.bumdes_name || "BUMDES Desa"
  const villageName = settings.village_name || ""
  const districtName = settings.district_name || ""
  const regencyName = settings.regency_name || ""
  const locationParts = [villageName, districtName, regencyName].filter(Boolean)
  const locationShort = locationParts.slice(0, 2).join(", ") || "Indonesia"
  const locationFull = locationParts.join(", ") || ""

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100/80 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform duration-200">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 tracking-tight text-sm sm:text-base leading-none block">
                {bumdesName}
              </span>
              {locationShort && (
                <span className="text-[10px] sm:text-xs text-slate-400 font-semibold mt-0.5 block">
                  {locationShort}
                </span>
              )}
            </div>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/50 transition-all duration-200"
            >
              <Home className="w-4 h-4 text-emerald-600" />
              Beranda
            </Link>
            <Link
              href="/berita"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/50 transition-all duration-200"
            >
              <Newspaper className="w-4 h-4 text-emerald-600" />
              Berita & Kegiatan
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs sm:text-sm shadow-md shadow-emerald-600/10 hover:shadow-emerald-700/20 transition-all active:scale-[0.98] ml-2"
            >
              <LogIn className="w-4 h-4" />
              Sistem SIM
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {/* Info Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-white">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold tracking-tight text-base">{bumdesName}</span>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed text-slate-400 font-medium">
                Badan Usaha Milik Desa (BUMDES) berkomitmen meningkatkan perekonomian masyarakat desa melalui tata kelola usaha yang transparan, modern, dan mandiri.
              </p>
            </div>

            {/* Links Column */}
            <div className="space-y-4">
              <h4 className="font-bold text-white text-sm uppercase tracking-wider">Navigasi Cepat</h4>
              <ul className="space-y-2.5 text-xs sm:text-sm">
                <li>
                  <Link href="/" className="hover:text-emerald-400 transition-colors">Beranda</Link>
                </li>
                <li>
                  <Link href="/berita" className="hover:text-emerald-400 transition-colors">Berita & Kegiatan</Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-emerald-400 transition-colors">Akses Sistem Manajemen (SIM)</Link>
                </li>
              </ul>
            </div>

            {/* Address Column */}
            <div className="space-y-4">
              <h4 className="font-bold text-white text-sm uppercase tracking-wider">Informasi</h4>
              {locationFull && (
                <p className="text-xs sm:text-sm leading-relaxed text-slate-400 font-medium">
                  {locationFull}
                </p>
              )}
              <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                Data kontak dan alamat lengkap dapat dikonfigurasi melalui menu Pengaturan di Sistem Manajemen.
              </p>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-xs text-slate-500 font-semibold flex flex-col sm:flex-row sm:justify-between gap-4">
            <p>{bumdesName} &copy; {new Date().getFullYear()}. Hak Cipta Dilindungi.</p>
            {locationFull && <p>{locationFull}</p>}
          </div>
        </div>
      </footer>
    </div>
  )
}

import React from "react"
import Link from "next/link"
import { ArrowLeft, Map, CheckCircle, Home, Calendar, Shield, HelpCircle } from "lucide-react"
import { getSettings } from "@/lib/settings"

export default async function SewaLahanDetailPage() {
  const settings = await getSettings()
  const name = settings.bumdes_name || "BUMDES Desa"

  return (
    <div className="min-h-screen bg-slate-50/30 pb-20">
      {/* Header / Hero */}
      <section className="relative bg-slate-950 text-white overflow-hidden py-16 sm:py-24">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Map className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">Unit Usaha BUMDes</span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Unit Sewa Lahan & Lapak</h1>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-10">
        {/* Overview */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">Deskripsi Layanan</h2>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-semibold">
            {settings.sewa_lahan_description || `Unit Sewa Lahan BUMDes ${name} menyediakan kavling usaha berupa lapak tenda dan bangunan warung permanen di lokasi-lokasi strategis desa. Kami bertujuan mendukung akselerasi usaha mikro warga lokal dan penataan PKL agar lebih tertib, bersih, serta ramai dikunjungi pembeli.`}
          </p>
        </div>

        {/* Lahan Types & Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Home className="w-5 h-5 text-amber-600" />
              Tipe Kavling Usaha
            </h3>
            <ul className="space-y-4 text-xs sm:text-sm text-slate-500 font-semibold">
              <li className="space-y-1">
                <span className="text-slate-800 font-bold block">1. Lapak Tenda UMKM</span>
                <p className="text-[11px] leading-relaxed">Cocok untuk kuliner sore/malam, pakaian, atau kerajinan. Disediakan dalam shift (Pagi/Malam) atau harian.</p>
              </li>
              <li className="space-y-1">
                <span className="text-slate-800 font-bold block">2. Warung Permanen Desa</span>
                <p className="text-[11px] leading-relaxed">Bangunan fisik berukuran 3x4 meter yang disewakan dengan kontrak jangka panjang (tahunan) untuk usaha kuliner menetap, kelontong, atau jasa.</p>
              </li>
            </ul>
          </div>

          <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-600" />
              Sistem Sewa & Tarif
            </h3>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-500 font-semibold">
              {settings.sewa_lahan_rates ? (
                settings.sewa_lahan_rates.split('\n').filter(Boolean).map((rate: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>{rate}</span>
                  </li>
                ))
              ) : (
                <>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <strong>Tarif Lapak Tenda:</strong> Sistem bulanan dengan harga terjangkau (Rp 100.000 s/d Rp 200.000 / bulan).
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <strong>Tarif Warung Permanen:</strong> Sistem kontrak tahunan (mulai dari Rp 1.500.000 s/d Rp 3.000.000 / tahun).
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    Sudah termasuk fasilitas kebersihan, pembuangan sampah terpadu, dan akses parkir pengunjung.
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Rules & Procedure Accordion */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-amber-600" />
            Ketentuan & Cara Pendaftaran
          </h2>

          <div className="space-y-4">
            {settings.sewa_lahan_requirements ? (
              settings.sewa_lahan_requirements.split('\n').filter(Boolean).map((req: string, idx: number) => (
                <div key={idx} className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
                  <h4 className="font-bold text-slate-800 text-xs sm:text-sm">{idx + 1}. {req}</h4>
                </div>
              ))
            ) : (
              <>
                <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
                  <h4 className="font-bold text-slate-800 text-xs sm:text-sm">1. Prioritas Warga Desa Setempat</h4>
                  <p className="mt-1 text-xs text-slate-500 font-semibold leading-relaxed">
                    Kavling dan lapak diprioritaskan bagi pelaku UMKM yang merupakan warga asli desa dibuktikan dengan KTP dan Kartu Keluarga (KK).
                  </p>
                </div>

                <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
                  <h4 className="font-bold text-slate-800 text-xs sm:text-sm">2. Pengaturan Listrik & Air Bersih</h4>
                  <p className="mt-1 text-xs text-slate-500 font-semibold leading-relaxed">
                    Setiap kavling/warung dilengkapi dengan meteran listrik token mandiri. Pembayaran listrik bulanan diselesaikan langsung oleh penyewa secara online melalui unit PPOB.
                  </p>
                </div>

                <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
                  <h4 className="font-bold text-slate-800 text-xs sm:text-sm">3. Alur Pengajuan Lahan Kosong</h4>
                  <p className="mt-1 text-xs text-slate-500 font-semibold leading-relaxed">
                    Penyewa baru menghubungi pengurus untuk menanyakan kavling yang masih kosong $\rightarrow$ Mengisi formulir sewa di kantor BUMDes $\rightarrow$ Penandatanganan kontrak sewa $\rightarrow$ Penyerahan kunci lapak.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-8 text-center text-white space-y-6 relative overflow-hidden">
          <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="max-w-lg mx-auto space-y-3 relative z-10">
            <h3 className="font-bold text-lg sm:text-xl">Mulai Usaha Anda Bersama BUMDes</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-semibold">
              Ingin menyewa lapak/kavling strategis desa untuk usaha makanan, pakaian, atau kelontong? Hubungi pengelola sewa lahan kami sekarang untuk mendapatkan lokasi terbaik.
            </p>
          </div>
          <a
            href={`https://wa.me/${settings.sewa_lahan_whatsapp || "6281234567890"}?text=Halo%20Admin%20BUMDES%2C%20saya%20warga%20ingin%20bertanya%20mengenai%20ketersediaan%20kavling%20Sewa%20Lahan%20UMKM...`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition-all duration-200 cursor-pointer relative z-10"
          >
            Hubungi Pengelola Lahan (WhatsApp)
          </a>
        </div>
      </section>
    </div>
  )
}

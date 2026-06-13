import React from "react"
import Link from "next/link"
import { ArrowLeft, Building2, CheckCircle, MapPin, Calendar, Users, HelpCircle } from "lucide-react"
import { getSettings } from "@/lib/settings"

export default async function SewaGedungDetailPage() {
  const settings = await getSettings()
  const name = settings.bumdes_name || "BUMDES Desa"

  return (
    <div className="min-h-screen bg-slate-50/30 pb-20">
      {/* Header / Hero */}
      <section className="relative bg-slate-950 text-white overflow-hidden py-16 sm:py-24">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block">Unit Usaha BUMDes</span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Unit Sewa Gedung</h1>
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
            {settings.sewa_gedung_description || `BUMDes ${name} mengelola dan menyewakan Gedung Serbaguna Desa sebagai pusat fasilitas olahraga kemasyarakatan, resepsi pernikahan, pertemuan/rapat warga, serta acara hiburan seni budaya. Kami berkomitmen memberikan tempat yang bersih, nyaman, dan bertarif terjangkau demi menunjang kegiatan sosial-ekonomi warga desa setempat.`}
          </p>
        </div>

        {/* Facilities & Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Fasilitas Gedung
            </h3>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-500 font-semibold">
              {settings.sewa_gedung_facilities ? (
                settings.sewa_gedung_facilities.split('\n').filter(Boolean).map((fac: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span>{fac}</span>
                  </li>
                ))
              ) : (
                <>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    Area Hall utama luas dengan kapasitas hingga 800 orang tamu berdiri.
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    Lapangan Bulutangkis (Badminton) indoor aktif sebanyak 2 line lapangan.
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    Panggung permanen, toilet bersih, ruang ganti pakaian, dan area parkir memadai.
                  </li>
                </>
              )}
            </ul>
          </div>

          <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Jenis Kegiatan & Tarif
            </h3>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-500 font-semibold">
              {settings.sewa_gedung_rates ? (
                settings.sewa_gedung_rates.split('\n').filter(Boolean).map((rate: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span>{rate}</span>
                  </li>
                ))
              ) : (
                <>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <strong>Olahraga Bulutangkis:</strong> Rp 20.000 / jam per lapangan.
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <strong>Acara Resepsi / Pesta Pernikahan:</strong> Mulai dari Rp 1.500.000 / hari.
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <strong>Rapat / Seminar / Sosialisasi:</strong> Rp 500.000 / hari.
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Booking Process Accordion */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-blue-600" />
            Alur Pemesanan (Booking)
          </h2>

          <div className="space-y-4">
            <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
              <h4 className="font-bold text-slate-800 text-xs sm:text-sm">1. Cek Ketersediaan Tanggal secara Online</h4>
              <p className="mt-1 text-xs text-slate-500 font-semibold leading-relaxed">
                Warga desa dapat melihat jadwal pemakaian gedung yang sudah dipesan secara transparan melalui sistem SIM BUMDes di website ini untuk mencari tanggal kosong.
              </p>
            </div>

            <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
              <h4 className="font-bold text-slate-800 text-xs sm:text-sm">2. Konfirmasi & Pembayaran Uang Muka (DP)</h4>
              <p className="mt-1 text-xs text-slate-500 font-semibold leading-relaxed">
                Untuk menjamin kepastian tanggal pemakaian dan mencegah bentrok pesanan, warga wajib mendatangi Kantor BUMDes untuk menyetor DP minimal 30% dari total sewa dengan membawa fotokopi KTP.
              </p>
            </div>

            <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
              <h4 className="font-bold text-slate-800 text-xs sm:text-sm">3. Pelunasan & Validasi</h4>
              <p className="mt-1 text-xs text-slate-500 font-semibold leading-relaxed">
                Pelunasan sewa gedung diselesaikan maksimal H-3 sebelum pelaksanaan acara. Status pesanan akan otomatis terubah menjadi "Lunas (PAID)" di dalam sistem manajemen BUMDes setelah divalidasi petugas sewa.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-8 text-center text-white space-y-6 relative overflow-hidden">
          <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="max-w-lg mx-auto space-y-3 relative z-10">
            <h3 className="font-bold text-lg sm:text-xl">Ajukan Penyewaan Gedung</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-semibold">
              Apakah Anda ingin memesan gedung untuk pernikahan, turnamen olahraga, atau rapat penting? Hubungi admin pemesanan gedung kami sekarang untuk memeriksa slot tanggal terbaik.
            </p>
          </div>
          <a
            href={`https://wa.me/${settings.sewa_gedung_whatsapp || "6281234567890"}?text=Halo%20Admin%20BUMDES%2C%20saya%20warga%20ingin%20bertanya%20mengenai%20slot%20jadwal%20kosong%20Sewa%20Gedung...`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-lg shadow-blue-500/20 active:scale-95 transition-all duration-200 cursor-pointer relative z-10"
          >
            Hubungi Admin Sewa Gedung (WhatsApp)
          </a>
        </div>
      </section>
    </div>
  )
}

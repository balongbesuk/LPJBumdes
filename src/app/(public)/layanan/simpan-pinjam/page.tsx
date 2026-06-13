import React from "react"
import Link from "next/link"
import { ArrowLeft, Coins, CheckCircle, Shield, Clock, HelpCircle } from "lucide-react"
import { getSettings } from "@/lib/settings"

export default async function SimpanPinjamDetailPage() {
  const settings = await getSettings()
  const name = settings.bumdes_name || "BUMDES Desa"

  return (
    <div className="min-h-screen bg-slate-50/30 pb-20">
      {/* Header / Hero */}
      <section className="relative bg-slate-950 text-white overflow-hidden py-16 sm:py-24">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Coins className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">Unit Usaha BUMDes</span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Unit Simpan Pinjam</h1>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-10">
        {/* Overview */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">Deskripsi Unit Usaha</h2>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-semibold">
            {settings.simpan_pinjam_description || `Unit Simpan Pinjam BUMDes ${name} didirikan khusus untuk memberikan akses permodalan yang mudah, cepat, dan aman bagi masyarakat desa serta kelompok tani (Poktan). Kami berfokus untuk menunjang produktivitas ekonomi pedesaan dan memberantas ketergantungan warga pada pinjaman liar dengan suku bunga yang menjerat.`}
          </p>
        </div>

        {/* Benefits & Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-600" />
              Keunggulan Kami
            </h3>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-500 font-semibold">
              {settings.simpan_pinjam_benefits ? (
                settings.simpan_pinjam_benefits.split('\n').filter(Boolean).map((benefit: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </li>
                ))
              ) : (
                <>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    Suku bunga flat kompetitif yang ditentukan oleh hasil Musyawarah Desa (Musdes).
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    Proses pengajuan transparan, kekeluargaan, dan bebas biaya administrasi siluman.
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    Dana simpanan diputar kembali untuk membiayai usaha produktif warga lokal.
                  </li>
                </>
              )}
            </ul>
          </div>

          <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" />
              Ketentuan Pinjaman
            </h3>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-500 font-semibold">
              {settings.simpan_pinjam_rates ? (
                settings.simpan_pinjam_rates.split('\n').filter(Boolean).map((rate: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{rate}</span>
                  </li>
                ))
              ) : (
                <>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <strong>Plafon Usaha:</strong> Maksimal pinjaman Rp 10.000.000 (disesuaikan dengan skala usaha).
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <strong>Tenor Waktu:</strong> Fleksibel mulai dari 3 bulan s/d 12 bulan.
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    Peminjam wajib terdaftar sebagai anggota aktif BUMDes.
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Requirements Accordion */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-emerald-600" />
            Persyaratan & Cara Pendaftaran
          </h2>

          <div className="space-y-4">
            {settings.simpan_pinjam_requirements ? (
              settings.simpan_pinjam_requirements.split('\n').filter(Boolean).map((req: string, idx: number) => (
                <div key={idx} className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
                  <h4 className="font-bold text-slate-800 text-xs sm:text-sm">{idx + 1}. {req}</h4>
                </div>
              ))
            ) : (
              <>
                <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
                  <h4 className="font-bold text-slate-800 text-xs sm:text-sm">1. Syarat Administrasi Anggota</h4>
                  <ul className="list-disc pl-5 mt-2 text-xs text-slate-500 font-semibold space-y-1">
                    <li>Fotokopi KTP suami/istri (bagi yang sudah menikah).</li>
                    <li>Fotokopi Kartu Keluarga (KK) yang masih berlaku.</li>
                    <li>Surat Keterangan Usaha (SKU) dari RT/RW atau Kantor Desa (jika untuk pinjaman usaha).</li>
                    <li>Pas foto ukuran 3x4 sebanyak 2 lembar.</li>
                  </ul>
                </div>

                <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
                  <h4 className="font-bold text-slate-800 text-xs sm:text-sm">2. Jenis Simpanan Wajib Anggota</h4>
                  <ul className="list-disc pl-5 mt-2 text-xs text-slate-500 font-semibold space-y-1">
                    <li><strong>Simpanan Pokok:</strong> Dibayarkan sekali saat pertama kali mendaftar sebagai anggota.</li>
                    <li><strong>Simpanan Wajib:</strong> Iuran rutin bulanan yang disetorkan sesuai keputusan rapat anggota.</li>
                    <li><strong>Simpanan Sukarela:</strong> Tabungan bebas yang dapat ditarik sewaktu-waktu oleh anggota.</li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-8 text-center text-white space-y-6 relative overflow-hidden">
          <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="max-w-lg mx-auto space-y-3 relative z-10">
            <h3 className="font-bold text-lg sm:text-xl">Ajukan Permodalan Anda Sekarang</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-semibold">
              Butuh modal tambahan untuk bertani, berdagang, atau memulai UMKM? Hubungi pengurus kami melalui WhatsApp untuk menjadwalkan konsultasi awal di kantor BUMDes.
            </p>
          </div>
          <a
            href={`https://wa.me/${settings.simpan_pinjam_whatsapp || "6281234567890"}?text=Halo%20Admin%20BUMDES%2C%20saya%20warga%20ingin%20berkonsultasi%20mengenai%20syarat%20Simpan%20Pinjam...`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-lg shadow-emerald-500/20 active:scale-95 transition-all duration-200 cursor-pointer relative z-10"
          >
            Hubungi Pengurus Simpan Pinjam (WhatsApp)
          </a>
        </div>
      </section>
    </div>
  )
}

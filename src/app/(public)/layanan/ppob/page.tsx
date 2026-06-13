import React from "react"
import Link from "next/link"
import { ArrowLeft, CreditCard, CheckCircle, Smartphone, Zap, Droplet, ShieldCheck, HelpCircle } from "lucide-react"
import { getSettings } from "@/lib/settings"

export default async function PpobDetailPage() {
  const settings = await getSettings()
  const name = settings.bumdes_name || "BUMDES Desa"

  return (
    <div className="min-h-screen bg-slate-50/30 pb-20">
      {/* Header / Hero */}
      <section className="relative bg-slate-950 text-white overflow-hidden py-16 sm:py-24">
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <CreditCard className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest block">Unit Usaha BUMDes</span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Unit Pembayaran Tagihan (PPOB)</h1>
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
            {settings.ppob_description || `Unit PPOB (Payment Point Online Bank) BUMDes ${name} adalah pusat layanan pembayaran digital warga desa yang dekat dan terpercaya. Kini warga tidak perlu menempuh perjalanan jauh ke kota kecamatan hanya untuk mengantre membayar tagihan. Cukup kunjungi loket BUMDes atau agen pos desa kami untuk melunasi tagihan bulanan Anda secara cepat.`}
          </p>
        </div>

        {/* Payment Channels & Services */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Zap className="w-5 h-5 text-violet-600" />
              Tagihan Rumah Tangga
            </h3>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-500 font-semibold">
              {settings.ppob_billings ? (
                settings.ppob_billings.split('\n').filter(Boolean).map((billing: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
                    <span>{billing}</span>
                  </li>
                ))
              ) : (
                <>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
                    <strong>Listrik PLN:</strong> Pembelian token prabayar dan pelunasan tagihan listrik pascabayar.
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
                    <strong>PDAM:</strong> Pembayaran tagihan air bersih bulanan PDAM kabupaten setempat.
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
                    <strong>BPJS Kesehatan:</strong> Pembayaran iuran jaminan kesehatan mandiri untuk keluarga.
                  </li>
                </>
              )}
            </ul>
          </div>

          <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-violet-600" />
              Layanan Digital & Pulsa
            </h3>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-500 font-semibold">
              {settings.ppob_services ? (
                settings.ppob_services.split('\n').filter(Boolean).map((service: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
                    <span>{service}</span>
                  </li>
                ))
              ) : (
                <>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
                    Isi ulang pulsa reguler, paket data internet seluruh operator seluler (Telkomsel, Indosat, XL, Smartfren, dll).
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
                    Top-up saldo e-wallet (DANA, OVO, ShopeePay, GoPay, LinkAja) untuk kebutuhan belanja digital.
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
                    Pembayaran cicilan pembiayaan (motor/mobil) dan transfer antar bank nasional.
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Benefits Accordion */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-violet-600" />
            Kenapa Membayar di BUMDes?
          </h2>

          <div className="space-y-4">
            {settings.ppob_reasons ? (
              settings.ppob_reasons.split('\n').filter(Boolean).map((reason: string, idx: number) => {
                const parts = reason.split(':');
                const title = parts[0];
                const desc = parts.slice(1).join(':').trim();
                return (
                  <div key={idx} className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 flex gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs sm:text-sm">{title}</h4>
                      {desc && <p className="mt-1 text-xs text-slate-500 font-semibold leading-relaxed">{desc}</p>}
                    </div>
                  </div>
                );
              })
            ) : (
              <>
                <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 flex gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs sm:text-sm">1. Aman & Terbuka</h4>
                    <p className="mt-1 text-xs text-slate-500 font-semibold leading-relaxed">
                      Setiap pembayaran langsung menghasilkan struk bukti pembayaran fisik berstempel resmi BUMDes dan tersimpan rapi dalam arsip digital kami.
                    </p>
                  </div>
                </div>

                <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 flex gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs sm:text-sm">2. Dekat & Menghemat Waktu</h4>
                    <p className="mt-1 text-xs text-slate-500 font-semibold leading-relaxed">
                      Loket berlokasi di Kantor BUMDes atau agen pos desa di balai desa, menghemat waktu dan ongkos transportasi warga.
                    </p>
                  </div>
                </div>

                <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 flex gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs sm:text-sm">3. Membangun Desa Sendiri</h4>
                    <p className="mt-1 text-xs text-slate-500 font-semibold leading-relaxed">
                      Sebagian dari biaya admin yang Anda bayarkan di loket BUMDes akan disalurkan kembali sebagai laba bersih BUMDes yang nantinya berkontribusi bagi dana pembangunan desa (PADes).
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-8 text-center text-white space-y-6 relative overflow-hidden">
          <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-violet-500/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="max-w-lg mx-auto space-y-3 relative z-10">
            <h3 className="font-bold text-lg sm:text-xl">Butuh Info atau Pembayaran Kolektif?</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-semibold">
              Apakah Anda memiliki tagihan bernilai besar, ingin menjadi mitra agen tagihan di dusun Anda, atau mengalami keluhan transaksi? Hubungi admin PPOB kami sekarang.
            </p>
          </div>
          <a
            href={`https://wa.me/${settings.ppob_whatsapp || "6281234567890"}?text=Halo%20Admin%20BUMDES%2C%20saya%20warga%20ingin%20bertanya%20mengenai%20layanan%20loket%20Pembayaran%20Digital...`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-lg shadow-violet-500/20 active:scale-95 transition-all duration-200 cursor-pointer relative z-10"
          >
            Hubungi Loket Pembayaran (WhatsApp)
          </a>
        </div>
      </section>
    </div>
  )
}

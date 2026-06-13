import React from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Store, ShoppingBag } from "lucide-react"
import { getSettings } from "@/lib/settings"

export default async function PojokUmkmPage() {
  const settings = await getSettings()
  let umkmList = []
  try {
    if (settings.umkm_list) {
      umkmList = JSON.parse(settings.umkm_list)
    }
  } catch (e) {
    console.error("Error parsing umkm_list", e)
  }

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
              <ShoppingBag className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">Ekonomi Kreatif Desa</span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Seluruh Produk Pojok UMKM</h1>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {umkmList.length > 0 ? (
            umkmList.map((item: any) => (
              <div key={item.id} className="group bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm hover:shadow-[0_25px_45px_-20px_rgba(15,23,42,0.06)] hover:-translate-y-1.5 transition-all duration-500 flex flex-col justify-between h-full">
                <div className="space-y-5">
                  <div className="w-full h-52 overflow-hidden bg-slate-50 relative">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="px-6 pb-4 space-y-2">
                    <span className="inline-flex px-2.5 py-1 rounded-full bg-amber-50 border border-amber-100 text-amber-700 text-[10px] font-bold">{item.category}</span>
                    <h3 className="font-extrabold text-slate-800 text-sm sm:text-base leading-snug">
                      {item.name}
                    </h3>
                    <p className="text-slate-500 text-xs leading-relaxed font-semibold">
                      {item.description}
                    </p>
                    <p className="text-[10px] text-slate-400 font-semibold">Pemilik: {item.owner}</p>
                  </div>
                </div>
                <div className="p-6 pt-0">
                  <a
                    href={`https://wa.me/${item.phone}?text=Halo%20${item.owner}%2C%20saya%20tertarik%20membeli%20${item.name}...`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-500 transition-colors"
                  >
                    Hubungi Penjual
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 py-12 text-center text-slate-400 font-semibold text-xs">
              Belum ada produk UMKM terdaftar di Pojok UMKM.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

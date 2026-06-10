"use client"

import React from "react"
import { DollarSign } from "lucide-react"
import { formatRupiah } from "@/lib/utils"

interface ShuSettings {
  pengurus: number
  pengawas: number
  sosial: number
  modal: number
  desa: number
}

interface ShuTabProps {
  report: {
    labaRugi: {
      netProfit: number
    }
    shuSettings: ShuSettings
  }
}

export default function ShuTab({ report }: ShuTabProps) {
  const calculateShuAllocation = (percentage: number) => {
    const profit = Math.max(report.labaRugi.netProfit, 0)
    return profit * (percentage / 100)
  }

  return (
    <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-3xl shadow-sm print-container space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="font-bold text-slate-800 text-sm tracking-tight">Rencana Pembagian Sisa Hasil Usaha</h3>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
            Alokasi pembagian laba bersih berjalan sesuai ketetapan AD/ART BUMDES.
          </p>
        </div>
        <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-between w-64">
          <span className="text-[10px] font-bold text-emerald-800">Laba Bersih Berjalan:</span>
          <span className="font-bold text-emerald-700 text-sm">{formatRupiah(report.labaRugi.netProfit)}</span>
        </div>
      </div>

      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="text-slate-400 font-bold border-b border-slate-50">
            <th className="py-2">Rencana Distribusi Alokasi SHU</th>
            <th className="py-2 text-center">Persentase (%)</th>
            <th className="py-2 text-right">Nilai Alokasi (Rp)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 font-semibold text-slate-700">
          <tr className="hover:bg-slate-50/50">
            <td className="py-3.5">
              <div className="text-slate-800">Bonus Pengurus / Pelaksana Operasional</div>
              <span className="text-[9px] text-slate-400 mt-1 block">Insentif kinerja jajaran pengurus</span>
            </td>
            <td className="py-3.5 text-center font-bold text-slate-800">{report.shuSettings.pengurus}%</td>
            <td className="py-3.5 text-right font-bold text-slate-700">
              {formatRupiah(calculateShuAllocation(report.shuSettings.pengurus))}
            </td>
          </tr>
          <tr className="hover:bg-slate-50/50">
            <td className="py-3.5">
              <div className="text-slate-800">Bonus Pengawas & Penasihat</div>
              <span className="text-[9px] text-slate-400 mt-1 block">Insentif penasihat (Kades) dan badan pengawas</span>
            </td>
            <td className="py-3.5 text-center font-bold text-slate-800">{report.shuSettings.pengawas}%</td>
            <td className="py-3.5 text-right font-bold text-slate-700">
              {formatRupiah(calculateShuAllocation(report.shuSettings.pengawas))}
            </td>
          </tr>
          <tr className="hover:bg-slate-50/50">
            <td className="py-3.5">
              <div className="text-slate-800">Dana Sosial, Pendidikan & Pelatihan</div>
              <span className="text-[9px] text-slate-400 mt-1 block">Alokasi kegiatan kemasyarakatan dan pelatihan warga</span>
            </td>
            <td className="py-3.5 text-center font-bold text-slate-800">{report.shuSettings.sosial}%</td>
            <td className="py-3.5 text-right font-bold text-slate-700">
              {formatRupiah(calculateShuAllocation(report.shuSettings.sosial))}
            </td>
          </tr>
          <tr className="hover:bg-slate-50/50">
            <td className="py-3.5">
              <div className="text-slate-800">Penambahan Cadangan Modal BUMDES</div>
              <span className="text-[9px] text-slate-400 mt-1 block">Diputar kembali ke modal usaha BUMDES</span>
            </td>
            <td className="py-3.5 text-center font-bold text-slate-800">{report.shuSettings.modal}%</td>
            <td className="py-3.5 text-right font-bold text-slate-700">
              {formatRupiah(calculateShuAllocation(report.shuSettings.modal))}
            </td>
          </tr>
          <tr className="hover:bg-slate-50/50">
            <td className="py-3.5">
              <div className="text-slate-800">Kas Desa (Pendapatan Asli Desa - PADes)</div>
              <span className="text-[9px] text-slate-400 mt-1 block">Setoran kontribusi langsung ke kas pembangunan desa</span>
            </td>
            <td className="py-3.5 text-center font-bold text-slate-800">{report.shuSettings.desa}%</td>
            <td className="py-3.5 text-right font-bold text-emerald-800">
              {formatRupiah(calculateShuAllocation(report.shuSettings.desa))}
            </td>
          </tr>
          <tr className="bg-slate-50 font-bold border-t border-slate-100 text-slate-900">
            <td className="py-3.5">TOTAL ALOKASI SHU TERBAGI</td>
            <td className="py-3.5 text-center">100%</td>
            <td className="py-3.5 text-right text-emerald-800">
              {formatRupiah(
                report.labaRugi.netProfit > 0 ? report.labaRugi.netProfit : 0
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

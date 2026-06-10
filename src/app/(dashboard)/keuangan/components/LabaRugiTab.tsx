"use client"

import React from "react"
import { formatRupiah } from "@/lib/utils"

interface Revenue {
  code: string
  name: string
  amount: number
}

interface Expense {
  code: string
  name: string
  amount: number
}

interface LabaRugiTabProps {
  report: {
    labaRugi: {
      revenues: Revenue[]
      expenses: Expense[]
      totalRevenue: number
      totalExpense: number
      netProfit: number
    }
  }
}

export default function LabaRugiTab({ report }: LabaRugiTabProps) {
  return (
    <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-3xl shadow-sm print-container space-y-6">
      {/* Revenues Table */}
      <div className="space-y-3">
        <h3 className="font-bold text-slate-800 text-sm tracking-tight border-b border-slate-100 pb-2">
          I. PENDAPATAN HASIL USAHA
        </h3>
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="text-slate-400 font-bold border-b border-slate-50">
              <th className="py-2 w-24">Kode Akun</th>
              <th className="py-2">Uraian Akun</th>
              <th className="py-2 text-right">Realisasi (Rp)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 font-semibold text-slate-700">
            {report.labaRugi.revenues.map((rev) => (
              <tr key={rev.code}>
                <td className="py-3 text-slate-500 font-bold">{rev.code}</td>
                <td className="py-3">{rev.name}</td>
                <td className="py-3 text-right">{formatRupiah(rev.amount)}</td>
              </tr>
            ))}
            <tr className="bg-slate-50/55 font-bold border-t border-slate-100 text-slate-900">
              <td className="py-3"></td>
              <td className="py-3 text-slate-800">TOTAL PENDAPATAN HASIL USAHA</td>
              <td className="py-3 text-right text-emerald-800">
                {formatRupiah(report.labaRugi.totalRevenue)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Expenses Table */}
      <div className="space-y-3 pt-4">
        <h3 className="font-bold text-slate-800 text-sm tracking-tight border-b border-slate-100 pb-2">
          II. BEBAN OPERASIONAL & UNIT
        </h3>
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="text-slate-400 font-bold border-b border-slate-50">
              <th className="py-2 w-24">Kode Akun</th>
              <th className="py-2">Uraian Akun</th>
              <th className="py-2 text-right">Realisasi (Rp)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 font-semibold text-slate-700">
            {report.labaRugi.expenses.map((exp) => (
              <tr key={exp.code}>
                <td className="py-3 text-slate-500 font-bold">{exp.code}</td>
                <td className="py-3">{exp.name}</td>
                <td className="py-3 text-right">{formatRupiah(exp.amount)}</td>
              </tr>
            ))}
            <tr className="bg-slate-50/55 font-bold border-t border-slate-100 text-slate-900">
              <td className="py-3"></td>
              <td className="py-3 text-slate-800">TOTAL BEBAN OPERASIONAL & BIAYA</td>
              <td className="py-3 text-right text-rose-800">
                {formatRupiah(report.labaRugi.totalExpense)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Net profit summary Card */}
      <div className="bg-emerald-50/50 border border-emerald-100 p-6 rounded-2xl flex items-center justify-between mt-6">
        <div>
          <h4 className="text-emerald-800 font-bold text-sm leading-none">SISA HASIL USAHA (LABA BERSIH)</h4>
          <p className="text-[10px] text-emerald-600 font-semibold mt-1">Laba bersih operasional berjalan sebelum pembagian</p>
        </div>
        <div className="text-emerald-800 font-bold text-lg">
          {formatRupiah(report.labaRugi.netProfit)}
        </div>
      </div>
    </div>
  )
}

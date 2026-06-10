"use client"

import React from "react"
import { CheckCircle, AlertTriangle } from "lucide-react"
import { formatRupiah } from "@/lib/utils"

interface CurrentAsset {
  name: string
  amount: number
}

interface Liability {
  name: string
  amount: number
}

interface Equity {
  name: string
  amount: number
}

interface NeracaTabProps {
  report: {
    neraca: {
      currentAssets: CurrentAsset[]
      totalCurrentAssets: number
      fixedAssets: {
        peralatan: number
        akumulasiPenyusutan: number
        net: number
      }
      totalAssets: number
      liabilities: Liability[]
      totalLiabilities: number
      equity: Equity[]
      totalEquity: number
      totalLiabilitiesAndEquity: number
    }
  }
  isNeracaBalanced: boolean
}

export default function NeracaTab({ report, isNeracaBalanced }: NeracaTabProps) {
  return (
    <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-3xl shadow-sm print-container space-y-6">
      {/* Balancing Alert (No Print) */}
      <div className="no-print flex items-center justify-between p-3 border rounded-xl bg-slate-50 text-xs">
        <div className="flex items-center gap-2 font-semibold">
          {isNeracaBalanced ? (
            <>
              <CheckCircle className="w-4.5 h-4.5 text-emerald-500" />
              <span className="text-emerald-800">Neraca Seimbang (Balanced)</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-4.5 h-4.5 text-rose-500" />
              <span className="text-rose-800">Neraca Tidak Seimbang!</span>
            </>
          )}
        </div>
        <div className="text-slate-400 text-[10px] font-bold">
          Total Aset: {formatRupiah(report.neraca.totalAssets)}
        </div>
      </div>

      {/* Neraca Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-100">
        {/* Left side: Assets */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-800 text-sm tracking-tight border-b border-slate-100 pb-2">
            AKTIVA (ASET)
          </h3>

          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">A. ASET LANCAR</span>
            <table className="w-full text-xs font-semibold text-slate-700">
              <tbody>
                {report.neraca.currentAssets.map((asset, index) => (
                  <tr key={index} className="border-b border-slate-50/50">
                    <td className="py-2.5">{asset.name}</td>
                    <td className="py-2.5 text-right font-medium text-slate-600">{formatRupiah(asset.amount)}</td>
                  </tr>
                ))}
                <tr className="font-bold text-slate-800 bg-slate-50/30">
                  <td className="py-2.5">Total Aset Lancar</td>
                  <td className="py-2.5 text-right">{formatRupiah(report.neraca.totalCurrentAssets)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="space-y-2 pt-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">B. ASET TETAP</span>
            <table className="w-full text-xs font-semibold text-slate-700">
              <tbody>
                <tr className="border-b border-slate-50/50">
                  <td className="py-2.5">Peralatan & Inventaris</td>
                  <td className="py-2.5 text-right font-medium text-slate-600">{formatRupiah(report.neraca.fixedAssets.peralatan)}</td>
                </tr>
                <tr className="border-b border-slate-50/50 text-slate-400 italic">
                  <td className="py-2.5">Akumulasi Penyusutan Aset Tetap</td>
                  <td className="py-2.5 text-right font-medium">({formatRupiah(report.neraca.fixedAssets.akumulasiPenyusutan)})</td>
                </tr>
                <tr className="font-bold text-slate-800 bg-slate-50/30">
                  <td className="py-2.5">Total Aset Tetap (Net)</td>
                  <td className="py-2.5 text-right">{formatRupiah(report.neraca.fixedAssets.net)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-200/60 pt-4 flex justify-between font-bold text-slate-900 bg-emerald-50/30 p-3 rounded-xl">
            <span>TOTAL AKTIVA (ASET)</span>
            <span>{formatRupiah(report.neraca.totalAssets)}</span>
          </div>
        </div>

        {/* Right side: Liabilities and Equity */}
        <div className="space-y-4 md:pl-8 pt-6 md:pt-0">
          <h3 className="font-bold text-slate-800 text-sm tracking-tight border-b border-slate-100 pb-2">
            PASIVA (LIABILITAS & EKUITAS)
          </h3>

          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">A. LIABILITAS (KEWAJIBAN)</span>
            <table className="w-full text-xs font-semibold text-slate-700">
              <tbody>
                {report.neraca.liabilities.map((liab, index) => (
                  <tr key={index} className="border-b border-slate-50/50">
                    <td className="py-2.5">{liab.name}</td>
                    <td className="py-2.5 text-right font-medium text-slate-600">{formatRupiah(liab.amount)}</td>
                  </tr>
                ))}
                <tr className="font-bold text-slate-800 bg-slate-50/30">
                  <td className="py-2.5">Total Liabilitas</td>
                  <td className="py-2.5 text-right">{formatRupiah(report.neraca.totalLiabilities)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="space-y-2 pt-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">B. EKUITAS (MODAL)</span>
            <table className="w-full text-xs font-semibold text-slate-700">
              <tbody>
                {report.neraca.equity.map((eq, index) => (
                  <tr key={index} className="border-b border-slate-50/50">
                    <td className="py-2.5">{eq.name}</td>
                    <td className="py-2.5 text-right font-medium text-slate-600">{formatRupiah(eq.amount)}</td>
                  </tr>
                ))}
                <tr className="font-bold text-slate-800 bg-slate-50/30">
                  <td className="py-2.5">Total Ekuitas</td>
                  <td className="py-2.5 text-right">{formatRupiah(report.neraca.totalEquity)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-200/60 pt-4 flex justify-between font-bold text-slate-900 bg-emerald-50/30 p-3 rounded-xl">
            <span>TOTAL PASIVA (LIABILITAS & MODAL)</span>
            <span>{formatRupiah(report.neraca.totalLiabilitiesAndEquity)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

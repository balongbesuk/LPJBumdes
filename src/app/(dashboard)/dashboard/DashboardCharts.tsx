"use client"

import React from "react"
import { TrendingUp, BarChart3, PieChart as PieChartIcon } from "lucide-react"
import { formatRupiah } from "@/lib/utils"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
  PieChart,
  Pie,
} from "recharts"

interface StatsData {
  totalRevenue: number
  revenueData: { name: string; value: number; color: string }[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-100 shadow-xl">
        <p className="text-xs font-bold text-slate-800 mb-1">{label}</p>
        <p className="text-sm font-bold text-emerald-600">{formatRupiah(payload[0].value)}</p>
      </div>
    )
  }
  return null
}

export default function DashboardCharts({ stats }: { stats: StatsData }) {
  // Compute pie chart data
  const pieData = stats.revenueData.map((item) => ({
    name: item.name,
    value: item.value,
    fill: item.color,
  }))

  // Compute revenue percentages
  const revenueWithPct = stats.revenueData.map((item) => ({
    ...item,
    pct: stats.totalRevenue > 0 ? ((item.value / stats.totalRevenue) * 100).toFixed(1) : "0",
  }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Revenue Bar Chart */}
      <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm lg:col-span-2 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm tracking-tight">Pendapatan Unit Usaha</h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Komparasi performa setiap unit bisnis</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-3 py-2 rounded-2xl text-xs font-bold border border-emerald-100">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{formatRupiah(stats.totalRevenue)}</span>
          </div>
        </div>

        <div className="flex-1 w-full h-72 min-h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#94a3b8"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                dy={8}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={9}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${(v / 1000000).toFixed(0)}jt`}
                width={45}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={48}>
                {stats.revenueData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue legend */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-5 mt-2 border-t border-slate-50">
          {revenueWithPct.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></div>
              <div>
                <span className="text-[9px] text-slate-500 font-semibold block leading-tight">{item.name}</span>
                <span className="text-[10px] text-slate-700 font-bold">{item.pct}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pie Chart Distribution */}
      <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
            <PieChartIcon className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm tracking-tight">Distribusi Pendapatan</h3>
            <p className="text-[10px] text-slate-400 font-semibold">Proporsi kontribusi per unit</p>
          </div>
        </div>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`pie-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any) => [formatRupiah(value), "Pendapatan"]}
                contentStyle={{
                  backgroundColor: "#fff",
                  borderRadius: "12px",
                  border: "1px solid #f1f5f9",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.05)",
                  fontSize: "11px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Pie legend */}
        <div className="space-y-2 pt-2">
          {revenueWithPct.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-slate-600 font-semibold">{item.name}</span>
              </div>
              <span className="text-slate-800 font-bold">{item.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

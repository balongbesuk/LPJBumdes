"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

export interface BumdesSettings {
  bumdes_name: string
  village_name: string
  district_name: string
  regency_name: string
  shu_pengurus_pct: string
  shu_pengawas_pct: string
  shu_sosial_pct: string
  shu_modal_pct: string
  shu_desa_pct: string
}

const SettingsContext = createContext<BumdesSettings | null>(null)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<BumdesSettings | null>(null)

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/setup")
        const json = await res.json()
        if (json.success && json.data) {
          setSettings(json.data as BumdesSettings)
        }
      } catch (err) {
        console.error("Gagal memuat pengaturan:", err)
      }
    }
    fetchSettings()
  }, [])

  // Default fallback values if settings are not loaded yet
  const defaultSettings: BumdesSettings = {
    bumdes_name: settings?.bumdes_name || "BUMDES",
    village_name: settings?.village_name || "",
    district_name: settings?.district_name || "",
    regency_name: settings?.regency_name || "",
    shu_pengurus_pct: settings?.shu_pengurus_pct || "0",
    shu_pengawas_pct: settings?.shu_pengawas_pct || "0",
    shu_sosial_pct: settings?.shu_sosial_pct || "0",
    shu_modal_pct: settings?.shu_modal_pct || "0",
    shu_desa_pct: settings?.shu_desa_pct || "0",
  }

  return (
    <SettingsContext.Provider value={defaultSettings}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}

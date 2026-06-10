"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"

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

const defaultSettings: BumdesSettings = {
  bumdes_name: "BUMDES",
  village_name: "",
  district_name: "",
  regency_name: "",
  shu_pengurus_pct: "0",
  shu_pengawas_pct: "0",
  shu_sosial_pct: "0",
  shu_modal_pct: "0",
  shu_desa_pct: "0",
}

// Simple in-memory cache to prevent duplicate fetches across components
let cachedSettings: BumdesSettings | null = null
let fetchPromise: Promise<BumdesSettings | null> | null = null

async function fetchSettingsOnce(): Promise<BumdesSettings | null> {
  // If we already have cached data, return it immediately
  if (cachedSettings) return cachedSettings
  
  // If a fetch is already in progress, reuse it (dedup)
  if (fetchPromise) return fetchPromise

  fetchPromise = (async () => {
    try {
      const res = await fetch("/api/setup")
      const json = await res.json()
      if (json.success && json.data) {
        cachedSettings = json.data as BumdesSettings
        return cachedSettings
      }
    } catch (err) {
      console.error("Gagal memuat pengaturan:", err)
    } finally {
      fetchPromise = null
    }
    return null
  })()

  return fetchPromise
}

const SettingsContext = createContext<BumdesSettings>(defaultSettings)

export function SettingsProvider({
  children,
  initialSettings,
}: {
  children: React.ReactNode
  initialSettings?: BumdesSettings
}) {
  const [settings, setSettings] = useState<BumdesSettings>(initialSettings || defaultSettings)

  useEffect(() => {
    if (initialSettings) {
      cachedSettings = initialSettings
      setSettings(initialSettings)
    } else {
      fetchSettingsOnce().then((data) => {
        if (data) setSettings(data)
      })
    }
  }, [initialSettings])

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  )
}

// Utility to invalidate cache (e.g., after settings update)
export function invalidateSettingsCache() {
  cachedSettings = null
  fetchPromise = null
}

export function useSettings() {
  return useContext(SettingsContext)
}

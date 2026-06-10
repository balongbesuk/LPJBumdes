import { db } from "@/lib/db"

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
  [key: string]: string
}

const defaults: BumdesSettings = {
  bumdes_name: "",
  village_name: "",
  district_name: "",
  regency_name: "",
  shu_pengurus_pct: "30",
  shu_pengawas_pct: "10",
  shu_sosial_pct: "10",
  shu_modal_pct: "25",
  shu_desa_pct: "25",
}

/**
 * Reads all settings from the database and returns them as a typed object.
 * Falls back to defaults if keys are missing.
 */
export async function getSettings(): Promise<BumdesSettings> {
  const rows = await db.setting.findMany()
  const map: Record<string, string> = {}
  rows.forEach((r) => {
    map[r.key] = r.value
  })
  return { ...defaults, ...map }
}

/**
 * Check whether initial setup has been completed.
 * Returns true if bumdes_name is non-empty.
 */
export async function isSetupComplete(): Promise<boolean> {
  const setting = await db.setting.findUnique({ where: { key: "bumdes_name" } })
  return !!setting && setting.value.trim().length > 0
}

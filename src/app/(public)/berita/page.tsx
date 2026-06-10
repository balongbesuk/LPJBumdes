import React from "react"
import { db } from "@/lib/db"
import BeritaList from "./BeritaList"
import { getSettings } from "@/lib/settings"
import type { Metadata } from "next"

export const revalidate = 0 // Disable cache for live news updates

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings()
  const bumdesName = settings.bumdes_name || "BUMDES"
  const villageName = settings.village_name || ""
  
  return {
    title: `Berita & Kegiatan ${bumdesName}`,
    description: `Rilis pers resmi, transparansi laporan kegiatan, dan kabar terbaru seputar Badan Usaha Milik Desa (BUMDES) ${bumdesName}${villageName ? `, Desa ${villageName}` : ""}.`,
    keywords: ["Berita BUMDES", `Kegiatan Desa ${villageName}`, `Kabar ${bumdesName}`, "Transparansi BUMDES"],
  }
}

export default async function PublicBeritaPage() {
  const settings = await getSettings()
  const bumdesName = settings.bumdes_name || "BUMDES"
  const villageName = settings.village_name || ""

  // Fetch all published articles
  const posts = await db.post.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  })

  // Format date to string to avoid serialization issues
  const formattedPosts = posts.map(post => ({
    ...post,
    createdAt: post.createdAt.toISOString()
  }))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="space-y-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 text-[10px] font-bold uppercase tracking-widest">
          Pusat Informasi
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 leading-none">
          Berita & Kegiatan BUMDES
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm font-semibold max-w-2xl leading-relaxed">
          Temukan rilis pers resmi, agenda desa, dan dokumentasi foto dari seluruh unit usaha operasional {bumdesName}{villageName ? ` Desa ${villageName}` : ""}.
        </p>
      </div>

      <BeritaList initialPosts={formattedPosts} />
    </div>
  )
}

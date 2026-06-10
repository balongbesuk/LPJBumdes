import React from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { Calendar, ChevronLeft, Building2, Clock, FileText } from "lucide-react"
import { slugify } from "@/lib/utils"
import { getSettings } from "@/lib/settings"

import type { Metadata } from "next"

export const revalidate = 0 // Disable cache for live news updates

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await db.post.findUnique({
    where: { slug },
  })

  const settings = await getSettings()
  const bumdesName = settings.bumdes_name || "BUMDES"

  if (!post) {
    return {
      title: `Berita Tidak Ditemukan - ${bumdesName}`,
    }
  }

  const snippet = post.content.length > 150 ? `${post.content.substring(0, 150)}...` : post.content

  return {
    title: `${post.title} - ${bumdesName}`,
    description: snippet,
    openGraph: {
      title: post.title,
      description: snippet,
      type: "article",
      images: post.imageUrl ? [{ url: post.imageUrl }] : [],
    },
  }
}

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function BeritaDetailPage({ params }: PageProps) {
  const { slug } = await params

  // Fetch current article
  const post = await db.post.findUnique({
    where: { slug },
  })

  // If article not found or not published, show 404
  if (!post || !post.published) {
    notFound()
  }

  // Fetch recent articles for sidebar recommendation (excluding current)
  const recentPosts = await db.post.findMany({
    where: {
      published: true,
      NOT: { id: post.id },
    },
    orderBy: { createdAt: "desc" },
    take: 3,
  })

  const date = new Date(post.createdAt).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  const paragraphs = post.content.split("\n").filter((p) => p.trim() !== "")

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back navigation */}
      <Link
        href="/berita"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors mb-8 group"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Kembali ke Berita
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Main Content Column */}
        <article className="lg:col-span-8 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-slate-400 text-xs font-semibold">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-600" />
                {date}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-600" />
                {Math.max(1, Math.ceil(post.content.split(/\s+/).length / 200))} menit baca
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {post.title}
            </h1>
          </div>

          {/* Cover Image */}
          {post.imageUrl ? (
            <div className="w-full max-h-[460px] overflow-hidden rounded-3xl bg-slate-100 border border-slate-100 shadow-sm">
              <img
                src={post.imageUrl}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-full h-64 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-3xl flex items-center justify-center text-emerald-700">
              <Building2 className="w-16 h-16 opacity-30" />
            </div>
          )}

          {/* Article Text Content */}
          <div className="prose max-w-none text-slate-700 leading-relaxed text-sm sm:text-base space-y-6 pt-4 font-semibold text-justify">
            {paragraphs.map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>
        </article>

        {/* Sidebar Recommendation Column */}
        <aside className="lg:col-span-4 space-y-8">
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-6">
            <h3 className="font-extrabold text-slate-800 text-sm sm:text-base border-b border-slate-100 pb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              Berita Terbaru Lainnya
            </h3>

            {recentPosts.length > 0 ? (
              <div className="space-y-5">
                {recentPosts.map((rPost) => {
                  const rDate = new Date(rPost.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                  return (
                    <Link
                      key={rPost.id}
                      href={`/berita/${rPost.slug}`}
                      className="group flex gap-4 items-start hover:opacity-85 transition-opacity"
                    >
                      {rPost.imageUrl ? (
                        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                          <img
                            src={rPost.imageUrl}
                            alt={rPost.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100/50">
                          <Building2 className="w-6 h-6 opacity-40" />
                        </div>
                      )}
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-800 text-xs sm:text-sm leading-snug group-hover:text-emerald-600 transition-colors line-clamp-2">
                          {rPost.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-bold">{rDate}</span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <p className="text-slate-400 text-xs font-semibold">Tidak ada berita terbaru lainnya.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}

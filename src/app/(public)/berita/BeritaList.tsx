"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Search, Calendar, Building2, ArrowRight } from "lucide-react"
import { slugify } from "@/lib/utils"

interface Post {
  id: string
  title: string
  slug: string
  content: string
  imageUrl: string | null
  published: boolean
  createdAt: Date | string
}

export default function BeritaList({ initialPosts }: { initialPosts: Post[] }) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredPosts = initialPosts.filter((post) =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-8">
      {/* Search Bar */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-100 flex-col sm:flex-row gap-4">
        <h2 className="font-extrabold text-slate-800 text-sm sm:text-base flex items-center gap-2">
          Daftar Rilis Kegiatan ({filteredPosts.length})
        </h2>
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Cari berita..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 focus:border-emerald-500 rounded-2xl text-xs focus:outline-none transition-all placeholder:text-slate-400 text-slate-700 shadow-sm"
          />
        </div>
      </div>

      {/* Grid of Articles */}
      {filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredPosts.map((post) => {
            const date = new Date(post.createdAt).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
            const snippet = post.content.length > 130 ? `${post.content.substring(0, 130)}...` : post.content
            return (
              <div
                key={post.id}
                className="group bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {post.imageUrl ? (
                    <div className="w-full h-48 overflow-hidden bg-slate-100">
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center text-emerald-700">
                      <Building2 className="w-12 h-12 opacity-40" />
                    </div>
                  )}
                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{date}</span>
                    </div>
                    <h3 className="font-extrabold text-slate-800 text-sm sm:text-base leading-snug group-hover:text-emerald-600 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-slate-500 text-xs sm:text-sm font-semibold leading-relaxed line-clamp-3">
                      {snippet}
                    </p>
                  </div>
                </div>
                <div className="p-6 pt-0">
                  <Link
                    href={`/berita/${post.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 mt-2"
                  >
                    Baca Selengkapnya
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white border border-slate-100 text-center p-16 rounded-3xl text-slate-400 font-semibold text-xs sm:text-sm">
          Tidak ada berita yang cocok dengan pencarian Anda.
        </div>
      )}
    </div>
  )
}

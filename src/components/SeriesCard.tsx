"use client"

import Link from "next/link"
import { Star, Tv, Eye } from "lucide-react"
import { formatViews } from "@/lib/utils"
import type { Series } from "@/types"
import { getClientLocale, getDictionary } from "@/lib/i18n"

interface SeriesCardProps {
  series: Series
}

export default function SeriesCard({ series }: SeriesCardProps) {
  const locale = getClientLocale()
  const t = getDictionary(locale).cards

  return (
    <Link
      href={`/serie/${series.slug}`}
      className="group block bg-gradient-to-b from-night-700 to-night-800 rounded-2xl overflow-hidden border border-white/5 hover:border-white/15 transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-sweet-purple/10"
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-night-800/90 z-10" />
        {series.poster ? (
          <img
            src={series.poster}
            alt={series.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-night-600 to-night-700 flex items-center justify-center text-6xl group-hover:scale-105 transition-transform duration-500">
            📺
          </div>
        )}

        {/* Quality Badge */}
        <div className="absolute top-3 left-3 z-20 bg-sweet-purple/90 text-white text-xs font-bold px-2.5 py-1 rounded-lg backdrop-blur">
          {series.quality}
        </div>

        {/* Rating */}
        <div className="absolute top-3 right-3 z-20 bg-black/60 backdrop-blur text-sweet-gold text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
          <Star className="w-3.5 h-3.5 fill-current" />
          {series.rating.toFixed(1)}
        </div>

        {/* Seasons Badge */}
        <div className="absolute bottom-3 left-3 z-20 bg-black/70 backdrop-blur text-white text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
          <Tv className="w-3.5 h-3.5" />
          {series.totalSeasons} {t.seasons(series.totalSeasons)}
        </div>

        {/* Play Button on Hover */}
        <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-16 h-16 rounded-full bg-sweet-purple/90 flex items-center justify-center text-white text-2xl shadow-xl backdrop-blur hover:scale-110 transition-transform">
            ▶
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-white font-bold text-sm mb-2 line-clamp-1 group-hover:text-sweet-gold transition-colors">
          {series.titleAr || series.title}
        </h3>

        <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
          <span className="flex items-center gap-1">
            <Tv className="w-3.5 h-3.5" />
            {series.totalEpisodes} {t.episodes(series.totalEpisodes)}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            {formatViews(series.views)}
          </span>
          <span>{series.releaseYear}</span>
        </div>

        {/* Categories Tags */}
        <div className="flex flex-wrap gap-1.5">
          {series.categories?.slice(0, 2).map((sc) => (
            <span
              key={sc.category.id}
              className="text-[10px] font-medium px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: `${sc.category.color}18`,
                color: sc.category.color,
              }}
            >
              {sc.category.nameAr}
            </span>
          ))}
        </div>
      </div>
    </Link>
  )
}

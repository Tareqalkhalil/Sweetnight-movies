"use client"

import Link from "next/link"
import { Star, Clock, Eye } from "lucide-react"
import { formatDuration, formatViews } from "@/lib/utils"
import type { Movie } from "@/types"

interface MovieCardProps {
  movie: Movie
}

export default function MovieCard({ movie }: MovieCardProps) {
  return (
    <Link
      href={`/movie/${movie.slug}`}
      className="group block bg-gradient-to-b from-night-700 to-night-800 rounded-2xl overflow-hidden border border-white/5 hover:border-white/15 transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-sweet-coral/10"
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-night-800/90 z-10" />
        {movie.poster ? (
          <img
            src={movie.poster}
            alt={movie.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-night-600 to-night-700 flex items-center justify-center text-6xl group-hover:scale-105 transition-transform duration-500">
            🎬
          </div>
        )}

        {/* Quality Badge */}
        <div className="absolute top-3 left-3 z-20 bg-sweet-coral/90 text-white text-xs font-bold px-2.5 py-1 rounded-lg backdrop-blur">
          {movie.quality}
        </div>

        {/* Rating */}
        <div className="absolute top-3 right-3 z-20 bg-black/60 backdrop-blur text-sweet-gold text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
          <Star className="w-3.5 h-3.5 fill-current" />
          {movie.rating.toFixed(1)}
        </div>

        {/* Play Button on Hover */}
        <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-16 h-16 rounded-full bg-sweet-coral/90 flex items-center justify-center text-white text-2xl shadow-xl backdrop-blur hover:scale-110 transition-transform">
            ▶
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-white font-bold text-sm mb-2 line-clamp-1 group-hover:text-sweet-gold transition-colors">
          {movie.titleAr || movie.title}
        </h3>

        <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {formatDuration(movie.duration)}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            {formatViews(movie.views)}
          </span>
          <span>{movie.releaseYear}</span>
        </div>

        {/* Categories Tags */}
        <div className="flex flex-wrap gap-1.5">
          {movie.categories?.slice(0, 2).map((mc) => (
            <span
              key={mc.category.id}
              className="text-[10px] font-medium px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: `${mc.category.color}18`,
                color: mc.category.color,
              }}
            >
              {mc.category.nameAr}
            </span>
          ))}
        </div>
      </div>
    </Link>
  )
}

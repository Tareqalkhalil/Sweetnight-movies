"use client"

import { useState, useEffect } from "react"
import { Play, Plus, ChevronRight, ChevronLeft } from "lucide-react"
import type { Banner, Series } from "@/types"
import { getClientLocale, getDictionary } from "@/lib/i18n"

interface HeroBannerProps {
  banners: Banner[]
  series?: Series[]
}

export default function HeroBanner({ banners, series = [] }: HeroBannerProps) {
  const [current, setCurrent] = useState(0)
  const locale = getClientLocale()
  const t = getDictionary(locale).hero
  const slides = (series.length > 0 ? series : banners).slice(0, 5)

  useEffect(() => {
    if (slides.length <= 1) return
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [slides.length])

  if (slides.length === 0) return null

  const slide = slides[current]
  const isSeriesSlide = series.length > 0
  const title = isSeriesSlide ? (slide as Series).titleAr || (slide as Series).title : (slide as Banner).title
  const description = isSeriesSlide
    ? (slide as Series).descriptionAr || (slide as Series).description
    : (slide as Banner).description || (slide as Banner).subtitle || ""
  const image = isSeriesSlide ? (slide as Series).backdrop || (slide as Series).poster || "" : (slide as Banner).image
  const href = isSeriesSlide ? `/serie/${(slide as Series).slug}` : "#"

  return (
    <section className="relative h-[500px] md:h-[600px] overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-night-900 via-night-800 to-night-700" />
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30 transition-opacity duration-1000"
        style={{ backgroundImage: `url(${image})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-l from-night-900/95 via-night-900/60 to-transparent" />

      {/* Content */}
      <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 flex items-center">
        <div className="max-w-2xl animate-fade-in">
          <span className="inline-flex items-center gap-2 bg-gradient-to-r from-sweet-coral to-sweet-gold text-night-900 px-4 py-1.5 rounded-full text-xs font-bold mb-6">
            🔥 {t.trending}
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-4">
            {title}
          </h1>
          <p className="text-lg md:text-xl text-gray-400 leading-relaxed mb-8 max-w-lg">
            {description}
          </p>
          <div className="flex items-center gap-4">
            <a
              href={href}
              className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-sweet-coral to-sweet-gold text-night-900 font-extrabold text-base hover:shadow-xl hover:shadow-sweet-coral/30 transition-all hover:scale-105"
            >
              <Play className="w-5 h-5 fill-current" />
              {t.watchNow}
            </a>
            <a
              href={isSeriesSlide ? "/series" : "#"}
              className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-white/10 border border-white/20 text-white font-bold text-base hover:bg-white/20 transition-all"
            >
              <Plus className="w-5 h-5" />
              {t.watchlist}
            </a>
          </div>
        </div>
      </div>

      {/* Slide Controls */}
      {slides.length > 1 && (
        <>
          <button
            onClick={() => setCurrent((prev) => (prev - 1 + slides.length) % slides.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => setCurrent((prev) => (prev + 1) % slides.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          {/* Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === current
                    ? "w-8 bg-gradient-to-r from-sweet-coral to-sweet-gold"
                    : "w-2 bg-white/30 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}

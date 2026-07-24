"use client"

import SeriesCard from "./SeriesCard"
import type { Series } from "@/types"

interface FeaturedSeriesProps {
  series: Series[]
}

export default function FeaturedSeries({ series }: FeaturedSeriesProps) {
  return (
    <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl md:text-3xl font-black text-white flex items-center gap-3">
          <span className="text-3xl">🔥</span>
          المسلسلات المميزة
        </h2>
        <a
          href="/series"
          className="text-sweet-gold text-sm font-semibold hover:underline flex items-center gap-1"
        >
          عرض الكل
          <span>→</span>
        </a>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
        {series.map((s) => (
          <SeriesCard key={s.id} series={s} />
        ))}
      </div>
    </section>
  )
}

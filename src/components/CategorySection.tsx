"use client"

import { useState } from "react"
import Link from "next/link"
import type { Category } from "@/types"
import { getClientLocale, getDictionary } from "@/lib/i18n"

interface CategorySectionProps {
  movieCategories: Category[]
  seriesCategories: Category[]
}

type SeriesSectionItem = {
  slug: string
  name: string
  nameAr: string
  icon: string
  color: string
}

export default function CategorySection({ movieCategories, seriesCategories }: CategorySectionProps) {
  const locale = getClientLocale()
  const t = getDictionary(locale).categories

  const seriesSections: SeriesSectionItem[] = [
    {
      slug: "foreign-series",
      name: locale === "en" ? "Foreign Series" : "مسلسلات أجنبية",
      nameAr: locale === "en" ? "Foreign Series" : "مسلسلات أجنبية",
      icon: "🌍",
      color: "#0984e3",
    },
    {
      slug: "netflix-series",
      name: locale === "en" ? "Netflix Series" : "مسلسلات نيتفليكس",
      nameAr: locale === "en" ? "Netflix Series" : "مسلسلات نيتفليكس",
      icon: "📺",
      color: "#d63031",
    },
    {
      slug: "asian-series",
      name: locale === "en" ? "Asian Series" : "مسلسلات آسيوية",
      nameAr: locale === "en" ? "Asian Series" : "مسلسلات آسيوية",
      icon: "🏯",
      color: "#e17055",
    },
  ]

  const categories = movieCategories

  const animeSections = [
    {
      slug: "anime",
      name: locale === "en" ? "Anime List" : "قائمة الأنمي",
      nameAr: locale === "en" ? "Anime List" : "قائمة الأنمي",
      icon: "⛩️",
      color: "#8e44ad",
    },
    {
      slug: "netflix-anime",
      name: locale === "en" ? "Netflix Anime" : "أنمي نيتفليكس",
      nameAr: locale === "en" ? "Netflix Anime" : "أنمي نيتفليكس",
      icon: "📺",
      color: "#f39c12",
    },
  ]

  return (
    <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2 bg-night-700/50 p-1.5 rounded-2xl">
          <div className="px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-sweet-coral to-sweet-gold text-night-900 shadow-lg">
            🎬 {locale === "en" ? "Categories" : "الأقسام"}
          </div>
        </div>
        <Link
          href="/categories"
          className="text-sweet-gold text-sm font-semibold hover:underline flex items-center gap-1"
        >
          {t.viewAll}
          <span>→</span>
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={`/categories/${category.slug}`}
            className="group relative bg-gradient-to-br from-night-700 to-night-800 rounded-2xl p-5 text-center border border-white/5 hover:border-white/10 transition-all hover:-translate-y-1 hover:shadow-xl overflow-hidden"
          >
            <div
              className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
              style={{ background: `linear-gradient(90deg, ${category.color}, ${category.color}88)` }}
            />

            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
              {category.icon}
            </div>
            <h3 className="text-white font-bold text-sm mb-1">{category.nameAr}</h3>
            <p className="text-gray-500 text-xs">{category.name}</p>

            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity rounded-2xl"
              style={{ background: category.color }}
            />
          </Link>
        ))}

        {animeSections.map((section) => (
          <Link
            key={section.slug}
            href={`/categories/${section.slug}`}
            className="group relative bg-gradient-to-br from-night-700 to-night-800 rounded-2xl p-5 text-center border border-white/5 hover:border-white/10 transition-all hover:-translate-y-1 hover:shadow-xl overflow-hidden"
          >
            <div
              className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
              style={{ background: `linear-gradient(90deg, ${section.color}, ${section.color}88)` }}
            />

            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
              {section.icon}
            </div>
            <h3 className="text-white font-bold text-sm mb-1">{section.nameAr}</h3>
            <p className="text-gray-500 text-xs">{section.name}</p>

            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity rounded-2xl"
              style={{ background: section.color }}
            />
          </Link>
        ))}
      </div>
    </section>
  )
}

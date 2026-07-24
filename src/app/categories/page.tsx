import { prisma } from "@/lib/prisma"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import Link from "next/link"
import { cookies } from "next/headers"
import { getDictionary, getLocaleFromCookie } from "@/lib/i18n"

export default async function CategoriesPage() {
  const cookieStore = await cookies()
  const locale = getLocaleFromCookie(cookieStore.get("locale")?.value)
  const t = getDictionary(locale).pages.categories

  const [movieCategories, seriesCategories] = await Promise.all([
    prisma.category.findMany({
      where: { type: { in: ["MOVIE", "BOTH"] }, isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.category.findMany({
      where: { type: { in: ["SERIES", "BOTH"] }, isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
  ])

  const seriesSections = [
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
      icon: "🎞️",
      color: "#f39c12",
    },
  ]

  return (
    <main className="min-h-screen bg-night-900">
      <Navbar />

      <section className="pt-8 pb-16 px-4 sm:px-6 max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-black text-white mb-2 flex items-center gap-3">
          <span className="text-4xl">🗂️</span>
          {t.title}
        </h1>
        <p className="text-gray-400 mb-12">{t.subtitle}</p>

        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-2xl">🎬</span>
            {getDictionary(locale).categories.movieCategories}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {movieCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="group bg-gradient-to-br from-night-700 to-night-800 rounded-2xl p-6 text-center border border-white/5 hover:border-white/15 transition-all hover:-translate-y-1"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{cat.icon}</div>
                <h3 className="text-white font-bold mb-1">{cat.nameAr}</h3>
                <p className="text-gray-500 text-xs">{cat.name}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-2xl">📺</span>
            {getDictionary(locale).categories.seriesCategories}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {seriesSections.map((section) => (
              <Link
                key={section.slug}
                href={`/series?section=${section.slug}`}
                className="group bg-gradient-to-br from-night-700 to-night-800 rounded-2xl p-6 text-center border border-white/5 hover:border-white/15 transition-all hover:-translate-y-1"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{section.icon}</div>
                <h3 className="text-white font-bold mb-1">{section.nameAr}</h3>
                <p className="text-gray-500 text-xs">{section.name}</p>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-2xl">⛩️</span>
            {locale === "en" ? "Anime Categories" : "أقسام الأنمي"}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {animeSections.map((section) => (
              <Link
                key={section.slug}
                href={`/categories/${section.slug}`}
                className="group bg-gradient-to-br from-night-700 to-night-800 rounded-2xl p-6 text-center border border-white/5 hover:border-white/15 transition-all hover:-translate-y-1"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{section.icon}</div>
                <h3 className="text-white font-bold mb-1">{section.nameAr}</h3>
                <p className="text-gray-500 text-xs">{section.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

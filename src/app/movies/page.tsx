import { prisma } from "@/lib/prisma"
import Navbar from "@/components/Navbar"
import MovieCard from "@/components/MovieCard"
import Footer from "@/components/Footer"
import { cookies } from "next/headers"
import { getDictionary, getLocaleFromCookie } from "@/lib/i18n"

export default async function MoviesPage() {
  const cookieStore = await cookies()
  const locale = getLocaleFromCookie(cookieStore.get("locale")?.value)
  const t = getDictionary(locale).pages.movies

  const [movies, categories] = await Promise.all([
    prisma.movie.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      include: { categories: { include: { category: true } } },
    }),
    prisma.category.findMany({
      where: { type: { in: ["MOVIE", "BOTH"] }, isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
  ])

  return (
    <main className="min-h-screen bg-night-900">
      <Navbar />

      {/* Header */}
      <section className="pt-8 pb-12 px-4 sm:px-6 max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-black text-white mb-2 flex items-center gap-3">
          <span className="text-4xl">🎬</span>
          {t.title}
        </h1>
        <p className="text-gray-400">{t.subtitle}</p>
      </section>

      {/* Categories Filter */}
      <section className="px-4 sm:px-6 max-w-7xl mx-auto mb-8">
        <div className="flex flex-wrap gap-2">
          <button className="px-4 py-2 rounded-full bg-gradient-to-r from-sweet-coral to-sweet-gold text-night-900 text-sm font-bold">
            {getDictionary(locale).categories.all}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-300 text-sm font-medium hover:bg-white/10 hover:text-white transition-all"
            >
              {cat.nameAr}
            </button>
          ))}
        </div>
      </section>

      {/* Movies Grid */}
      <section className="px-4 sm:px-6 max-w-7xl mx-auto pb-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>

      <Footer />
    </main>
  )
}

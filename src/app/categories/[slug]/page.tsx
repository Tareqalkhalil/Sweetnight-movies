import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Navbar from "@/components/Navbar"
import MovieCard from "@/components/MovieCard"
import SeriesCard from "@/components/SeriesCard"
import Footer from "@/components/Footer"
import { cookies } from "next/headers"
import { getDictionary, getLocaleFromCookie } from "@/lib/i18n"

interface CategoryPageProps {
  params: Promise<{ slug: string }>
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params
  const cookieStore = await cookies()
  const locale = getLocaleFromCookie(cookieStore.get("locale")?.value)
  const t = getDictionary(locale).pages.detail

  const category = await prisma.category.findUnique({
    where: { slug, isActive: true },
  })

  if (!category) {
    notFound()
  }

  const [movies, series] = await Promise.all([
    prisma.movie.findMany({
      where: {
        isActive: true,
        categories: {
          some: { categoryId: category.id },
        },
      },
      orderBy: { rating: "desc" },
      include: { categories: { include: { category: true } } },
    }),
    prisma.series.findMany({
      where: {
        isActive: true,
        categories: {
          some: { categoryId: category.id },
        },
      },
      orderBy: { rating: "desc" },
      include: { categories: { include: { category: true } } },
    }),
  ])

  const hasMovies = movies.length > 0
  const hasSeries = series.length > 0

  return (
    <main className="min-h-screen bg-night-900">
      <Navbar />

      {/* Header */}
      <section className="pt-8 pb-12 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-5xl">{category.icon}</span>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white">{category.nameAr}</h1>
            <p className="text-gray-400">{category.name}</p>
          </div>
        </div>
        <div
          className="h-1 w-24 rounded-full"
          style={{ background: `linear-gradient(90deg, ${category.color}, ${category.color}88)` }}
        />
      </section>

      {/* Movies */}
      {hasMovies && (
        <section className="px-4 sm:px-6 max-w-7xl mx-auto pb-12">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-2xl">🎬</span>
            {locale === "en" ? `Movies ${category.name}` : `أفلام ${category.nameAr}`}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </section>
      )}

      {/* Series */}
      {hasSeries && (
        <section className="px-4 sm:px-6 max-w-7xl mx-auto pb-16">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-2xl">📺</span>
            {locale === "en" ? `Series ${category.name}` : `مسلسلات ${category.nameAr}`}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {series.map((s) => (
              <SeriesCard key={s.id} series={s} />
            ))}
          </div>
        </section>
      )}

      {!hasMovies && !hasSeries && (
        <section className="px-4 sm:px-6 max-w-7xl mx-auto pb-16 text-center py-20">
          <div className="text-6xl mb-4">📭</div>
          <h2 className="text-xl font-bold text-white mb-2">{t.noContent}</h2>
          <p className="text-gray-400">{t.noContentText}</p>
        </section>
      )}

      <Footer />
    </main>
  )
}

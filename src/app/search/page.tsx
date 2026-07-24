import { prisma } from "@/lib/prisma"
import Navbar from "@/components/Navbar"
import SeriesCard from "@/components/SeriesCard"
import Footer from "@/components/Footer"
import { cookies } from "next/headers"
import { getDictionary, getLocaleFromCookie, getLocalizedText } from "@/lib/i18n"
import Link from "next/link"

interface SearchPageProps {
  searchParams?: Promise<{ q?: string | string[] }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const cookieStore = await cookies()
  const locale = getLocaleFromCookie(cookieStore.get("locale")?.value)
  const t = getDictionary(locale).pages.series
  const params = await searchParams
  const q = typeof params?.q === "string" ? params.q : Array.isArray(params?.q) ? params.q[0] : ""
  const query = q?.trim() || ""

  const [movies, series] = await Promise.all([
    prisma.movie.findMany({
      where: {
        isActive: true,
        OR: [
          { title: { contains: query } },
          { titleAr: { contains: query } },
          { description: { contains: query } },
          { descriptionAr: { contains: query } },
        ],
      },
      take: 12,
      orderBy: { rating: "desc" },
      include: { categories: { include: { category: true } } },
    }),
    prisma.series.findMany({
      where: {
        isActive: true,
        OR: [
          { title: { contains: query } },
          { titleAr: { contains: query } },
          { description: { contains: query } },
          { descriptionAr: { contains: query } },
        ],
      },
      take: 12,
      orderBy: { rating: "desc" },
      include: { categories: { include: { category: true } } },
    }),
  ])

  const results = [...movies.map((item) => ({ ...item, type: "movie" as const })), ...series.map((item) => ({ ...item, type: "series" as const }))]

  return (
    <main className="min-h-screen bg-night-900">
      <Navbar />

      <section className="pt-8 pb-12 px-4 sm:px-6 max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
          {query ? `${locale === "ar" ? "نتائج البحث عن" : "Search results for"} “${query}”` : (locale === "ar" ? "ابحث عن أي محتوى" : "Search for anything")}
        </h1>
        <p className="text-gray-400">
          {query ? (locale === "ar" ? "تم العثور على النتائج التالية" : "Here are the matching results") : (locale === "ar" ? "اكتب اسم فيلم أو مسلسل أو أنمي للبدء" : "Type a movie, series, or anime title to get started")}
        </p>
      </section>

      {query && (
        <section className="px-4 sm:px-6 max-w-7xl mx-auto pb-16">
          {results.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-night-800/70 p-8 text-center">
              <p className="text-gray-400">{locale === "ar" ? "لا توجد نتائج مطابقة حالياً" : "No matching results found yet"}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
              {results.map((item) => (
                <Link key={`${item.type}-${item.id}`} href={item.type === "movie" ? `/movie/${item.slug}` : `/serie/${item.slug}`} className="group">
                  <div className="rounded-2xl overflow-hidden border border-white/10 bg-night-800/70 transition-all hover:-translate-y-1">
                    <img src={item.poster || ""} alt={getLocalizedText(locale, item.titleAr, item.title)} className="h-56 w-full object-cover" />
                    <div className="p-3">
                      <div className="text-xs text-sweet-gold mb-2">{item.type === "movie" ? (locale === "ar" ? "فيلم" : "Movie") : (locale === "ar" ? "مسلسل" : "Series")}</div>
                      <h3 className="text-sm font-bold text-white line-clamp-2">{getLocalizedText(locale, item.titleAr, item.title)}</h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      <Footer />
    </main>
  )
}

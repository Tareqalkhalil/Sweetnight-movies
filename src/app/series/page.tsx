import { prisma } from "@/lib/prisma"
import Navbar from "@/components/Navbar"
import SeriesCard from "@/components/SeriesCard"
import Footer from "@/components/Footer"
import { cookies } from "next/headers"
import { getDictionary, getLocaleFromCookie } from "@/lib/i18n"

interface SeriesPageProps {
  searchParams?: Promise<{ section?: string | string[] }>
}

export default async function SeriesPage({ searchParams }: SeriesPageProps) {
  const cookieStore = await cookies()
  const locale = getLocaleFromCookie(cookieStore.get("locale")?.value)
  const t = getDictionary(locale).pages.series
  const params = await searchParams
  const section = typeof params?.section === "string" ? params.section : Array.isArray(params?.section) ? params.section[0] : undefined

  const seriesSections = [
    { slug: "foreign-series", name: locale === "en" ? "Foreign Series" : "مسلسلات أجنبية" },
    { slug: "netflix-series", name: locale === "en" ? "Netflix Series" : "مسلسلات نيتفليكس" },
    { slug: "asian-series", name: locale === "en" ? "Asian Series" : "مسلسلات آسيوية" },
  ]

  const selectedSection = seriesSections.find((item) => item.slug === section)

  const [series, categories] = await Promise.all([
    prisma.series.findMany({
      where: {
        isActive: true,
        ...(selectedSection
          ? {
              categories: {
                some: {
                  category: {
                    slug: selectedSection.slug,
                  },
                },
              },
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      include: { categories: { include: { category: true } } },
    }),
    prisma.category.findMany({
      where: { type: { in: ["SERIES", "BOTH"] }, isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
  ])

  return (
    <main className="min-h-screen bg-night-900">
      <Navbar />

      <section className="pt-8 pb-12 px-4 sm:px-6 max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-black text-white mb-2 flex items-center gap-3">
          <span className="text-4xl">📺</span>
          {selectedSection ? selectedSection.name : t.title}
        </h1>
        <p className="text-gray-400">{selectedSection ? `${t.subtitle}` : t.subtitle}</p>
      </section>

      <section className="px-4 sm:px-6 max-w-7xl mx-auto mb-8">
        <div className="flex flex-wrap gap-2">
          <a
            href="/series"
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              !selectedSection
                ? "bg-gradient-to-r from-sweet-coral to-sweet-gold text-night-900 font-bold"
                : "bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            {getDictionary(locale).categories.all}
          </a>
          {seriesSections.map((item) => (
            <a
              key={item.slug}
              href={`/series?section=${item.slug}`}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedSection?.slug === item.slug
                  ? "bg-gradient-to-r from-sweet-coral to-sweet-gold text-night-900 font-bold"
                  : "bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item.name}
            </a>
          ))}
        </div>
      </section>

      <section className="px-4 sm:px-6 max-w-7xl mx-auto pb-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          {series.map((s) => (
            <SeriesCard key={s.id} series={s} />
          ))}
        </div>
      </section>

      <Footer />
    </main>
  )
}

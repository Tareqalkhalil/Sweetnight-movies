import { prisma } from "@/lib/prisma"
import Navbar from "@/components/Navbar"
import SeriesCard from "@/components/SeriesCard"
import Footer from "@/components/Footer"
import Link from "next/link"
import { cookies } from "next/headers"
import { getDictionary, getLocaleFromCookie, getLocalizedText } from "@/lib/i18n"
import { Star, Tv, Sparkles, List } from "lucide-react"

export default async function AnimePage() {
  const cookieStore = await cookies()
  const locale = getLocaleFromCookie(cookieStore.get("locale")?.value)
  const t = getDictionary(locale).pages.anime

  const [animeSeries, netflixAnimeSeries, topAnimeSeries] = await Promise.all([
    prisma.series.findMany({
      where: {
        isActive: true,
        categories: {
          some: { category: { slug: "anime" } },
        },
      },
      orderBy: { rating: "desc" },
      include: { categories: { include: { category: true } } },
      take: 100,
    }),
    prisma.series.findMany({
      where: {
        isActive: true,
        categories: {
          some: { category: { slug: "netflix-anime" } },
        },
      },
      orderBy: { rating: "desc" },
      include: { categories: { include: { category: true } } },
      take: 100,
    }),
    prisma.series.findMany({
      where: {
        isActive: true,
        categories: {
          some: { category: { slug: "anime" } },
        },
        rating: { gte: 8.0 },
      },
      orderBy: { rating: "desc" },
      include: { categories: { include: { category: true } } },
      take: 100,
    }),
  ])

  const featuredAnime = animeSeries.slice(0, 12)
  const featuredNetflixAnime = netflixAnimeSeries.slice(0, 12)
  const featuredTopAnime = topAnimeSeries.slice(0, 12)

  const animeCategoryCards = [
    {
      slug: "anime",
      title: locale === "en" ? "Anime List" : "قائمة الأنمي",
      subtitle: locale === "en" ? "Browse all anime titles" : "تصفح جميع عناوين الأنمي",
      icon: <List className="w-5 h-5" />,
      color: "from-sweet-purple to-sweet-coral",
    },
    {
      slug: "netflix-anime",
      title: locale === "en" ? "Netflix Anime" : "أنمي نيتفليكس",
      subtitle: locale === "en" ? "Exclusive anime on Netflix" : "أنمي حصري على نيتفليكس",
      icon: <Tv className="w-5 h-5" />,
      color: "from-sweet-coral to-sweet-gold",
    },
  ]

  return (
    <main className="min-h-screen bg-night-900">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-8 pb-12 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-night-800 via-night-800 to-night-900 p-8 md:p-12 overflow-hidden relative">
          <div className="absolute -right-20 -top-20 w-60 h-60 bg-sweet-purple/10 rounded-full blur-3xl" />
          <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-sweet-coral/10 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-5xl">⛩️</span>
              <span className="px-4 py-1 rounded-full bg-sweet-purple/20 text-sweet-purple font-bold text-sm">
                {locale === "en" ? "Anime" : "أنمي"}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">{t.title}</h1>
            <p className="text-gray-400 text-lg max-w-2xl">{t.subtitle}</p>
          </div>
        </div>
      </section>

      {/* Anime Category Sections */}
      <section className="px-4 sm:px-6 max-w-7xl mx-auto mb-12">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <List className="w-5 h-5 text-sweet-purple" />
            <h2 className="text-2xl font-black text-white">{locale === "en" ? "Anime Categories" : "أقسام الأنمي"}</h2>
          </div>
          <p className="text-gray-400">{locale === "en" ? "Browse the main anime collections" : "تصفح المجموعات الرئيسية للأنمي"}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {animeCategoryCards.map((card) => (
            <Link
              key={card.slug}
              href={`/categories/${card.slug}`}
              className={`group rounded-3xl border border-white/10 bg-gradient-to-r ${card.color} p-6 text-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-2xl`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="rounded-2xl bg-white/20 p-3">{card.icon}</div>
                <h3 className="text-xl font-black">{card.title}</h3>
              </div>
              <p className="text-sm text-white/80">{card.subtitle}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Anime */}
      <section className="px-4 sm:px-6 max-w-7xl mx-auto mb-12">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-sweet-gold" />
            <h2 className="text-2xl font-black text-white">{locale === "en" ? "Latest Anime" : "أحدث الأنمي"}</h2>
          </div>
          <p className="text-gray-400">{locale === "en" ? "Discover the newest anime series" : "اكتشف أحدث سلاسل الأنمي"}</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {featuredAnime.map((anime) => (
            <SeriesCard key={anime.id} series={anime} />
          ))}
        </div>
      </section>

      {/* Netflix Anime */}
      {netflixAnimeSeries.length > 0 && (
        <section className="px-4 sm:px-6 max-w-7xl mx-auto mb-12">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Tv className="w-5 h-5 text-sweet-coral" />
              <h2 className="text-2xl font-black text-white">📺 {locale === "en" ? "Netflix Anime" : "أنمي نيتفليكس"}</h2>
            </div>
            <p className="text-gray-400">{locale === "en" ? "Exclusive anime available on Netflix" : "أعمال أنمية حصرية على نيتفليكس"}</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featuredNetflixAnime.map((anime) => (
              <SeriesCard key={anime.id} series={anime} />
            ))}
          </div>
        </section>
      )}

      {/* Top Rated Anime */}
      {topAnimeSeries.length > 0 && (
        <section className="px-4 sm:px-6 max-w-7xl mx-auto mb-12">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-sweet-gold fill-current" />
              <h2 className="text-2xl font-black text-white">{locale === "en" ? "Top Rated Anime" : "أفضل الأنمي"}</h2>
            </div>
            <p className="text-gray-400">{locale === "en" ? "Most popular anime by rating" : "الأنمي الأكثر شهرة حسب التقييم"}</p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {featuredTopAnime.map((anime) => (
              <SeriesCard key={anime.id} series={anime} />
            ))}
          </div>
        </section>
      )}

      {/* All Anime */}
      {animeSeries.length > 0 && (
        <section className="px-4 sm:px-6 max-w-7xl mx-auto mb-12">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-white mb-2">{locale === "en" ? "All Anime" : "جميع الأنمي"}</h2>
            <p className="text-gray-400">{locale === "en" ? `Browse all ${animeSeries.length} anime series` : `تصفح جميع ${animeSeries.length} سلسلة أنمي`}</p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {animeSeries.map((anime) => (
              <SeriesCard key={anime.id} series={anime} />
            ))}
          </div>
        </section>
      )}

      <Footer />
    </main>
  )
}

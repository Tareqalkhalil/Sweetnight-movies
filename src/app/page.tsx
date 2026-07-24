import { prisma } from "@/lib/prisma"
import Navbar from "@/components/Navbar"
import HeroBanner from "@/components/HeroBanner"
import CategorySection from "@/components/CategorySection"
import FeaturedMovies from "@/components/FeaturedMovies"
import TrendingSection from "@/components/TrendingSection"
import StatsSection from "@/components/StatsSection"
import Footer from "@/components/Footer"
import MovieCard from "@/components/MovieCard"
import SeriesCard from "@/components/SeriesCard"
import { cookies } from "next/headers"
import { getDictionary, getLocaleFromCookie } from "@/lib/i18n"

export default async function Home() {
  const cookieStore = await cookies()
  const locale = getLocaleFromCookie(cookieStore.get("locale")?.value)
  const t = getDictionary(locale).pages.anime

  const [movieCategories, seriesCategories, featuredMovies, featuredAnime, latestAnime, trendingMovies, trendingSeries, banners, heroSeries, foreignSeries, netflixSeries, animeSeries] = await Promise.all([
    prisma.category.findMany({
      where: { type: { in: ['MOVIE', 'BOTH'] }, isActive: true },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.category.findMany({
      where: { type: { in: ['SERIES', 'BOTH'] }, isActive: true },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.movie.findMany({
      where: {
        isActive: true,
        categories: {
          some: {
            category: {
              OR: [
                { slug: { in: ['foreign', 'foreign-movies', 'movies-foreign'] } },
                { slug: { in: ['netflix', 'netflix-movies', 'movies-netflix'] } },
              ],
            },
          },
        },
      },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { categories: { include: { category: true } } },
    }),
    prisma.series.findMany({
      where: {
        isActive: true,
        categories: {
          some: { category: { slug: { in: ['anime', 'anime-action', 'anime-comedy', 'anime-drama', 'anime-romance', 'anime-fantasy', 'anime-adventure', 'anime-supernatural', 'anime-sports', 'anime-slice-of-life', 'anime-mecha', 'anime-isekai'] } } },
        },
      },
      take: 6,
      orderBy: { rating: 'desc' },
      include: { categories: { include: { category: true } } },
    }),
    prisma.series.findMany({
      where: {
        isActive: true,
        categories: {
          some: { category: { slug: { in: ['anime', 'anime-action', 'anime-comedy', 'anime-drama', 'anime-romance', 'anime-fantasy', 'anime-adventure', 'anime-supernatural', 'anime-sports', 'anime-slice-of-life', 'anime-mecha', 'anime-isekai'] } } },
        },
      },
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: { categories: { include: { category: true } } },
    }),
    prisma.movie.findMany({
      where: { isTrending: true, isActive: true },
      take: 8,
      orderBy: { views: 'desc' },
      include: { categories: { include: { category: true } } },
    }),
    prisma.series.findMany({
      where: { isTrending: true, isActive: true },
      take: 8,
      orderBy: { views: 'desc' },
      include: { categories: { include: { category: true } } },
    }),
    prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.series.findMany({
      where: { isActive: true },
      take: 5,
      orderBy: { views: 'desc' },
      include: { categories: { include: { category: true } } },
    }),
    prisma.series.findMany({
      where: {
        isActive: true,
        categories: {
          some: {
            category: {
              OR: [
                { slug: { in: ['asian', 'asian-series', 'series-asian'] } },
              ],
            },
          },
        },
      },
      take: 5,
      orderBy: { rating: 'desc' },
      include: { categories: { include: { category: true } } },
    }),
    prisma.series.findMany({
      where: {
        isActive: true,
        categories: {
          some: {
            category: {
              OR: [
                { slug: { in: ['netflix', 'netflix-series', 'series-netflix'] } },
                { slug: { in: ['foreign', 'foreign-series', 'series-foreign'] } },
              ],
            },
          },
        },
      },
      take: 5,
      orderBy: { rating: 'desc' },
      include: { categories: { include: { category: true } } },
    }),
    prisma.series.findMany({
      where: {
        isActive: true,
        categories: {
          some: { category: { slug: { in: ['anime', 'netflix-anime'] } } },
        },
      },
      take: 5,
      orderBy: { rating: 'desc' },
      include: { categories: { include: { category: true } } },
    }),
  ])

  return (
    <main className="min-h-screen bg-night-900">
      <Navbar />
      <HeroBanner banners={banners} series={heroSeries} />
      <CategorySection 
        movieCategories={movieCategories} 
        seriesCategories={seriesCategories} 
      />
      <FeaturedMovies movies={featuredMovies} />
      <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          {featuredAnime.map((anime) => (
            <SeriesCard key={anime.id} series={anime} />
          ))}
        </div>
      </section>

      {featuredAnime[0] && (
        <section className="px-4 sm:px-6 max-w-7xl mx-auto pb-4">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-night-800 to-night-900 p-6 md:p-8">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-25"
              style={{ backgroundImage: `url(${featuredAnime[0].poster})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-night-900/95 via-night-900/70 to-night-900/40" />
            <div className="relative z-10 max-w-2xl">
              <span className="inline-flex items-center gap-2 bg-gradient-to-r from-sweet-coral to-sweet-gold text-night-900 px-4 py-1.5 rounded-full text-xs font-bold mb-4">
                ✨ {t.bannerTitle}
              </span>
              <h3 className="text-2xl md:text-3xl font-black text-white mb-3">
                {featuredAnime[0].titleAr || featuredAnime[0].title}
              </h3>
              <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-6">
                {t.bannerText}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={`/serie/${featuredAnime[0].slug}`}
                  className="px-5 py-2.5 rounded-full bg-gradient-to-r from-sweet-coral to-sweet-gold text-night-900 text-sm font-bold hover:shadow-lg transition-all"
                >
                  {t.bannerCta}
                </a>
                <a
                  href="/anime"
                  className="px-5 py-2.5 rounded-full bg-white/10 border border-white/10 text-white text-sm font-semibold hover:bg-white/20 transition-all"
                >
                  {t.viewAll}
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          {latestAnime.map((anime) => (
            <SeriesCard key={anime.id} series={anime} />
          ))}
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-black text-white">مسلسلات Netflix</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          {netflixSeries.map((serie) => (
            <SeriesCard key={serie.id} series={serie} />
          ))}
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-black text-white">مسلسلات آسيوية</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          {foreignSeries.map((serie) => (
            <SeriesCard key={serie.id} series={serie} />
          ))}
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-black text-white">الأنمي</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          {animeSeries.map((serie) => (
            <SeriesCard key={serie.id} series={serie} />
          ))}
        </div>
      </section>
      <TrendingSection 
        trendingMovies={trendingMovies} 
        trendingSeries={trendingSeries} 
      />
      <StatsSection />
      <Footer />
    </main>
  )
}

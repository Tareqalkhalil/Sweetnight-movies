import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { Star, Tv, Calendar, Eye, Play, Plus, Share2, Download, Users, Film, Globe } from "lucide-react"
import { formatViews } from "@/lib/utils"
import { cookies } from "next/headers"
import { getDictionary, getLocaleFromCookie, getLocalizedText } from "@/lib/i18n"
import SeriesSeasonsSection from "@/components/SeriesSeasonsSection"

interface SeriesDetailPageProps {
  params: Promise<{ slug: string }>
}

export default async function SeriesDetailPage({ params }: SeriesDetailPageProps) {
  const { slug } = await params
  const cookieStore = await cookies()
  const locale = getLocaleFromCookie(cookieStore.get("locale")?.value)
  const t = getDictionary(locale).pages.detail

  const series = await prisma.series.findUnique({
    where: { slug, isActive: true },
    include: {
      categories: { include: { category: true } },
      cast: { include: { person: true } },
      directors: { include: { person: true } },
      seasons: {
        include: { episodes: true },
        orderBy: { seasonNumber: "asc" },
      },
    },
  })

  if (!series) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-night-900">
      <Navbar />

      {/* Backdrop */}
      <section className="relative h-[500px] md:h-[600px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-night-800 to-night-900" />
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{ backgroundImage: `url(${series.backdrop || series.poster})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-night-900 via-night-900/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-l from-night-900/80 to-transparent" />

        <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 flex items-end pb-12">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Poster */}
            <div className="w-40 md:w-56 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10 flex-shrink-0 bg-gradient-to-br from-night-600 to-night-700 flex items-center justify-center text-6xl">
              📺
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {series.categories.map((sc) => (
                  <span
                    key={sc.category.id}
                    className="text-xs font-bold px-3 py-1 rounded-full"
                    style={{
                      backgroundColor: `${sc.category.color}20`,
                      color: sc.category.color,
                    }}
                  >
                    {getLocalizedText(locale, sc.category.nameAr, sc.category.name)}
                  </span>
                ))}
              </div>

              <h1 className="text-3xl md:text-5xl font-black text-white mb-2">
                {getLocalizedText(locale, series.titleAr, series.title)}
              </h1>
              <p className="text-gray-400 text-sm mb-4">{getLocalizedText(locale, series.title, series.titleAr)}</p>

              <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
                <span className="flex items-center gap-1 text-sweet-gold font-bold">
                  <Star className="w-4 h-4 fill-current" />
                  {series.rating.toFixed(1)}
                </span>
                <span className="flex items-center gap-1 text-gray-400">
                  <Tv className="w-4 h-4" />
                  {series.totalSeasons} {locale === "en" ? (series.totalSeasons === 1 ? "season" : "seasons") : series.totalSeasons === 1 ? "موسم" : "مواسم"}
                </span>
                <span className="flex items-center gap-1 text-gray-400">
                  <Calendar className="w-4 h-4" />
                  {series.releaseYear}{series.endYear ? ` - ${series.endYear}` : ""}
                </span>
                <span className="flex items-center gap-1 text-gray-400">
                  <Eye className="w-4 h-4" />
                  {formatViews(series.views)}
                </span>
                <span className="px-2 py-0.5 rounded bg-white/10 text-gray-300 text-xs font-bold">
                  {series.ageRating}
                </span>
                <span className="px-2 py-0.5 rounded bg-sweet-purple/20 text-sweet-purple text-xs font-bold">
                  {series.quality}
                </span>
              </div>

              <p className="text-gray-300 leading-relaxed mb-6 max-w-2xl">
                {getLocalizedText(locale, series.descriptionAr, series.description)}
              </p>

              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-sweet-coral to-sweet-gold text-night-900 font-extrabold hover:shadow-xl hover:shadow-sweet-coral/30 transition-all hover:scale-105">
                  <Play className="w-5 h-5 fill-current" />
                  {t.watchNow}
                </button>
                <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 border border-white/20 text-white font-bold hover:bg-white/20 transition-all">
                  <Plus className="w-5 h-5" />
                  {t.favorite}
                </button>
                <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 border border-white/20 text-white font-bold hover:bg-white/20 transition-all">
                  <Share2 className="w-5 h-5" />
                  {t.share}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Series Details Section */}
      <section className="px-4 sm:px-6 max-w-7xl mx-auto py-12 space-y-6">
        {/* Overview */}
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-night-800/80 to-night-900/80 p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-white mb-4">📖 {locale === "en" ? "Overview" : "نظرة عامة"}</h2>
            <p className="text-gray-300 leading-relaxed text-lg">
              {getLocalizedText(locale, series.descriptionAr, series.description)}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {/* Year */}
            <div className="rounded-xl bg-night-900/50 border border-white/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-sweet-coral" />
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                  {locale === "en" ? "Year" : "السنة"}
                </p>
              </div>
              <p className="text-white font-bold text-lg">
                {series.releaseYear}{series.endYear ? ` - ${series.endYear}` : ""}
              </p>
            </div>

            {/* Rating */}
            <div className="rounded-xl bg-night-900/50 border border-white/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-sweet-gold fill-current" />
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                  IMDb
                </p>
              </div>
              <p className="text-white font-bold text-lg">{series.rating.toFixed(1)}</p>
            </div>

            {/* Seasons */}
            <div className="rounded-xl bg-night-900/50 border border-white/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Tv className="w-4 h-4 text-sweet-purple" />
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                  {locale === "en" ? "Seasons" : "المواسم"}
                </p>
              </div>
              <p className="text-white font-bold text-lg">{series.totalSeasons}</p>
            </div>

            {/* Quality */}
            <div className="rounded-xl bg-night-900/50 border border-white/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Film className="w-4 h-4 text-sweet-green" />
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                  {locale === "en" ? "Quality" : "الجودة"}
                </p>
              </div>
              <p className="text-white font-bold text-lg">{series.quality}</p>
            </div>

            {/* Views */}
            <div className="rounded-xl bg-night-900/50 border border-white/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-4 h-4 text-sweet-pink" />
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                  {locale === "en" ? "Views" : "المشاهدات"}
                </p>
              </div>
              <p className="text-white font-bold text-lg">{formatViews(series.views)}</p>
            </div>
          </div>
        </div>

        {/* Directors */}
        {series.directors.length > 0 && (
          <div className="rounded-3xl border border-white/10 bg-night-800/80 p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">🎬</span>
              {locale === "en" ? "Directors" : "المخرجون"}
            </h3>
            <div className="flex flex-wrap gap-2">
              {series.directors.map((d) => (
                <span
                  key={d.person.id}
                  className="px-4 py-2 rounded-full bg-sweet-coral/20 text-sweet-coral font-semibold text-sm border border-sweet-coral/30"
                >
                  {getLocalizedText(locale, d.person.nameAr, d.person.name)}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Cast */}
        {series.cast.length > 0 && (
          <div className="rounded-3xl border border-white/10 bg-night-800/80 p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              {locale === "en" ? "Cast" : "الممثلون"}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {series.cast.slice(0, 12).map((c) => (
                <div
                  key={c.person.id}
                  className="bg-gradient-to-br from-night-700 to-night-900 rounded-xl p-3 text-center border border-white/5 hover:border-white/20 transition"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sweet-coral to-sweet-gold mx-auto mb-2 flex items-center justify-center text-xl font-bold text-night-900">
                    {getLocalizedText(locale, c.person.nameAr, c.person.name).charAt(0)}
                  </div>
                  <h4 className="text-white font-bold text-sm line-clamp-2">
                    {getLocalizedText(locale, c.person.nameAr, c.person.name)}
                  </h4>
                  <p className="text-gray-500 text-xs mt-1">{c.role}</p>
                </div>
              ))}
            </div>
            {series.cast.length > 12 && (
              <button className="mt-4 w-full py-2 rounded-lg border border-white/10 text-white hover:bg-white/5 transition font-semibold text-sm">
                {locale === "en" ? "View All Cast" : "عرض جميع الممثلين"}
              </button>
            )}
          </div>
        )}
      </section>

      <SeriesSeasonsSection
        title={getLocalizedText(locale, series.titleAr, series.title)}
        seriesUrl={series.embedUrl}
        seasons={series.seasons.map((season) => ({
          id: season.id,
          seasonNumber: season.seasonNumber,
          title: season.title,
          episodes: season.episodes.map((ep) => ({
            id: ep.id,
            episodeNumber: ep.episodeNumber,
            title: ep.title,
            description: ep.description,
            videoUrl: ep.videoUrl,
          })),
        }))}
        locale={locale}
        t={{ noEpisodes: t.noEpisodes, noSeasons: t.noSeasons }}
      />

      <Footer />
    </main>
  )
}

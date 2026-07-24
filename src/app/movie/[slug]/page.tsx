import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { Star, Clock, Calendar, Eye, Play, Plus, Share2 } from "lucide-react"
import { formatDuration, formatViews } from "@/lib/utils"
import { cookies } from "next/headers"
import { getDictionary, getLocaleFromCookie, getLocalizedText } from "@/lib/i18n"
import MediaPlayer from "@/components/MediaPlayer"

interface MovieDetailPageProps {
  params: Promise<{ slug: string }>
}

export default async function MovieDetailPage({ params }: MovieDetailPageProps) {
  const { slug } = await params
  const cookieStore = await cookies()
  const locale = getLocaleFromCookie(cookieStore.get("locale")?.value)
  const t = getDictionary(locale).pages.detail

  const movie = await prisma.movie.findUnique({
    where: { slug, isActive: true },
    include: {
      categories: { include: { category: true } },
      cast: { include: { person: true } },
      directors: { include: { person: true } },
    },
  })

  if (!movie) {
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
          style={{ backgroundImage: `url(${movie.backdrop || movie.poster})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-night-900 via-night-900/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-l from-night-900/80 to-transparent" />

        <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 flex items-end pb-12">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Poster */}
            <div className="w-40 md:w-56 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10 flex-shrink-0 bg-gradient-to-br from-night-600 to-night-700 flex items-center justify-center text-6xl">
              🎬
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {movie.categories.map((mc) => (
                  <span
                    key={mc.category.id}
                    className="text-xs font-bold px-3 py-1 rounded-full"
                    style={{
                      backgroundColor: `${mc.category.color}20`,
                      color: mc.category.color,
                    }}
                  >
                    {getLocalizedText(locale, mc.category.nameAr, mc.category.name)}
                  </span>
                ))}
              </div>

              <h1 className="text-3xl md:text-5xl font-black text-white mb-2">
                {getLocalizedText(locale, movie.titleAr, movie.title)}
              </h1>
              <p className="text-gray-400 text-sm mb-4">{getLocalizedText(locale, movie.title, movie.titleAr)}</p>

              <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
                <span className="flex items-center gap-1 text-sweet-gold font-bold">
                  <Star className="w-4 h-4 fill-current" />
                  {movie.rating.toFixed(1)}
                </span>
                <span className="flex items-center gap-1 text-gray-400">
                  <Clock className="w-4 h-4" />
                  {formatDuration(movie.duration)}
                </span>
                <span className="flex items-center gap-1 text-gray-400">
                  <Calendar className="w-4 h-4" />
                  {movie.releaseYear}
                </span>
                <span className="flex items-center gap-1 text-gray-400">
                  <Eye className="w-4 h-4" />
                  {formatViews(movie.views)}
                </span>
                <span className="px-2 py-0.5 rounded bg-white/10 text-gray-300 text-xs font-bold">
                  {movie.ageRating}
                </span>
                <span className="px-2 py-0.5 rounded bg-sweet-coral/20 text-sweet-coral text-xs font-bold">
                  {movie.quality}
                </span>
              </div>

              <p className="text-gray-300 leading-relaxed mb-6 max-w-2xl">
                {getLocalizedText(locale, movie.descriptionAr, movie.description)}
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

      {/* Player */}
      {movie.embedUrl && (
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <MediaPlayer title={getLocalizedText(locale, movie.titleAr, movie.title)} url={movie.embedUrl} />
        </section>
      )}

      {/* Cast */}
      {movie.cast.length > 0 && (
        <section className="py-12 px-4 sm:px-6 max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6">{t.cast}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {movie.cast.map((c) => (
              <div key={c.person.id} className="bg-night-800 rounded-xl p-4 text-center border border-white/5">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-night-600 to-night-700 mx-auto mb-3 flex items-center justify-center text-2xl">
                  👤
                </div>
                <h4 className="text-white font-bold text-sm">{getLocalizedText(locale, c.person.nameAr, c.person.name)}</h4>
                <p className="text-gray-500 text-xs mt-1">{c.role}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <Footer />
    </main>
  )
}

"use client"

import { useEffect, useMemo, useState } from "react"
import { ChevronDown, ChevronLeft, ChevronRight, PlayCircle, Film } from "lucide-react"
import type { Locale } from "@/lib/i18n"
import { getLocalizedText } from "@/lib/i18n"
import MediaPlayer from "./MediaPlayer"

interface EpisodeItem {
  id: string
  episodeNumber: number
  title: string
  description?: string | null
  videoUrl?: string | null
}

interface SeasonItem {
  id: string
  seasonNumber: number
  title?: string | null
  episodes: EpisodeItem[]
}

interface SeriesSeasonsSectionProps {
  seasons: SeasonItem[]
  locale: Locale
  t: {
    noEpisodes: string
    noSeasons: string
  }
  title: string
  seriesUrl?: string | null
}

export default function SeriesSeasonsSection({ seasons, locale, t, title, seriesUrl }: SeriesSeasonsSectionProps) {
  const seasonEntries = useMemo(() => {
    return [...seasons]
      .map((season) => ({
        ...season,
        episodes: [...season.episodes].sort((left, right) => left.episodeNumber - right.episodeNumber),
      }))
      .sort((left, right) => left.seasonNumber - right.seasonNumber)
  }, [seasons])

  const flattenedEpisodes = useMemo(() => {
    return seasonEntries.flatMap((season) =>
      season.episodes.map((episode) => ({
        ...episode,
        seasonId: season.id,
        seasonNumber: season.seasonNumber,
        seasonTitle: season.title,
      }))
    )
  }, [seasonEntries])

  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string | null>(flattenedEpisodes[0]?.id ?? null)
  const [selectedSeasonId, setSelectedSeasonId] = useState<string | null>(seasonEntries[0]?.id ?? null)

  useEffect(() => {
    if (!flattenedEpisodes.length) {
      setSelectedEpisodeId(null)
      return
    }

    setSelectedEpisodeId((current) => {
      if (current && flattenedEpisodes.some((episode) => episode.id === current)) {
        return current
      }

      return flattenedEpisodes[0].id
    })
  }, [flattenedEpisodes])

  const selectedEpisode = flattenedEpisodes.find((episode) => episode.id === selectedEpisodeId) ?? flattenedEpisodes[0] ?? null

  useEffect(() => {
    if (selectedEpisode?.seasonId) {
      setSelectedSeasonId(selectedEpisode.seasonId)
    }
  }, [selectedEpisode])

  const handleSelectEpisode = (episodeId: string) => {
    setSelectedEpisodeId(episodeId)
  }

  const handleNavigateEpisode = (direction: -1 | 1) => {
    if (!selectedEpisode) return

    const currentIndex = flattenedEpisodes.findIndex((episode) => episode.id === selectedEpisode.id)
    if (currentIndex === -1) return

    const nextIndex = (currentIndex + direction + flattenedEpisodes.length) % flattenedEpisodes.length
    const nextEpisode = flattenedEpisodes[nextIndex]
    if (nextEpisode) {
      setSelectedEpisodeId(nextEpisode.id)
    }
  }

  const currentSeasonEpisodes = seasonEntries.find(s => s.id === selectedSeasonId)?.episodes || []

  return (
    <section className="py-12 px-4 sm:px-6 max-w-7xl mx-auto space-y-6">
      {seriesUrl && (
        <div className="rounded-3xl border border-white/10 bg-night-800/80 p-3 sm:p-4">
          <MediaPlayer title={title} url={selectedEpisode?.videoUrl || seriesUrl} />
        </div>
      )}

      <div className="space-y-6">
        {/* Now Playing Section */}
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-night-800 to-night-900 p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-sweet-coral font-bold mb-2">
                {locale === "en" ? "Now Playing" : "تشغيل الآن"}
              </p>
              <h3 className="text-2xl font-black text-white">
                {selectedEpisode
                  ? `${locale === "en" ? "Episode" : "الحلقة"} ${selectedEpisode.episodeNumber}`
                  : locale === "en"
                    ? "No episode selected"
                    : "لم يتم اختيار حلقة"}
              </h3>
              <p className="text-gray-400 mt-2">
                {getLocalizedText(locale, selectedEpisode?.title, selectedEpisode?.title)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleNavigateEpisode(-1)}
                className="flex items-center gap-2 rounded-full border border-sweet-coral/30 bg-sweet-coral/10 px-4 py-2 text-sm text-sweet-coral transition hover:bg-sweet-coral/20 font-bold"
              >
                <ChevronLeft className="h-4 w-4" />
                {locale === "en" ? "Previous" : "سابقة"}
              </button>
              <button
                type="button"
                onClick={() => handleNavigateEpisode(1)}
                className="flex items-center gap-2 rounded-full border border-sweet-coral/30 bg-sweet-coral/10 px-4 py-2 text-sm text-sweet-coral transition hover:bg-sweet-coral/20 font-bold"
              >
                {locale === "en" ? "Next" : "تالية"}
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Episodes Section */}
        <div className="space-y-4">
          {/* Season Tabs */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-white">
              {locale === "en" ? "Episodes" : "الحلقات"}
            </h2>
            <span className="text-sm text-gray-400 font-bold">
              {currentSeasonEpisodes.length} {locale === "en" ? "episode(s)" : "حلقة"}
            </span>
          </div>

          {/* Season Selector */}
          {seasonEntries.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
              {seasonEntries.map((season) => (
                <button
                  key={season.id}
                  onClick={() => setSelectedSeasonId(season.id)}
                  className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition ${
                    selectedSeasonId === season.id
                      ? "bg-gradient-to-r from-sweet-coral to-sweet-gold text-night-900"
                      : "bg-night-800 border border-white/10 text-gray-300 hover:bg-night-700"
                  }`}
                >
                  {locale === "en" ? `Season ${season.seasonNumber}` : `الموسم ${season.seasonNumber}`}
                </button>
              ))}
            </div>
          )}

          {/* Episodes Grid */}
          <div className="rounded-3xl border border-white/10 bg-night-800/80 p-6">
            {currentSeasonEpisodes.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {currentSeasonEpisodes.map((episode) => {
                  const isActive = selectedEpisode?.id === episode.id
                  return (
                    <button
                      key={episode.id}
                      onClick={() => handleSelectEpisode(episode.id)}
                      className={`group relative overflow-hidden rounded-xl transition-all ${
                        isActive
                          ? "ring-2 ring-sweet-coral scale-105"
                          : "hover:scale-105"
                      }`}
                    >
                      {/* Thumbnail Background */}
                      <div className="aspect-video bg-gradient-to-br from-night-700 to-night-900 border border-white/10 flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-night-900/80 via-transparent to-transparent" />
                        <Film className="w-8 h-8 text-gray-600 group-hover:text-gray-400 transition" />
                      </div>

                      {/* Episode Badge */}
                      <div className={`absolute top-2 right-2 rounded-lg px-2 py-1 text-xs font-bold text-night-900 ${
                        isActive
                          ? "bg-gradient-to-r from-sweet-coral to-sweet-gold"
                          : "bg-sweet-coral"
                      }`}>
                        {episode.episodeNumber}
                      </div>

                      {/* Play Icon Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition">
                        <PlayCircle className={`w-8 h-8 transition ${
                          isActive
                            ? "text-sweet-gold"
                            : "text-white group-hover:text-sweet-gold"
                        }`} />
                      </div>

                      {/* Episode Title */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-night-900 to-transparent p-2">
                        <p className="text-xs font-semibold text-white line-clamp-2">
                          {getLocalizedText(locale, episode.title, episode.title)}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="py-12 text-center">
                <Film className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500">{t.noEpisodes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

interface TopCinemaItem {
  url: string
  title: string
  image: string | null
}

interface ParsedSeason {
  number: number
  title: string
  href: string
  poster: string | null
}

interface SeasonDetail {
  seasonNumber: number
  title: string
  href: string
  episodes: ParsedEpisode[]
}

interface ParsedEpisode {
  number: string
  title: string
  href: string
  poster: string | null
  embedUrl?: string | null
}

interface CustomSeasonPlan {
  number: number
  title: string
  episodes: Array<{
    number: number
    title: string
  }>
}

interface ImportJob {
  id: string
  status: "queued" | "running" | "completed" | "failed"
  total: number
  processed: number
  completed: number
  skipped: number
  failed: number
  currentTitle: string
  result: any | null
  error: string | null
  createdAt: number
  updatedAt: number
}

declare global {
  var __topCinemaImportJobs: Map<string, ImportJob> | undefined
}

const importJobs = globalThis.__topCinemaImportJobs ?? new Map<string, ImportJob>()
globalThis.__topCinemaImportJobs = importJobs

const DEFAULT_IMPORT_DELAY_MS = 400
const DEFAULT_TITLE_BATCH_SIZE = 25

import { hasValidAdminAccess } from "@/lib/admin-auth"

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

function decodeHtmlEntities(input: string) {
  return input
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_match, code) => String.fromCodePoint(Number(code)))
}

function cleanText(input?: string | null) {
  return (input || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

async function runConcurrent<T>(tasks: (() => Promise<T>)[], concurrency: number): Promise<T[]> {
  const results: T[] = []
  const queue = [...tasks]
  const inProgress: Promise<void>[] = []

  const dequeue = async () => {
    while (queue.length > 0) {
      const task = queue.shift()!
      results.push(await task())
    }
  }

  const workers = Array(Math.min(concurrency, tasks.length)).fill(null).map(() => dequeue())
  await Promise.all(workers)
  return results
}

function normalizeUrl(raw: string, baseUrl: string) {
  if (!raw) return baseUrl
  const value = decodeHtmlEntities(raw.trim())
  if (/^https?:\/\//i.test(value)) return value
  if (value.startsWith("//")) return `https:${value}`
  if (value.startsWith("/")) return new URL(value, baseUrl).toString()
  return value
}

function getYearFromTitle(title: string) {
  const match = title.match(/\b(19|20)\d{2}\b/)
  return match ? Number(match[0]) : new Date().getFullYear()
}

function extractNumberFromText(text: string, fallback?: string) {
  const normalized = decodeHtmlEntities(cleanText(text || fallback || ""))
  const direct = normalized.match(/(\d+(?:\.\d+)?)/)
  if (direct) return direct[1]
  const season = normalized.match(/(?:الموسم|season|s)\s*([0-9]+)/i)
  if (season) return season[1]
  const episode = normalized.match(/(?:الحلقة|episode|ep)\s*([0-9]+)/i)
  if (episode) return episode[1]
  return fallback || "1"
}

function extractSeasonNumber(text: string, fallback: number) {
  const normalized = decodeHtmlEntities(cleanText(text || ""))
  const match = normalized.match(/(?:الموسم|season|s)\s*([0-9]+)/i)
  if (match) return Number(match[1])
  const direct = normalized.match(/\b([0-9]+)\b/)
  if (direct) return Number(direct[1])
  return fallback
}

function getEpisodeSortNumber(episode: ParsedEpisode) {
  const direct = Number(episode.number)
  if (!Number.isNaN(direct)) return direct
  const match = episode.number.match(/(\d+(?:\.\d+)?)/)
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER
}

function groupEpisodesBySeasons(episodeCandidates: ParsedEpisode[], seasonCandidates: ParsedSeason[]) {
  const sortedEpisodes = [...episodeCandidates]
    .filter((episode) => episode.number && episode.title)
    .sort((left, right) => getEpisodeSortNumber(left) - getEpisodeSortNumber(right))

  if (!sortedEpisodes.length) {
    return [{ seasonNumber: 1, title: seasonCandidates[0]?.title || "Season 1", episodes: [] }]
  }

  if (!seasonCandidates.length || seasonCandidates.length <= 1) {
    return [{ seasonNumber: 1, title: seasonCandidates[0]?.title || "Season 1", episodes: sortedEpisodes }]
  }

  const groups: Array<{ seasonNumber: number; title: string; episodes: ParsedEpisode[] }> = []
  const episodeCount = sortedEpisodes.length
  const seasonCount = seasonCandidates.length
  const baseCount = Math.floor(episodeCount / seasonCount)
  const remainder = episodeCount % seasonCount

  seasonCandidates.forEach((season, seasonIndex) => {
    const start = seasonIndex * baseCount + Math.min(seasonIndex, remainder)
    const end = start + baseCount + (seasonIndex < remainder ? 1 : 0)
    const chunk = sortedEpisodes.slice(start, end).sort((left, right) => getEpisodeSortNumber(left) - getEpisodeSortNumber(right))

    if (chunk.length > 0) {
      groups.push({
        seasonNumber: season.number || seasonIndex + 1,
        title: season.title || `Season ${season.number || seasonIndex + 1}`,
        episodes: chunk,
      })
    }
  })

  return groups.length > 0 ? groups : [{ seasonNumber: 1, title: "Season 1", episodes: sortedEpisodes }]
}

function extractInstructionSearchQuery(instruction?: string | null) {
  const text = instruction?.trim()
  if (!text) return null

  const afterVerb = text
    .replace(/^(?:استورد|استيراد|import|imported|أستورد)\s+/i, "")
    .replace(/\b(?:انمي|أنمي|مسلسل|فيلم|movie|series|anime|show|program|season|episodes|episode|الحلقات|الحلقة|الكامل|كامل|جميع|كل|القسم|المختار|المختارة|الى|إلى|في|و|the|a|an|and|into|for|of)\b/gi, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()

  if (!afterVerb) return null

  const tokens = afterVerb.split(/\s+/).filter((token) => token.length >= 2)
  return tokens.slice(0, 6).join(" ") || null
}

function getInstructionSignals(instruction?: string | null) {
  const query = extractInstructionSearchQuery(instruction)
  if (!query) return []

  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
}

function getAnchorText(node: string) {
  return cleanText(node.replace(/<[^>]+>/g, " "))
}

async function fetchSearchResults(query: string | null, limit: number): Promise<TopCinemaItem[]> {
  const url = new URL("https://topcinemaa.top/")
  if (query?.trim()) {
    url.searchParams.set("s", query.trim())
  }

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "text/html,application/xhtml+xml",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
  })

  if (!response.ok) {
    throw new Error(`TopCinema request failed with ${response.status}`)
  }

  const html = await response.text()
  const results: TopCinemaItem[] = []
  const seen = new Set<string>()

  // Try multiple patterns to find search results
  const patterns = [
    // Pattern 1: Small--Box with href, title, and image
    /<div[^>]+class=["'][^"']*Small--Box[^"']*["'][^>]*>[\s\S]*?<a\s+href=["']([^"']+)["'][^>]*title=["']([^"']*)["'][\s\S]*?(?:<img[^>]+(?:data-src|src)=["']([^"']+)["'][^>]*>)?/gi,
    // Pattern 2: Post or article item with href and title
    /<article[^>]*>[\s\S]*?<a[^>]+href=["']([^"']+)["'][^>]*>[\s\S]*?<(?:h2|h3|span[^>]*class="title")[^>]*>([^<]+)<\/(?:h2|h3|span)>/gi,
    // Pattern 3: Link with title and lazy-loaded image
    /<a[^>]+href=["']([^"']+)["'][^>]*>[\s\S]*?<img[^>]+(?:data-src|src)=["']([^"']+)["'][^>]*>[\s\S]*?(?:<(?:span|h3|div)[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)<\/(?:span|h3|div)>)?/gi,
    // Pattern 4: Simplified: any link with title attribute
    /<a[^>]+href=["']([^"']+)["'][^>]*title=["']([^"']+)["'][^>]*>/gi,
  ]

  for (const regex of patterns) {
    if (results.length >= limit) break

    let match: RegExpExecArray | null
    const regexCopy = new RegExp(regex.source, regex.flags)
    while ((match = regexCopy.exec(html)) !== null && results.length < limit) {
      const href = match[1]?.trim()
      const titleOrImage = match[2]?.trim() || match[3]?.trim()
      const image = match[3]?.trim() || match[2]?.trim()

      if (!href) continue
      if (seen.has(href)) continue

      const title = decodeHtmlEntities(cleanText(titleOrImage || ""))
      if (!title || title.length < 2) continue

      seen.add(href)
      results.push({
        url: href.startsWith("http") ? href : `https://topcinemaa.top${href}`,
        title,
        image: image && (image.startsWith("http") || image.startsWith("/")) ? decodeHtmlEntities(image) : null,
      })
    }
  }

  return results
}

function extractMediaCandidates(html: string, baseUrl: string) {
  const candidates = new Set<string>()

  const patterns = [
    /<iframe[^>]+(?:data-src|src)=["']([^"']+)["']/gi,
    /<source[^>]+(?:data-src|src)=["']([^"']+)["']/gi,
    /<video[^>]+(?:data-src|src)=["']([^"']+)["']/gi,
    /(?:src|data-src|file|url|videoUrl|video_url|streamUrl|stream_url|embedUrl|embed_url)\s*[:=]\s*["']([^"']+)["']/gi,
    /https?:\/\/[^"'\s<>]+(?:embed|player|video|m3u8|mp4|hls)[^"'\s<>]*/gi,
  ]

  for (const pattern of patterns) {
    let match: RegExpExecArray | null
    while ((match = pattern.exec(html)) !== null) {
      const candidate = normalizeUrl(match[1] || match[0], baseUrl)
      if (candidate && candidate !== baseUrl) {
        candidates.add(candidate)
      }
    }
  }

  return Array.from(candidates)
}

function extractSeasons(html: string, baseUrl: string): ParsedSeason[] {
  const seasons: ParsedSeason[] = []
  const seen = new Set<string>()
  const regex = /class=["'][^"']*Small--Box\s+Season[^"']*["'][^>]*>[\s\S]*?<a\s+href=["']([^"']+)["'][^>]*>[\s\S]*?<div class="epnum"><span>الموسم<\/span>\s*([0-9]+)[\s\S]*?<h3 class="title">([^<]+)<\/h3>/gi

  let match: RegExpExecArray | null
  while ((match = regex.exec(html)) !== null) {
    const href = normalizeUrl(match[1], baseUrl)
    const number = Number(match[2])
    const title = cleanText(match[3])
    const key = `${number}-${href}`
    if (!href || Number.isNaN(number) || seen.has(key)) continue
    seen.add(key)
    seasons.push({ number, title: decodeHtmlEntities(title) || `Season ${number}`, href, poster: null })
  }

  return seasons
}

function extractEpisodes(html: string, baseUrl: string): ParsedEpisode[] {
  const episodes: ParsedEpisode[] = []
  const seen = new Set<string>()

  const patterns = [
    /<a\s+href=["']([^"']+)["'][^>]*title=["']([^"']*)["'][\s\S]*?<div class="ep-info">[\s\S]*?<h2>([^<]+)<\/h2>[\s\S]*?<div class="epnum">[\s\S]*?<span>[^<]*<\/span>\s*([0-9.]+)\s*<\/div>/gi,
    /<a\s+href=["']([^"']+)["'][^>]*>[\s\S]*?(?:الحلقة|episode|ep)[^<]*<\/a>/gi,
    /<div[^>]*class=["'][^"']*epnum[^"']*["'][^>]*>[\s\S]*?<span>[^<]*<\/span>\s*([0-9.]+)\s*<\/div>/gi,
  ]

  for (const pattern of patterns) {
    let match: RegExpExecArray | null
    const regexCopy = new RegExp(pattern.source, pattern.flags)
    while ((match = regexCopy.exec(html)) !== null) {
      const href = normalizeUrl(match[1], baseUrl)
      const titleValue = match[2] || match[3] || ""
      const title = decodeHtmlEntities(cleanText(titleValue))
      const number = cleanText(match[4] || match[1] || "")
      const key = `${href}-${number}`
      const looksLikeEpisode = /(?:الحلقة|episode|ep)/i.test(title) || /(?:الحلقة|episode|ep)/i.test(number)
      if (!href || seen.has(key) || !looksLikeEpisode) continue
      seen.add(key)
      episodes.push({ number: number || String(episodes.length + 1), title: title || `Episode ${episodes.length + 1}`, href, poster: null })
    }
  }

  return episodes.filter((episode, index, self) => self.findIndex((item) => item.number === episode.number && item.href === episode.href) === index)
}

function inferContentTypeFromText(title: string, description: string, contentType: "movie" | "series" | "anime") {
  const haystack = `${title} ${description}`.toLowerCase()
  const isAnimeSignal = /(anime|انمي|cartoon|كرتون|manga|مانجا|shonen|شونين|season|الموسم)/i.test(haystack)
  const isSeriesSignal = /(series|serie|مسلسل|tv show|show|season|الموسم|episode|حلقة)/i.test(haystack)
  const isMovieSignal = /(movie|film|فيلم|cinema|سينما|trailer|مشاهدة)/i.test(haystack)

  if (contentType === "anime") {
    return isAnimeSignal || (!isSeriesSignal && !isMovieSignal) ? "anime" : null
  }

  if (contentType === "series") {
    return isSeriesSignal || (!isAnimeSignal && !isMovieSignal) ? "series" : null
  }

  return isMovieSignal || (!isAnimeSignal && !isSeriesSignal) ? "movie" : null
}

async function fetchSeasonDetails(url: string, fallbackSeasonNumber: number, fallbackTitle: string): Promise<SeasonDetail | null> {
  try {
    const response = await fetch(url, {
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "User-Agent": "Mozilla/5.0",
      },
      signal: AbortSignal.timeout(15000),
    })

    if (!response.ok) {
      return null
    }

    const html = await response.text()
    const episodes = extractEpisodes(html, url)
    
    // استخراج embed URLs لكل حلقة من صفحتها
    const episodesWithEmbed = await Promise.all(
      episodes.map(async (episode) => {
        try {
          const episodeResponse = await fetch(episode.href, {
            headers: {
              Accept: "text/html,application/xhtml+xml",
              "User-Agent": "Mozilla/5.0",
            },
            signal: AbortSignal.timeout(10000),
          })
          
          if (episodeResponse.ok) {
            const episodeHtml = await episodeResponse.text()
            const embedCandidates = extractMediaCandidates(episodeHtml, episode.href)
            const embedUrl = embedCandidates.find((candidate) => /embed|player|video|m3u8|mp4|hls/i.test(candidate)) || embedCandidates[0]
            
            return { ...episode, embedUrl: embedUrl || episode.href }
          }
        } catch {
          // silent error
        }
        return { ...episode, embedUrl: episode.href }
      })
    )
    
    const seasonTitle = decodeHtmlEntities(cleanText(html.match(/(?:الموسم|season)[^<]{0,40}([0-9]+)/i)?.[0] || fallbackTitle)) || fallbackTitle

    return {
      seasonNumber: fallbackSeasonNumber,
      title: seasonTitle || fallbackTitle,
      href: url,
      episodes: episodesWithEmbed,
    }
  } catch {
    return null
  }
}

async function fetchItemDetails(url: string) {
  try {
    const response = await fetch(url, {
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "User-Agent": "Mozilla/5.0",
      },
      signal: AbortSignal.timeout(15000),
    })

    if (!response.ok) {
      return null
    }

    const html = await response.text()
    const metaDescription = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)?.[1] || null
    const ogDescription = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["']/i)?.[1] || null
    const ogImage = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']*)["']/i)?.[1] || null
    const imageMatch = html.match(/<img[^>]+(?:data-src|src)=["']([^"']+)["'][^>]*>/i)?.[1] || null
    const embedCandidates = extractMediaCandidates(html, url)
    const embedUrl = embedCandidates.find((candidate) => /embed|player|video|m3u8|mp4|hls/i.test(candidate)) || embedCandidates[0] || url

    const seasons = extractSeasons(html, url)
    const seasonDetails: SeasonDetail[] = (await runConcurrent(
      seasons.map((season) => () =>
        fetchSeasonDetails(season.href, season.number, season.title)
      ),
      5
    )).filter((detail): detail is SeasonDetail => detail !== null)

    return {
      description: decodeHtmlEntities(cleanText(metaDescription || ogDescription || "")),
      poster: decodeHtmlEntities(cleanText(ogImage || imageMatch || "")) || null,
      backdrop: decodeHtmlEntities(cleanText(ogImage || imageMatch || "")) || null,
      embedUrl: embedUrl || url,
      seasons,
      episodes: extractEpisodes(html, url),
      seasonDetails,
    }
  } catch {
    return null
  }
}

async function runImportJob(body: any, job?: ImportJob) {
  const { query, titles = [], contentType = "movie", limit = 6, categorySlug, mode = "query", url, instruction, customSeasons, batchSize = DEFAULT_TITLE_BATCH_SIZE, delayMs = DEFAULT_IMPORT_DELAY_MS } = body as {
    query?: string
    titles?: string[]
    contentType?: "movie" | "series" | "anime"
    limit?: number
    categorySlug?: string
    mode?: "query" | "catalog"
    url?: string
    instruction?: string
    customSeasons?: CustomSeasonPlan[]
    batchSize?: number
    delayMs?: number
  }

  const isBatchImport = Array.isArray(titles) && titles.length > 0
  const useCatalog = mode === "catalog"
  const directUrl = url?.trim()
  const effectiveQuery = query?.trim() || extractInstructionSearchQuery(instruction)

  if (!isBatchImport && !useCatalog && !directUrl && !effectiveQuery) {
    throw new Error("Please provide a TopCinema search query, direct URL, titles array, or text instruction")
  }

  if (!categorySlug?.trim()) {
    throw new Error("Choose the destination category manually before importing")
  }

  const normalizedSlug = categorySlug.trim().toLowerCase()
  let category = await prisma.category.findUnique({ where: { slug: normalizedSlug } })

  if (!category) {
    const fallbackType = contentType === "movie" ? "MOVIE" : "SERIES"
    const allCats = await prisma.category.findMany()
    category = allCats.find((c) => c.slug.toLowerCase() === normalizedSlug || c.name.toLowerCase() === normalizedSlug) || null
    if (!category) {
      const fallbackName = normalizedSlug
        .replace(/-/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase())
      try {
        category = await prisma.category.create({
          data: {
            name: fallbackName,
            nameAr: fallbackName,
            slug: normalizedSlug,
            icon: contentType === "movie" ? "🎬" : "📺",
            color: contentType === "movie" ? "#f59e0b" : "#8b5cf6",
            type: fallbackType,
            sortOrder: 999,
            isActive: true,
          },
        })
      } catch {
        category = allCats.find((c) => c.name === fallbackName || c.slug === normalizedSlug) || null
        if (!category) throw new Error(`Category "${normalizedSlug}" not found and could not be created`)
      }
    }
  }

  const normalizedType = contentType === "anime" ? "series" : contentType

  const createdItems: Array<{
    id: string
    title: string
    type: string
    seasons: Array<{
      seasonNumber: number
      title: string
      episodes: Array<{ number: number; title: string }>
    }>
    totalSeasons: number
    totalEpisodes: number
  }> = []

  let skippedCount = 0
  let failedCount = 0

  if (isBatchImport) {
    const validTitles = titles.filter((t): t is string => typeof t === "string" && t.trim().length > 0)
    if (job) {
      job.total = validTitles.length
      job.updatedAt = Date.now()
    }
    console.log(`[BATCH IMPORT] Starting import of ${validTitles.length} titles for category: ${categorySlug}`)

    const normalizedBatchSize = Math.max(1, Math.min(100, Number(batchSize) || DEFAULT_TITLE_BATCH_SIZE))

    for (let batchStart = 0; batchStart < validTitles.length; batchStart += normalizedBatchSize) {
      const batchTitles = validTitles.slice(batchStart, batchStart + normalizedBatchSize)
      const batchItems: TopCinemaItem[] = []

      for (const [indexInBatch, title] of batchTitles.entries()) {
        const absoluteIndex = batchStart + indexInBatch
        if (job) {
          job.processed = absoluteIndex + 1
          job.currentTitle = title.trim()
          job.updatedAt = Date.now()
        }

        const searchResults = await fetchSearchResults(title.trim(), Math.max(1, Math.min(limit, 6)))
        console.log(`[BATCH IMPORT] Found ${searchResults.length} results for "${title}"`)
        batchItems.push(...searchResults)
        await sleep(Number(delayMs) || DEFAULT_IMPORT_DELAY_MS)
      }

      console.log(`[BATCH IMPORT] Processing batch ${Math.floor(batchStart / normalizedBatchSize) + 1} with ${batchItems.length} items for type: ${contentType}`)
      for (const [index, item] of batchItems.entries()) {
        try {
          const details = await fetchItemDetails(item.url)
          const title = item.title?.trim() || `Imported from TopCinema ${batchStart + index + 1}`
          const queryLabel = query?.trim() || (useCatalog ? "catalog" : "topcinemaa")
          const description = details?.description?.trim() || `Imported from TopCinema using query: ${queryLabel}`
          const poster = details?.poster || item.image || null
          const instructionSignals = getInstructionSignals(instruction)
          const titleAndDescription = `${title} ${description}`.toLowerCase()
          const matchesInstruction = instructionSignals.length === 0 || instructionSignals.every((token) => titleAndDescription.includes(token))
          const backdrop = details?.backdrop || item.image || poster
          const embedUrl = details?.embedUrl || item.url
          const slug = `${slugify(title)}-${batchStart + index + 1}`
          const inferredType = inferContentTypeFromText(title, description, contentType)

          console.log(`[BATCH IMPORT] Processing item ${batchStart + index + 1}/${validTitles.length + batchItems.length}: "${title}" (inferred: ${inferredType}, requested: ${contentType})`)

          if (isBatchImport && contentType === "movie") {
          } else if (inferredType && inferredType !== contentType && inferredType !== (contentType === "anime" ? "series" : contentType)) {
            console.log(`[BATCH IMPORT] Skipping - type mismatch`)
            skippedCount++
            if (job) {
              job.skipped = skippedCount
              job.updatedAt = Date.now()
            }
            continue
          }

          if (!matchesInstruction) {
            console.log(`[BATCH IMPORT] Skipping - instruction mismatch`)
            skippedCount++
            if (job) {
              job.skipped = skippedCount
              job.updatedAt = Date.now()
            }
            continue
          }

          if (normalizedType === "movie") {
            const created = await prisma.movie.create({
              data: {
                title,
                titleAr: title,
                slug: `${slug}-${Date.now()}-${batchStart + index}`,
                description,
                descriptionAr: description,
                poster,
                backdrop,
                embedUrl,
                duration: 120,
                releaseYear: getYearFromTitle(title),
                rating: 0,
                language: "ar",
                quality: "HD",
                views: 0,
                isFeatured: false,
                isTrending: false,
                isActive: true,
                ...(category
                  ? {
                      categories: {
                        create: [{ categoryId: category.id }],
                      },
                    }
                  : {}),
              },
            })

            createdItems.push({
              id: created.id,
              title: created.title,
              type: "movie",
              seasons: [],
              totalSeasons: 0,
              totalEpisodes: 0,
            })
            if (job) {
              job.completed = createdItems.length
              job.updatedAt = Date.now()
            }
            continue
          }

          const createdSeries = await prisma.series.create({
            data: {
              title,
              titleAr: title,
              slug: `${slug}-${Date.now()}-${batchStart + index}`,
              description,
              descriptionAr: description,
              poster,
              backdrop,
              embedUrl,
              totalSeasons: 1,
              totalEpisodes: 1,
              releaseYear: getYearFromTitle(title),
              rating: 0,
              language: "ar",
              quality: "HD",
              views: 0,
              isFeatured: false,
              isTrending: false,
              isActive: true,
              ...(category
                ? {
                    categories: {
                      create: [{ categoryId: category.id }],
                    },
                  }
                : {}),
            },
          })

          const seasonCandidates = details?.seasons?.length ? details.seasons : [{ number: 1, title: "Season 1", href: item.url, poster }]
          const episodeCandidates = details?.episodes?.length ? details.episodes : [{ number: "1", title: `${title} - Episode 1`, href: item.url, poster }]
          const groupedSeasons = groupEpisodesBySeasons(episodeCandidates, seasonCandidates)
          const seasonDetails = Array.isArray((details as any)?.seasonDetails) && (details as any).seasonDetails.length > 0
            ? (details as any).seasonDetails
            : []
          const importedSeasonPlan = Array.isArray(customSeasons) && customSeasons.length > 0
            ? customSeasons.map((seasonPlan, seasonIndex) => ({
                seasonNumber: seasonPlan.number || seasonIndex + 1,
                title: seasonPlan.title || `Season ${seasonPlan.number || seasonIndex + 1}`,
                episodes: (seasonPlan.episodes || []).map((episodePlan, episodeIndex) => ({
                  number: episodePlan.number || episodeIndex + 1,
                  title: episodePlan.title || `${title} - Episode ${episodeIndex + 1}`,
                  videoUrl: embedUrl,
                })),
              }))
            : (seasonDetails.length > 0
                ? seasonDetails.map((seasonDetail: SeasonDetail, seasonIndex: number) => ({
                    seasonNumber: seasonDetail.seasonNumber || seasonIndex + 1,
                    title: seasonDetail.title || `Season ${seasonDetail.seasonNumber || seasonIndex + 1}`,
                    episodes: seasonDetail.episodes.length > 0
                      ? seasonDetail.episodes.map((episode, episodeIndex) => ({
                          number: Number(episode.number) || episodeIndex + 1,
                          title: episode.title || `${title} - Episode ${episodeIndex + 1}`,
                          videoUrl: episode.embedUrl || episode.href || embedUrl,
                        }))
                      : groupedSeasons[seasonIndex]?.episodes?.map((episode, episodeIndex) => ({
                          number: Number(episode.number) || episodeIndex + 1,
                          title: episode.title || `${title} - Episode ${episodeIndex + 1}`,
                          videoUrl: episode.embedUrl || episode.href || embedUrl,
                        })) || [],
                  }))
                : groupedSeasons.map((groupedSeason, seasonIndex) => ({
                    seasonNumber: groupedSeason.seasonNumber || seasonIndex + 1,
                    title: groupedSeason.title || `Season ${groupedSeason.seasonNumber || seasonIndex + 1}`,
                    episodes: groupedSeason.episodes.map((episode, episodeIndex) => ({
                      number: Number(episode.number) || episodeIndex + 1,
                      title: episode.title || `${title} - Episode ${episodeIndex + 1}`,
                      videoUrl: episode.embedUrl || episode.href || embedUrl,
                    })),
                  })))

          const createdSeasonCount = importedSeasonPlan.length
          const totalEpisodesImported = importedSeasonPlan.reduce((total: number, group: any) => total + group.episodes.length, 0)

          for (const [seasonIndex, seasonPlan] of importedSeasonPlan.entries()) {
            const createdSeason = await prisma.season.create({
              data: {
                seriesId: createdSeries.id,
                seasonNumber: seasonPlan.seasonNumber || seasonIndex + 1,
                title: seasonPlan.title || `Season ${seasonPlan.seasonNumber || seasonIndex + 1}`,
                description: `Imported season from TopCinema for ${title}`,
                releaseDate: new Date(),
                episodeCount: seasonPlan.episodes.length,
              },
            })

            for (const [episodeIndex, episodePlan] of seasonPlan.episodes.entries()) {
              await prisma.episode.create({
                data: {
                  seasonId: createdSeason.id,
                  episodeNumber: Number(episodePlan.number) || episodeIndex + 1,
                  title: episodePlan.title || `${title} - Episode ${episodeIndex + 1}`,
                  description,
                  duration: 120,
                  videoUrl: episodePlan.videoUrl || embedUrl,
                  thumbnail: poster,
                },
              })
            }
          }

          await prisma.series.update({
            where: { id: createdSeries.id },
            data: {
              totalSeasons: createdSeasonCount,
              totalEpisodes: totalEpisodesImported,
            },
          })

          createdItems.push({
            id: createdSeries.id,
            title: createdSeries.title,
            type: contentType === "anime" ? "anime" : "series",
            seasons: importedSeasonPlan.map((s: { seasonNumber: number; title: string; episodes: { number: number; title: string }[] }) => ({
              seasonNumber: s.seasonNumber,
              title: s.title,
              episodes: s.episodes.map((e: { number: number; title: string }) => ({ number: e.number, title: e.title })),
            })),
            totalSeasons: createdSeasonCount,
            totalEpisodes: totalEpisodesImported,
          })
          if (job) {
            job.completed = createdItems.length
            job.updatedAt = Date.now()
          }
        } catch (error) {
          failedCount++
          if (job) {
            job.failed = failedCount
            job.updatedAt = Date.now()
          }
          console.error(`[BATCH IMPORT] Failed item ${batchStart + index + 1}/${validTitles.length + batchItems.length}:`, error instanceof Error ? error.message : error)
        }
      }

      await sleep(Number(delayMs) || DEFAULT_IMPORT_DELAY_MS)
    }
  } else {
    const parsedItems: TopCinemaItem[] = directUrl
      ? [{ url: normalizeUrl(directUrl, "https://topcinemaa.top/"), title: "Direct TopCinema Import", image: null }]
      : await fetchSearchResults(useCatalog ? null : effectiveQuery || null, Math.max(1, Math.min(limit, 24)))

    console.log(`[BATCH IMPORT] Processing ${parsedItems.length} items for type: ${contentType}`)
    for (const [index, item] of parsedItems.entries()) {
      try {
        const details = await fetchItemDetails(item.url)
        const title = item.title?.trim() || `Imported from TopCinema ${index + 1}`
        const queryLabel = query?.trim() || (useCatalog ? "catalog" : "topcinema")
        const description = details?.description?.trim() || `Imported from TopCinema using query: ${queryLabel}`
        const poster = details?.poster || item.image || null
        const instructionSignals = getInstructionSignals(instruction)
        const titleAndDescription = `${title} ${description}`.toLowerCase()
        const matchesInstruction = instructionSignals.length === 0 || instructionSignals.every((token) => titleAndDescription.includes(token))
        const backdrop = details?.backdrop || item.image || poster
        const embedUrl = details?.embedUrl || item.url
        const slug = `${slugify(title)}-${index + 1}`
        const inferredType = inferContentTypeFromText(title, description, contentType)

        console.log(`[BATCH IMPORT] Processing item ${index + 1}/${parsedItems.length}: "${title}" (inferred: ${inferredType}, requested: ${contentType})`)

        if (isBatchImport && contentType === "movie") {
        } else if (inferredType && inferredType !== contentType && inferredType !== (contentType === "anime" ? "series" : contentType)) {
          console.log(`[BATCH IMPORT] Skipping - type mismatch`)
          skippedCount++
          if (job) {
            job.skipped = skippedCount
            job.updatedAt = Date.now()
          }
          continue
        }

        if (!matchesInstruction) {
          console.log(`[BATCH IMPORT] Skipping - instruction mismatch`)
          skippedCount++
          if (job) {
            job.skipped = skippedCount
            job.updatedAt = Date.now()
          }
          continue
        }

        if (normalizedType === "movie") {
          const created = await prisma.movie.create({
            data: {
              title,
              titleAr: title,
              slug: `${slug}-${Date.now()}-${index}`,
              description,
              descriptionAr: description,
              poster,
              backdrop,
              embedUrl,
              duration: 120,
              releaseYear: getYearFromTitle(title),
              rating: 0,
              language: "ar",
              quality: "HD",
              views: 0,
              isFeatured: false,
              isTrending: false,
              isActive: true,
              ...(category
                ? {
                    categories: {
                      create: [{ categoryId: category.id }],
                    },
                  }
                : {}),
            },
          })

          createdItems.push({
            id: created.id,
            title: created.title,
            type: "movie",
            seasons: [],
            totalSeasons: 0,
            totalEpisodes: 0,
          })
          if (job) {
            job.completed = createdItems.length
            job.updatedAt = Date.now()
          }
          continue
        }

        const createdSeries = await prisma.series.create({
          data: {
            title,
            titleAr: title,
            slug: `${slug}-${Date.now()}-${index}`,
            description,
            descriptionAr: description,
            poster,
            backdrop,
            embedUrl,
            totalSeasons: 1,
            totalEpisodes: 1,
            releaseYear: getYearFromTitle(title),
            rating: 0,
            language: "ar",
            quality: "HD",
            views: 0,
            isFeatured: false,
            isTrending: false,
            isActive: true,
            ...(category
              ? {
                  categories: {
                    create: [{ categoryId: category.id }],
                  },
                }
              : {}),
          },
        })

        const seasonCandidates = details?.seasons?.length ? details.seasons : [{ number: 1, title: "Season 1", href: item.url, poster }]
        const episodeCandidates = details?.episodes?.length ? details.episodes : [{ number: "1", title: `${title} - Episode 1`, href: item.url, poster }]
        const groupedSeasons = groupEpisodesBySeasons(episodeCandidates, seasonCandidates)
        const seasonDetails = Array.isArray((details as any)?.seasonDetails) && (details as any).seasonDetails.length > 0
          ? (details as any).seasonDetails
          : []
        const importedSeasonPlan = Array.isArray(customSeasons) && customSeasons.length > 0
          ? customSeasons.map((seasonPlan, seasonIndex) => ({
              seasonNumber: seasonPlan.number || seasonIndex + 1,
              title: seasonPlan.title || `Season ${seasonPlan.number || seasonIndex + 1}`,
              episodes: (seasonPlan.episodes || []).map((episodePlan, episodeIndex) => ({
                number: episodePlan.number || episodeIndex + 1,
                title: episodePlan.title || `${title} - Episode ${episodeIndex + 1}`,
                videoUrl: embedUrl,
              })),
            }))
          : (seasonDetails.length > 0
              ? seasonDetails.map((seasonDetail: SeasonDetail, seasonIndex: number) => ({
                  seasonNumber: seasonDetail.seasonNumber || seasonIndex + 1,
                  title: seasonDetail.title || `Season ${seasonDetail.seasonNumber || seasonIndex + 1}`,
                  episodes: seasonDetail.episodes.length > 0
                    ? seasonDetail.episodes.map((episode, episodeIndex) => ({
                        number: Number(episode.number) || episodeIndex + 1,
                        title: episode.title || `${title} - Episode ${episodeIndex + 1}`,
                        videoUrl: episode.embedUrl || episode.href || embedUrl,
                      }))
                    : groupedSeasons[seasonIndex]?.episodes?.map((episode, episodeIndex) => ({
                        number: Number(episode.number) || episodeIndex + 1,
                        title: episode.title || `${title} - Episode ${episodeIndex + 1}`,
                        videoUrl: episode.embedUrl || episode.href || embedUrl,
                      })) || [],
                }))
              : groupedSeasons.map((groupedSeason, seasonIndex) => ({
                  seasonNumber: groupedSeason.seasonNumber || seasonIndex + 1,
                  title: groupedSeason.title || `Season ${groupedSeason.seasonNumber || seasonIndex + 1}`,
                  episodes: groupedSeason.episodes.map((episode, episodeIndex) => ({
                    number: Number(episode.number) || episodeIndex + 1,
                    title: episode.title || `${title} - Episode ${episodeIndex + 1}`,
                    videoUrl: episode.embedUrl || episode.href || embedUrl,
                  })),
                })))

        const createdSeasonCount = importedSeasonPlan.length
        const totalEpisodesImported = importedSeasonPlan.reduce((total: number, group: any) => total + group.episodes.length, 0)

        for (const [seasonIndex, seasonPlan] of importedSeasonPlan.entries()) {
          const createdSeason = await prisma.season.create({
            data: {
              seriesId: createdSeries.id,
              seasonNumber: seasonPlan.seasonNumber || seasonIndex + 1,
              title: seasonPlan.title || `Season ${seasonPlan.seasonNumber || seasonIndex + 1}`,
              description: `Imported season from TopCinema for ${title}`,
              releaseDate: new Date(),
              episodeCount: seasonPlan.episodes.length,
            },
          })

          for (const [episodeIndex, episodePlan] of seasonPlan.episodes.entries()) {
            await prisma.episode.create({
              data: {
                seasonId: createdSeason.id,
                episodeNumber: Number(episodePlan.number) || episodeIndex + 1,
                title: episodePlan.title || `${title} - Episode ${episodeIndex + 1}`,
                description,
                duration: 120,
                videoUrl: episodePlan.videoUrl || embedUrl,
                thumbnail: poster,
              },
            })
          }
        }

        await prisma.series.update({
          where: { id: createdSeries.id },
          data: {
            totalSeasons: createdSeasonCount,
            totalEpisodes: totalEpisodesImported,
          },
        })

        createdItems.push({
          id: createdSeries.id,
          title: createdSeries.title,
          type: contentType === "anime" ? "anime" : "series",
          seasons: importedSeasonPlan.map((s: { seasonNumber: number; title: string; episodes: { number: number; title: string }[] }) => ({
            seasonNumber: s.seasonNumber,
            title: s.title,
            episodes: s.episodes.map((e: { number: number; title: string }) => ({ number: e.number, title: e.title })),
          })),
          totalSeasons: createdSeasonCount,
          totalEpisodes: totalEpisodesImported,
        })
        if (job) {
          job.completed = createdItems.length
          job.updatedAt = Date.now()
        }
      } catch (error) {
        failedCount++
        if (job) {
          job.failed = failedCount
          job.updatedAt = Date.now()
        }
        console.error(`[BATCH IMPORT] Failed item ${index + 1}/${parsedItems.length}:`, error instanceof Error ? error.message : error)
      }
    }
  }

  return {
    success: true,
    count: createdItems.length,
    imported: createdItems.length,
    skipped: skippedCount,
    failed: failedCount,
    items: createdItems,
    log: createdItems.map((item) => ({
      title: item.title,
      type: item.type,
      seasons: item.totalSeasons,
      episodes: item.totalEpisodes,
    })),
  }
}

async function processImportJob(body: any, job: ImportJob) {
  try {
    job.status = "running"
    job.updatedAt = Date.now()
    const result = await runImportJob(body, job)
    job.status = "completed"
    job.result = result
    job.updatedAt = Date.now()
  } catch (error) {
    job.status = "failed"
    job.error = error instanceof Error ? error.message : "Unknown error"
    job.updatedAt = Date.now()
  }
}

export async function GET(request: Request) {
  if (!hasValidAdminAccess(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const jobId = searchParams.get("jobId")

  if (!jobId) {
    return NextResponse.json({ jobs: Array.from(importJobs.values()).slice(-10) }, { status: 200 })
  }

  const job = importJobs.get(jobId)
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 })
  }

  return NextResponse.json(job)
}

export async function POST(request: Request) {
  try {
    if (!hasValidAdminAccess(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let body: any = {}

    try {
      body = await request.json()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid JSON body"
      return NextResponse.json({ error: `Invalid request body: ${message}` }, { status: 400 })
    }

    const { titles = [], contentType, categorySlug, limit } = body as {
      titles?: string[]
      contentType?: "movie" | "series" | "anime"
      categorySlug?: string
      limit?: number
    }
    const validTitles = Array.isArray(titles) ? titles.filter((t): t is string => typeof t === "string" && t.trim().length > 0) : []

    if (validTitles.length === 0) {
      return NextResponse.json({ error: "No valid titles were provided." }, { status: 400 })
    }

    const job: ImportJob = {
      id: `import-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      status: "running",
      total: validTitles.length,
      processed: validTitles.length,
      completed: 0,
      skipped: 0,
      failed: 0,
      currentTitle: "",
      result: null,
      error: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    importJobs.set(job.id, job)
    const result = await runImportJob({ ...body, titles: validTitles, contentType, categorySlug, limit }, job)
    job.status = "completed"
    job.result = result
    job.updatedAt = Date.now()

    return NextResponse.json({
      success: true,
      count: result.count,
      items: result.items,
      jobId: job.id,
      status: job.status,
      total: job.total,
      message: "Import completed successfully.",
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("[IMPORT ERROR]", message)
    return NextResponse.json({ error: `Failed to import TopCinema content: ${message}` }, { status: 500 })
  }
}

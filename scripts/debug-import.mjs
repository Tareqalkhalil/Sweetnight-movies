async function fetchSearchResults(query, limit = 6) {
  const url = new URL("https://topcinemaa.top/")
  if (query) url.searchParams.set("s", query)

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "text/html,application/xhtml+xml",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
    signal: AbortSignal.timeout(15000),
  })

  if (!response.ok) throw new Error(`TopCinema request failed with ${response.status}`)

  const html = await response.text()
  const results = []
  const seen = new Set()

  const patterns = [
    /<div[^>]+class=["'][^"']*Small--Box[^"']*["'][^>]*>[\s\S]*?<a\s+href=["']([^"']+)["'][^>]*title=["']([^"']*)["'][\s\S]*?(?:<img[^>]+(?:data-src|src)=["']([^"']+)["'][^>]*>)?/gi,
    /<article[^>]*>[\s\S]*?<a[^>]+href=["']([^"']+)["'][^>]*>[\s\S]*?<(?:h2|h3|span[^>]*class="title")[^>]*>([^<]+)<\/(?:h2|h3|span)>/gi,
    /<a[^>]+href=["']([^"']+)["'][^>]*>[\s\S]*?<img[^>]+(?:data-src|src)=["']([^"']+)["'][^>]*>[\s\S]*?(?:<(?:span|h3|div)[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)<\/(?:span|h3|div)>)?/gi,
    /<a[^>]+href=["']([^"']+)["'][^>]*title=["']([^"']+)["'][^>]*>/gi,
  ]

  for (const regex of patterns) {
    if (results.length >= limit) break
    const regexCopy = new RegExp(regex.source, regex.flags)
    let match
    while ((match = regexCopy.exec(html)) !== null && results.length < limit) {
      const href = match[1]?.trim()
      if (!href || seen.has(href)) continue
      const title = match[2]?.trim() || match[3]?.trim()
      if (!title || title.length < 2) continue
      seen.add(href)
      results.push({
        url: href.startsWith("http") ? href : `https://topcinemaa.top${href}`,
        title,
        image: null,
      })
    }
  }

  return results
}

function decodeHtmlEntities(input) {
  return input
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_match, code) => String.fromCodePoint(Number(code)))
}

function cleanText(input) {
  return (input || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
}

function extractSeasons(html, baseUrl) {
  const seasons = []
  const seen = new Set()
  const regex = /class=["'][^"']*Small--Box\s+Season[^"']*["'][^>]*>[\s\S]*?<a\s+href=["']([^"']+)["'][^>]*>[\s\S]*?<div class="epnum"><span>الموسم<\/span>\s*([0-9]+)[\s\S]*?<h3 class="title">([^<]+)<\/h3>/gi
  let match
  while ((match = regex.exec(html)) !== null) {
    const href = match[1].startsWith("http") ? match[1] : new URL(match[1], baseUrl).toString()
    const number = Number(match[2])
    const title = cleanText(match[3])
    const key = `${number}-${href}`
    if (!href || Number.isNaN(number) || seen.has(key)) continue
    seen.add(key)
    seasons.push({ number, title: decodeHtmlEntities(title) || `Season ${number}`, href, poster: null })
  }
  return seasons
}

function extractEpisodes(html, baseUrl) {
  const episodes = []
  const seen = new Set()

  const patterns = [
    /<a\s+href=["']([^"']+)["'][^>]*title=["']([^"']*)["'][\s\S]*?<div class="ep-info">[\s\S]*?<h2>([^<]+)<\/h2>[\s\S]*?<div class="epnum">[\s\S]*?<span>[^<]*<\/span>\s*([0-9.]+)\s*<\/div>/gi,
    /<a\s+href=["']([^"']+)["'][^>]*>[\s\S]*?(?:الحلقة|episode|ep)[^<]*<\/a>/gi,
    /<div[^>]*class=["'][^"']*epnum[^"']*["'][^>]*>[\s\S]*?<span>[^<]*<\/span>\s*([0-9.]+)\s*<\/div>/gi,
  ]

  for (const pattern of patterns) {
    let match
    const regexCopy = new RegExp(pattern.source, pattern.flags)
    while ((match = regexCopy.exec(html)) !== null) {
      const href = match[1]?.startsWith("http") ? match[1] : match[1] ? new URL(match[1], baseUrl).toString() : ""
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

  return episodes.filter((ep, index, self) => self.findIndex((item) => item.number === ep.number && item.href === ep.href) === index)
}

async function fetchSeasonDetails(url, seasonNumber, title) {
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(15000),
    })
    if (!response.ok) return null
    const html = await response.text()
    const episodes = extractEpisodes(html, url)
    return { seasonNumber, title, href: url, episodes }
  } catch {
    return null
  }
}

async function fetchItemDetails(url) {
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(15000),
    })
    if (!response.ok) return null
    const html = await response.text()

    const seasons = extractSeasons(html, url)
    console.log(`  Seasons found on page: ${seasons.length}`)

    // Fetch season details with concurrency 5
    const seasonDetails = []
    const queue = [...seasons]
    const workers = Array(Math.min(5, seasons.length))
    for (let i = 0; i < workers.length; i++) {
      workers[i] = (async () => {
        while (queue.length > 0) {
          const season = queue.shift()
          const detail = await fetchSeasonDetails(season.href, season.number, season.title)
          if (detail) seasonDetails.push(detail)
        }
      })()
    }
    await Promise.all(workers)

    const episodes = extractEpisodes(html, url)
    console.log(`  Episodes on detail page: ${episodes.length}`)
    console.log(`  Season details fetched: ${seasonDetails.length}`)

    return {
      description: "",
      poster: null,
      backdrop: null,
      embedUrl: url,
      seasons,
      episodes,
      seasonDetails,
    }
  } catch (e) {
    console.error("  fetchItemDetails error:", e.message)
    return null
  }
}

async function main() {
  console.log("=== Searching for 'one piece' ===")
  const results = await fetchSearchResults("one piece", 3)
  console.log(`Found ${results.length} results:`)
  results.forEach((r, i) => console.log(`  ${i + 1}. ${r.title} -> ${r.url}`))

  if (results.length > 0) {
    console.log(`\n=== Fetching details for: ${results[0].title} ===`)
    const details = await fetchItemDetails(results[0].url)

    if (details) {
      console.log(`\n=== Details Summary ===`)
      console.log(`Seasons: ${details.seasons.length}`)
      console.log(`Season details fetched: ${details.seasonDetails.length}`)

      details.seasonDetails.forEach((sd) => {
        console.log(`  Season ${sd.seasonNumber}: ${sd.title} -> ${sd.episodes.length} episodes`)
      })

      // Check for URL issues
      console.log(`\n=== Season URL Check ===`)
      details.seasons.forEach((s, i) => {
        if (i < 3) {
          console.log(`  Season ${s.number}: ${s.href.slice(0, 100)}...`)
        }
      })
    } else {
      console.log("FAILED: fetchItemDetails returned null")
    }
  }
}

main().catch((e) => console.error("Fatal:", e))

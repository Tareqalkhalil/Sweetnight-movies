/**
 * Batch Import Component
 * مكون قابل لإعادة الاستخدام للاستيراد الجماعي
 */

"use client"

import { useState, useEffect } from "react"
import { Upload, Loader2, CheckCircle2, AlertCircle, Copy, Download, Plus, Trash2 } from "lucide-react"

interface Category {
  id: string
  name: string
  slug: string
  type: string
}

interface BatchImportComponentProps {
  defaultContentType?: "movie" | "series" | "anime"
  defaultCategorySlug?: string
  onImportSuccess?: (result: any) => void
  className?: string
}

const seriesCategoryPresets: Category[] = [
  { id: "foreign-series", name: "مسلسلات أجنبية", slug: "foreign-series", type: "SERIES" },
  { id: "netflix-series", name: "مسلسلات نيتفليكس", slug: "netflix-series", type: "SERIES" },
  { id: "asian-series", name: "مسلسلات آسيوية", slug: "asian-series", type: "SERIES" },
]

const animeCategoryPresets: Category[] = [
  { id: "anime", name: "قائمة الأنمي", slug: "anime", type: "SERIES" },
  { id: "netflix-anime", name: "أنمي نيتفليكس", slug: "netflix-anime", type: "SERIES" },
]

interface SeasonResult {
  seasonNumber: number
  title: string
  episodes: Array<{ number: number; title: string }>
}

interface ImportResult {
  id: string
  title: string
  type: string
  seasons: SeasonResult[]
  totalSeasons: number
  totalEpisodes: number
}

interface ImportResponse {
  success: boolean
  count: number
  items: ImportResult[]
}

interface EpisodeDraft {
  id: string
  title: string
  number: number
}

interface SeasonDraft {
  id: string
  title: string
  episodes: EpisodeDraft[]
}

function createEpisodeDraft(number: number): EpisodeDraft {
  return {
    id: `ep-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: `Episode ${number}`,
    number,
  }
}

function createSeasonDraft(number: number): SeasonDraft {
  return {
    id: `season-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: `Season ${number}`,
    episodes: [createEpisodeDraft(1)],
  }
}

export function BatchImportComponent({
  defaultContentType = "movie",
  defaultCategorySlug = "",
  onImportSuccess,
  className = "",
}: BatchImportComponentProps) {
  const [titles, setTitles] = useState<string[]>([])
  const [newTitle, setNewTitle] = useState("")
  const [contentType, setContentType] = useState<"movie" | "series" | "anime">(defaultContentType)
  const [categorySlug, setCategorySlug] = useState(defaultCategorySlug)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<ImportResponse | null>(null)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [limit, setLimit] = useState(6)
  const [batchSize, setBatchSize] = useState(25)
  const [delayMs, setDelayMs] = useState(400)
  const [seasonDrafts, setSeasonDrafts] = useState<SeasonDraft[]>([createSeasonDraft(1)])

  useEffect(() => {
    try {
      const saved = localStorage.getItem("batch-import-settings")
      if (!saved) return

      const parsed = JSON.parse(saved)
      if (typeof parsed.batchSize === "number") {
        setBatchSize(Math.max(1, Math.min(100, parsed.batchSize)))
      }
      if (typeof parsed.delayMs === "number") {
        setDelayMs(Math.max(0, Math.min(5000, parsed.delayMs)))
      }
    } catch {
      // Ignore invalid stored settings
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem("batch-import-settings", JSON.stringify({ batchSize, delayMs }))
    } catch {
      // Ignore storage errors
    }
  }, [batchSize, delayMs])
  const [jobId, setJobId] = useState<string | null>(null)
  const [jobProgress, setJobProgress] = useState<{ total: number; processed: number; completed: number; skipped: number; failed: number; currentTitle: string; status: string } | null>(null)

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch("/api/categories")
        if (!response.ok) throw new Error("Failed to load categories")
        let data = await response.json()
        
        // Handle if data is wrapped in an object property
        if (!Array.isArray(data)) {
          data = data.categories || data.data || []
        }
        
        // Ensure data is an array
        if (!Array.isArray(data)) {
          data = []
        }
        
        const baseCategories = data.filter((cat: any) => 
          cat.type === "BOTH" || 
          (contentType === "anime" && cat.type === "SERIES") ||
          (contentType === "movie" && cat.type === "MOVIE") ||
          (contentType === "series" && cat.type === "SERIES")
        )

        const presets = contentType === "series" ? seriesCategoryPresets : contentType === "anime" ? animeCategoryPresets : []
        const merged = [...baseCategories, ...presets.filter((preset) => !baseCategories.some((cat: any) => cat.slug === preset.slug))]

        setCategories(merged)
      } catch (err) {
        console.error("Error loading categories:", err)
        setCategories([])
      } finally {
        setLoading(false)
      }
    }

    loadCategories()
  }, [contentType])

  useEffect(() => {
    if (contentType === "movie") {
      setSeasonDrafts([])
      return
    }

    setSeasonDrafts([createSeasonDraft(1)])
  }, [contentType])

  const addTitle = () => {
    if (newTitle.trim()) {
      setTitles([...titles, newTitle.trim()])
      setNewTitle("")
      setError("")
    }
  }

  const removeTitle = (index: number) => {
    setTitles(titles.filter((_, i) => i !== index))
  }

  const addSeason = () => {
    setSeasonDrafts((prev) => [...prev, createSeasonDraft(prev.length + 1)])
  }

  const removeSeason = (seasonId: string) => {
    setSeasonDrafts((prev) => prev.filter((season) => season.id !== seasonId))
  }

  const addEpisode = (seasonId: string) => {
    setSeasonDrafts((prev) =>
      prev.map((season) => {
        if (season.id !== seasonId) return season
        const nextNumber = season.episodes.length + 1
        return {
          ...season,
          episodes: [...season.episodes, createEpisodeDraft(nextNumber)],
        }
      })
    )
  }

  const removeEpisode = (seasonId: string, episodeId: string) => {
    setSeasonDrafts((prev) =>
      prev.map((season) => {
        if (season.id !== seasonId) return season
        return {
          ...season,
          episodes: season.episodes.filter((episode) => episode.id !== episodeId),
        }
      })
    )
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      const newTitles = text
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
      
      setTitles([...titles, ...newTitles])
      setSuccessMessage(`✅ تم لصق ${newTitles.length} عنوان`)
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (err) {
      setError("❌ خطأ في النسخ من الحافظة")
    }
  }

  useEffect(() => {
    if (!jobId) return

    const interval = window.setInterval(async () => {
      try {
        const response = await fetch(`/api/admin/import-topcinema?jobId=${jobId}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "فشل تتبع حالة الاستيراد")
        }

        setJobProgress({
          total: data.total || 0,
          processed: data.processed || 0,
          completed: data.completed || 0,
          skipped: data.skipped || 0,
          failed: data.failed || 0,
          currentTitle: data.currentTitle || "",
          status: data.status || "queued",
        })

        if (data.status === "completed" || data.status === "failed") {
          clearInterval(interval)
          setImporting(false)

          if (data.status === "completed") {
            setResult(data.result)
            setSuccessMessage(`✅ تم استيراد ${data.result?.count || 0} عنصر بنجاح!`)
            setTitles([])
            setSeasonDrafts(contentType === "movie" ? [] : [createSeasonDraft(1)])
            onImportSuccess?.(data.result)
          } else {
            setError(`❌ خطأ: ${data.error || "فشل الاستيراد"}`)
          }
        }
      } catch (err) {
        clearInterval(interval)
        setImporting(false)
        setError(`❌ خطأ: ${err instanceof Error ? err.message : "خطأ غير معروف"}`)
      }
    }, 2000)

    return () => window.clearInterval(interval)
  }, [jobId, contentType, onImportSuccess])

  const handleImport = async () => {
    setError("")
    setSuccessMessage("")
    setJobId(null)
    setJobProgress(null)

    if (titles.length === 0) {
      setError("❌ يجب إضافة عناوين أولاً")
      return
    }

    if (!categorySlug) {
      setError("❌ يجب اختيار فئة الوجهة")
      return
    }

    setImporting(true)

    try {
      const response = await fetch("/api/admin/import-topcinema", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titles,
          contentType,
          categorySlug,
          limit,
          batchSize,
          delayMs,
          customSeasons: contentType === "movie" ? undefined : seasonDrafts.map((season, index) => ({
            number: index + 1,
            title: season.title.trim() || `Season ${index + 1}`,
            episodes: season.episodes.map((episode, episodeIndex) => ({
              number: episode.number || episodeIndex + 1,
              title: episode.title.trim() || `Episode ${episodeIndex + 1}`,
            })),
          })),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "فشل الاستيراد")
      }

      setJobId(data.jobId || null)
      setJobProgress({
        total: data.total || titles.length,
        processed: 0,
        completed: 0,
        skipped: 0,
        failed: 0,
        currentTitle: "",
        status: data.status || "queued",
      })
      setSuccessMessage("⏳ جاري تشغيل الاستيراد في الخلفية... سيتم متابعة المعالجة على دفعات آمنة")
    } catch (err) {
      setImporting(false)
      setError(`❌ خطأ: ${err instanceof Error ? err.message : "خطأ غير معروف"}`)
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Messages */}
      {error && (
        <div className="p-4 bg-red-900/20 border border-red-500 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-red-200">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-green-900/20 border border-green-500 rounded-lg flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
          <p className="text-green-200">{successMessage}</p>
        </div>
      )}

      {/* Content Type Selection */}
      <div>
        <label className="block text-sm font-semibold text-slate-200 mb-3">
          نوع المحتوى
        </label>
        <div className="grid grid-cols-3 gap-3">
          {(["movie", "series", "anime"] as const).map((type) => (
            <button
              key={type}
              onClick={() => {
                setContentType(type)
                setCategorySlug("")
              }}
              className={`p-3 rounded-lg font-semibold transition-all text-sm ${
                contentType === type
                  ? "bg-cyan-500 text-white"
                  : "bg-slate-600 text-slate-300 hover:bg-slate-500"
              }`}
            >
              {type === "movie" && "🎬 أفلام"}
              {type === "series" && "📺 مسلسلات"}
              {type === "anime" && "⛩️ أنمي"}
            </button>
          ))}
        </div>
      </div>

      {/* Category Selection */}
      <div>
        <label className="block text-sm font-semibold text-slate-200 mb-3">
          فئة الوجهة
        </label>
        {loading ? (
          <div className="flex items-center gap-2 text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            جاري التحميل...
          </div>
        ) : (
          <select
            value={categorySlug}
            onChange={(e) => setCategorySlug(e.target.value)}
            className="w-full px-4 py-2 bg-slate-600 border border-slate-500 text-white rounded-lg focus:outline-none focus:border-cyan-400 text-sm"
          >
            <option value="">اختر فئة...</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Titles Input */}
      <div>
        <label className="block text-sm font-semibold text-slate-200 mb-3">
          أضف الأسماء
        </label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addTitle()}
            placeholder="أدخل اسم..."
            className="flex-1 px-3 py-2 bg-slate-600 border border-slate-500 text-white rounded-lg focus:outline-none focus:border-cyan-400 placeholder-slate-400 text-sm"
          />
          <button
            onClick={addTitle}
            className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            إضافة
          </button>
        </div>

        {/* Helper Buttons */}
        <button
          onClick={handlePaste}
          className="flex items-center gap-2 px-3 py-1 bg-slate-600 hover:bg-slate-500 text-slate-200 rounded text-xs transition-colors mb-3"
        >
          <Copy className="w-3 h-3" />
          لصق من الحافظة
        </button>

        {/* Titles List */}
        {titles.length > 0 && (
          <div className="bg-slate-800/50 rounded-lg p-3 max-h-40 overflow-y-auto">
            <p className="text-slate-300 text-xs mb-2 font-semibold">
              القائمة ({titles.length})
            </p>
            <div className="space-y-1">
              {titles.map((title, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-slate-700 p-2 rounded text-sm"
                >
                  <span className="text-slate-100 truncate">{title}</span>
                  <button
                    onClick={() => removeTitle(index)}
                    className="text-red-400 hover:text-red-300 transition-colors flex-shrink-0"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Season / Episode Plan */}
      {(contentType === "series" || contentType === "anime") && (
        <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-200">
              مواسم / حلقات قبل الاستيراد
            </label>
            <button
              onClick={addSeason}
              className="px-3 py-1.5 rounded-lg bg-cyan-500/80 hover:bg-cyan-500 text-white text-xs font-semibold"
            >
              + موسم جديد
            </button>
          </div>

          <div className="space-y-3">
            {seasonDrafts.map((season, seasonIndex) => (
              <div key={season.id} className="rounded-lg border border-slate-700 bg-slate-900/70 p-3">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <input
                    value={season.title}
                    onChange={(event) => {
                      const value = event.target.value
                      setSeasonDrafts((prev) =>
                        prev.map((item) => (item.id === season.id ? { ...item, title: value } : item))
                      )
                    }}
                    className="flex-1 px-2 py-1.5 bg-slate-800 border border-slate-600 rounded text-sm text-white"
                    placeholder={`الموسم ${seasonIndex + 1}`}
                  />
                  <button
                    onClick={() => removeSeason(season.id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                    title="حذف الموسم"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  {season.episodes.map((episode, episodeIndex) => (
                    <div key={episode.id} className="flex items-center gap-2">
                      <input
                        value={episode.title}
                        onChange={(event) => {
                          const value = event.target.value
                          setSeasonDrafts((prev) =>
                            prev.map((item) =>
                              item.id === season.id
                                ? {
                                    ...item,
                                    episodes: item.episodes.map((ep) =>
                                      ep.id === episode.id ? { ...ep, title: value } : ep
                                    ),
                                  }
                                : item
                            )
                          )
                        }}
                        className="flex-1 px-2 py-1.5 bg-slate-800 border border-slate-600 rounded text-sm text-white"
                        placeholder={`الحلقة ${episodeIndex + 1}`}
                      />
                      <button
                        onClick={() => removeEpisode(season.id, episode.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                        title="حذف الحلقة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => addEpisode(season.id)}
                  className="mt-2 px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold"
                >
                  + إضافة حلقة
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Import Settings */}
      <div className="grid gap-3 md:grid-cols-2">
        <label className="rounded-lg border border-slate-700 bg-slate-800/60 p-3 text-sm text-slate-200">
          <div className="mb-2 font-semibold">حجم الدفعة</div>
          <input
            type="number"
            min="1"
            max="100"
            value={batchSize}
            onChange={(e) => setBatchSize(Math.max(1, Math.min(100, parseInt(e.target.value) || 25)))}
            className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-white outline-none focus:border-cyan-400"
          />
          <div className="mt-2 text-xs text-slate-400">الحد الأقصى 100 عنوان لكل دفعة</div>
        </label>

        <label className="rounded-lg border border-slate-700 bg-slate-800/60 p-3 text-sm text-slate-200">
          <div className="mb-2 font-semibold">التأخير بين الدفعات (ms)</div>
          <input
            type="number"
            min="0"
            max="5000"
            value={delayMs}
            onChange={(e) => setDelayMs(Math.max(0, Math.min(5000, parseInt(e.target.value) || 400)))}
            className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-white outline-none focus:border-cyan-400"
          />
          <div className="mt-2 text-xs text-slate-400">أضف تأخيرًا لتقليل الضغط على الخادم</div>
        </label>
      </div>

      {/* Import Button */}
      <button
        onClick={handleImport}
        disabled={importing || titles.length === 0 || !categorySlug}
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-slate-600 disabled:to-slate-700 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all duration-200 text-sm"
      >
        {importing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            جاري الاستيراد...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" />
            استيراد ({titles.length})
          </>
        )}
      </button>

      {jobProgress && (
        <div className="rounded-lg border border-cyan-500/30 bg-cyan-950/30 p-4 text-sm text-cyan-100">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-semibold">التقدم</span>
            <span className="text-cyan-300">{jobProgress.status}</span>
          </div>
          <div className="mb-2 h-2 rounded-full bg-slate-700">
            <div
              className="h-2 rounded-full bg-cyan-400 transition-all"
              style={{ width: `${jobProgress.total > 0 ? (jobProgress.processed / jobProgress.total) * 100 : 0}%` }}
            />
          </div>
          <p className="text-cyan-200/90">
            تمت معالجة {jobProgress.processed}/{jobProgress.total} عنوان
          </p>
          {jobProgress.currentTitle && (
            <p className="mt-2 text-xs text-cyan-300">الحالي: {jobProgress.currentTitle}</p>
          )}
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-cyan-200/80">
            <span>تمت: {jobProgress.completed}</span>
            <span>تخطّي: {jobProgress.skipped}</span>
            <span>فشل: {jobProgress.failed}</span>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="bg-green-900/20 border border-green-500 rounded-lg p-4">
          <h3 className="font-bold text-green-300 mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            ✅ تم الاستيراد بنجاح!
          </h3>
          <div className="space-y-3 text-sm text-green-200">
            {result.items.map((item, idx) => (
              <div key={item.id} className="bg-green-900/30 rounded-lg p-3">
                <p className="font-semibold text-green-100 mb-2">
                  {idx + 1}. {item.title}
                  <span className="text-green-400 font-normal mr-2">
                    ({item.totalSeasons} موسم • {item.totalEpisodes} حلقة)
                  </span>
                </p>
                {item.seasons.length > 0 && (
                  <div className="mr-4 space-y-2">
                    {item.seasons.map((season) => (
                      <div key={season.seasonNumber} className="border-r-2 border-green-700/50 pr-3">
                        <p className="text-green-300 font-medium text-xs">
                          ▸ {season.title} ({season.episodes.length} حلقة)
                        </p>
                        {season.episodes.length > 0 && (
                          <div className="mr-3 mt-1 flex flex-wrap gap-1">
                            {season.episodes.map((ep) => (
                              <span
                                key={ep.number}
                                className="text-[10px] bg-green-800/40 text-green-300 px-1.5 py-0.5 rounded"
                              >
                                ح{ep.number}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

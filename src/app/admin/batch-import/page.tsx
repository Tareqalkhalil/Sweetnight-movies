"use client"

import { useState, useEffect } from "react"
import { Upload, Loader2, CheckCircle2, AlertCircle, Copy, Download, Plus, Trash2 } from "lucide-react"

interface CategoryOption {
  id: string
  name: string
  slug: string
  type: string
}

const seriesCategoryPresets: CategoryOption[] = [
  { id: "foreign-series", name: "مسلسلات أجنبية", slug: "foreign-series", type: "SERIES" },
  { id: "netflix-series", name: "مسلسلات نيتفليكس", slug: "netflix-series", type: "SERIES" },
  { id: "asian-series", name: "مسلسلات آسيوية", slug: "asian-series", type: "SERIES" },
]

const animeCategoryPresets: CategoryOption[] = [
  { id: "anime", name: "قائمة الأنمي", slug: "anime", type: "SERIES" },
  { id: "netflix-anime", name: "أنمي نيتفليكس", slug: "netflix-anime", type: "SERIES" },
]

interface ImportItem {
  title: string
}

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
  count?: number
  items?: ImportResult[]
  jobId?: string
  status?: string
  total?: number
  message?: string
  result?: {
    success?: boolean
    count?: number
    items?: ImportResult[]
  }
}

export default function BatchImportPage() {
  const [titles, setTitles] = useState<string[]>([])
  const [newTitle, setNewTitle] = useState("")
  const [contentType, setContentType] = useState<"movie" | "series" | "anime">("movie")
  const [categorySlug, setCategorySlug] = useState("")
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<ImportResponse | null>(null)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [limit, setLimit] = useState(6)

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

  const handleDownloadTemplate = () => {
    const template = `الماتريكس
جون ويك
مهمة مستحيلة
انجيب والعملاق
بدء مبكر`
    
    const element = document.createElement("a")
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(template))
    element.setAttribute("download", "batch_import_template.txt")
    element.style.display = "none"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleImport = async () => {
    setError("")
    setSuccessMessage("")

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
        }),
      })

      const text = await response.text()
      let data: any = null

      try {
        data = text ? JSON.parse(text) : null
      } catch {
        data = { error: text || "Empty response from server" }
      }

      if (!response.ok) {
        throw new Error(data?.error || data?.message || "فشل الاستيراد")
      }

      const payload = data?.result ?? data
      const normalizedResult: ImportResponse = {
        success: payload?.success ?? true,
        count: payload?.count ?? payload?.items?.length ?? 0,
        items: Array.isArray(payload?.items) ? payload.items : [],
      }

      setResult(normalizedResult)
      setSuccessMessage(`✅ تم استيراد ${normalizedResult.count} عنصر بنجاح!`)
      setTitles([])
    } catch (err) {
      setError(`❌ خطأ: ${err instanceof Error ? err.message : "خطأ غير معروف"}`)
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Upload className="w-8 h-8 text-cyan-400" />
            استيراد جماعي من TopCinema
          </h1>
          <p className="text-slate-400">
            استيراد قائمة كبيرة من الأسماء دفعة واحدة
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-900/20 border border-green-500 rounded-lg flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
            <p className="text-green-200">{successMessage}</p>
          </div>
        )}

        {/* Main Form */}
        <div className="bg-slate-700/50 border border-slate-600 rounded-xl p-8 mb-8">
          {/* Content Type Selection */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-slate-200 mb-4">
              نوع المحتوى
            </label>
            <div className="grid grid-cols-3 gap-4">
              {(["movie", "series", "anime"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setContentType(type)
                    setCategorySlug("")
                  }}
                  className={`p-4 rounded-lg font-semibold transition-all ${
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
          <div className="mb-8">
            <label className="block text-sm font-semibold text-slate-200 mb-4">
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
                className="w-full px-4 py-3 bg-slate-600 border border-slate-500 text-white rounded-lg focus:outline-none focus:border-cyan-400"
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

          {/* Results Per Title */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-slate-200 mb-4">
              عدد النتائج لكل عنوان
            </label>
            <input
              type="number"
              min="1"
              max="24"
              value={limit}
              onChange={(e) => setLimit(Math.max(1, Math.min(24, parseInt(e.target.value) || 6)))}
              className="w-full px-4 py-3 bg-slate-600 border border-slate-500 text-white rounded-lg focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Titles Input */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-slate-200 mb-4">
              أضف الأسماء
            </label>
            <div className="flex gap-3 mb-4">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addTitle()}
                placeholder="أدخل اسم فيلم أو مسلسل..."
                className="flex-1 px-4 py-3 bg-slate-600 border border-slate-500 text-white rounded-lg focus:outline-none focus:border-cyan-400 placeholder-slate-400"
              />
              <button
                onClick={addTitle}
                className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
              >
                <Plus className="w-5 h-5" />
                إضافة
              </button>
            </div>

            {/* Helper Buttons */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={handlePaste}
                className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-slate-200 rounded-lg transition-colors text-sm"
              >
                <Copy className="w-4 h-4" />
                لصق من الحافظة
              </button>
              <button
                onClick={handleDownloadTemplate}
                className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-slate-200 rounded-lg transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                تنزيل نموذج
              </button>
            </div>

            {/* Titles List */}
            {titles.length > 0 && (
              <div className="bg-slate-800/50 rounded-lg p-4 mb-4 max-h-64 overflow-y-auto">
                <p className="text-slate-300 text-sm mb-3 font-semibold">
                  القائمة ({titles.length} عنوان)
                </p>
                <div className="space-y-2">
                  {titles.map((title, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-slate-700 p-3 rounded"
                    >
                      <span className="text-slate-100">{title}</span>
                      <button
                        onClick={() => removeTitle(index)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Import Button */}
          <button
            onClick={handleImport}
            disabled={importing || titles.length === 0 || !categorySlug}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-slate-600 disabled:to-slate-700 text-white py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-3 transition-all duration-200"
          >
            {importing ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                جاري الاستيراد...
              </>
            ) : (
              <>
                <Upload className="w-6 h-6" />
                استيراد الآن ({titles.length})
              </>
            )}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="bg-slate-700/50 border border-slate-600 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-400" />
              نتائج الاستيراد
            </h2>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-slate-800 p-4 rounded-lg">
                <p className="text-slate-400 text-sm">عدد العناصر</p>
                <p className="text-3xl font-bold text-cyan-400">{result.count}</p>
              </div>
              <div className="bg-slate-800 p-4 rounded-lg">
                <p className="text-slate-400 text-sm">نوع المحتوى</p>
                <p className="text-3xl font-bold text-cyan-400">
                  {contentType === "movie" ? "🎬" : contentType === "series" ? "📺" : "⛩️"}
                </p>
              </div>
              <div className="bg-slate-800 p-4 rounded-lg">
                <p className="text-slate-400 text-sm">الفئة</p>
                <p className="text-lg font-bold text-cyan-400 truncate">
                  {categories.find((c) => c.slug === categorySlug)?.name || categorySlug}
                </p>
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {(result.items ?? []).length === 0 ? (
                <div className="text-slate-400 text-sm">لا توجد عناصر لعرضها.</div>
              ) : (
                (result.items ?? []).map((item, index) => (
                  <div key={item.id} className="bg-slate-800 p-4 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-white">{index + 1}. {item.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 text-xs rounded-full font-semibold">
                        {item.type === "movie" ? "فيلم" : item.type === "series" ? "مسلسل" : "أنمي"}
                      </span>
                      {item.totalSeasons > 0 && (
                        <span className="px-3 py-1 bg-slate-700 text-slate-300 text-xs rounded-full">
                          {item.totalSeasons} موسم • {item.totalEpisodes} حلقة
                        </span>
                      )}
                    </div>
                  </div>
                    {item.seasons.length > 0 && (
                      <div className="mt-3 mr-2 space-y-2 border-r-2 border-slate-700 pr-3">
                        {item.seasons.map((season, seasonIndex) => (
                          <div key={`${item.id}-${season.seasonNumber ?? seasonIndex}-${seasonIndex}`}>
                            <p className="text-cyan-300 text-xs font-medium">
                              ▸ {season.title}
                            </p>
                            <div className="mr-3 mt-1 flex flex-wrap gap-1">
                              {season.episodes.map((ep, episodeIndex) => (
                                <span
                                  key={`${season.seasonNumber}-${ep.number}-${episodeIndex}`}
                                  className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded"
                                >
                                  ح{ep.number}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

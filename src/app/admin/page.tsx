"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Save, Film, Tv, Sparkles, CheckCircle2, PlusCircle, Trash2 } from "lucide-react"

interface CategoryOption {
  id: string
  name: string
  slug: string
}

interface DistributionItem {
  id: string
  title: string
  type: "movie" | "series" | "anime"
  categories?: Array<{ category: { slug?: string | null } }>
}

async function parseJsonResponse(res: Response) {
  const text = await res.text()

  if (!text) {
    if (!res.ok) {
      throw new Error(`Request failed with status ${res.status}`)
    }
    return {}
  }

  try {
    return JSON.parse(text)
  } catch (error) {
    console.error("Unexpected non-JSON response:", text.slice(0, 400))
    if (!res.ok) {
      throw new Error(`Request failed with status ${res.status}`)
    }
    throw new Error("Server returned an invalid response")
  }
}

export default function AdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [savedMessage, setSavedMessage] = useState("")
  const [contentType, setContentType] = useState<"movie" | "series" | "anime">("movie")
  const [categorySlug, setCategorySlug] = useState("")
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [embedUrl, setEmbedUrl] = useState("")
  const [basePattern, setBasePattern] = useState("https://vidlink.example/embed/{slug}")
  const [previewImage, setPreviewImage] = useState("")
  const [previewLoading, setPreviewLoading] = useState(false)
  const [backdropUrl, setBackdropUrl] = useState("")
  const [backdropPreview, setBackdropPreview] = useState("")
  const [backdropLoading, setBackdropLoading] = useState(false)
  const [mediaItems, setMediaItems] = useState<Array<{ id: string; title: string; titleAr?: string | null; slug: string; embedUrl?: string | null; backdrop?: string | null; poster?: string | null; description?: string | null; descriptionAr?: string | null; categories?: Array<{ category: { slug?: string | null } }> }>>([])
  const [selectedMediaId, setSelectedMediaId] = useState("")
  const [editingBackdropUrl, setEditingBackdropUrl] = useState("")
  const [editingBackdropPreview, setEditingBackdropPreview] = useState("")
  const [editingBackdropLoading, setEditingBackdropLoading] = useState(false)
  const [updatingMedia, setUpdatingMedia] = useState(false)
  const [editMediaId, setEditMediaId] = useState("")
  const [editMediaTitle, setEditMediaTitle] = useState("")
  const [editMediaDescription, setEditMediaDescription] = useState("")
  const [editMediaPoster, setEditMediaPoster] = useState("")
  const [editMediaEmbedUrl, setEditMediaEmbedUrl] = useState("")
  const [editMediaBackdrop, setEditMediaBackdrop] = useState("")
  const [editMediaCategorySlug, setEditMediaCategorySlug] = useState("")
  const [savingEditedMedia, setSavingEditedMedia] = useState(false)
  const [deletingMediaId, setDeletingMediaId] = useState<string | null>(null)
  const [activeImportType, setActiveImportType] = useState<"movie" | "series" | "anime" | null>(null)
  const [importLog, setImportLog] = useState<Array<{ title: string; type: string; seasons?: number; episodes?: number }>>([])
  const [movieImportMode, setMovieImportMode] = useState<"query" | "catalog">("catalog")
  const [movieImportQuery, setMovieImportQuery] = useState("")
  const [movieImportUrl, setMovieImportUrl] = useState("")
  const [movieImportInstruction, setMovieImportInstruction] = useState("")
  const [seriesImportMode, setSeriesImportMode] = useState<"query" | "catalog">("catalog")
  const [seriesImportQuery, setSeriesImportQuery] = useState("")
  const [seriesImportUrl, setSeriesImportUrl] = useState("")
  const [seriesImportInstruction, setSeriesImportInstruction] = useState("")
  const [animeImportMode, setAnimeImportMode] = useState<"query" | "catalog">("catalog")
  const [animeImportQuery, setAnimeImportQuery] = useState("")
  const [animeImportUrl, setAnimeImportUrl] = useState("")
  const [animeImportInstruction, setAnimeImportInstruction] = useState("")

  useEffect(() => {
    const hasAccess = document.cookie.split(";").some((item) => item.trim().startsWith("admin_access=true"))
    if (!hasAccess) {
      router.replace("/admin/login")
      return
    }

    async function loadData() {
      try {
        const res = await fetch("/api/categories")
        const data = await parseJsonResponse(res)
        setCategories(data.categories || [])
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  useEffect(() => {
    const url = embedUrl.trim()

    if (!url) {
      setPreviewImage("")
      setPreviewLoading(false)
      return
    }

    const isDirectImage = /\.(jpg|jpeg|png|webp|gif|avif|svg)(\?.*)?$/i.test(url)
    if (isDirectImage) {
      setPreviewImage(url)
      setPreviewLoading(false)
      return
    }

    const timer = window.setTimeout(async () => {
      setPreviewLoading(true)
      try {
        const res = await fetch(`/api/admin/preview-image?url=${encodeURIComponent(url)}`)
        const data = await parseJsonResponse(res)
        setPreviewImage(data.imageUrl || "")
      } catch (error) {
        setPreviewImage("")
      } finally {
        setPreviewLoading(false)
      }
    }, 500)

    return () => window.clearTimeout(timer)
  }, [embedUrl])

  useEffect(() => {
    const url = backdropUrl.trim()

    if (!url) {
      setBackdropPreview("")
      setBackdropLoading(false)
      return
    }

    const isDirectImage = /\.(jpg|jpeg|png|webp|gif|avif|svg)(\?.*)?$/i.test(url)
    if (isDirectImage) {
      setBackdropPreview(url)
      setBackdropLoading(false)
      return
    }

    const timer = window.setTimeout(async () => {
      setBackdropLoading(true)
      try {
        const res = await fetch(`/api/admin/preview-image?url=${encodeURIComponent(url)}`)
        const data = await parseJsonResponse(res)
        setBackdropPreview(data.imageUrl || "")
      } catch (error) {
        setBackdropPreview("")
      } finally {
        setBackdropLoading(false)
      }
    }, 500)

    return () => window.clearTimeout(timer)
  }, [backdropUrl])

  useEffect(() => {
    async function loadMediaItems() {
      try {
        const res = await fetch(`/api/admin/media?type=${contentType}`)
        const data = await parseJsonResponse(res)
        const items = data.items || []
        setMediaItems(items)

        if (items.length > 0) {
          const firstItem = items[0]
          setSelectedMediaId(firstItem.id)
          setEditingBackdropUrl(firstItem.backdrop || "")
          setEditingBackdropPreview(firstItem.backdrop || "")
          setEditMediaId(firstItem.id)
          setEditMediaTitle(firstItem.title || "")
          setEditMediaDescription(firstItem.description || "")
          setEditMediaPoster(firstItem.poster || "")
          setEditMediaEmbedUrl(firstItem.embedUrl || "")
          setEditMediaBackdrop(firstItem.backdrop || "")
          setEditMediaCategorySlug(firstItem.categories?.find((entry: { category?: { slug?: string | null } }) => entry.category?.slug)?.category?.slug || "")
        } else {
          setSelectedMediaId("")
          setEditingBackdropUrl("")
          setEditingBackdropPreview("")
          setEditMediaId("")
          setEditMediaTitle("")
          setEditMediaDescription("")
          setEditMediaPoster("")
          setEditMediaEmbedUrl("")
          setEditMediaBackdrop("")
          setEditMediaCategorySlug("")
        }
      } catch (error) {
        console.error(error)
        setMediaItems([])
      }
    }

    loadMediaItems()
  }, [contentType])

  useEffect(() => {
    const url = editingBackdropUrl.trim()

    if (!url) {
      setEditingBackdropPreview("")
      setEditingBackdropLoading(false)
      return
    }

    const isDirectImage = /\.(jpg|jpeg|png|webp|gif|avif|svg)(\?.*)?$/i.test(url)
    if (isDirectImage) {
      setEditingBackdropPreview(url)
      setEditingBackdropLoading(false)
      return
    }

    const timer = window.setTimeout(async () => {
      setEditingBackdropLoading(true)
      try {
        const res = await fetch(`/api/admin/preview-image?url=${encodeURIComponent(url)}`)
        const data = await parseJsonResponse(res)
        setEditingBackdropPreview(data.imageUrl || "")
      } catch (error) {
        setEditingBackdropPreview("")
      } finally {
        setEditingBackdropLoading(false)
      }
    }, 500)

    return () => window.clearTimeout(timer)
  }, [editingBackdropUrl])

  const createMedia = async () => {
    if (!title.trim()) {
      setSavedMessage("Title is required")
      return
    }

    try {
      const generated = embedUrl.trim()
        ? embedUrl.trim()
        : basePattern
            .replaceAll("{slug}", title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""))
            .replaceAll("{title}", title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""))

      const res = await fetch("/api/admin/create-media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: contentType,
          categorySlug: categorySlug || undefined,
          title: title.trim(),
          description: description.trim(),
          embedUrl: generated,
          backdrop: backdropUrl.trim() || undefined,
        }),
      })

      if (!res.ok) throw new Error("Failed")

      setSavedMessage(`${contentType === "movie" ? "Movie" : contentType === "anime" ? "Anime" : "Series"} created successfully`)
      setTitle("")
      setDescription("")
      setEmbedUrl("")
      setBackdropUrl("")
      setCategorySlug("")
      setTimeout(() => setSavedMessage(""), 2500)
    } catch (error) {
      console.error(error)
      setSavedMessage("Failed to create media")
    }
  }

  const updateMediaBackdrop = async () => {
    if (!selectedMediaId) {
      setSavedMessage("Select an item to update")
      return
    }

    try {
      setUpdatingMedia(true)
      const res = await fetch("/api/admin/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: contentType,
          id: selectedMediaId,
          backdrop: editingBackdropUrl.trim() || null,
        }),
      })

      if (!res.ok) throw new Error("Failed")

      setSavedMessage(`${contentType === "movie" ? "Movie" : contentType === "anime" ? "Anime" : "Series"} backdrop updated successfully`)
      setMediaItems((current) =>
        current.map((item) => (item.id === selectedMediaId ? { ...item, backdrop: editingBackdropUrl.trim() || null } : item)),
      )
      setTimeout(() => setSavedMessage(""), 2500)
    } catch (error) {
      console.error(error)
      setSavedMessage("Failed to update backdrop")
    } finally {
      setUpdatingMedia(false)
    }
  }

  const startEditingMedia = (item: { id: string; title?: string | null; description?: string | null; poster?: string | null; embedUrl?: string | null; backdrop?: string | null; categories?: Array<{ category: { slug?: string | null } }> }) => {
    setEditMediaId(item.id)
    setEditMediaTitle(item.title || "")
    setEditMediaDescription(item.description || "")
    setEditMediaPoster(item.poster || "")
    setEditMediaEmbedUrl(item.embedUrl || "")
    setEditMediaBackdrop(item.backdrop || "")
    setEditMediaCategorySlug(item.categories?.find((entry: { category?: { slug?: string | null } }) => entry.category?.slug)?.category?.slug || "")
  }

  const saveEditedMedia = async () => {
    if (!editMediaId || !editMediaTitle.trim()) {
      setSavedMessage("Title is required")
      return
    }

    try {
      setSavingEditedMedia(true)
      const res = await fetch("/api/admin/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: contentType,
          id: editMediaId,
          title: editMediaTitle.trim(),
          description: editMediaDescription.trim(),
          embedUrl: editMediaEmbedUrl.trim() || null,
          poster: editMediaPoster.trim() || null,
          backdrop: editMediaBackdrop.trim() || null,
          categorySlug: editMediaCategorySlug || null,
        }),
      })

      if (!res.ok) throw new Error("Failed")

      setMediaItems((current) =>
        current.map((item) =>
          item.id === editMediaId
            ? {
                ...item,
                title: editMediaTitle.trim(),
                description: editMediaDescription.trim(),
                embedUrl: editMediaEmbedUrl.trim() || null,
                poster: editMediaPoster.trim() || null,
                backdrop: editMediaBackdrop.trim() || null,
                categories: editMediaCategorySlug ? [{ category: { slug: editMediaCategorySlug } }] : [],
              }
            : item,
        ),
      )
      setSavedMessage(`${contentType === "movie" ? "Movie" : contentType === "anime" ? "Anime" : "Series"} updated successfully`)
      setTimeout(() => setSavedMessage(""), 2500)
    } catch (error) {
      console.error(error)
      setSavedMessage("Failed to update media")
    } finally {
      setSavingEditedMedia(false)
    }
  }

  const deleteMedia = async (id: string) => {
    if (!window.confirm("Remove this item from the site?")) return

    try {
      setDeletingMediaId(id)
      const res = await fetch(`/api/admin/media?type=${contentType}&id=${id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const errorText = await res.text().catch(() => "")
        throw new Error(`Delete failed (${res.status}): ${errorText || res.statusText}`)
      }

      setMediaItems((current) => current.filter((item) => item.id !== id))
      setSavedMessage(`${contentType === "movie" ? "Movie" : contentType === "anime" ? "Anime" : "Series"} removed successfully`)
      setTimeout(() => setSavedMessage(""), 2500)
    } catch (error) {
      console.error(error)
      setSavedMessage("Failed to remove media")
    } finally {
      setDeletingMediaId(null)
    }
  }

  const importFromTopCinema = async (
    importType: "movie" | "series" | "anime",
    mode: "query" | "catalog",
    query: string,
    directUrl: string,
    instruction: string,
  ) => {
    if (!categorySlug.trim()) {
      setSavedMessage("Please select a destination category before importing")
      return
    }

    if (mode === "query" && !query.trim() && !directUrl.trim() && !instruction.trim()) {
      setSavedMessage("Enter a TopCinema search query, direct URL, or text instruction")
      return
    }

    try {
      setActiveImportType(importType)
      const res = await fetch("/api/admin/import-topcinema", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: mode === "query" ? (query.trim() || instruction.trim()) : undefined,
          url: directUrl.trim() || undefined,
          instruction: instruction.trim() || undefined,
          contentType: importType,
          categorySlug: categorySlug.trim(),
          mode,
        }),
      })

      const data = await parseJsonResponse(res)
      if (!res.ok) throw new Error(data.error || "Failed")

      const refreshed = await fetch(`/api/admin/media?type=${importType}`)
      const refreshedData = await parseJsonResponse(refreshed)
      setMediaItems(refreshedData.items || [])

      setImportLog(Array.isArray(data.log) ? data.log : [])
      setSavedMessage(`Imported ${data.count || 0} ${importType === "movie" ? "movies" : importType === "anime" ? "anime" : "series"} from TopCinema`)
      if (importType === "movie") {
        setMovieImportQuery("")
        setMovieImportUrl("")
        setMovieImportInstruction("")
      } else if (importType === "series") {
        setSeriesImportQuery("")
        setSeriesImportUrl("")
        setSeriesImportInstruction("")
      } else {
        setAnimeImportQuery("")
        setAnimeImportUrl("")
        setAnimeImportInstruction("")
      }
      setTimeout(() => setSavedMessage(""), 3000)
    } catch (error) {
      console.error(error)
      setSavedMessage("Failed to import from TopCinema")
    } finally {
      setActiveImportType(null)
    }
  }

  if (loading) {
    return <main className="min-h-screen bg-night-900 p-8 text-white">Loading admin panel...</main>
  }

  return (
    <main className="min-h-screen bg-night-900 px-4 py-8 text-white sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black">Unified Media Creator</h1>
            <p className="mt-2 text-gray-400">Choose movie, series, or anime, pick a category, and create a new entry with a link.</p>
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300">
            {savedMessage ? <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> {savedMessage}</span> : "Create content from one place"}
          </div>
        </div>

        <section className="rounded-3xl border border-white/10 bg-night-800/60 p-6 shadow-2xl">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-300">Content Type</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "movie", label: "Movie", icon: <Film className="h-4 w-4" /> },
                  { value: "series", label: "Series", icon: <Tv className="h-4 w-4" /> },
                  { value: "anime", label: "Anime", icon: <Sparkles className="h-4 w-4" /> },
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setContentType(item.value as typeof contentType)}
                    className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold transition-all ${contentType === item.value ? "border-sweet-gold bg-sweet-gold/10 text-sweet-gold" : "border-white/10 bg-white/5 text-gray-300"}`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-300">Category</label>
              <select
                value={categorySlug}
                onChange={(e) => setCategorySlug(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-night-900/80 px-3 py-3 text-sm text-white outline-none"
              >
                <option value="">No category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-300">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter title"
                className="w-full rounded-xl border border-white/10 bg-night-900/80 px-3 py-3 text-sm text-white outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-300">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write a short description"
                className="min-h-[100px] w-full rounded-xl border border-white/10 bg-night-900/80 px-3 py-3 text-sm text-white outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-gray-300">VidLink URL</label>
              <input
                value={embedUrl}
                onChange={(e) => setEmbedUrl(e.target.value)}
                placeholder="Paste link or use generated pattern"
                className="w-full rounded-xl border border-white/10 bg-night-900/80 px-3 py-3 text-sm text-white outline-none"
              />

              <div className="mt-3 rounded-2xl border border-white/10 bg-night-900/60 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Preview</p>
                  {previewLoading ? <span className="text-xs text-gray-500">Loading...</span> : null}
                </div>

                {previewImage ? (
                  <img src={previewImage} alt="Media preview" className="h-48 w-full rounded-xl object-cover" />
                ) : (
                  <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-white/10 text-sm text-gray-500">
                    {previewLoading ? "Loading preview..." : "Paste a link to see the poster or image preview"}
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-gray-300">Backdrop Image URL</label>
              <input
                value={backdropUrl}
                onChange={(e) => setBackdropUrl(e.target.value)}
                placeholder="Paste a background image URL"
                className="w-full rounded-xl border border-white/10 bg-night-900/80 px-3 py-3 text-sm text-white outline-none"
              />

              <div className="mt-3 rounded-2xl border border-white/10 bg-night-900/60 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Backdrop Preview</p>
                  {backdropLoading ? <span className="text-xs text-gray-500">Loading...</span> : null}
                </div>

                {backdropPreview ? (
                  <img src={backdropPreview} alt="Backdrop preview" className="h-48 w-full rounded-xl object-cover" />
                ) : (
                  <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-white/10 text-sm text-gray-500">
                    {backdropLoading ? "Loading preview..." : "Paste a background image URL to preview it"}
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-gray-300">Link Pattern</label>
              <input
                value={basePattern}
                onChange={(e) => setBasePattern(e.target.value)}
                placeholder="https://vidlink.example/embed/{slug}"
                className="w-full rounded-xl border border-white/10 bg-night-900/80 px-3 py-3 text-sm text-white outline-none"
              />
              <p className="mt-2 text-xs text-gray-500">Use {'{slug}'} or {'{title}'} to generate a link automatically.</p>
            </div>
          </div>

          <button
            onClick={createMedia}
            className="mt-6 flex items-center gap-2 rounded-full bg-gradient-to-r from-sweet-coral to-sweet-gold px-5 py-3 font-bold text-night-900"
          >
            <PlusCircle className="h-5 w-5" />
            Create {contentType === "movie" ? "Movie" : contentType === "anime" ? "Anime" : "Series"}
          </button>
        </section>

        <section className="mt-8 rounded-3xl border border-white/10 bg-night-800/60 p-6 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black">Manage Existing Media</h2>
              <p className="mt-2 text-sm text-gray-400">Edit or remove any movie, series, or anime directly from this panel.</p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {mediaItems.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-night-900/60 p-4 text-sm text-gray-500">No items yet for this type.</div>
            ) : (
              mediaItems.map((item) => (
                <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-night-900/60 p-4">
                  <div>
                    <h3 className="font-semibold text-white">{item.title}</h3>
                    <p className="mt-1 text-xs text-gray-500">{item.description?.slice(0, 90) || "No description"}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => startEditingMedia(item)}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteMedia(item.id)}
                      disabled={deletingMediaId === item.id}
                      className="flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300"
                    >
                      <Trash2 className="h-4 w-4" />
                      {deletingMediaId === item.id ? "Removing..." : "Remove"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-night-900/60 p-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-300">Title</label>
                <input
                  value={editMediaTitle}
                  onChange={(e) => setEditMediaTitle(e.target.value)}
                  placeholder="Edit title"
                  className="w-full rounded-xl border border-white/10 bg-night-800/80 px-3 py-3 text-sm text-white outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-300">Category</label>
                <select
                  value={editMediaCategorySlug}
                  onChange={(e) => setEditMediaCategorySlug(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-night-800/80 px-3 py-3 text-sm text-white outline-none"
                >
                  <option value="">No category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-gray-300">Description</label>
                <textarea
                  value={editMediaDescription}
                  onChange={(e) => setEditMediaDescription(e.target.value)}
                  placeholder="Edit description"
                  className="min-h-[110px] w-full rounded-xl border border-white/10 bg-night-800/80 px-3 py-3 text-sm text-white outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-300">Poster URL</label>
                <input
                  value={editMediaPoster}
                  onChange={(e) => setEditMediaPoster(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-white/10 bg-night-800/80 px-3 py-3 text-sm text-white outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-300">Backdrop URL</label>
                <input
                  value={editMediaBackdrop}
                  onChange={(e) => setEditMediaBackdrop(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-white/10 bg-night-800/80 px-3 py-3 text-sm text-white outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-gray-300">Embed URL</label>
                <input
                  value={editMediaEmbedUrl}
                  onChange={(e) => setEditMediaEmbedUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-white/10 bg-night-800/80 px-3 py-3 text-sm text-white outline-none"
                />
              </div>
            </div>

            <button
              onClick={saveEditedMedia}
              disabled={savingEditedMedia || !editMediaId}
              className="mt-6 flex items-center gap-2 rounded-full bg-gradient-to-r from-sweet-coral to-sweet-gold px-5 py-3 font-bold text-night-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-5 w-5" />
              {savingEditedMedia ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-white/10 bg-night-800/60 p-6 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black">TopCinema Import Tools</h2>
              <p className="mt-2 text-sm text-gray-400">Use a dedicated importer for movies, series, and anime. Importing is now unlimited.</p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-night-900/60 p-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-300">
                  Destination Category <span className="text-sweet-coral">*</span> <span className="text-xs text-gray-500">(Required)</span>
                </label>
                <p className="text-xs text-gray-500">Select where imported content will be placed</p>
              </div>
              {categorySlug.trim() && (
                <div className="rounded-full border border-sweet-gold bg-sweet-gold/10 px-3 py-1">
                  <p className="text-xs font-semibold text-sweet-gold">✓ Category Selected</p>
                </div>
              )}
            </div>
            <select
              value={categorySlug}
              onChange={(e) => setCategorySlug(e.target.value)}
              className={`mt-3 w-full rounded-xl border px-3 py-3 text-sm text-white outline-none transition-colors ${
                categorySlug.trim() 
                  ? "border-sweet-gold bg-night-800/80 focus:ring-2 focus:ring-sweet-gold" 
                  : "border-rose-500/30 bg-rose-500/5 focus:ring-2 focus:ring-rose-500"
              }`}
            >
              <option value="">🔴 Select destination manually</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-night-900/60 p-4">
              <h3 className="text-lg font-semibold text-white">Movies</h3>
              <p className="mt-2 text-sm text-gray-400">Import movies from TopCinema into the movie section.</p>
              <div className="mt-4 space-y-3">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-300">Import Mode</label>
                  <select
                    value={movieImportMode}
                    onChange={(e) => setMovieImportMode(e.target.value as "query" | "catalog")}
                    className="w-full rounded-xl border border-white/10 bg-night-800/80 px-3 py-3 text-sm text-white outline-none"
                  >
                    <option value="query">Search Query</option>
                    <option value="catalog">Full Catalog</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-300">{movieImportMode === "query" ? "Search Query" : "Catalog"}</label>
                  <input
                    value={movieImportMode === "query" ? movieImportQuery : movieImportQuery}
                    onChange={(e) => setMovieImportQuery(e.target.value)}
                    placeholder={movieImportMode === "query" ? "e.g. action movie" : "Use full catalog import"}
                    className="w-full rounded-xl border border-white/10 bg-night-800/80 px-3 py-3 text-sm text-white outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-300">Direct URL (optional)</label>
                  <input
                    value={movieImportUrl}
                    onChange={(e) => setMovieImportUrl(e.target.value)}
                    placeholder="https://topcinemaa.top/..."
                    className="w-full rounded-xl border border-white/10 bg-night-800/80 px-3 py-3 text-sm text-white outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-300">Instruction for the tool</label>
                  <textarea
                    value={movieImportInstruction}
                    onChange={(e) => setMovieImportInstruction(e.target.value)}
                    placeholder="مثال: استورد فيلم One Piece كاملًا في القسم المختار"
                    className="min-h-[90px] w-full rounded-xl border border-white/10 bg-night-800/80 px-3 py-3 text-sm text-white outline-none"
                  />
                  <p className="mt-2 text-xs text-gray-500">اكتب هنا أمرًا نصيًا للأداة، مثل: «استورد أنمي ون بيس وحلقاته كاملة إلى القسم المختار».</p>
                </div>
                <button
                  onClick={() => importFromTopCinema("movie", movieImportMode, movieImportQuery, movieImportUrl, movieImportInstruction)}
                  disabled={activeImportType === "movie" || !categorySlug.trim()}
                  title={!categorySlug.trim() ? "Please select a category first" : ""}
                  className="w-full rounded-full bg-gradient-to-r from-sweet-coral to-sweet-gold px-4 py-3 font-bold text-night-900 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {activeImportType === "movie" ? "Importing..." : !categorySlug.trim() ? "Select Category First" : "Import Movies"}
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-night-900/60 p-4">
              <h3 className="text-lg font-semibold text-white">Series</h3>
              <p className="mt-2 text-sm text-gray-400">Import series from TopCinema into the series section.</p>
              <div className="mt-4 space-y-3">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-300">Import Mode</label>
                  <select
                    value={seriesImportMode}
                    onChange={(e) => setSeriesImportMode(e.target.value as "query" | "catalog")}
                    className="w-full rounded-xl border border-white/10 bg-night-800/80 px-3 py-3 text-sm text-white outline-none"
                  >
                    <option value="query">Search Query</option>
                    <option value="catalog">Full Catalog</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-300">{seriesImportMode === "query" ? "Search Query" : "Catalog"}</label>
                  <input
                    value={seriesImportQuery}
                    onChange={(e) => setSeriesImportQuery(e.target.value)}
                    placeholder={seriesImportMode === "query" ? "e.g. drama series" : "Use full catalog import"}
                    className="w-full rounded-xl border border-white/10 bg-night-800/80 px-3 py-3 text-sm text-white outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-300">Direct URL (optional)</label>
                  <input
                    value={seriesImportUrl}
                    onChange={(e) => setSeriesImportUrl(e.target.value)}
                    placeholder="https://topcinemaa.top/..."
                    className="w-full rounded-xl border border-white/10 bg-night-800/80 px-3 py-3 text-sm text-white outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-300">Instruction for the tool</label>
                  <textarea
                    value={seriesImportInstruction}
                    onChange={(e) => setSeriesImportInstruction(e.target.value)}
                    placeholder="مثال: استورد مسلسل Breaking Bad كاملًا في القسم المختار"
                    className="min-h-[90px] w-full rounded-xl border border-white/10 bg-night-800/80 px-3 py-3 text-sm text-white outline-none"
                  />
                  <p className="mt-2 text-xs text-gray-500">اكتب هنا أمرًا نصيًا للأداة، مثل: «استورد مسلسل ون بيس وحلقاته كاملة إلى القسم المختار».</p>
                </div>
                <button
                  onClick={() => importFromTopCinema("series", seriesImportMode, seriesImportQuery, seriesImportUrl, seriesImportInstruction)}
                  disabled={activeImportType === "series" || !categorySlug.trim()}
                  title={!categorySlug.trim() ? "Please select a category first" : ""}
                  className="w-full rounded-full bg-gradient-to-r from-sweet-coral to-sweet-gold px-4 py-3 font-bold text-night-900 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {activeImportType === "series" ? "Importing..." : !categorySlug.trim() ? "Select Category First" : "Import Series"}
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-night-900/60 p-4">
              <h3 className="text-lg font-semibold text-white">Anime</h3>
              <p className="mt-2 text-sm text-gray-400">Import anime from TopCinema into the anime section.</p>
              <div className="mt-4 space-y-3">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-300">Import Mode</label>
                  <select
                    value={animeImportMode}
                    onChange={(e) => setAnimeImportMode(e.target.value as "query" | "catalog")}
                    className="w-full rounded-xl border border-white/10 bg-night-800/80 px-3 py-3 text-sm text-white outline-none"
                  >
                    <option value="query">Search Query</option>
                    <option value="catalog">Full Catalog</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-300">{animeImportMode === "query" ? "Search Query" : "Catalog"}</label>
                  <input
                    value={animeImportQuery}
                    onChange={(e) => setAnimeImportQuery(e.target.value)}
                    placeholder={animeImportMode === "query" ? "e.g. anime action" : "Use full catalog import"}
                    className="w-full rounded-xl border border-white/10 bg-night-800/80 px-3 py-3 text-sm text-white outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-300">Direct URL (optional)</label>
                  <input
                    value={animeImportUrl}
                    onChange={(e) => setAnimeImportUrl(e.target.value)}
                    placeholder="https://topcinemaa.top/..."
                    className="w-full rounded-xl border border-white/10 bg-night-800/80 px-3 py-3 text-sm text-white outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-300">Instruction for the tool</label>
                  <textarea
                    value={animeImportInstruction}
                    onChange={(e) => setAnimeImportInstruction(e.target.value)}
                    placeholder="مثال: استورد أنمي ون بيس وحلقاته كاملة في القسم المختار"
                    className="min-h-[90px] w-full rounded-xl border border-white/10 bg-night-800/80 px-3 py-3 text-sm text-white outline-none"
                  />
                  <p className="mt-2 text-xs text-gray-500">اكتب هنا أمرًا نصيًا للأداة، مثل: «استورد أنمي ناروتو وحلقاته كاملة إلى القسم المختار».</p>
                </div>
                <button
                  onClick={() => importFromTopCinema("anime", animeImportMode, animeImportQuery, animeImportUrl, animeImportInstruction)}
                  disabled={activeImportType === "anime" || !categorySlug.trim()}
                  title={!categorySlug.trim() ? "Please select a category first" : ""}
                  className="w-full rounded-full bg-gradient-to-r from-sweet-coral to-sweet-gold px-4 py-3 font-bold text-night-900 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {activeImportType === "anime" ? "Importing..." : !categorySlug.trim() ? "Select Category First" : "Import Anime"}
                </button>
              </div>
            </div>
          </div>

          {importLog.length > 0 ? (
            <div className="mt-6 rounded-2xl border border-white/10 bg-night-900/70 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">Latest import log</h3>
              <ul className="mt-3 space-y-2 text-sm text-gray-200">
                {importLog.map((entry, index) => (
                  <li key={`${entry.title}-${index}`} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-3 py-2">
                    <span className="font-medium">{entry.title}</span>
                    <span className="text-xs text-gray-400">
                      {entry.type} · {entry.seasons ? `${entry.seasons} season(s)` : ""}{entry.episodes ? ` · ${entry.episodes} episode(s)` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>

        <section className="mt-8 rounded-3xl border border-white/10 bg-night-800/60 p-6 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black">Edit Backdrop</h2>
              <p className="mt-2 text-sm text-gray-400">Choose an existing movie, series, or anime and update its background image.</p>
            </div>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-300">Content Type</label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value as typeof contentType)}
                className="w-full rounded-xl border border-white/10 bg-night-900/80 px-3 py-3 text-sm text-white outline-none"
              >
                <option value="movie">Movie</option>
                <option value="series">Series</option>
                <option value="anime">Anime</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-300">Select Existing Media</label>
              <select
                value={selectedMediaId}
                onChange={(e) => {
                  const selected = mediaItems.find((item) => item.id === e.target.value)
                  setSelectedMediaId(e.target.value)
                  setEditingBackdropUrl(selected?.backdrop || "")
                  setEditingBackdropPreview(selected?.backdrop || "")
                }}
                className="w-full rounded-xl border border-white/10 bg-night-900/80 px-3 py-3 text-sm text-white outline-none"
              >
                {mediaItems.length === 0 ? <option value="">No items found</option> : null}
                {mediaItems.map((item) => (
                  <option key={item.id} value={item.id}>{item.title}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-gray-300">New Backdrop Image URL</label>
              <input
                value={editingBackdropUrl}
                onChange={(e) => setEditingBackdropUrl(e.target.value)}
                placeholder="Paste a new background image URL"
                className="w-full rounded-xl border border-white/10 bg-night-900/80 px-3 py-3 text-sm text-white outline-none"
              />

              <div className="mt-3 rounded-2xl border border-white/10 bg-night-900/60 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Current Preview</p>
                  {editingBackdropLoading ? <span className="text-xs text-gray-500">Loading...</span> : null}
                </div>

                {editingBackdropPreview ? (
                  <img src={editingBackdropPreview} alt="Current backdrop preview" className="h-48 w-full rounded-xl object-cover" />
                ) : (
                  <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-white/10 text-sm text-gray-500">
                    {editingBackdropLoading ? "Loading preview..." : "Enter an image URL to preview the new backdrop"}
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={updateMediaBackdrop}
            disabled={updatingMedia || !selectedMediaId}
            className="mt-6 flex items-center gap-2 rounded-full bg-gradient-to-r from-sweet-coral to-sweet-gold px-5 py-3 font-bold text-night-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="h-5 w-5" />
            {updatingMedia ? "Updating..." : "Update Backdrop"}
          </button>
        </section>
      </div>
    </main>
  )
}

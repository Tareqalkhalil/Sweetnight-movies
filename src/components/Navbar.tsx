"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Search, Menu, X, Moon, Film, Tv, Grid3X3, Heart, User, Sparkles, ShieldCheck } from "lucide-react"
import LocaleSwitcher from "@/components/LocaleSwitcher"
import { useRouter } from "next/navigation"
import { getClientLocale, getDictionary } from "@/lib/i18n"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [suggestions, setSuggestions] = useState<{ movies: any[]; series: any[] }>({ movies: [], series: [] })
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const router = useRouter()
  const locale = getClientLocale()
  const t = getDictionary(locale).navbar

  const navLinks = [
    { href: "/", label: t.home, icon: <Moon className="w-4 h-4" /> },
    { href: "/movies", label: t.movies, icon: <Film className="w-4 h-4" /> },
    { href: "/series", label: t.series, icon: <Tv className="w-4 h-4" /> },
    { href: "/anime", label: t.anime, icon: <Sparkles className="w-4 h-4" /> },
    { href: "/categories", label: t.categories, icon: <Grid3X3 className="w-4 h-4" /> },
    { href: "/favorites", label: t.favorites, icon: <Heart className="w-4 h-4" /> },
    { href: "/admin", label: "Admin", icon: <ShieldCheck className="w-4 h-4" /> },
  ]

  useEffect(() => {
    const query = searchQuery.trim()

    if (!query || query.length < 2) {
      setSuggestions({ movies: [], series: [] })
      setIsLoadingSuggestions(false)
      return
    }

    const controller = new AbortController()
    const fetchSuggestions = async () => {
      setIsLoadingSuggestions(true)
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: controller.signal })
        const data = await response.json()
        if (!controller.signal.aborted) {
          setSuggestions({ movies: data.movies || [], series: data.series || [] })
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Search suggestions error:", error)
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingSuggestions(false)
        }
      }
    }

    fetchSuggestions()
    return () => controller.abort()
  }, [searchQuery])

  const handleSearch = () => {
    const query = searchQuery.trim()
    if (!query) return
    router.push(`/search?q=${encodeURIComponent(query)}`)
    setIsOpen(false)
    setSuggestions({ movies: [], series: [] })
  }

  const handleSuggestionClick = (slug: string, type: "movie" | "series") => {
    setSearchQuery("")
    setSuggestions({ movies: [], series: [] })
    router.push(type === "movie" ? `/movie/${slug}` : `/serie/${slug}`)
    setIsOpen(false)
  }

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-l from-night-900 via-night-800 to-night-900 border-b border-white/5 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sweet-coral to-sweet-gold flex items-center justify-center text-lg shadow-lg shadow-sweet-coral/20 group-hover:shadow-sweet-coral/40 transition-all">
              🌙
            </div>
            <span className="text-xl font-extrabold bg-gradient-to-r from-sweet-gold via-sweet-coral to-sweet-pink bg-clip-text text-transparent">
              Sweet Night
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-sweet-gold hover:bg-white/5 transition-all"
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>

          {/* Search & Auth */}
          <div className="hidden md:flex items-center gap-3">
            <div className="relative">
              <button
                type="button"
                onClick={handleSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-gray-500 hover:text-sweet-gold transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleSearch()
                  }
                }}
                className="w-56 bg-white/5 border border-white/10 rounded-full pr-10 pl-4 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-sweet-gold/50 focus:bg-white/10 transition-all"
              />
              {searchQuery.trim().length >= 2 && (
                <div className="absolute top-full mt-2 left-0 right-0 z-50 rounded-2xl border border-white/10 bg-night-800/95 shadow-2xl backdrop-blur-xl overflow-hidden">
                  {isLoadingSuggestions && <div className="px-4 py-3 text-sm text-gray-400">جاري البحث...</div>}
                  {!isLoadingSuggestions && suggestions.movies.length === 0 && suggestions.series.length === 0 && (
                    <div className="px-4 py-3 text-sm text-gray-400">لا توجد نتائج</div>
                  )}
                  {suggestions.movies.map((movie) => (
                    <button
                      key={movie.id}
                      type="button"
                      onClick={() => handleSuggestionClick(movie.slug, "movie")}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-gray-200 hover:bg-white/10 transition-colors"
                    >
                      <span className="text-sweet-gold">🎬</span>
                      <span className="truncate">{movie.titleAr || movie.title}</span>
                    </button>
                  ))}
                  {suggestions.series.map((serie) => (
                    <button
                      key={serie.id}
                      type="button"
                      onClick={() => handleSuggestionClick(serie.slug, "series")}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-gray-200 hover:bg-white/10 transition-colors"
                    >
                      <span className="text-sweet-gold">📺</span>
                      <span className="truncate">{serie.titleAr || serie.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <LocaleSwitcher />
            <Link
              href="/login"
              className="flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-sweet-coral to-sweet-gold text-night-900 font-bold text-sm hover:shadow-lg hover:shadow-sweet-coral/30 transition-all"
            >
              <User className="w-4 h-4" />
              {t.login}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-night-800 border-t border-white/5 px-4 py-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:text-sweet-gold hover:bg-white/5 transition-all"
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-white/5">
            <div className="relative mb-3">
              <button
                type="button"
                onClick={handleSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-gray-500 hover:text-sweet-gold transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
              <input
                type="text"
                placeholder={t.mobileSearchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleSearch()
                  }
                }}
                className="w-full bg-white/5 border border-white/10 rounded-full pr-10 pl-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-sweet-gold/50"
              />
              {searchQuery.trim().length >= 2 && (
                <div className="absolute top-full mt-2 left-0 right-0 z-50 rounded-2xl border border-white/10 bg-night-800/95 shadow-2xl backdrop-blur-xl overflow-hidden">
                  {isLoadingSuggestions && <div className="px-4 py-3 text-sm text-gray-400">جاري البحث...</div>}
                  {!isLoadingSuggestions && suggestions.movies.length === 0 && suggestions.series.length === 0 && (
                    <div className="px-4 py-3 text-sm text-gray-400">لا توجد نتائج</div>
                  )}
                  {suggestions.movies.map((movie) => (
                    <button
                      key={movie.id}
                      type="button"
                      onClick={() => handleSuggestionClick(movie.slug, "movie")}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-gray-200 hover:bg-white/10 transition-colors"
                    >
                      <span className="text-sweet-gold">🎬</span>
                      <span className="truncate">{movie.titleAr || movie.title}</span>
                    </button>
                  ))}
                  {suggestions.series.map((serie) => (
                    <button
                      key={serie.id}
                      type="button"
                      onClick={() => handleSuggestionClick(serie.slug, "series")}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-gray-200 hover:bg-white/10 transition-colors"
                    >
                      <span className="text-sweet-gold">📺</span>
                      <span className="truncate">{serie.titleAr || serie.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="mb-3 flex justify-center">
              <LocaleSwitcher />
            </div>
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 w-full px-5 py-2.5 rounded-full bg-gradient-to-r from-sweet-coral to-sweet-gold text-night-900 font-bold text-sm"
            >
              <User className="w-4 h-4" />
              {t.login}
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}

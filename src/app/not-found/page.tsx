import Link from "next/link"
import { Home, Film } from "lucide-react"
import { cookies } from "next/headers"
import { getDictionary, getLocaleFromCookie } from "@/lib/i18n"

export default async function NotFound() {
  const cookieStore = await cookies()
  const locale = getLocaleFromCookie(cookieStore.get("locale")?.value)
  const t = getDictionary(locale).pages.notFound

  return (
    <main className="min-h-screen bg-night-900 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-8xl mb-6">🎬</div>
        <h1 className="text-6xl font-black text-white mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-300 mb-2">{t.title}</h2>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">{t.text}</p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-sweet-coral to-sweet-gold text-night-900 font-bold hover:shadow-lg transition-all"
          >
            <Home className="w-5 h-5" />
            {t.home}
          </Link>
          <Link
            href="/movies"
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 border border-white/20 text-white font-bold hover:bg-white/20 transition-all"
          >
            <Film className="w-5 h-5" />
            {t.browseMovies}
          </Link>
        </div>
      </div>
    </main>
  )
}

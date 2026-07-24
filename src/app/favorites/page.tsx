import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { Heart } from "lucide-react"
import { cookies } from "next/headers"
import { getDictionary, getLocaleFromCookie } from "@/lib/i18n"

export default async function FavoritesPage() {
  const cookieStore = await cookies()
  const locale = getLocaleFromCookie(cookieStore.get("locale")?.value)
  const t = getDictionary(locale).pages.favorites
  return (
    <main className="min-h-screen bg-night-900">
      <Navbar />

      <section className="pt-8 pb-16 px-4 sm:px-6 max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-black text-white mb-2 flex items-center gap-3">
          <span className="text-4xl">❤️</span>
          {t.title}
        </h1>
        <p className="text-gray-400 mb-12">{t.subtitle}</p>

        <div className="text-center py-20">
          <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-gray-600" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">{t.emptyTitle}</h2>
          <p className="text-gray-400 max-w-md mx-auto">
            {t.emptyText}
          </p>
        </div>
      </section>

      <Footer />
    </main>
  )
}

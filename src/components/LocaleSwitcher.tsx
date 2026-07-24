"use client"

import { useEffect, useState } from "react"
import { Globe2 } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"

export default function LocaleSwitcher() {
  const [locale, setLocale] = useState<"ar" | "en">("ar")
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const match = document.cookie.match(/(?:^|; )locale=(ar|en)(?:;|$)/)
    if (match?.[1] === "en") {
      setLocale("en")
    } else {
      setLocale("ar")
    }
  }, [])

  const toggleLocale = () => {
    const nextLocale = locale === "ar" ? "en" : "ar"
    document.cookie = `locale=${nextLocale}; path=/; max-age=31536000`
    setLocale(nextLocale)
    router.refresh()
  }

  return (
    <button
      onClick={toggleLocale}
      className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-gray-200 transition-all hover:border-sweet-gold/40 hover:bg-white/10 hover:text-white"
      aria-label={locale === "ar" ? "Switch to English" : "التبديل للعربية"}
    >
      <Globe2 className="h-4 w-4" />
      <span>{locale === "ar" ? "EN" : "العربية"}</span>
    </button>
  )
}

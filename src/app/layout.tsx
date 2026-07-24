import type { Metadata } from "next"
import { cookies } from "next/headers"
import { defaultLocale, getDirection, getLocaleFromCookie } from "@/lib/i18n"
import "./globals.css"

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies()
  const locale = getLocaleFromCookie(cookieStore.get("locale")?.value)

  if (locale === "en") {
    return {
      title: "Sweet Night - Movies & Series Platform",
      description: "Enjoy thousands of movies and series in high quality with professional subtitles.",
      keywords: "movies, series, streaming, cinema, Netflix, action, drama, comedy",
    }
  }

  return {
    title: "Sweet Night - منصة الأفلام والمسلسلات",
    description: "استمتع بآلاف الأفلام والمسلسلات بجودة عالية وترجمة احترافية",
    keywords: "أفلام, مسلسلات, مشاهدة, سينما, نتفليكس, أكشن, دراما, كوميدي",
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const locale = getLocaleFromCookie(cookieStore.get("locale")?.value)
  const dir = getDirection(locale)

  return (
    <html lang={locale ?? defaultLocale} dir={dir}>
      <body className="min-h-screen bg-night-900 text-white antialiased">
        {children}
      </body>
    </html>
  )
}

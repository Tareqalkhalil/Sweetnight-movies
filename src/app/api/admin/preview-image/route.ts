import { NextResponse } from "next/server"
import { hasValidAdminAccess } from "@/lib/admin-auth"

export async function GET(request: Request) {
  if (!hasValidAdminAccess(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const targetUrl = searchParams.get("url")

  if (!targetUrl) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 })
  }

  try {
    const response = await fetch(targetUrl, {
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch")
    }

    const html = await response.text()
    const candidates = [
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i),
      html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["'][^>]*>/i),
      html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i),
    ]

    const imageMatch = candidates.find((match) => match?.[1])
    const imageUrl = imageMatch?.[1]

    if (!imageUrl) {
      return NextResponse.json({ imageUrl: null })
    }

    const absoluteUrl = imageUrl.startsWith("http") ? imageUrl : new URL(imageUrl, targetUrl).toString()

    return NextResponse.json({ imageUrl: absoluteUrl })
  } catch (error) {
    return NextResponse.json({ imageUrl: null })
  }
}

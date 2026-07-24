import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get("q")

    if (!q || q.length < 2) {
      return NextResponse.json({ movies: [], series: [] })
    }

    const [movies, series] = await Promise.all([
      prisma.movie.findMany({
        where: {
          isActive: true,
          OR: [
            { title: { contains: q } },
            { titleAr: { contains: q } },
          ],
        },
        take: 5,
        select: {
          id: true,
          title: true,
          titleAr: true,
          slug: true,
          poster: true,
          rating: true,
          releaseYear: true,
        },
      }),
      prisma.series.findMany({
        where: {
          isActive: true,
          OR: [
            { title: { contains: q } },
            { titleAr: { contains: q } },
          ],
        },
        take: 5,
        select: {
          id: true,
          title: true,
          titleAr: true,
          slug: true,
          poster: true,
          rating: true,
          releaseYear: true,
        },
      }),
    ])

    return NextResponse.json({ movies, series })
  } catch (error) {
    console.error("Error searching:", error)
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    )
  }
}

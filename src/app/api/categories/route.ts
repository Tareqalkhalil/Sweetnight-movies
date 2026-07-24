import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

function mapCategoryType(type?: string | null) {
  const normalized = type?.toLowerCase()

  switch (normalized) {
    case "movie":
    case "movies":
      return ["MOVIE", "BOTH"] as const
    case "series":
    case "serie":
    case "serieses":
    case "shows":
      return ["SERIES", "BOTH"] as const
    case "anime":
      return ["SERIES", "BOTH"] as const
    default:
      return undefined
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const categoryTypes = mapCategoryType(type)

    const where: any = { isActive: true }
    if (categoryTypes) {
      where.type = { in: categoryTypes }
    }

    const categories = await prisma.category.findMany({
      where,
      orderBy: { sortOrder: "asc" },
      include: {
        _count: {
          select: {
            movies: true,
            series: true,
          },
        },
      },
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}

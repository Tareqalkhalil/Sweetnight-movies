import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    const where: any = { isActive: true }

    if (category) {
      where.categories = {
        some: {
          category: { slug: category },
        },
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { titleAr: { contains: search } },
        { description: { contains: search } },
      ]
    }

    const [movies, total] = await Promise.all([
      prisma.movie.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          categories: { include: { category: true } },
          _count: { select: { reviews: true } },
        },
      }),
      prisma.movie.count({ where }),
    ])

    return NextResponse.json({
      movies,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching movies:", error)
    return NextResponse.json(
      { error: "Failed to fetch movies" },
      { status: 500 }
    )
  }
}

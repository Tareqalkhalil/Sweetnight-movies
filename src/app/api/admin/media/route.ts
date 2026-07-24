import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hasValidAdminAccess } from "@/lib/admin-auth"

async function applyCategoryRelation(type: "movie" | "series" | "anime", id: string, categorySlug?: string | null) {
  if (type === "movie") {
    await prisma.movieCategory.deleteMany({ where: { movieId: id } })
    if (categorySlug?.trim()) {
      const category = await prisma.category.findUnique({ where: { slug: categorySlug.trim() } })
      if (category) {
        await prisma.movieCategory.create({ data: { movieId: id, categoryId: category.id } })
      }
    }
    return
  }

  await prisma.seriesCategory.deleteMany({ where: { seriesId: id } })
  if (categorySlug?.trim()) {
    const category = await prisma.category.findUnique({ where: { slug: categorySlug.trim() } })
    if (category) {
      await prisma.seriesCategory.create({ data: { seriesId: id, categoryId: category.id } })
    }
  }
}

export async function GET(request: Request) {
  try {
    if (!hasValidAdminAccess(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    if (type === "movie") {
      const items = await prisma.movie.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          titleAr: true,
          slug: true,
          embedUrl: true,
          backdrop: true,
          poster: true,
          description: true,
          descriptionAr: true,
          categories: { select: { category: { select: { slug: true } } } },
        },
      })
      return NextResponse.json({ items })
    }

    if (type === "series") {
      const items = await prisma.series.findMany({
        where: {
          isActive: true,
          NOT: {
            categories: {
              some: { category: { slug: { in: ["anime", "anime-action", "anime-comedy", "anime-drama", "anime-romance", "anime-fantasy", "anime-adventure", "anime-supernatural", "anime-sports", "anime-slice-of-life", "anime-mecha", "anime-isekai"] } } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          titleAr: true,
          slug: true,
          embedUrl: true,
          backdrop: true,
          poster: true,
          description: true,
          descriptionAr: true,
          categories: { select: { category: { select: { slug: true } } } },
        },
      })
      return NextResponse.json({ items })
    }

    if (type === "anime") {
      const items = await prisma.series.findMany({
        where: {
          isActive: true,
          categories: {
            some: { category: { slug: { in: ["anime", "anime-action", "anime-comedy", "anime-drama", "anime-romance", "anime-fantasy", "anime-adventure", "anime-supernatural", "anime-sports", "anime-slice-of-life", "anime-mecha", "anime-isekai"] } } },
          },
        },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          titleAr: true,
          slug: true,
          embedUrl: true,
          backdrop: true,
          poster: true,
          description: true,
          descriptionAr: true,
          categories: { select: { category: { select: { slug: true } } } },
        },
      })
      return NextResponse.json({ items })
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to load media" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    if (!hasValidAdminAccess(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { type, id, title, description, embedUrl, backdrop, poster, categorySlug } = body as {
      type?: "movie" | "series" | "anime"
      id?: string
      title?: string
      description?: string
      embedUrl?: string
      backdrop?: string | null
      poster?: string | null
      categorySlug?: string | null
    }

    if (!type || !id) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 })
    }

    if (type === "movie") {
      const updateData: { title?: string; titleAr?: string | null; description?: string; descriptionAr?: string | null; embedUrl?: string | null; backdrop?: string | null; poster?: string | null } = {}
      if (typeof title === "string") {
        const trimmedTitle = title.trim()
        updateData.title = trimmedTitle
        updateData.titleAr = trimmedTitle
      }
      if (typeof description === "string") {
        const trimmedDescription = description.trim()
        updateData.description = trimmedDescription || ""
        updateData.descriptionAr = trimmedDescription || ""
      }
      if (typeof embedUrl === "string") updateData.embedUrl = embedUrl.trim() || null
      if (typeof backdrop === "string") updateData.backdrop = backdrop.trim() || null
      if (typeof backdrop === "object" && backdrop === null) updateData.backdrop = null
      if (typeof poster === "string") updateData.poster = poster.trim() || null
      if (typeof poster === "object" && poster === null) updateData.poster = null

      await prisma.movie.update({ where: { id }, data: updateData })
      await applyCategoryRelation(type, id, categorySlug)
      return NextResponse.json({ success: true })
    }

    if (type === "series" || type === "anime") {
      const updateData: { title?: string; titleAr?: string | null; description?: string; descriptionAr?: string | null; embedUrl?: string | null; backdrop?: string | null; poster?: string | null } = {}
      if (typeof title === "string") {
        const trimmedTitle = title.trim()
        updateData.title = trimmedTitle
        updateData.titleAr = trimmedTitle
      }
      if (typeof description === "string") {
        const trimmedDescription = description.trim()
        updateData.description = trimmedDescription || ""
        updateData.descriptionAr = trimmedDescription || ""
      }
      if (typeof embedUrl === "string") updateData.embedUrl = embedUrl.trim() || null
      if (typeof backdrop === "string") updateData.backdrop = backdrop.trim() || null
      if (typeof backdrop === "object" && backdrop === null) updateData.backdrop = null
      if (typeof poster === "string") updateData.poster = poster.trim() || null
      if (typeof poster === "object" && poster === null) updateData.poster = null

      await prisma.series.update({ where: { id }, data: updateData })
      await applyCategoryRelation(type, id, categorySlug)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to update media" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    if (!hasValidAdminAccess(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const id = searchParams.get("id")

    if (!type || !id) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 })
    }

    if (type === "movie") {
      await prisma.movie.update({ where: { id }, data: { isActive: false } })
      return NextResponse.json({ success: true })
    }

    if (type === "series" || type === "anime") {
      await prisma.series.update({ where: { id }, data: { isActive: false } })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to delete media" }, { status: 500 })
  }
}

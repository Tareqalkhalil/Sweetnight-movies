import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hasValidAdminAccess } from "@/lib/admin-auth"

async function resolveCategory(type: "movie" | "series" | "anime", categorySlug?: string | null) {
  if (categorySlug?.trim()) {
    return prisma.category.findUnique({ where: { slug: categorySlug.trim() } })
  }

  if (type === "anime") {
    const existing = await prisma.category.findUnique({ where: { slug: "anime" } })
    if (existing) return existing

    return prisma.category.create({
      data: {
        name: "Anime",
        nameAr: "أنمي",
        slug: "anime",
        description: "Anime content",
        icon: "✨",
        color: "#ff6b6b",
        type: "SERIES",
        isActive: true,
      },
    })
  }

  return null
}

export async function POST(request: Request) {
  try {
    if (!hasValidAdminAccess(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { type, categorySlug, title, description, embedUrl, backdrop } = body as {
      type?: "movie" | "series" | "anime"
      categorySlug?: string
      title?: string
      description?: string
      embedUrl?: string
      backdrop?: string
    }

    if (!type || !title?.trim()) {
      return NextResponse.json({ error: "Missing type or title" }, { status: 400 })
    }

    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    const category = await resolveCategory(type, categorySlug)

    if (type === "movie") {
      const created = await prisma.movie.create({
        data: {
          title,
          titleAr: title,
          slug: `${slug}-${Date.now()}`,
          description: description || title,
          descriptionAr: description || title,
          poster: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500",
          backdrop: backdrop?.trim() || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200",
          duration: 120,
          releaseYear: new Date().getFullYear(),
          language: "en",
          quality: "HD",
          isFeatured: false,
          isTrending: false,
          embedUrl: embedUrl || null,
          ...(category ? {
            categories: {
              create: [{ categoryId: category.id }],
            },
          } : {}),
        },
      })

      return NextResponse.json({ success: true, item: created })
    }

    const created = await prisma.series.create({
      data: {
        title,
        titleAr: title,
        slug: `${slug}-${Date.now()}`,
        description: description || title,
        descriptionAr: description || title,
        poster: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500",
        backdrop: backdrop?.trim() || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200",
        releaseYear: new Date().getFullYear(),
        language: "en",
        quality: "HD",
        totalSeasons: 1,
        totalEpisodes: 1,
        isFeatured: false,
        isTrending: false,
        embedUrl: embedUrl || null,
        ...(category ? {
          categories: {
            create: [{ categoryId: category.id }],
          },
        } : {}),
      },
    })

    return NextResponse.json({ success: true, item: created })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to create media" }, { status: 500 })
  }
}

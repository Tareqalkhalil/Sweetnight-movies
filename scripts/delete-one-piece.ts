import { prisma } from "@/lib/prisma"

async function deleteOnePiece() {
  console.log("🗑️ حذف جميع عناصر One Piece...")
  console.log("═".repeat(70))

  try {
    // حذف الأفلام
    const deletedMovies = await prisma.movie.deleteMany({
      where: {
        OR: [
          { title: { contains: "One Piece" } },
          { titleAr: { contains: "One Piece" } },
          { title: { contains: "ون بيس" } },
          { titleAr: { contains: "ون بيس" } }
        ]
      }
    })

    // حذف المسلسلات
    const deletedSeries = await prisma.series.deleteMany({
      where: {
        OR: [
          { title: { contains: "One Piece" } },
          { titleAr: { contains: "One Piece" } },
          { title: { contains: "ون بيس" } },
          { titleAr: { contains: "ون بيس" } }
        ]
      }
    })

    // حذف الحلقات
    const deletedEpisodes = await prisma.episode.deleteMany({
      where: {
        OR: [
          { title: { contains: "One Piece" } },
          { title: { contains: "ون بيس" } }
        ]
      }
    })

    console.log("\n📊 النتائج:")
    console.log(`   🎬 أفلام محذوفة: ${deletedMovies.count}`)
    console.log(`   📺 مسلسلات محذوفة: ${deletedSeries.count}`)
    console.log(`   📹 حلقات محذوفة: ${deletedEpisodes.count}`)

    const total = deletedMovies.count + deletedSeries.count + deletedEpisodes.count

    console.log("\n" + "═".repeat(70))
    console.log(`✅ تم حذف ${total} عنصر من One Piece بنجاح!`)
  } catch (error) {
    console.error("❌ خطأ في الحذف:")
    console.error(error)
  } finally {
    await prisma.$disconnect()
  }
}

deleteOnePiece()

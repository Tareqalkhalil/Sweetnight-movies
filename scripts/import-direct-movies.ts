import { prisma } from "@/lib/prisma"

const movies = [
  "Obsession (2025)",
  "The Magic Faraway Tree (2026)",
  "Pitfall (2025)",
  "Dead Man's Wire (2026)",
  "The Invite (2026)",
  "California Schemin (2025)",
  "Black Box (2026)",
  "Supergirl (2026)",
  "Nothing to Lose (2026)",
  "The Death of Robin Hood (2026)",
  "The Furious (2025)",
  "Passenger (2026)",
  "Worth the Wait (2025)",
  "Jacked (2025)",
  "Bad Man (2025)",
  "Man of War (2026)",
  "Giant (2025)",
  "40 Dates and 40 Nights (2026)",
  "Kafir: The Spirit Gate (2026)",
  "A Different Man (2024)",
  "Enola Holmes 3 (2026)",
  "The Devil Wears Prada (2006)",
  "The Devil Wears Prada 2 (2026)",
  "The Get Out (2026)",
  "Bare Skin (2026)",
  "Killhouse (2026)",
  "Unconnected (2026)",
  "Homage (2026)",
  "Finding Emily (2026)",
  "Gangland (2025)",
  "This Tempting Madness (2025)",
  "Torrente for President (2026)",
  "Strung (2026)",
  "Scary Movie (2026)",
  "Masters of the Universe (2026)",
  "Hold the Fort (2025)",
  "Backrooms (2026)",
  "Savage House (2026)",
  "Beast (2026)",
  "Little Brother (2026)",
  "Flavia (2026)",
  "They Will Kill You (2026)",
  "How to Make a Killing (2026)",
  "Toy Story 5 (2026)",
  "Hungry (2026)",
  "The Sheep Detectives (2026)",
  "In the Hand of Dante (2025)",
  "Tuner (2025)",
  "The Love Heist (2026)",
  "Power Ballad (2026)",
  "I Love Boosters (2026)",
  "Hitman: The Slaughter (2025)",
  "Carolina Caroline (2025)",
  "Blue Heron (2025)",
  "Hair of the Bear (2025)",
  "Star Wars: The Mandalorian and Grogu (2026)",
  "The Voices of Our Mother (2026)",
  "Citizen Vigilante (2026)",
  "Voicemails for Isabelle (2026)",
  "The Super Mario Galaxy Movie (2026)",
  "Extreme Makeover: Homer Edition (2026)",
  "Disclosure Day (2026)",
  "Busboys (2026)",
  "Greenland 2: Migration (2026)",
  "The Rip (2026)",
  "Captain America: Brave New World (2025)",
  "Troll 2 (2025)",
  "The Family Plan 2 (2025)",
  "Nobody 2 (2025)",
  "The Fantastic Four: First Steps (2025)",
  "Venom: The Last Dance (2024)",
  "Superman (2025)",
  "Avatar: Fire and Ash (2025)",
  "The Housemaid (2025)",
  "Shelter (2026)",
  "Balls Up (2026)",
  "Peaky Blinders: The Immortal Man (2026)",
  "Anaconda (2025)",
  "The Strangers: Chapter 3 (2026)",
  "Mercy (2026)",
  "The Wrecking Crew (2026)",
  "IRaH (2024)",
  "She Said Maybe (2025)",
  "Dirty Hands (2026)"
]

async function importForeignMoviesToDatabase() {
  console.log("🎬 استيراد مباشر للأفلام الأجنبية...")
  console.log(`📊 عدد الأفلام: ${movies.length}`)
  console.log("═".repeat(70))

  try {
    // Get the Foreign Movies category
    const category = await prisma.category.findUnique({
      where: { slug: "foreign-movies" }
    })

    if (!category) {
      console.error("❌ فئة Foreign Movies غير موجودة!")
      return
    }

    console.log(`✅ وجدت الفئة: ${category.name}`)

    let created = 0
    let failed = 0

    for (const [index, movieTitle] of movies.entries()) {
      try {
        // Extract year from title if available
        const yearMatch = movieTitle.match(/\((\d{4})\)/)
        const releaseYear = yearMatch ? parseInt(yearMatch[1]) : 2025
        const title = movieTitle.replace(/\s*\(\d{4}\)\s*$/, "").trim()

        // Create slug
        const slug = `${title
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")}-${Date.now()}-${index}`

        const movie = await prisma.movie.create({
          data: {
            title,
            titleAr: title,
            slug,
            description: `فيلم أجنبي - ${title}`,
            descriptionAr: `فيلم أجنبي - ${title}`,
            poster: `https://via.placeholder.com/300x450?text=${encodeURIComponent(title)}`,
            backdrop: `https://via.placeholder.com/1920x1080?text=${encodeURIComponent(title)}`,
            embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            duration: 120,
            releaseYear,
            rating: 7.5,
            language: "en",
            quality: "HD",
            views: 0,
            isFeatured: false,
            isTrending: false,
            isActive: true,
            categories: {
              create: [{ categoryId: category.id }]
            }
          }
        })

        console.log(`   ✅ ${index + 1}/${movies.length} - ${title} (${releaseYear})`)
        created++
      } catch (err) {
        console.error(`   ❌ فشل: ${movieTitle}`)
        failed++
      }
    }

    console.log("\n" + "═".repeat(70))
    console.log("📊 النتائج النهائية:")
    console.log(`   ✅ نجح: ${created}`)
    console.log(`   ❌ فشل: ${failed}`)
    console.log(`   📊 المجموع: ${movies.length}`)
    console.log("\n🎉 تم الاستيراد بنجاح!")
  } catch (error) {
    console.error("❌ خطأ في الاستيراد:")
    console.error(error)
  } finally {
    await prisma.$disconnect()
  }
}

importForeignMoviesToDatabase()

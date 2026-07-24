import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

try {
  const series = await prisma.series.findFirst({
    where: { isActive: true },
    include: {
      seasons: {
        include: { episodes: true },
        orderBy: { seasonNumber: "asc" },
      },
    },
  });

  if (!series) {
    console.log("No series found");
    process.exit(0);
  }

  console.log(`\n📺 Series: ${series.title}`);
  console.log(`ID: ${series.id}`);
  console.log(`Embed URL: ${series.embedUrl}`);
  console.log(`\nSeasons count: ${series.seasons.length}`);

  series.seasons.slice(0, 3).forEach((season) => {
    console.log(`\n  🎬 Season ${season.seasonNumber}: "${season.title}"`);
    console.log(`     Episodes: ${season.episodes.length}`);
    season.episodes.slice(0, 5).forEach((ep) => {
      console.log(`       - Ep ${ep.episodeNumber}: "${ep.title}"`);
      console.log(`         videoUrl: ${ep.videoUrl || "❌ EMPTY"}`);
    });
  });
} catch (error) {
  console.error("Error:", error);
} finally {
  await prisma.$disconnect();
}

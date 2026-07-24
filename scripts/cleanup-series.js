const path = require('path');
const { PrismaClient } = require('@prisma/client');

const dbPath = path.resolve(__dirname, '../prisma/prisma/dev.db');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${dbPath.replace(/\\/g, '/')}`,
    },
  },
});

(async () => {
  const fastTitles = ['Fast and Furious', 'Fast & Furious', 'Fast And Furious'];

  const series = await prisma.series.findMany({
    where: {
      NOT: {
        title: { in: fastTitles },
      },
    },
    select: { id: true, title: true },
  });

  const ids = series.map((item) => item.id);

  if (ids.length === 0) {
    console.log(JSON.stringify({ deleted: 0, remaining: [] }, null, 2));
    await prisma.$disconnect();
    return;
  }

  await prisma.$transaction([
    prisma.episode.deleteMany({ where: { season: { seriesId: { in: ids } } } }),
    prisma.season.deleteMany({ where: { seriesId: { in: ids } } }),
    prisma.seriesCategory.deleteMany({ where: { seriesId: { in: ids } } }),
    prisma.seriesCast.deleteMany({ where: { seriesId: { in: ids } } }),
    prisma.seriesDirector.deleteMany({ where: { seriesId: { in: ids } } }),
    prisma.review.deleteMany({ where: { seriesId: { in: ids } } }),
    prisma.rating.deleteMany({ where: { seriesId: { in: ids } } }),
    prisma.watchlistItem.deleteMany({ where: { seriesId: { in: ids } } }),
    prisma.favorite.deleteMany({ where: { seriesId: { in: ids } } }),
    prisma.watchHistory.deleteMany({ where: { seriesId: { in: ids } } }),
    prisma.series.deleteMany({ where: { id: { in: ids } } }),
  ]);

  const remaining = await prisma.series.findMany({
    select: { id: true, title: true },
    orderBy: { createdAt: 'asc' },
  });

  console.log(JSON.stringify({ deleted: ids.length, remaining }, null, 2));
  await prisma.$disconnect();
})().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});

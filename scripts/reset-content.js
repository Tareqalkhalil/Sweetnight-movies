const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: 'file:./prisma/dev.db',
      },
    },
  });

  try {
    await prisma.$executeRawUnsafe('PRAGMA foreign_keys = OFF');
    await prisma.$executeRawUnsafe('DELETE FROM Episode');
    await prisma.$executeRawUnsafe('DELETE FROM Season');
    await prisma.$executeRawUnsafe('DELETE FROM MovieCategory');
    await prisma.$executeRawUnsafe('DELETE FROM SeriesCategory');
    await prisma.$executeRawUnsafe('DELETE FROM MovieCast');
    await prisma.$executeRawUnsafe('DELETE FROM SeriesCast');
    await prisma.$executeRawUnsafe('DELETE FROM MovieDirector');
    await prisma.$executeRawUnsafe('DELETE FROM SeriesDirector');
    await prisma.$executeRawUnsafe('DELETE FROM WatchlistItem');
    await prisma.$executeRawUnsafe('DELETE FROM Favorite');
    await prisma.$executeRawUnsafe('DELETE FROM Review');
    await prisma.$executeRawUnsafe('DELETE FROM Rating');
    await prisma.$executeRawUnsafe('DELETE FROM WatchHistory');
    await prisma.$executeRawUnsafe('DELETE FROM Movie');
    await prisma.$executeRawUnsafe('DELETE FROM Series');
    await prisma.$executeRawUnsafe('DELETE FROM Person');
    await prisma.$executeRawUnsafe('PRAGMA foreign_keys = ON');

    const movieCount = await prisma.movie.count();
    const seriesCount = await prisma.series.count();
    console.log(JSON.stringify({ movieCount, seriesCount }));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

import { prisma } from "../src/lib/prisma"

async function main() {
  const series = await prisma.series.findMany({
    where: { title: { contains: "Little House" } },
    include: {
      seasons: {
        include: { episodes: true },
        orderBy: { seasonNumber: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  console.log(JSON.stringify(series, null, 2))
  await prisma.$disconnect()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

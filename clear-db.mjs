import { PrismaClient } from "@prisma/client";

const p = new PrismaClient();

try {
  await p.episode.deleteMany({});
  await p.season.deleteMany({});
  await p.series.deleteMany({});
  console.log("✅ Database cleared - ready for fresh data");
} catch (error) {
  console.error(error);
} finally {
  await p.$disconnect();
}

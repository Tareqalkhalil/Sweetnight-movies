const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve('.env') });
dotenv.config({ path: path.resolve('.env.local') });
console.log('USE_SUPABASE_DB=%s', process.env.USE_SUPABASE_DB);
console.log('DATABASE_URL_LOCAL=%s', process.env.DATABASE_URL_LOCAL);
console.log('DATABASE_URL=%s', process.env.DATABASE_URL);
console.log('DATABASE_URL_SUPABASE=%s', process.env.DATABASE_URL_SUPABASE);
const { PrismaClient } = require('@prisma/client');
const url = process.env.USE_SUPABASE_DB === 'true' ? process.env.DATABASE_URL_SUPABASE || process.env.DATABASE_URL : process.env.DATABASE_URL_LOCAL || process.env.DATABASE_URL;
console.log('resolved url=', url);
const prisma = new PrismaClient({ datasources: { db: { url } } });
(async () => {
  try {
    const version = await prisma.$queryRawUnsafe('SELECT version()');
    console.log('version result =', version);
    const cats = await prisma.category.findMany({ take: 1 });
    console.log('category result =', cats);
  } catch (error) {
    console.error('PRISMA ERROR');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
})();

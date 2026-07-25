import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const localDatabaseUrl = process.env.DATABASE_URL_LOCAL ?? process.env.DATABASE_URL
const supabaseDatabaseUrl = process.env.DATABASE_URL_SUPABASE
const useSupabase = process.env.USE_SUPABASE_DB === 'true'

const databaseUrl = useSupabase
  ? supabaseDatabaseUrl ?? process.env.DATABASE_URL
  : localDatabaseUrl

if (!databaseUrl) {
  throw new Error(
    'Database URL is not configured. Set DATABASE_URL_LOCAL or DATABASE_URL_SUPABASE, and DATABASE_URL for Prisma schema operations.'
  )
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

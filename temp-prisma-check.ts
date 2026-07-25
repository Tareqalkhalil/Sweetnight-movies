import 'dotenv/config'
import path from 'path'
import { PrismaClient } from '@prisma/client'
import { prisma } from './src/lib/prisma'

console.log('process.env.USE_SUPABASE_DB=', process.env.USE_SUPABASE_DB)
console.log('process.env.DATABASE_URL_LOCAL=', process.env.DATABASE_URL_LOCAL)
console.log('process.env.DATABASE_URL=', process.env.DATABASE_URL)
console.log('process.env.DATABASE_URL_SUPABASE=', process.env.DATABASE_URL_SUPABASE)

(async () => {
  try {
    const version = await prisma.$queryRawUnsafe('SELECT version()')
    console.log('prisma version ok', version)
  } catch (err) {
    console.error('prisma error', err)
  } finally {
    await prisma.$disconnect()
  }
})()

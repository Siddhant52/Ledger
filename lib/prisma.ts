import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = global as typeof globalThis & {
  prisma?: PrismaClient
}

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('Missing DIRECT_URL or DATABASE_URL environment variable for Prisma adapter')
}

const prismaAdapter = new PrismaPg(connectionString)

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter: prismaAdapter })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const prismaClientSingleton = () => {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
  })
  // The Prisma constructor in Prisma 7 with a custom adapter
  // expects the factory/adapter provided by @prisma/adapter-pg.
  return new PrismaClient({ adapter: new PrismaPg(pool) })
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma

// Client Prisma condiviso.
//
// Su Vercel ogni richiesta può girare in un'istanza serverless diversa e ogni
// istanza apre il proprio pool di connessioni. Con il pool predefinito di
// Prisma (più connessioni per istanza) il database di Supabase raggiunge il
// limite di client e alcune richieste falliscono con 500. Prisma raccomanda
// una sola connessione per istanza quando c'è un pooler esterno: la si imposta
// qui, a meno che DATABASE_URL non indichi già un connection_limit.

let PrismaClient: any
try {
  PrismaClient = require('@prisma/client').PrismaClient
} catch {
  PrismaClient = null
}

function databaseUrl(): string | undefined {
  const raw = process.env.DATABASE_URL
  if (!raw) return undefined
  try {
    const url = new URL(raw)
    if (!url.searchParams.has('connection_limit')) url.searchParams.set('connection_limit', '1')
    return url.toString()
  } catch {
    return raw
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: any | undefined
}

function createClient() {
  const url = databaseUrl()
  return url ? new PrismaClient({ datasources: { db: { url } } }) : new PrismaClient()
}

export const prisma = PrismaClient ? globalForPrisma.prisma ?? createClient() : null

if (process.env.NODE_ENV !== 'production' && prisma) {
  globalForPrisma.prisma = prisma
}

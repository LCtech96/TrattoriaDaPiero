/**
 * Rate limit e registro degli eventi di sicurezza, salvati nel database.
 *
 * Il vecchio limite in memoria valeva per una sola istanza serverless: in
 * produzione le richieste si distribuiscono su più istanze e il blocco non
 * scattava mai. Qui il contatore sta in Postgres ed è condiviso.
 *
 * Le tabelle "RateLimit" e "SecurityEvent" vengono create automaticamente al
 * primo utilizzo (con RLS attiva e senza permessi per i ruoli pubblici di
 * Supabase), così non serve lanciare script a mano. Se il database non è
 * raggiungibile si ripiega su un limite in memoria, meglio di niente.
 */
import { prisma } from '@/lib/db'

/** IP del client. Su Vercel x-forwarded-for è impostato dalla piattaforma e non è falsificabile. */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim().slice(0, 64)
  return (request.headers.get('x-real-ip') ?? 'unknown').slice(0, 64)
}

// ── Creazione automatica delle tabelle ──────────────────────────────────────

const DDL = [
  `CREATE TABLE IF NOT EXISTS "RateLimit" (
     "key" TEXT PRIMARY KEY,
     "count" INTEGER NOT NULL DEFAULT 0,
     "windowStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
   )`,
  `CREATE TABLE IF NOT EXISTS "SecurityEvent" (
     "id" SERIAL PRIMARY KEY,
     "type" TEXT NOT NULL,
     "ip" TEXT,
     "detail" TEXT,
     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
   )`,
  `CREATE INDEX IF NOT EXISTS "SecurityEvent_createdAt_idx" ON "SecurityEvent" ("createdAt")`,
  `CREATE INDEX IF NOT EXISTS "SecurityEvent_type_createdAt_idx" ON "SecurityEvent" ("type", "createdAt")`,
  `ALTER TABLE "RateLimit" ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE "SecurityEvent" ENABLE ROW LEVEL SECURITY`,
  `DO $$
   DECLARE r TEXT;
   BEGIN
     FOREACH r IN ARRAY ARRAY['anon', 'authenticated'] LOOP
       IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = r) THEN
         EXECUTE format('REVOKE ALL ON TABLE "RateLimit", "SecurityEvent" FROM %I', r);
         EXECUTE format('REVOKE ALL ON SEQUENCE "SecurityEvent_id_seq" FROM %I', r);
       END IF;
     END LOOP;
   END $$`,
]

let tablesReady: Promise<boolean> | null = null

async function ensureTables(): Promise<boolean> {
  if (!prisma) return false
  if (!tablesReady) {
    tablesReady = (async () => {
      try {
        // Un comando per chiamata: il pooler di Supabase non accetta più comandi insieme.
        for (const statement of DDL) await prisma.$executeRawUnsafe(statement)
        return true
      } catch (error) {
        console.error('[security] impossibile preparare le tabelle di sicurezza:', error)
        tablesReady = null // si riprova alla prossima richiesta
        return false
      }
    })()
  }
  return tablesReady
}

// ── Rate limit ──────────────────────────────────────────────────────────────

const memory = new Map<string, { count: number; start: number }>()

function memoryHit(key: string, windowSeconds: number): number {
  const now = Date.now()
  const entry = memory.get(key)
  if (!entry || now - entry.start > windowSeconds * 1000) {
    memory.set(key, { count: 1, start: now })
    return 1
  }
  entry.count += 1
  return entry.count
}

export interface RateLimitResult {
  allowed: boolean
  count: number
  retryAfter: number
}

/** Conta una richiesta per `key` e dice se rientra nel limite della finestra. */
export async function rateLimit(key: string, limit: number, windowSeconds: number): Promise<RateLimitResult> {
  if (await ensureTables()) {
    try {
      const rows: { count: number; retryAfter: number }[] = await prisma.$queryRaw`
        INSERT INTO "RateLimit" ("key", "count", "windowStart")
        VALUES (${key}, 1, NOW())
        ON CONFLICT ("key") DO UPDATE SET
          "count" = CASE
            WHEN "RateLimit"."windowStart" <= NOW() - make_interval(secs => ${windowSeconds}::double precision)
            THEN 1 ELSE "RateLimit"."count" + 1 END,
          "windowStart" = CASE
            WHEN "RateLimit"."windowStart" <= NOW() - make_interval(secs => ${windowSeconds}::double precision)
            THEN NOW() ELSE "RateLimit"."windowStart" END
        RETURNING "count",
          GREATEST(1, CEIL(EXTRACT(EPOCH FROM ("windowStart" + make_interval(secs => ${windowSeconds}::double precision) - NOW()))))::int AS "retryAfter"`
      const row = rows[0]
      return { allowed: row.count <= limit, count: row.count, retryAfter: row.retryAfter }
    } catch (error) {
      console.error('[security] rate limit su database non riuscito, uso la memoria:', error)
    }
  }
  const count = memoryHit(key, windowSeconds)
  return { allowed: count <= limit, count, retryAfter: windowSeconds }
}

/** Quante richieste sono state contate per `key` nella finestra corrente (senza incrementare). */
export async function rateLimitPeek(key: string, windowSeconds: number): Promise<number> {
  if (await ensureTables()) {
    try {
      const rows: { count: number }[] = await prisma.$queryRaw`
        SELECT "count" FROM "RateLimit"
        WHERE "key" = ${key}
          AND "windowStart" > NOW() - make_interval(secs => ${windowSeconds}::double precision)`
      return rows[0]?.count ?? 0
    } catch {
      // ricade sulla memoria
    }
  }
  const entry = memory.get(key)
  return entry && Date.now() - entry.start <= windowSeconds * 1000 ? entry.count : 0
}

export async function rateLimitReset(key: string): Promise<void> {
  memory.delete(key)
  if (await ensureTables()) {
    try {
      await prisma.$executeRaw`DELETE FROM "RateLimit" WHERE "key" = ${key}`
    } catch {
      // non bloccante
    }
  }
}

// ── Registro eventi ─────────────────────────────────────────────────────────

export type SecurityEventType =
  | 'login_success'
  | 'login_failed'
  | 'login_rate_limited'
  | 'login_locked'
  | 'checkout_rate_limited'
  | 'webhook_bad_signature'
  | 'payment_amount_mismatch'
  | 'upload_rejected'
  | 'admin_delete'
  | 'admin_payment'

/**
 * Registra un evento: sempre nei log di Vercel (console) e, se possibile, nel
 * database, da cui lo legge la pagina /admin/sicurezza. Non lancia mai errori.
 */
export async function logSecurityEvent(
  type: SecurityEventType,
  request: Request | null,
  detail?: string
): Promise<void> {
  const ip = request ? getClientIp(request) : null
  const safeDetail = detail ? detail.replace(/[\r\n]+/g, ' ').slice(0, 500) : null
  console.warn(JSON.stringify({ security: type, ip, detail: safeDetail, at: new Date().toISOString() }))

  if (!(await ensureTables())) return
  try {
    await prisma.$executeRaw`
      INSERT INTO "SecurityEvent" ("type", "ip", "detail") VALUES (${type}, ${ip}, ${safeDetail})`
    // Pulizia occasionale: si tengono 90 giorni di storico.
    if (Math.random() < 0.02) {
      await prisma.$executeRaw`DELETE FROM "SecurityEvent" WHERE "createdAt" < NOW() - INTERVAL '90 days'`
      await prisma.$executeRaw`DELETE FROM "RateLimit" WHERE "windowStart" < NOW() - INTERVAL '2 days'`
    }
  } catch (error) {
    console.error('[security] impossibile salvare l\'evento:', error)
  }
}

export interface SecurityEventRow {
  id: number
  type: string
  ip: string | null
  detail: string | null
  createdAt: Date
}

/** Ultimi eventi e indicatori di allarme per il pannello admin. */
export async function getSecuritySummary() {
  if (!(await ensureTables())) return null
  const events: SecurityEventRow[] = await prisma.$queryRaw`
    SELECT "id", "type", "ip", "detail", "createdAt" FROM "SecurityEvent"
    ORDER BY "createdAt" DESC LIMIT 200`
  const [stats]: {
    failedLastHour: number
    failedLast24h: number
    blockedLast24h: number
    consecutiveFailures: number
  }[] = await prisma.$queryRaw`
    SELECT
      COUNT(*) FILTER (WHERE "type" = 'login_failed' AND "createdAt" > NOW() - INTERVAL '1 hour')::int AS "failedLastHour",
      COUNT(*) FILTER (WHERE "type" = 'login_failed' AND "createdAt" > NOW() - INTERVAL '24 hours')::int AS "failedLast24h",
      COUNT(*) FILTER (WHERE "type" IN ('login_rate_limited', 'login_locked', 'checkout_rate_limited', 'webhook_bad_signature', 'payment_amount_mismatch') AND "createdAt" > NOW() - INTERVAL '24 hours')::int AS "blockedLast24h",
      COUNT(*) FILTER (
        WHERE "type" = 'login_failed'
          AND "createdAt" > COALESCE(
            (SELECT MAX("createdAt") FROM "SecurityEvent" WHERE "type" = 'login_success'),
            'epoch'::timestamp)
      )::int AS "consecutiveFailures"
    FROM "SecurityEvent"`
  const alert =
    stats.consecutiveFailures >= 5 || stats.failedLastHour >= 5 || stats.blockedLast24h > 0
  return { events, stats, alert }
}

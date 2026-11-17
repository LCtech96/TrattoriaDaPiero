-- =====================================================================
-- Trattoria Da Piero - Tabelle di sicurezza (rate limit e registro eventi)
-- =====================================================================
-- NON serve eseguirlo a mano: il sito crea queste tabelle da solo al primo
-- utilizzo (lib/security.ts). Lo script è qui come documentazione e per chi
-- preferisce crearle in anticipo. È idempotente.
-- =====================================================================

CREATE TABLE IF NOT EXISTS "RateLimit" (
  "key" TEXT PRIMARY KEY,
  "count" INTEGER NOT NULL DEFAULT 0,
  "windowStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "SecurityEvent" (
  "id" SERIAL PRIMARY KEY,
  "type" TEXT NOT NULL,
  "ip" TEXT,
  "detail" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "SecurityEvent_createdAt_idx" ON "SecurityEvent" ("createdAt");
CREATE INDEX IF NOT EXISTS "SecurityEvent_type_createdAt_idx" ON "SecurityEvent" ("type", "createdAt");

-- Chiuse all'API pubblica di Supabase: le legge solo il sito via Prisma.
ALTER TABLE "RateLimit" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SecurityEvent" ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE r TEXT;
BEGIN
  FOREACH r IN ARRAY ARRAY['anon', 'authenticated'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = r) THEN
      EXECUTE format('REVOKE ALL ON TABLE "RateLimit", "SecurityEvent" FROM %I', r);
      EXECUTE format('REVOKE ALL ON SEQUENCE "SecurityEvent_id_seq" FROM %I', r);
    END IF;
  END LOOP;
END $$;

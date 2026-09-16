-- =====================================================================
-- Trattoria Da Piero - Correzione degli avvisi di sicurezza Supabase
-- =====================================================================
-- Incolla tutto questo file nel SQL Editor di Supabase ed esegui.
-- È idempotente: si può rilanciare quante volte serve.
--
-- PERCHÉ ARRIVANO QUELLE EMAIL
-- Le tabelle create da Prisma finiscono nello schema "public". Supabase
-- espone automaticamente lo schema "public" tramite l'API REST (PostgREST)
-- ai ruoli "anon" (chiave pubblica, presente in qualunque browser) e
-- "authenticated". Senza Row Level Security chiunque conosca l'URL del
-- progetto e la anon key può leggere — e in molti casi scrivere — tutte le
-- righe. Con le tabelle Order/Payment questo significa nomi, email, indirizzi
-- e importi dei clienti: dati personali.
--
-- COSA FA QUESTO SCRIPT
--  1. Attiva RLS su tutte le tabelle di "public" senza creare policy.
--     Nessuna policy = nessun accesso via API pubblica. L'app continua a
--     funzionare perché Prisma si collega in Postgres con il ruolo
--     proprietario delle tabelle, che non è soggetto a RLS.
--  2. Revoca i permessi di "anon" e "authenticated" su tabelle, sequenze e
--     funzioni: seconda barriera, nel caso una policy venga aggiunta per errore.
--  3. Blocca i privilegi di default, così le tabelle create in futuro
--     nascono già chiuse.
--  4. Fissa il search_path delle funzioni di "public" (avviso
--     "function_search_path_mutable").
--  5. Elenca a fine script quello che resta da sistemare a mano.
--
-- ATTENZIONE: esegui questo script solo se l'applicazione parla con il
-- database via Prisma/connessione Postgres diretta (è il caso di questo
-- sito). Se in futuro userai la libreria supabase-js dal browser dovrai
-- scrivere policy RLS esplicite per le tabelle che vuoi esporre.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. Row Level Security su tutte le tabelle dello schema public
-- ---------------------------------------------------------------------
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT c.relname
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind = 'r'          -- solo tabelle ordinarie
      AND c.relname <> '_prisma_migrations'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', r.relname);
    RAISE NOTICE 'RLS attivata su public.%', r.relname;
  END LOOP;
END
$$;

-- La tabella delle migrazioni di Prisma, se esiste, va chiusa allo stesso modo.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = '_prisma_migrations'
  ) THEN
    EXECUTE 'ALTER TABLE public._prisma_migrations ENABLE ROW LEVEL SECURITY;';
  END IF;
END
$$;


-- ---------------------------------------------------------------------
-- 2. Revoca dei permessi ai ruoli pubblici dell'API
-- ---------------------------------------------------------------------
REVOKE ALL ON ALL TABLES    IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon, authenticated;

-- "anon" non deve nemmeno poter elencare gli oggetti dello schema.
REVOKE USAGE ON SCHEMA public FROM anon;

-- Il ruolo PUBLIC eredita permessi a chiunque: togliamo anche quelli.
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC;


-- ---------------------------------------------------------------------
-- 3. Privilegi di default: le tabelle future nascono già chiuse
-- ---------------------------------------------------------------------
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  REVOKE ALL ON TABLES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  REVOKE ALL ON SEQUENCES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  REVOKE ALL ON FUNCTIONS FROM anon, authenticated;

-- Stessa cosa per gli oggetti creati dal ruolo postgres (quello usato da Prisma).
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL ON TABLES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL ON SEQUENCES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL ON FUNCTIONS FROM anon, authenticated;


-- ---------------------------------------------------------------------
-- 4. search_path fisso sulle funzioni (avviso function_search_path_mutable)
-- ---------------------------------------------------------------------
-- Una funzione senza search_path fisso può essere dirottata: chi riesce a
-- creare un oggetto in uno schema che precede "public" nel search_path del
-- chiamante fa eseguire il proprio codice al posto di quello atteso.
DO $$
DECLARE
  f RECORD;
BEGIN
  FOR f IN
    SELECT p.oid::regprocedure AS signature
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prokind IN ('f', 'p')
      AND (p.proconfig IS NULL OR NOT EXISTS (
        SELECT 1 FROM unnest(p.proconfig) cfg WHERE cfg LIKE 'search_path=%'
      ))
  LOOP
    EXECUTE format('ALTER FUNCTION %s SET search_path = public, pg_temp;', f.signature);
    RAISE NOTICE 'search_path fissato su %', f.signature;
  END LOOP;
END
$$;


-- ---------------------------------------------------------------------
-- 5. Viste SECURITY DEFINER (avviso security_definer_view)
-- ---------------------------------------------------------------------
-- Una vista SECURITY DEFINER gira con i permessi di chi l'ha creata e
-- aggira la RLS di chi la interroga. Qui le elenchiamo soltanto: vanno
-- riscritte una per una, perché toccarle a tappeto può rompere query esistenti.
DO $$
DECLARE
  v RECORD;
  found BOOLEAN := false;
BEGIN
  FOR v IN
    SELECT c.relname
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind = 'v'
      AND EXISTS (
        SELECT 1 FROM unnest(c.reloptions) opt WHERE opt ILIKE 'security_invoker=%false%'
      )
  LOOP
    found := true;
    RAISE NOTICE 'DA CONTROLLARE: la vista public.% non usa security_invoker', v.relname;
  END LOOP;
  IF NOT found THEN
    RAISE NOTICE 'Nessuna vista SECURITY DEFINER da correggere.';
  END IF;
END
$$;


-- ---------------------------------------------------------------------
-- 6. Verifica finale
-- ---------------------------------------------------------------------
-- Dopo l'esecuzione questa query non deve restituire NESSUNA riga.
SELECT
  c.relname AS tabella_senza_rls
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND c.relrowsecurity = false;


-- =====================================================================
-- DA FARE A MANO NELLA DASHBOARD SUPABASE (non si può fare via SQL)
-- =====================================================================
-- a) Authentication → Policies → "Leaked password protection": ATTIVALA.
--    Corrisponde all'avviso auth_leaked_password_protection.
-- b) Authentication → Providers → Email → "OTP expiry": portalo a 3600
--    secondi o meno (avviso auth_otp_long_expiry).
-- c) Authentication → MFA: abilita almeno TOTP (avviso
--    insufficient_mfa_options).
-- d) Settings → Database → "Postgres version": applica gli aggiornamenti
--    disponibili (avviso vulnerable_postgres_version).
-- e) Settings → Database → Network Restrictions: limita gli IP che possono
--    collegarsi direttamente al database.
-- f) RUOTA LA PASSWORD DEL DATABASE. La stringa di connessione completa,
--    password inclusa, era stata committata nel file env.example del
--    repository: va considerata compromessa. Settings → Database →
--    Reset database password, poi aggiorna DATABASE_URL su Vercel.
-- =====================================================================

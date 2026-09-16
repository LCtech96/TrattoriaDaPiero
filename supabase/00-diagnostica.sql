-- =====================================================================
-- Diagnostica: cosa c'è già nel database
-- =====================================================================
-- Esegui questo file per primo, così si vede se esistono già tabelle
-- Product/Order/OrderItem/Payment e con quale struttura.
-- Non modifica niente: fa solo delle SELECT.
-- =====================================================================

-- 1. Tutte le tabelle dello schema public e il loro stato RLS.
SELECT
  c.relname        AS tabella,
  c.relrowsecurity AS rls_attiva,
  (SELECT count(*) FROM pg_policy p WHERE p.polrelid = c.oid) AS numero_policy
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind = 'r'
ORDER BY c.relname;

-- 2. Struttura delle tabelle e-commerce, se già presenti.
SELECT
  table_name  AS tabella,
  column_name AS colonna,
  data_type   AS tipo,
  is_nullable AS accetta_null,
  column_default AS valore_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('Product', 'Order', 'OrderItem', 'Payment')
ORDER BY table_name, ordinal_position;

-- 3. Quante righe contengono (per capire se sono dati veri o tabelle vuote).
--    Il SQL Editor di Supabase non mostra i messaggi NOTICE, quindi il
--    conteggio arriva come tabella di risultati.
SELECT
  c.relname AS tabella,
  (SELECT n_live_tup FROM pg_stat_user_tables t WHERE t.relid = c.oid) AS righe_circa
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
  AND c.relname IN ('Product', 'Order', 'OrderItem', 'Payment')
ORDER BY c.relname;

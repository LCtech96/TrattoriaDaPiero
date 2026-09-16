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
DO $$
DECLARE
  t TEXT;
  n BIGINT;
BEGIN
  FOREACH t IN ARRAY ARRAY['Product', 'Order', 'OrderItem', 'Payment'] LOOP
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = t) THEN
      EXECUTE format('SELECT count(*) FROM public.%I', t) INTO n;
      RAISE NOTICE 'Tabella % : % righe', t, n;
    ELSE
      RAISE NOTICE 'Tabella % : non esiste', t;
    END IF;
  END LOOP;
END
$$;

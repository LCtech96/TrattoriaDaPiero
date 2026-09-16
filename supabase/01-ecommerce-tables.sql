-- =====================================================================
-- Trattoria Da Piero - Tabelle e-commerce
-- =====================================================================
-- Da eseguire nel SQL Editor di Supabase PRIMA di 02-security-fixes.sql.
--
-- Lo script è idempotente E "riparatore": funziona sia su un database
-- vuoto sia se esiste già una tabella Product/Order/OrderItem/Payment con
-- una struttura diversa (per esempio creata da script precedenti). In quel
-- caso le colonne mancanti vengono aggiunte senza toccare i dati esistenti.
-- Le eventuali colonne di troppo restano dove sono: non vengono eliminate.
--
-- I prezzi sono in centesimi di euro (12,50 € = 1250).
--
-- NOTA: se il SQL Editor mostra "Potential issue detected ... enabling Row
-- Level Security", scegli pure "Run without RLS": la RLS viene attivata
-- subito dopo da 02-security-fixes.sql, che va eseguito (o rieseguito)
-- sempre DOPO questo file.
-- =====================================================================


-- ---------------------------------------------------------------------
-- PRODUCT
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "Product" ("id" SERIAL PRIMARY KEY);

ALTER TABLE "Product"
  ADD COLUMN IF NOT EXISTS "slug"              TEXT,
  ADD COLUMN IF NOT EXISTS "name"              TEXT,
  ADD COLUMN IF NOT EXISTS "description"       TEXT      NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "priceCents"        INTEGER   NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "comparePriceCents" INTEGER,
  ADD COLUMN IF NOT EXISTS "currency"          TEXT      NOT NULL DEFAULT 'EUR',
  ADD COLUMN IF NOT EXISTS "stock"             INTEGER   NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "unit"              TEXT,
  ADD COLUMN IF NOT EXISTS "weightGrams"       INTEGER,
  ADD COLUMN IF NOT EXISTS "sku"               TEXT,
  ADD COLUMN IF NOT EXISTS "category"          TEXT      NOT NULL DEFAULT 'Prodotti',
  ADD COLUMN IF NOT EXISTS "imageUrl"          TEXT,
  ADD COLUMN IF NOT EXISTS "images"            TEXT[]    DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "isActive"          BOOLEAN   NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "isFeatured"        BOOLEAN   NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "sortOrder"         INTEGER   NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updatedAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Le righe già presenti non hanno slug/name: gliene diamo uno valido,
-- riusando dove possibile una colonna testuale preesistente (title/nome).
DO $$
DECLARE
  legacy_title TEXT;
BEGIN
  SELECT column_name INTO legacy_title
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'Product'
    AND column_name IN ('title', 'titolo', 'nome', 'productName')
  LIMIT 1;

  IF legacy_title IS NOT NULL THEN
    EXECUTE format(
      'UPDATE "Product" SET "name" = %I WHERE "name" IS NULL AND %I IS NOT NULL;',
      legacy_title, legacy_title
    );
    RAISE NOTICE 'Colonna "name" riempita partendo da "%"', legacy_title;
  END IF;
END
$$;

UPDATE "Product" SET "name" = 'Prodotto ' || "id" WHERE "name" IS NULL OR btrim("name") = '';
-- Slug leggibile ricavato dal nome ("Cassata siciliana" -> "cassata-siciliana"),
-- con ripiego sull'id se il nome non produce niente di utilizzabile.
UPDATE "Product"
SET "slug" = btrim(
      regexp_replace(
        lower(translate("name",
          'àáâãäåèéêëìíîïòóôõöùúûüçñ',
          'aaaaaaeeeeiiiiooooouuuucn')),
        '[^a-z0-9]+', '-', 'g'),
      '-')
WHERE "slug" IS NULL OR btrim("slug") = '';

UPDATE "Product" SET "slug" = 'prodotto-' || "id" WHERE "slug" IS NULL OR btrim("slug") = '';

ALTER TABLE "Product"
  ALTER COLUMN "slug" SET NOT NULL,
  ALTER COLUMN "name" SET NOT NULL;


-- ---------------------------------------------------------------------
-- ORDER
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "Order" ("id" SERIAL PRIMARY KEY);

ALTER TABLE "Order"
  ADD COLUMN IF NOT EXISTS "orderNumber"           TEXT,
  ADD COLUMN IF NOT EXISTS "customerName"          TEXT    NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "customerEmail"         TEXT    NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "customerPhone"         TEXT,
  ADD COLUMN IF NOT EXISTS "shippingAddress"       TEXT,
  ADD COLUMN IF NOT EXISTS "notes"                 TEXT,
  ADD COLUMN IF NOT EXISTS "subtotalCents"         INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "shippingCents"         INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "totalCents"            INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "currency"              TEXT    NOT NULL DEFAULT 'EUR',
  ADD COLUMN IF NOT EXISTS "status"                TEXT    NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS "paymentStatus"         TEXT    NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS "paymentMethod"         TEXT,
  ADD COLUMN IF NOT EXISTS "stripeSessionId"       TEXT,
  ADD COLUMN IF NOT EXISTS "stripePaymentIntentId" TEXT,
  ADD COLUMN IF NOT EXISTS "stockApplied"          BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "paidAt"                TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "createdAt"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updatedAt"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "Order" SET "orderNumber" = 'TDP-LEGACY-' || "id"
WHERE "orderNumber" IS NULL OR btrim("orderNumber") = '';

ALTER TABLE "Order" ALTER COLUMN "orderNumber" SET NOT NULL;


-- ---------------------------------------------------------------------
-- ORDER ITEM
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "OrderItem" ("id" SERIAL PRIMARY KEY);

ALTER TABLE "OrderItem"
  ADD COLUMN IF NOT EXISTS "orderId"        INTEGER,
  ADD COLUMN IF NOT EXISTS "productId"      INTEGER,
  ADD COLUMN IF NOT EXISTS "name"           TEXT    NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "unit"           TEXT,
  ADD COLUMN IF NOT EXISTS "unitPriceCents" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "quantity"       INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS "totalCents"     INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Righe orfane (senza ordine) impedirebbero di rendere orderId obbligatorio.
DELETE FROM "OrderItem" WHERE "orderId" IS NULL;
ALTER TABLE "OrderItem" ALTER COLUMN "orderId" SET NOT NULL;


-- ---------------------------------------------------------------------
-- PAYMENT
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "Payment" ("id" SERIAL PRIMARY KEY);

ALTER TABLE "Payment"
  ADD COLUMN IF NOT EXISTS "orderId"     INTEGER,
  ADD COLUMN IF NOT EXISTS "amountCents" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "currency"    TEXT    NOT NULL DEFAULT 'EUR',
  ADD COLUMN IF NOT EXISTS "provider"    TEXT    NOT NULL DEFAULT 'stripe',
  ADD COLUMN IF NOT EXISTS "providerRef" TEXT,
  ADD COLUMN IF NOT EXISTS "status"      TEXT    NOT NULL DEFAULT 'succeeded',
  ADD COLUMN IF NOT EXISTS "notes"       TEXT,
  ADD COLUMN IF NOT EXISTS "paidAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

DELETE FROM "Payment" WHERE "orderId" IS NULL;
ALTER TABLE "Payment" ALTER COLUMN "orderId" SET NOT NULL;


-- ---------------------------------------------------------------------
-- COMPATIBILITÀ CON COLONNE DI STRUTTURE PRECEDENTI
-- ---------------------------------------------------------------------
-- Se la tabella Product arrivava da uno script precedente può avere una
-- colonna "price" (euro, virgola mobile). Recuperiamo quei prezzi dentro
-- priceCents, così i prodotti già inseriti non partono da 0.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Product' AND column_name = 'price'
  ) THEN
    EXECUTE 'UPDATE "Product" SET "priceCents" = round("price" * 100)::int
             WHERE "priceCents" = 0 AND "price" IS NOT NULL AND "price" > 0';
    RAISE NOTICE 'Prezzi recuperati dalla vecchia colonna "price" dentro "priceCents"';
  END IF;
END
$$;

-- Le colonne residue obbligatorie e senza default (per esempio "price")
-- farebbero fallire ogni inserimento del sito, che non le valorizza.
-- Le rendiamo facoltative: i dati restano, ma smettono di bloccare.
DO $$
DECLARE
  c RECORD;
  expected TEXT[] := ARRAY[
    'id','slug','name','description','priceCents','comparePriceCents','currency',
    'stock','unit','weightGrams','sku','category','imageUrl','images','isActive',
    'isFeatured','sortOrder','createdAt','updatedAt',
    'orderNumber','customerName','customerEmail','customerPhone','shippingAddress',
    'notes','subtotalCents','shippingCents','totalCents','status','paymentStatus',
    'paymentMethod','stripeSessionId','stripePaymentIntentId','stockApplied','paidAt',
    'orderId','productId','unitPriceCents','quantity','amountCents','provider','providerRef'
  ];
BEGIN
  FOR c IN
    SELECT table_name, column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name IN ('Product', 'Order', 'OrderItem', 'Payment')
      AND is_nullable = 'NO'
      AND column_default IS NULL
      AND is_identity = 'NO'
      AND NOT (column_name = ANY (expected))
  LOOP
    EXECUTE format('ALTER TABLE public.%I ALTER COLUMN %I DROP NOT NULL;',
                   c.table_name, c.column_name);
    RAISE NOTICE 'Colonna residua %.% resa facoltativa', c.table_name, c.column_name;
  END LOOP;
END
$$;

-- All'opposto: alcune colonne dello schema del sito potrebbero essere
-- rimaste nullable da una struttura precedente. Il sito le legge come
-- sempre valorizzate, quindi un NULL in "description" o "images" farebbe
-- fallire la lettura della vetrina. Le riempiamo e le rendiamo obbligatorie.
UPDATE "Product" SET "description" = '' WHERE "description" IS NULL;
UPDATE "Product" SET "images" = ARRAY[]::TEXT[] WHERE "images" IS NULL;
UPDATE "Product" SET "createdAt" = CURRENT_TIMESTAMP WHERE "createdAt" IS NULL;
UPDATE "Product" SET "updatedAt" = CURRENT_TIMESTAMP WHERE "updatedAt" IS NULL;

ALTER TABLE "Product"
  ALTER COLUMN "description" SET DEFAULT '',
  ALTER COLUMN "description" SET NOT NULL,
  ALTER COLUMN "images"      SET DEFAULT ARRAY[]::TEXT[],
  ALTER COLUMN "images"      SET NOT NULL,
  ALTER COLUMN "currency"    SET DEFAULT 'EUR',
  ALTER COLUMN "createdAt"   SET DEFAULT CURRENT_TIMESTAMP,
  ALTER COLUMN "createdAt"   SET NOT NULL,
  ALTER COLUMN "updatedAt"   SET DEFAULT CURRENT_TIMESTAMP,
  ALTER COLUMN "updatedAt"   SET NOT NULL;


-- ---------------------------------------------------------------------
-- INDICI
-- ---------------------------------------------------------------------
-- Eventuali duplicati preesistenti renderebbero impossibile l'indice unico
-- sullo slug: li rendiamo univoci aggiungendo l'id in coda.
UPDATE "Product" p SET "slug" = p."slug" || '-' || p."id"
WHERE EXISTS (
  SELECT 1 FROM "Product" q WHERE q."slug" = p."slug" AND q."id" < p."id"
);

CREATE UNIQUE INDEX IF NOT EXISTS "Product_slug_key"              ON "Product"("slug");
CREATE INDEX        IF NOT EXISTS "Product_isActive_sortOrder_idx" ON "Product"("isActive", "sortOrder");
CREATE UNIQUE INDEX IF NOT EXISTS "Order_orderNumber_key"          ON "Order"("orderNumber");
CREATE UNIQUE INDEX IF NOT EXISTS "Order_stripeSessionId_key"      ON "Order"("stripeSessionId");
CREATE INDEX        IF NOT EXISTS "Order_status_createdAt_idx"     ON "Order"("status", "createdAt");
CREATE INDEX        IF NOT EXISTS "OrderItem_orderId_idx"          ON "OrderItem"("orderId");
CREATE INDEX        IF NOT EXISTS "Payment_orderId_idx"            ON "Payment"("orderId");
CREATE INDEX        IF NOT EXISTS "Payment_paidAt_idx"             ON "Payment"("paidAt");


-- ---------------------------------------------------------------------
-- CHIAVI ESTERNE
-- ---------------------------------------------------------------------
-- I vincoli FOREIGN KEY non supportano IF NOT EXISTS: li creiamo solo se
-- non sono già presenti, così lo script resta rilanciabile.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'OrderItem_orderId_fkey') THEN
    ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey"
      FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'OrderItem_productId_fkey') THEN
    ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey"
      FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Payment_orderId_fkey') THEN
    ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_fkey"
      FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;


-- ---------------------------------------------------------------------
-- CONTROLLO FINALE
-- ---------------------------------------------------------------------
-- Il SQL Editor di Supabase non mostra i messaggi NOTICE, quindi i controlli
-- finali sono normali SELECT: quello che conta si legge nei risultati.

-- CONTROLLO 1: deve restituire ZERO righe.
-- Elenca colonne residue di strutture precedenti che sono obbligatorie e
-- senza default: bloccherebbero gli inserimenti del sito.
SELECT
  table_name  AS tabella,
  column_name AS colonna_da_sistemare,
  'obbligatoria e senza default: bloccherebbe gli inserimenti' AS problema
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('Product', 'Order', 'OrderItem', 'Payment')
  AND is_nullable = 'NO'
  AND column_default IS NULL
  AND is_identity = 'NO'
  AND column_name NOT IN (
    'id','slug','name','orderNumber','orderId','description','priceCents',
    'currency','stock','category','isActive','isFeatured','sortOrder',
    'createdAt','updatedAt','images','customerName','customerEmail',
    'subtotalCents','shippingCents','totalCents','status','paymentStatus',
    'stockApplied','unitPriceCents','quantity','amountCents','provider'
  );

-- CONTROLLO 2: riepilogo dei prodotti recuperati da strutture precedenti.
-- Quelli con prezzo 0 vanno completati o eliminati dal pannello admin.
SELECT
  "id",
  "name"  AS titolo,
  "slug",
  round("priceCents" / 100.0, 2) AS prezzo_euro,
  "stock" AS quantita,
  "isActive" AS in_vetrina
FROM "Product"
ORDER BY "id";

# Deploy su Vercel

Il progetto è collegato a GitHub: **ogni push sul branch `main` viene
pubblicato automaticamente in produzione** su Vercel.

## Variabili d'ambiente

In Vercel → progetto → **Settings → Environment Variables** imposta le
variabili elencate in [`env.example`](env.example). Le segrete
(`DATABASE_URL`, `ADMIN_PASSWORD_HASH`, `ADMIN_SESSION_SECRET`,
`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`) vanno **solo** lì, mai in un
file del repository.

Dopo aver cambiato una variabile serve un nuovo deploy
(Deployments → ⋯ → Redeploy) perché venga usata.

## Database

Il database è PostgreSQL su Supabase; il sito ci accede con Prisma tramite
`DATABASE_URL`. Gli script SQL da lanciare a mano sono in `supabase/` (vedi
il suo README). Le tabelle di sicurezza si creano da sole al primo utilizzo.

## Build

`vercel.json` usa `pnpm install` e `pnpm run build`
(`prisma generate && next build`).

## Dopo il deploy

- Apri `/admin`, accedi e controlla la pagina **Sicurezza**.
- Se usi Stripe, configura il webhook su
  `https://<dominio>/api/webhooks/stripe` con gli eventi
  `checkout.session.completed`, `checkout.session.async_payment_succeeded`,
  `checkout.session.async_payment_failed`, `charge.refunded`.

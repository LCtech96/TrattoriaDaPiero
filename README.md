# Trattoria Da Piero — sito web

Sito della Trattoria Da Piero a Mondello (Palermo): menù, storia, ospiti VIP,
mappa, ordini al tavolo/asporto via WhatsApp e shop online con Stripe.

**Tecnologie:** Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS ·
Prisma · PostgreSQL su Supabase · Stripe · hosting su Vercel.

## Avvio in locale

```bash
pnpm install
cp env.example .env.local   # poi compila i valori (vedi sotto)
pnpm dev
```

## Variabili d'ambiente

L'elenco completo, con spiegazioni, è in [`env.example`](env.example).
**Non scrivere mai valori reali (password, chiavi) in file del repository:**
il repository è pubblico. I valori veri vanno solo nelle impostazioni del
progetto su Vercel (Settings → Environment Variables) o in `.env.local`, che
è escluso da git.

| Variabile | Segreta | A cosa serve |
| --- | --- | --- |
| `DATABASE_URL` | sì | Connessione al database Supabase |
| `ADMIN_EMAIL` | no | Email dell'admin |
| `ADMIN_PASSWORD_HASH` | sì | Hash della password admin (mai la password in chiaro) |
| `ADMIN_SESSION_SECRET` | sì | Firma del cookie di sessione (min. 32 caratteri) |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | sì | Pagamenti online (facoltativi) |
| `NEXT_PUBLIC_*` | no | Contatti e URL pubblici mostrati sul sito |

Per creare o cambiare la password admin:

```bash
node scripts/hash-password.mjs 'la-nuova-password'
```

Il comando stampa `ADMIN_PASSWORD_HASH` e un nuovo `ADMIN_SESSION_SECRET` da
copiare su Vercel.

## Sicurezza

- Pannello `/admin` e API di scrittura protetti da sessione firmata (cookie
  `HttpOnly`, `Secure`, `SameSite=Lax`), controllata sia nel middleware sia
  in ogni route.
- Protezione CSRF: le richieste che modificano dati devono partire dal sito.
- Rate limit condiviso su database per login e checkout (risposta 429).
- Registro degli eventi di sicurezza e avvisi in `/admin/sicurezza`.
- Immagini caricate controllate sul server (tipo, peso, contenuto reale).
- Header di sicurezza (CSP, HSTS, X-Frame-Options) in `next.config.js`.
- Prezzi sempre ricalcolati dal server; ordine pagato solo tramite webhook
  Stripe firmato e con importo verificato.

Le tabelle `RateLimit` e `SecurityEvent` vengono create automaticamente al
primo utilizzo; lo stesso SQL è in `supabase/03-security-tables.sql`.

Altri dettagli: [`DEPLOY.md`](DEPLOY.md), [`ECOMMERCE.md`](ECOMMERCE.md),
[`supabase/README.md`](supabase/README.md).

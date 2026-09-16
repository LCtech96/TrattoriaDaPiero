# Sezione E-commerce

## Cosa è stato aggiunto

| Pagina | Percorso | A cosa serve |
| --- | --- | --- |
| Vetrina | `/ecommerce` | Elenco prodotti con ricerca e filtro per categoria |
| Scheda prodotto | `/ecommerce/[slug]` | Galleria, descrizione, misura, disponibilità |
| Carrello e checkout | `/ecommerce/carrello` | Dati cliente e pagamento con Stripe |
| Conferma ordine | `/ecommerce/ordine` | Pagina di ritorno dopo il pagamento |
| Admin prodotti | `/admin/ecommerce` | Crea, modifica ed elimina prodotti |
| Admin ordini | `/admin/ecommerce/ordini` | Ordini ricevuti, incassi, pagamenti manuali |

Dal pannello admin si gestiscono per ogni prodotto: **titolo, descrizione,
prezzo, prezzo barrato, quantità disponibile, misura/formato, peso, codice
SKU, categoria, immagine, visibilità in vetrina, ordine di comparsa**.

## Configurazione

Copia `env.example` in `.env.local` (in locale) o inserisci le variabili nel
pannello del tuo hosting, poi riempi:

### 1. Accesso admin

```bash
node scripts/hash-password.mjs 'la-tua-password'
```

Il comando stampa `ADMIN_PASSWORD_HASH` e `ADMIN_SESSION_SECRET`. Insieme a
`ADMIN_EMAIL` sono le tre variabili necessarie al login. La password in chiaro
non viene mai salvata da nessuna parte.

### 2. Stripe

1. Crea un account su [stripe.com](https://stripe.com) e passa in modalità live.
2. Developers → API keys → copia la **Secret key** in `STRIPE_SECRET_KEY`.
3. Developers → Webhooks → Add endpoint:
   - URL: `https://iltuodominio.it/api/webhooks/stripe`
   - Eventi: `checkout.session.completed`,
     `checkout.session.async_payment_succeeded`,
     `checkout.session.async_payment_failed`, `charge.refunded`
4. Copia il **Signing secret** in `STRIPE_WEBHOOK_SECRET`.
5. Imposta `NEXT_PUBLIC_SITE_URL` sul dominio pubblico del sito.

Senza le chiavi Stripe il sito resta funzionante: gli ordini vengono
registrati come "da incassare" e l'admin li chiude a mano dal pannello.

### 3. Spedizione (opzionale)

`SHOP_SHIPPING_CENTS` è il costo fisso di spedizione in centesimi
(`0` = gratuita). `SHOP_FREE_SHIPPING_OVER_CENTS` è la soglia oltre la quale
la spedizione diventa gratuita.

## Come funzionano i pagamenti

1. Il cliente compila il carrello e i suoi dati.
2. Il server **rilegge i prezzi dal database** (i prezzi inviati dal browser
   non vengono mai usati), verifica la disponibilità e crea l'ordine come
   `pending`.
3. Il cliente paga sulla pagina sicura di Stripe.
4. Stripe chiama il webhook, di cui viene **sempre verificata la firma**.
   Solo allora l'ordine passa a `paid`, viene creata la riga in `Payment` e
   la quantità a magazzino viene scalata (una sola volta per ordine).
5. L'admin vede ordine e incasso in `/admin/ecommerce/ordini`.

Per contanti, bonifico o POS l'admin registra l'incasso a mano dalla stessa
pagina: viene creata la stessa riga in `Payment` e lo stock viene scalato
esattamente come per un pagamento Stripe.

## Sicurezza dell'area admin

L'accesso non è più un flag in `sessionStorage` (che chiunque poteva
impostare dalla console del browser). Ora:

- la password viene verificata **sul server** contro un hash PBKDF2;
- la sessione è un token firmato HMAC in un cookie `httpOnly`, valido 8 ore;
- un `middleware.ts` protegge tutte le pagine `/admin/*` e blocca ogni
  richiesta di scrittura alle API a chi non è autenticato — incluse quelle
  di post, VIP e immagini, che prima erano aperte a chiunque;
- il login ha un limite di tentativi per rallentare gli attacchi a forza bruta.

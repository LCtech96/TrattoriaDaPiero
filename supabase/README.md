# Database Supabase — istruzioni

## Ordine di esecuzione

Apri Supabase → **SQL Editor** → **New query**, incolla ed esegui:

1. `01-ecommerce-tables.sql` — crea le tabelle `Product`, `Order`, `OrderItem`, `Payment`.
2. `02-security-fixes.sql` — chiude le vulnerabilità segnalate via email dal Security Advisor.

Entrambi gli script sono idempotenti: rilanciarli non causa danni.

## Perché arrivavano le email di vulnerabilità

Le tabelle create da Prisma finiscono nello schema `public`, che Supabase
espone automaticamente via API REST ai ruoli `anon` e `authenticated`. La
chiave `anon` è pubblica per definizione. Senza Row Level Security chiunque
poteva leggere le tabelle — comprese, da oggi, quelle con nomi, email,
indirizzi e importi dei clienti.

Lo script 02 attiva RLS **senza creare policy**: nessuna policy significa
nessun accesso via API pubblica. L'applicazione continua a funzionare perché
Prisma si collega con il ruolo proprietario delle tabelle, che non è soggetto
a RLS.

## Cosa resta da fare a mano

Alcuni avvisi riguardano impostazioni della dashboard e non si possono
correggere via SQL. Sono elencati in fondo a `02-security-fixes.sql`:
protezione password compromesse, scadenza OTP, MFA, versione di Postgres,
restrizioni di rete e — la più urgente — la **rotazione della password del
database**, che era finita in chiaro nel repository.

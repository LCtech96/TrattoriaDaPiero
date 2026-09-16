# Database Supabase — istruzioni

## Ordine di esecuzione

Apri Supabase → **SQL Editor** → **New query**, incolla ed esegui:

0. `00-diagnostica.sql` — *facoltativo*: mostra cosa c'è già nel database. Non modifica niente.
1. `01-ecommerce-tables.sql` — crea le tabelle `Product`, `Order`, `OrderItem`, `Payment`.
2. `02-security-fixes.sql` — chiude le vulnerabilità segnalate via email dal Security Advisor.

Gli script sono idempotenti: rilanciarli non causa danni.

Se il SQL Editor mostra **"Potential issue detected — this query creates tables
without enabling Row Level Security"** mentre esegui il file 01, scegli pure
**"Run without RLS"**: la RLS viene attivata subito dopo dal file 02.

### Se avevi già una tabella Product (o Order, OrderItem, Payment)

Succede se in passato hai eseguito altri script SQL. Il file 01 se ne accorge:
invece di fallire, **aggiunge le colonne mancanti** alla tabella esistente
senza toccare i dati già presenti, generando `slug` e `name` per le righe
vecchie (e riusando una colonna `title`/`nome` se c'è). Le righe recuperate
compaiono nel pannello admin con prezzo 0 e quantità 0: vanno completate a
mano o eliminate.

Il file 01 recupera anche i prezzi da un'eventuale vecchia colonna `price`
(in euro) dentro `priceCents`, genera slug leggibili dai nomi e rende
facoltative le colonne residue obbligatorie — come `price` — che altrimenti
bloccherebbero ogni inserimento del sito.

Alla fine mostra due tabelle di risultati: la prima **deve essere vuota**
(elenca le colonne che restano problematiche), la seconda riepiloga i
prodotti recuperati. I prodotti con prezzo 0 vanno completati o eliminati
dal pannello admin.

**L'ordine conta**: se esegui il file 01 dopo il 02, rilancia il 02, altrimenti
le tabelle nuove restano senza RLS.

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

# 08 · Messaggi, Email (Resend) e Notifiche push

Scheda di lavoro + documentazione tecnica della sezione **Messaggi** dell'admin,
dell'invio email reale via **Resend** e delle **notifiche push** sul telefono.

> Fonte di verità = il codice. Questo file spiega il "perché" e lo stato; se
> diverge dal codice, vale il codice.

---

## 0 · Account e credenziali (promemoria)

- **Resend** — account collegato a **`dero975@gmail.com`** (login con Google).
  Pannello: <https://resend.com> → sezione *Domains*, *API keys*, *Logs*.
- **Dominio invio:** `deroarts.com` — stato **Verified** su Resend (record DKIM +
  SPF + MX `send` aggiunti via *Auto configure* su Cloudflare, region Ireland eu-west-1).
- **Chiave API:** `deroarts-site` (Full access). Valore in `RESEND_API_KEY`
  (App Control, sensibile). Mai in chiaro nel codice.
- **Ricezione posta** (email verso @deroarts.com) è su **Resend Inbound**: il
  record **MX del dominio punta direttamente a Resend** (AWS `inbound-smtp`), non
  più a Zoho. **Zoho è stato dismesso** (era solo email di test). Resend fa quindi
  sia **invio** sia **ricezione**. Vedi `07-dominio-email.md`.

---

## 1 · Scheda di lavoro (stato lavori)

Legenda: ✅ fatto · 🔄 in corso · ⬜ da fare

| # | Attività | Stato |
|---|----------|-------|
| 1 | `.env` + variabili nuove (Resend, VAPID) | ✅ |
| 2 | `ResendMailAdapter` + switch `MAIL_MODE=resend` | ✅ |
| 3 | Migrazione DB additiva (`replied_at`, `PushSubscription`, `NotificationSetting`) | ✅ |
| 4 | Backend azioni messaggi (letto/gestito/rispondi/elimina) | ✅ |
| 5 | UI sezione **Messaggi** (tabella stile admin, filtri, badge) | ✅ |
| 6 | Dettaglio messaggio + risposta da app via Resend | ✅ |
| 7 | Notifiche push web (attivabili/disattivabili) + service worker | ✅ |
| 8 | Vista mobile nativa (card impilate) | ✅ |
| 9 | Test (typecheck 0 err, build:check OK, visivi desktop+mobile) | ✅ |
| 10 | Documentazione DNA | ✅ |
| 11 | Sync App Control + commit | 🔄 |

> **Verifica visiva superata** (Playwright, dev :5001): tabella desktop stile
> admin, dettaglio con box risposta ("Da: … / A: …"), card native su mobile,
> 0px overflow orizzontale, 0 errori console, redirect `/richieste`→`/messaggi` OK.

---

## 2 · Variabili ambiente introdotte

| Variabile | Dove | Cosa fa |
|-----------|------|---------|
| `RESEND_API_KEY` | server, sensibile | Chiave API Resend per inviare email |
| `RESEND_FROM` | server | Mittente di default se il progetto non ha `from_email` (es. `info@deroarts.com`) |
| `MAIL_MODE` | server | `fake` = Dev Outbox (dev) · `resend` = invio reale (prod) |
| `VAPID_PUBLIC_KEY` | server | Chiave pubblica push (VAPID) |
| `VAPID_PRIVATE_KEY` | server, sensibile | Chiave privata push (VAPID) |
| `VAPID_SUBJECT` | server | Contatto VAPID, es. `mailto:info@deroarts.com` |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | client | Uguale a `VAPID_PUBLIC_KEY`, serve al browser per iscriversi |

Nota: le `VAPID_*` sono generate una volta con `web-push`. **Non rigenerarle**:
se cambiano, tutte le iscrizioni push esistenti smettono di funzionare.

---

## 3 · Email transazionale (Resend)

Il sistema email usa il pattern **adapter** già presente (`lib/adapters/mail.ts`),
con uno switch su `MAIL_MODE` in `lib/adapters/index.ts`:

- `MAIL_MODE=fake` → `FakeMailAdapter` → scrive in tabella `dev_outbox` (sezione
  Dev Outbox, solo in sviluppo). **Nessuna email parte davvero.**
- `MAIL_MODE=resend` → `ResendMailAdapter` → invio reale via API Resend.

**Mittente per progetto:** ogni progetto ha un campo `from_email`
(prefisso + `@deroarts.com`, es. `stickers@deroarts.com`). Se vuoto → `RESEND_FROM`.
Questo mittente distingue le email per progetto e, in ricezione, l'alias di
destinazione permette di collegare la mail al progetto giusto (vedi §5bis).

**Quando un utente scrive dal sito** (`app/actions/requests.ts`): la richiesta
viene salvata in DB, poi partono 2 email — notifica all'owner (`ADMIN_EMAIL`) +
risposta automatica al cliente. In più scatta la **notifica push** (vedi §5).

### Passaggio da test a reale
- **In sviluppo (locale):** `MAIL_MODE=fake` di default → non consuma invii.
- **In produzione (Render):** impostare `MAIL_MODE=resend`. Vedi `05-deploy.md`.

---

## 4 · Sezione Messaggi (admin)

Percorso: `/admina/messaggi` (evoluzione della vecchia `/admina/richieste`, che
resta come alias/redirect). Dati dalla tabella `requests` (nessun dato mock).

Funzioni di gestione posta:
- **Tabella** stile admin (griglia, head bar `green-deep`, righe a colore
  alternato, riga interamente cliccabile → apre la conversazione).
- **Una riga per UTENTE (email):** tutti i messaggi inbound dello stesso indirizzo
  sono raggruppati in una sola riga (rappresentata dal messaggio più recente).
  Nessuna paginazione: si scorre. Colonne: Data · Nome · Email · Inviato a
  (casella @deroarts destinataria) · Progetto (solo testo, "—" se assente).
- **Pallino verde lampeggiante** (prima colonna) = ci sono messaggi non letti da
  quell'utente; la riga è **in grassetto**. Aprendo la conversazione, tutti i
  messaggi `new` di quell'email diventano `read` → pallino e grassetto spariscono.
- **Filtri:** ricerca (nome/email/testo) + progetto, su una riga; pulsante reset.
  La UI dei filtri per stato (Nuovi/Letti/Gestiti) è stata **rimossa**; il campo
  `status` resta nel DB solo per pilotare il pallino non-letto.
- **Dettaglio = chat:** conversazione a bolle (ricevuti sx, risposte dx) con orario
  stile WhatsApp, barra di invio in fondo (Enter invia), pulsante "copia
  conversazione". La risposta parte da `from_email` del progetto via Resend.
- **Azioni:** segna gestito, elimina (icona cestino con conferma, anche in tabella).

---

## 5 · Notifiche push (telefono)

Notifiche web push (standard W3C, funzionano su Android/desktop; su iOS solo se
il sito è "Aggiungi a schermata Home" — limite di Apple, non del codice).

- **Service worker:** `public/sw.js` — riceve l'evento `push` e mostra la notifica.
- **Iscrizione:** pannello in `/admina/impostazioni` → l'admin attiva/disattiva le
  notifiche su quel dispositivo. Le subscription sono salvate in DB
  (`push_subscriptions`), lo stato on/off in `notification_settings`.
- **Invio:** quando arriva un nuovo messaggio, il server invia la push a tutte le
  subscription attive (`lib/push/send.ts` con `web-push` + chiavi VAPID).
- **Disattivabili:** l'utente può spegnere le notifiche dal pannello (rimuove la
  subscription del dispositivo) → gestibili e reversibili, come richiesto.

---

## 5bis · Casella unificata — email @deroarts.com dentro l'app (Resend Inbound, MX diretto)

La tabella **Messaggi** mostra **due origini** (campo `source` su `requests`):
- `site` = richieste dal form del sito.
- `email` = email vere ricevute su `@deroarts.com` via **Resend Inbound**.

**Architettura (dal 2026-07-07):** il **record MX del dominio punta direttamente
a Resend** (`inbound-smtp.eu-west-1.amazonaws.com`, priorità 9). Zoho è stato
**dismesso** — MX/SPF/verifica Zoho rimossi da Cloudflare. Un solo vendor (Resend)
per invio + ricezione. Niente più inoltro intermedio, niente limiti Zoho Free.

**Come funziona il flusso:**
1. Un cliente scrive a `info@deroarts.com` (o `stickers@`, ecc.).
2. Il MX consegna a Resend, che riceve, verifica SPF/DKIM, salva la mail e chiama
   il webhook `email.received` → `POST /api/inbound/resend`.
3. L'endpoint **verifica la firma** (`standardwebhooks` + `RESEND_WEBHOOK_SECRET`),
   scarica il corpo con `resend.emails.receiving.get(email_id)`, ricava mittente
   (`parseFrom`) e progetto (dall'alias in `received_for`, `aliasLocalPart` →
   `from_email` del progetto), e salva un messaggio `source=email` con
   `reply_to_email` = mittente reale, `subject`, `inbound_email_id` (idempotenza).
4. Registra la mail nel contatore quota (§5quater) e scatta la **notifica push**.

**Rispondere:** dal dettaglio, la risposta va a `reply_to_email` (il mittente
reale) con oggetto `Re: <subject>`, inviata via Resend dall'indirizzo `@deroarts.com`.

**Limiti noti (Resend + MX diretto):**
- Solo email **da quando l'MX punta a Resend** in poi (niente storico Zoho).
- **Allegati** non importati (solo testo/HTML del corpo) — limite del codice, non di Resend.
- **Conversazioni (thread):** i messaggi con la stessa `thread_key` (interlocutore
  + oggetto normalizzato senza "Re:") sono raggruppati e mostrati come chat nel
  dettaglio (bolle: ricevuti a sinistra, risposte admin a destra). Le risposte
  inviate dal pannello sono salvate come messaggi `direction=outbound` nello stesso
  thread. La lista mostra solo i messaggi `inbound` (le risposte vivono nel thread).
  La chat ha scroll interno (max-height) per non allungare la pagina. Vedi
  `lib/inbound/thread.ts` (calcolo `thread_key`).

**Variabili:** `RESEND_WEBHOOK_SECRET` (segreto, dal webhook Resend). Nessun
indirizzo `.resend.app` intermedio: la ricezione è via MX diretto del dominio.

**Setup (già fatto una volta):**
- Cloudflare DNS → record MX `@` → `inbound-smtp.eu-west-1.amazonaws.com` prio 9
  (generato attivando "Enable Receiving" sul dominio in Resend).
- Resend → Domains → deroarts.com → **Enable Receiving** ON.
- Resend → Webhooks → URL `https://www.deroarts.com/api/inbound/resend`,
  evento `email.received`, **Signing Secret** in `RESEND_WEBHOOK_SECRET`.
- In locale il webhook non arriva (serve URL pubblico): si testa in produzione.

## 5quater · Alert di quota email (Resend Free)

Il piano gratuito Resend = **100 email/giorno** e **3.000/mese**, con **invio e
ricezione che condividono** lo stesso conteggio. Per accorgersi in tempo quando le
app crescono, il sistema conta le email e avvisa **prima** di sbattere sul limite.

- **Dove si conta:** ogni invio (`ResendMailAdapter`) e ogni ricezione (webhook
  inbound) chiama `recordEmail()` in `lib/mail/quota.ts`.
- **Tabella:** `email_counters` (una riga per giorno, `sent` + `received`).
- **Soglia:** all'**80%** del limite giornaliero (80/100) o mensile (2.400/3.000)
  parte **una** notifica push di avviso (una volta al giorno, una volta al mese).
- **Non blocca nulla:** è solo un avviso; le email continuano a partire/arrivare.
  Un errore nel conteggio non impedisce mai l'invio/ricezione.
- **Cosa fare all'avviso:** valutare il passaggio a **Resend Pro (~20 $/mese)**,
  che alza i limiti e sblocca l'overage.

## 5ter · Notifiche dalle app dei progetti (endpoint diretto)

Il modo **consigliato e senza limiti** per portare le notifiche delle tue app
(Stickers, futuri progetti) dentro Messaggi — non usa email né Zoho.

- **Endpoint:** `POST /api/inbound/app`
- **Auth:** header `x-api-key: <DEROARTS_APP_KEY>` (chiave dedicata, separata da
  `AGENT_API_KEY`, revocabile in autonomia).
- **Body JSON:**
  ```json
  {
    "project": "<slug-progetto>",   // opzionale: collega il messaggio al progetto
    "from_name": "...",             // chi/cosa ha generato la notifica
    "from_email": "...",            // opzionale: indirizzo per rispondere
    "subject": "...",               // opzionale: oggetto breve
    "message": "..."                // OBBLIGATORIO: testo
  }
  ```
- **Comportamento:** salva un messaggio in `requests` (`source=email`), collegato
  al progetto se lo slug esiste, con `reply_to_email` = from_email; scatta la push.
- **Risposte:** 401 (chiave errata/assente), 400 (message mancante o JSON non
  valido), 500 (chiave non configurata sul server), 200 `{ok:true}`.
- **Perché questa via e non l'email:** diretta, senza consumare la quota email,
  il messaggio arriva subito e già collegato al progetto. Le app che sanno solo
  mandare email possono in alternativa scrivere a un indirizzo `@deroarts.com`
  (ricevuto via Resend Inbound, vedi §5bis).

**Variabile:** `DEROARTS_APP_KEY` (segreta) — in `.env`, App Control, Render.

## 6 · Note operative / sicurezza

- Tutte le nuove tabelle hanno dati **non-PII di terzi** (subscription del solo
  admin) tranne `requests` che già esisteva; RLS invariata (accesso solo backend).
- `MAIL_MODE=fake` in locale evita invii reali durante i test.
- La chiave privata VAPID e la API key Resend non vengono mai loggate né esposte
  al client. Solo `NEXT_PUBLIC_VAPID_PUBLIC_KEY` è pubblica (per design).

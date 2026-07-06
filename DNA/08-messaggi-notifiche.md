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
- **Ricezione posta** (leggere le caselle @deroarts.com) resta su **Zoho** — vedi
  `07-dominio-email.md`. Resend serve SOLO a **inviare** dal sito.

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
| `MAIL_MODE` | server | `fake` = Dev Outbox (dev) · `resend` = invio reale · `smtp` non usato |
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
Così su Zoho puoi taggare/filtrare in base al mittente del progetto.

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

Funzioni standard di gestione posta:
- **Tabella** allo stile admin nuovo (griglia, head bar verde `green-deep`,
  colonne centrate, riga cliccabile).
- **Filtri:** per stato (Tutte / Nuove / Lette / Gestite) e per **progetto**.
- **Ricerca** per nome, email, testo.
- **Badge progetto** colorato su ogni riga (o "Generale").
- **Stato letto/non-letto** evidenziato; badge conteggio "nuovi" nella nav.
- **Dettaglio messaggio:** info mittente, testo, progetto, e **risposta da app**
  (parte da `from_email` del progetto via Resend, con la mail del cliente in reply-to).
- **Azioni:** segna letta/gestita, elimina.

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

## 5bis · Rapporto con Zoho (IMPORTANTE — cosa mostra la tabella)

La tabella **Messaggi** mostra **solo i messaggi inviati dal sito** (form
"Richiedi informazioni" → tabella `requests`). **NON** legge la posta delle
caselle Zoho (`info@`, `stickers@`, ecc.). Sono due mondi distinti:

- **App › Messaggi** = richieste generate dal sito (fonte: DB `requests`).
- **Zoho webmail** = tutte le email vere ricevute su quelle caselle (anche
  quelle scritte a mano dai clienti direttamente all'indirizzo, non dal form).

Perché non le uniamo automaticamente: leggere la casella Zoho dentro l'app
richiederebbe un accesso IMAP/API alla mailbox — è un progetto a sé, con costi
di complessità e sicurezza (credenziali mailbox nel backend, sync continua,
gestione thread). Non è quello che serve ora e non era richiesto: il flusso
"cliente → form del sito → Messaggi → rispondi" è completo e coerente.

Coerenza garantita comunque:
- Le **risposte** partono dall'indirizzo `@deroarts.com` del progetto via Resend
  con **Reply-To** = indirizzo del progetto → se il cliente risponde, la mail
  arriva nella **casella Zoho** corrispondente. Nessun messaggio si perde.
- La **notifica all'owner** di un nuovo messaggio dal sito arriva comunque anche
  via email su `ADMIN_EMAIL` (Zoho), oltre che in tabella e come push.

Se in futuro si vuole una vera casella unificata (leggere Zoho dentro l'app),
è un'estensione separata via IMAP — da valutare a parte.

## 6 · Note operative / sicurezza

- Tutte le nuove tabelle hanno dati **non-PII di terzi** (subscription del solo
  admin) tranne `requests` che già esisteva; RLS invariata (accesso solo backend).
- `MAIL_MODE=fake` in locale evita invii reali durante i test.
- La chiave privata VAPID e la API key Resend non vengono mai loggate né esposte
  al client. Solo `NEXT_PUBLIC_VAPID_PUBLIC_KEY` è pubblica (per design).

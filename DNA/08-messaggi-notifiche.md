# 08 · Contatti ed email

> Dal 2026-09-29 sostituisce la vecchia sezione **Messaggi** dell'admin, le
> notifiche push e la ricezione email via Resend (storia in [[06-decision-log]]).
> Fonte di verità = il codice.

## Come funziona
- **Un solo indirizzo:** `info@deroarts.com`. Casella su **iCloud Mail** (iCloud+ del
  proprietario, "Dominio email personalizzato"), usata dall'app Mail di iPhone/Mac.
  Opzione **"Consenti tutti i messaggi in arrivo"** attiva: qualsiasi altro indirizzo
  `@deroarts.com` (es. `badgenode@`, `stickers@`) finisce in `info@`.
- **Modulo contatti** (`/contatti` e pulsante "Richiedi informazioni" dei progetti):
  `app/actions/requests.ts` → Zod + anti-spam (`lib/security/spam.ts`) → email a `info@`
  con **Reply-To = cliente**, più conferma automatica al cliente.
  **Nessun salvataggio su DB.** Se l'invio a `info@` fallisce, il visitatore vede un
  errore: il messaggio non si perde in silenzio.
- Il dialogo col cliente prosegue **fuori dal sito**, dall'app Mail.
- **Invio:** solo via **Resend** (`ResendMailAdapter`, `MAIL_MODE=resend`), mittente
  `info@deroarts.com`. In locale `MAIL_MODE=fake` → solo console, nessun invio.

## Resend (solo invio)
- Account `dero975@gmail.com` (login Google). Dominio `deroarts.com` Verified, region Ireland.
- Chiave `RESEND_API_KEY` (App Control, sensibile). Free: 100 email/giorno, 3.000/mese
  (ogni invio del modulo = 2 email).
- Record DNS di invio sul sottodominio `send` (non toccano la posta iCloud): [[07-dominio-email]].

## Stato migrazione (aggiornare a ogni passo)
| Passo | Stato |
|---|---|
| Codice: tolti Messaggi, push, ricezione, Dev Outbox, mittente per progetto | ✅ in locale, non ancora online |
| iCloud: dominio + `info@` (verificato) | ✅ 2026-09-29 — verifica dominio Apple in corso (fino a 24h) |
| DNS Cloudflare: record iCloud al posto di Resend Inbound | ✅ 2026-09-29 (Domain Connect, verificato su 1.1.1.1 e 8.8.8.8) |
| iCloud: "Consenti tutti" + "Usa su questo iPhone" | ⬜ owner, dopo la verifica |
| Test ricezione/invio da iPhone | ⬜ |
| Deploy (Render sospeso fino al 1/10; push solo su ok owner) | ⬜ |
| Pulizia dopo il deploy: variabili su Render/App Control, Resend Receiving off, webhook eliminato | ⬜ |

## Rimasto nel DB (non più usato)
Tabelle `requests`, `push_subscriptions`, `notification_settings`, `dev_outbox`,
`email_counters` e colonna `projects.from_email`. Restano (DB mai distruttivo):
eliminarle richiede una migrazione dedicata e un ok esplicito.

## Variabili
- In uso: `MAIL_MODE`, `RESEND_API_KEY`.
- Non più usate, da togliere da Render e App Control **dopo** il deploy (servono al
  codice ancora online fino ad allora): `ADMIN_EMAIL`, `RESEND_FROM`,
  `RESEND_WEBHOOK_SECRET`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`,
  `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `DEROARTS_APP_KEY`.

## Note
- Account di servizio registrati su indirizzi del dominio: `info@` (GitHub `deroarts`,
  Render, Supabase) e `badgenode@` (account del progetto BadgeNode). Non spegnere questi
  indirizzi senza aver prima cambiato l'email di quegli account.
- L'API per agent (`/api/agent/projects`) accetta ancora `from_email`: viene salvato ma
  non usato (file oltre 300 righe, non toccato in questo intervento).
- I dispositivi che avevano attivato le notifiche push conservano il vecchio service
  worker: gestiva solo le notifiche (niente cache), quindi è innocuo.

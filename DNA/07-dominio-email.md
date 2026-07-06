# 07 — Dominio & Email (Cloudflare + Resend)

Scheda tecnica del dominio. Valori operativi reali — usarli, non reinventarli.
**Dominio corretto: `deroarts.com`** · **mai** `dero-arts.com`.

> **Aggiornamento 2026-07-07:** email migrate da **Zoho → Resend**. L'MX del
> dominio punta ora direttamente a Resend (ricezione), l'invio era già su Resend.
> **Zoho dismesso** (era solo posta di test): MX/SPF/verifica Zoho rimossi da
> Cloudflare. Dettagli flusso e alert quota in `08-messaggi-notifiche.md`.

## Cloudflare (registrar + DNS)
- Registrar **e** DNS provider: **Cloudflare** (piano Free). DNSSEC **attivo**.
- Nameserver: `michael.ns.cloudflare.com`, `ziggy.ns.cloudflare.com`.
- Record DNS totali attuali: 10 (7 email + `www` + apex `@` verso Render + `stickers` progetto a parte).
- SSL/TLS: mode **Full**, Universal + Wildcard `*.deroarts.com`, Always-Use-HTTPS on, TLS 1.2+ (1.3 on), HTTP/2+3 on, HSTS off, ACM non attivo.
- Sicurezza: Managed Ruleset + DDoS + Browser Integrity + email obfuscation **on**; Bot Fight / Under Attack **off**. AI bots: ricerca+agente consenti, addestramento **blocca**.

## Email — Resend (invio + ricezione)
- Provider unico: **Resend** (account `dero975@gmail.com`, region Ireland eu-west-1).
- Dominio `deroarts.com` **Verified**; **Enable Sending** + **Enable Receiving** ON.
- Casella pubblica: **`info@deroarts.com`** (più alias per progetto, es. `stickers@`).
- Invio: via API Resend (`ResendMailAdapter`). Ricezione: MX → Resend Inbound →
  webhook `email.received` → `/api/inbound/resend`. Vedi [[08-messaggi-notifiche]].
- **Zoho dismesso** il 2026-07-07 (era solo posta di test). Non ripristinare Zoho
  né i suoi record; non usare Cloudflare Email Routing (superfluo, Resend basta).

## Record DNS email (in Cloudflare, modalità "Solo DNS")
| Tipo | Nome | Valore | Prio |
|---|---|---|---|
| MX | @ | `inbound-smtp.eu-west-1.amazonaws.com` (ricezione Resend) | 9 |
| MX | `send` | `feedback-smtp.eu-west-1.amazonses.com` (invio Resend) | 10 |
| TXT (SPF) | `send` | `v=spf1 include:amazonses.com ~all` | — |
| TXT (DKIM) | `resend._domainkey` | `p=MIGf...IDAQAB` (chiave Resend, completa in Cloudflare) | — |
| TXT (DMARC) | `_dmarc` | `v=DMARC1; p=none; rua=mailto:info@deroarts.com` (monitoraggio; irrigidire solo dopo) | — |

> Nota: nessun record Zoho residuo in Cloudflare (MX, SPF, DKIM `zmail._domainkey`
> e TXT di verifica rimossi il 2026-07-07).

## Sito web → Render (collegato 2026-07-06)
- **`www.deroarts.com`** → CNAME `deroarts.onrender.com` (Cloudflare, **Solo DNS** / proxy off). Verificato su Render (servizio `deroarts`, id `srv-d92qjlok1i2s73d15n0g`), SSL emesso da Render. Live: `https://www.deroarts.com`.
- **`deroarts.com`** (apex) → CNAME `@` → `deroarts.onrender.com`, **Solo DNS**. Cloudflare fa CNAME-flattening (risolve a IP Render 216.24.57.x). Verificato su Render → **301 redirect a `www.deroarts.com`**. Il flattening **non tocca gli MX/TXT Zoho** (email intatte, verificato).
- Entrambi i domini `verified` + certificato emesso su Render. Con o senza `www` → arrivi al sito.

## Struttura sottodomini (convenzione)
`deroarts.com` (sito) · `demo.` · `docs.` · `status.` · `<app>.` (app/progetto) · `admin.<app>.` · `api.<app>.`
Esempi futuri: `barnode.` `aquilanera.` `ccv.` `wine.` `stickers.`

## Alias email (per progetto)
Con Resend Inbound **qualsiasi** indirizzo `@deroarts.com` è già ricevibile senza
crearlo (catch-all): es. `stickers@`, `barnode@`, ecc. arrivano tutti al webhook,
che collega il messaggio al progetto tramite `from_email`. Nessuna casella separata
da creare. Per l'**invio** da un alias, basta impostare `from_email` sul progetto.

## Regole per agent/dev (non negoziabili)
- Non modificare registrar / nameserver; non disattivare DNSSEC; non eliminare i record email Resend (MX `@` e `send`, SPF `send`, DKIM `resend._domainkey`, DMARC).
- Aggiungere record DNS **solo** con valori precisi forniti dalla piattaforma (Render/Vercel/verifica dominio). Mai record inventati; nessun record web se non richiesto.
- Prima di modificare email/DNS, documentare: tipo, nome/host, valore, TTL, priorità (se MX), motivo, piattaforma richiedente.

## Stato collegamento sito
- Sito attuale su Render: `https://deroarts.onrender.com` (vedi [[04-infrastruttura]]).
- **DA COMPLETARE:** collegare `deroarts.com` → Render (record web CNAME/A con i valori reali forniti da Render) + verifica in Cloud­flare. Poi Google Search Console.

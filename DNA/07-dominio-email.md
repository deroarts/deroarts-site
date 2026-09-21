# 07 — Dominio & Email (Cloudflare + Resend)

Scheda tecnica del dominio. Valori operativi reali — usarli, non reinventarli.
**Dominio corretto: `deroarts.com`** · **mai** `dero-arts.com`.

> **Aggiornamento 2026-07-07:** email migrate da **Zoho → Resend**. L'MX del
> dominio punta ora direttamente a Resend (ricezione), l'invio era già su Resend.
> **Zoho dismesso** (era solo posta di test): MX/SPF/verifica Zoho rimossi da
> Cloudflare. Dettagli flusso e alert quota in `08-messaggi-notifiche.md`.

## Cloudflare (registrar + DNS)
- **Account: `dero975@gmail.com`** — login con **email + password**, non con Google/Apple/GitHub.
  **NON** è `info@deroarts.com`: l'account Cloudflare esiste da prima del dominio (registrato lì).
  Account ID: `591f9a8436b44b62ee683962c35bccb3` (compare nell'URL del pannello).
  Recupero password: il codice arriva su `dero975@gmail.com`, non su info@.
- Registrar **e** DNS provider: **Cloudflare** (piano Free). DNSSEC **attivo**.
- Nameserver: `michael.ns.cloudflare.com`, `ziggy.ns.cloudflare.com`.
- Record DNS totali attuali: 10 (7 email + `www` + apex `@` verso Render + `stickers` progetto a parte).
- SSL/TLS: mode **Full**, Universal + Wildcard `*.deroarts.com`, Always-Use-HTTPS on, TLS 1.2+ (1.3 on), HTTP/2+3 on, HSTS off, ACM non attivo.
- Sicurezza: Managed Ruleset + DDoS + Browser Integrity + email obfuscation **on**; Bot Fight / Under Attack **off**. AI bots: ricerca+agente consenti, addestramento **blocca**.
- **Accesso API (dal 2026-09-21):** token **`deroarts-agent`** in `CLOUDFLARE_API_TOKEN` (App Control, sensibile).
  Zone ID `569f762e3b48d8f7441bb4bf3e262f99`. Permessi (solo zona `deroarts.com`): `Zone:DNS:Edit`,
  `Zone Settings:Edit`, `Zone WAF:Edit`, `Cache Rules:Edit`, `Analytics:Read`.
  **Non** copre la gestione dei token stessi: per crearli/modificarli serve il pannello.
  Nota: modificare i permessi di un token **esistente** dal pannello non viene salvato
  (difetto noto Cloudflare) — creare sempre un token nuovo.

## WAF — regola anti-bot (dal 2026-09-21)
Ruleset `http_request_firewall_custom`, regola **"Blocca POST Server Action senza Origin valido"**:
`http.request.method eq "POST" and len(http.request.headers["next-action"]) > 0 and not any(http.request.headers["origin"][*] contains "deroarts.com")` → **block**.
Ferma su Cloudflare il bot attivo dal 2026-08-30 (vedi [[06-decision-log]]), prima che raggiunga Render.
Verificato dal vivo: POST senza Origin → 403 da Cloudflare; POST con Origin corretto e visite normali → passano all'origin.
Difesa ridondante con lo scudo in `middleware.ts`: se una cade, l'altra regge.
**Bot Fight Mode** attivo (impostato a mano dall'owner).

## Email — Resend (invio + ricezione)
- Provider unico: **Resend** (account `dero975@gmail.com`, region Ireland eu-west-1).
- Dominio `deroarts.com` **Verified**; **Enable Sending** + **Enable Receiving** ON.
- Casella pubblica: **`info@deroarts.com`** (più alias per progetto, es. `stickers@`).
- Invio: via API Resend (`ResendMailAdapter`). Ricezione: MX → Resend Inbound →
  webhook `email.received` → `/api/inbound/resend`. Vedi [[08-messaggi-notifiche]].
- **Zoho dismesso** il 2026-07-07 (era solo posta di test). Non ripristinare Zoho
  né i suoi record; non usare Cloudflare Email Routing (superfluo, Resend basta).

## Record DNS email (in Cloudflare, modalità "Solo DNS" — i record email restano SEMPRE non proxiati)
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
- **`www.deroarts.com`** → CNAME `deroarts.onrender.com` (Cloudflare, **PROXY ON** dal 2026-09-21; era Solo DNS). Verificato su Render (servizio `deroarts`, id `srv-d92qjlok1i2s73d15n0g`), SSL emesso da Render. Live: `https://www.deroarts.com`.
- **`deroarts.com`** (apex) → CNAME `@` → `deroarts.onrender.com`, **PROXY ON** dal 2026-09-21 (era Solo DNS). Cloudflare fa CNAME-flattening (risolve a IP Render 216.24.57.x). Verificato su Render → **301 redirect a `www.deroarts.com`**. Il flattening **non tocca gli MX/TXT Zoho** (email intatte, verificato).
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
- Sito collegato dal 2026-07-06: `https://www.deroarts.com` (apex 301 → www). Origin `deroarts.onrender.com`.
- Dal 2026-09-21 il traffico web passa da **Cloudflare proxy** (nuvoletta arancione) su `@` e `www`.
  `stickers.deroarts.com` resta **Solo DNS**: è un altro progetto, non toccato.
- **DA FARE:** Google Search Console + SEO (Google attribuisce al dominio identità di terzi).

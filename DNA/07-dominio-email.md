# 07 — Dominio & Email (Cloudflare + Zoho)

Scheda tecnica del dominio. Valori operativi reali — usarli, non reinventarli.
**Dominio corretto: `deroarts.com`** · **mai** `dero-arts.com`.

## Cloudflare (registrar + DNS)
- Registrar **e** DNS provider: **Cloudflare** (piano Free). DNSSEC **attivo**.
- Nameserver: `michael.ns.cloudflare.com`, `ziggy.ns.cloudflare.com`.
- Record DNS totali attuali: 7 (solo email; nessun record web A/CNAME ancora).
- SSL/TLS: mode **Full**, Universal + Wildcard `*.deroarts.com`, Always-Use-HTTPS on, TLS 1.2+ (1.3 on), HTTP/2+3 on, HSTS off, ACM non attivo.
- Sicurezza: Managed Ruleset + DDoS + Browser Integrity + email obfuscation **on**; Bot Fight / Under Attack **off**. AI bots: ricerca+agente consenti, addestramento **blocca**.

## Email — Zoho Mail (Free, EU)
- Casella unica reale: **`info@deroarts.com`** (invio+ricezione OK, nome "Davide"). Webmail: `https://mail.zoho.eu/zm`.
- SPF / DKIM / DMARC: **PASS**. Piano Free = 5 licenze, 1 utente attivo.
- SMTP prod (per `SmtpMailAdapter`, vedi [[05-deploy]]): `smtp.zoho.eu:465` SSL, user `info@deroarts.com`, **app-password Zoho** (non la password account).
- **Non** usare Cloudflare Email Routing come soluzione principale: Zoho è l'email ufficiale.

## Record DNS email (in Cloudflare, modalità "Solo DNS")
| Tipo | Nome | Valore | Prio |
|---|---|---|---|
| TXT | @ | `zoho-verification=zb87474940.zmverify.zoho.eu` | — |
| MX | @ | `mx.zoho.eu` | 10 |
| MX | @ | `mx2.zoho.eu` | 20 |
| MX | @ | `mx3.zoho.eu` | 50 |
| TXT (SPF) | @ | `v=spf1 include:zohomail.eu ~all` | — |
| TXT (DKIM) | `zmail._domainkey` | `v=DKIM1; k=rsa; p=MIGf...QIDAQAB` (chiave RSA completa in Cloudflare) | — |
| TXT (DMARC) | `_dmarc` | `v=DMARC1; p=none; rua=mailto:info@deroarts.com` (monitoraggio; irrigidire solo dopo) | — |

## Struttura sottodomini (convenzione)
`deroarts.com` (sito) · `demo.` · `docs.` · `status.` · `<app>.` (app/progetto) · `admin.<app>.` · `api.<app>.`
Esempi futuri: `barnode.` `aquilanera.` `ccv.` `wine.` `stickers.`

## Alias email (futuri, non ancora creati)
Per progetto (`info-demo@`, `info-stickers@`, `info-barnode@`, `info-ccv@`, `info-aquilanera@`), devono puntare/inoltrare a `info@deroarts.com`. Verificare prima che il piano Zoho Free lo consenta; niente caselle separate inutili.

## Regole per agent/dev (non negoziabili)
- Non modificare registrar / nameserver; non disattivare DNSSEC; non eliminare i record email Zoho.
- Aggiungere record DNS **solo** con valori precisi forniti dalla piattaforma (Render/Vercel/verifica dominio). Mai record inventati; nessun record web se non richiesto.
- Prima di modificare email/DNS, documentare: tipo, nome/host, valore, TTL, priorità (se MX), motivo, piattaforma richiedente.

## Stato collegamento sito
- Sito attuale su Render: `https://deroarts.onrender.com` (vedi [[04-infrastruttura]]).
- **DA COMPLETARE:** collegare `deroarts.com` → Render (record web CNAME/A con i valori reali forniti da Render) + verifica in Cloud­flare. Poi Google Search Console.

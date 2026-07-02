# DNA DeroArts — Indice

Contesto canonico del progetto. Leggi in ordine: i numeri bassi sono indispensabili.

| # | File | Cosa contiene | Quando leggerlo |
|---|------|---------------|-----------------|
| 00 | indice.md | Questo file | Sempre, per primo |
| 01 | stato-progetto.md | Cos'è, stato reale, cosa è fatto/da fare | Sempre |
| 02 | regole.md | Regole non negoziabili (sicurezza, DevSwitcher, deploy) | Sempre, prima di modificare |
| 03 | architettura.md | Pattern non ovvi: adapter, auth, i18n, immagini | Prima di toccare logica |
| 04 | infrastruttura.md | Repo, DB, deploy, dominio, servizi esterni, limiti free | Prima di operazioni infra |
| 05 | deploy.md | Procedura deploy Render + flip adapter prod | Solo al deploy |
| 06 | decision-log.md | Registro decisioni tecniche rilevanti | In chiusura, per registrare decisioni |
| 07 | dominio-email.md | Dominio Cloudflare + email Zoho: record DNS, SSL, sottodomini, regole | Prima di toccare DNS/email/dominio |

**Regole (come si lavora)** → `AGENTS.md` (governance canonica) + `CLAUDE.md` (standard universale). Questo DNA è lo **stato** (cos'è, dov'è), non le regole.
**Fonte di verità = il codice.** Se DNA e codice divergono, vale il codice: aggiorna il DNA.
Ciò che il repo mostra già (struttura cartelle, dipendenze, script `package.json`, schema in `prisma/schema.prisma`) NON è duplicato qui.

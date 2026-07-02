# AGENTS.md — Governance DeroArts (canonica, per ogni agent AI)

> **File canonico unico** di governance per questo progetto. Vale per QUALSIASI agent
> (Claude Code, Codex, Devin, Cursor, ...). Le regole sono **vincoli obbligatori**,
> non suggerimenti. Chi le viola crea debito tecnico che un altro dovrà correggere.

## Ordine di lettura a inizio sessione (obbligatorio)
1. `CLAUDE.md` — standard operativo universale (App Control, sync, reasoning, flusso). Base valida per tutti gli agent, non solo Claude.
2. **`DNA/00-indice.md`** e i soli file DNA pertinenti al task — stato operativo reale (architettura, servizi, deploy, infra). **Leggi il DNA PRIMA di operare.**
3. `LEARNINGS.md` — errori/pattern noti del progetto.

Governance = **le REGOLE (come si lavora)**. DNA = **lo STATO (cos'è, dov'è)**. Non duplicare: le une rimandano all'altro.

---

## ENFORCEMENT — applicazione in tempo reale
Tratta questa governance come un **pre-commit hook mentale**: confronta ogni azione con le regole **PRIMA** di eseguirla.
- File oltre il limite righe → **dividilo PRIMA** di proseguire, mai "dopo".
- "Non duplicare logica" → **cerca prima** se esiste già; non scrivere codice nuovo senza aver verificato.
- "Aggiorna la doc" → **nello stesso intervento**, non in un commit successivo.
- Violazione scoperta durante l'esecuzione → **correggi subito**, non rimandarla al report.

---

## Vincoli permanenti (ogni intervento)
- **Limite file: max 300 righe.** Se un file che crei/modifichi supera 300 righe, **dividilo subito** (estrai componenti, hook, helper) prima di continuare. File esistenti già oltre il limite (`ProjectForm.tsx`, `ImageFrameEditor.tsx`, ...) vanno divisi **quando li tocchi**, non in un refactor a parte.
- **Modularità e responsabilità singola:** un file = uno scopo. Naming coerente con il codice attorno.
- **Non duplicare logiche:** riusa adapter/helper/componenti esistenti (`lib/adapters`, `lib/auth`, `lib/i18n`, `components/`).
- **Non toccare aree non coinvolte** dalla richiesta. Nessun refactor massivo senza necessità documentata. Nessuna modifica a UX/layout/architettura se non richiesta.
- **DB = unica fonte dei dati.** Nessun dato applicativo hardcoded/mock nel runtime; dati d'esempio solo in `prisma/seed.ts`. **Parità admin/user:** ogni contenuto gestibile da admin è letto lato user dalla stessa fonte DB.
- **DB non distruttivo:** modifiche schema solo come **migrazioni Prisma versionate additive**; mai `db push`/`--force` su produzione. **RLS attiva** su ogni tabella con dati utente.
- **Secrets/env:** `.env` sempre in `.gitignore`; mai stampare token/chiavi/password/URL con credenziali; service_role solo backend. Env gestite via App Control (vedi `CLAUDE.md §1`).
- **Sincronizzazione:** frontend ↔ backend ↔ DB ↔ deploy ↔ servizi esterni devono restare coerenti dopo ogni intervento.
- **Portabilità:** nessuna dipendenza da un ambiente specifico (no lock-in). App avviabile in locale (`PORT=5001 pnpm dev`) e verificabile.
- **Tracciabilità:** ogni modifica verificabile, reversibile, tracciabile. Ogni decisione tecnica rilevante → `DNA/06-decision-log.md`.

---

## Selezione livello reasoning
Vedi `CLAUDE.md §2ter`. Sintesi: default **Medium**; chiedi **HIGH** per refactor multi-file/architettura, debug multi-layer, audit ampi, modifiche a governance/automazioni; chiedi **EXTRA HIGH** per schema DB/migrazioni/RLS, sicurezza/auth, deploy/produzione, eliminazioni massive. In ambienti senza selettore (es. Claude Code): niente richiesta di upgrade, ma se il task è ad alto rischio **dichiaralo prima** e procedi con cautela rafforzata. Se durante l'esecuzione il task risulta più complesso: fermati senza lasciare lavoro a metà e segnala.

---

## Flusso controllato per ogni modifica al codice
1. **Comprensione** — 1-3 righe: cosa è chiesto e cosa NON è incluso. Max 2 domande se ambiguo su punti sostanziali; altrimenti procedi.
2. **Piano** — file da toccare, impatto su DB/API/flussi, rischi. Procedi senza attendere conferma, SALVO aree che richiedono autorizzazione esplicita (**DB, secrets, deploy, architettura**): lì fermati e chiedi.
3. **Implementazione** — minimo codice necessario, riusa l'esistente, non toccare aree estranee. Verifica il limite 300 righe durante la scrittura.
4. **Verifica** — esegui i controlli reali (`pnpm typecheck`, `pnpm build`); non dichiarare test passati senza eseguirli.
5. **Chiusura** — aggiorna doc/DNA **nello stesso intervento** se la modifica incide su architettura/flussi/API/DB/deploy/secrets/governance; report breve.

Task banali (typo, testo, colore): punti 1-2 in una frase, mai saltati del tutto. Bug: riproduci e isola la causa radice prima di pianificare.

---

## Checklist PRE-modifica
- [ ] Ho letto `DNA/00-indice.md` e i file DNA pertinenti?
- [ ] Il task tocca DB/auth/deploy/architettura/secrets? → serve autorizzazione esplicita.
- [ ] La logica esiste già? (cercato prima di scrivere)
- [ ] `git status` pulito / so cosa sto per toccare?
- [ ] Livello di rischio dichiarato se alto?

## Checklist POST-modifica
- [ ] Ogni file toccato è sotto 300 righe?
- [ ] `pnpm typecheck` e `pnpm build` passano?
- [ ] Funzionalità esistenti non rotte? (parità admin/user preservata)
- [ ] Doc/DNA aggiornati nello stesso intervento (se serve)?
- [ ] Decisione rilevante registrata in `DNA/06-decision-log.md`?
- [ ] Nessun segreto/backup/file generato in staging? (`git status` prima di commit)
- [ ] Push solo con ok esplicito (push su `main` = deploy in produzione)?

## Quando NON intervenire / quando fermarsi
- Modifica a DB, secrets, deploy, architettura senza autorizzazione → **fermati e chiedi**.
- Operazione distruttiva o difficile da annullare → **fermati e chiedi**.
- Richiesta che contraddice questa governance → **fermati e segnala**.
- Push/deploy senza ok esplicito → **non farlo**.

# LEARNINGS — DeroArts

## DevSwitcher U/A — REGOLA PERMANENTE

Il DevSwitcher (due cerchi U/A in basso a destra) è uno strumento **SOLO di sviluppo**.

- Deve restare **SEMPRE indipendente** e **mai bloccato** da logiche di autenticazione, privacy, sicurezza, RLS o altro.
- È gated da `DEV_UA_SWITCH=true` (assente in produzione) e verrà **eliminato prima della produzione**.
- Quando `DEV_UA_SWITCH=true`, il middleware su `/admina` **bypassa** il controllo auth (passaggio U↔A senza login). Quando `false`/assente, login obbligatorio.
- Qualsiasi lavoro futuro su auth/sicurezza **NON deve interferire** col suo funzionamento in sviluppo.

File coinvolti: `middleware.ts` (bypass gated dal flag), `components/DevSwitcher.tsx`.

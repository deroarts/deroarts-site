/**
 * Chiave di raggruppamento di una conversazione.
 * Tutti i messaggi con la stessa chiave (stesso interlocutore + stesso argomento
 * normalizzato) vengono mostrati come un unico thread nel pannello Messaggi.
 *
 * L'argomento è normalizzato togliendo i prefissi "Re:"/"R:"/"Fwd:" e lo spazio
 * extra, così "Domanda X" e "Re: Domanda X" finiscono nello stesso thread.
 */
export function threadKey(email: string, subject: string | null | undefined): string {
  const who = (email || "").trim().toLowerCase();
  const subj = normalizeSubject(subject);
  return `${who}::${subj}`;
}

/** Rimuove prefissi di risposta/inoltro e normalizza spazi + minuscole. */
export function normalizeSubject(subject: string | null | undefined): string {
  let s = (subject || "").trim();
  // Toglie ripetuti "Re:", "R:", "Fwd:", "Fw:" all'inizio (anche multipli).
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const stripped = s.replace(/^\s*(re|r|fwd|fw)\s*:\s*/i, "");
    if (stripped === s) break;
    s = stripped;
  }
  return s.replace(/\s+/g, " ").trim().toLowerCase();
}

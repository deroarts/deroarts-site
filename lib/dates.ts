// Italian date formatters. Three named formats, each matching an existing use
// site exactly — kept distinct on purpose (different screens want different
// granularity).

/** "07/07/2026, 14:30:05" — full date + time with seconds (dev outbox log). */
export function formatDateTimeSeconds(d: Date): string {
  return d.toLocaleString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/** "07/07/2026, 14:30" — date + time, no seconds (chat transcript). */
export function formatDateTime(d: Date): string {
  return d.toLocaleString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** "07 Luglio 2026" — long month, capitalised (messages list). */
export function formatDateLong(d: Date): string {
  const s = d.toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  return s.replace(/ (\p{Ll})/u, (_, c) => " " + c.toUpperCase());
}

import "server-only";
import { headers } from "next/headers";

// ─── Difesa anti-spam del form contatti ───────────────────────────────────────
// Complemento allo scudo in `middleware.ts` (che chiude i POST contraffatti):
// qui filtriamo ciò che arriva da un browser vero ma è chiaramente automatico.
// Due livelli: quante richieste dallo stesso IP e cosa contiene il messaggio.

const WINDOW_MS = 60 * 60 * 1000; // finestra di 1 ora
const MAX_PER_WINDOW = 3; // invii consentiti per IP nella finestra
const MAX_TRACKED_IPS = 5_000; // tetto di memoria: oltre, si ripulisce

// In memoria: Render esegue una sola istanza e un riavvio azzera il conteggio.
// Accettabile — è un deterrente, non un registro.
const hits = new Map<string, number[]>();

function clientIp(): string {
  const h = headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return h.get("cf-connecting-ip") ?? h.get("x-real-ip") ?? "unknown";
}

/** true = troppi invii dallo stesso IP, la richiesta va respinta. */
export function isRateLimited(): boolean {
  const ip = clientIp();
  if (ip === "unknown") return false; // non punire chi non possiamo identificare

  const now = Date.now();
  if (hits.size > MAX_TRACKED_IPS) hits.clear();

  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return true;
  }

  recent.push(now);
  hits.set(ip, recent);
  return false;
}

// Frasi ricorrenti nello spam commerciale ricevuto finora (offerte SEO, video
// promozionali, finti "webmaster"). Confronto su testo minuscolo.
const SPAM_PHRASES = [
  "seo report",
  "seo audit",
  "rank higher",
  "search engine ranking",
  "perform better in google",
  "first page of google",
  "explainer video",
  "promotional video",
  "advertise your business",
  "i came across your website",
  "i just visited",
  "website administrator",
  "webmaster",
  "backlink",
  "guest post",
  "crypto",
  "bitcoin",
  "loan offer",
  "viagra",
];

// Due costanti distinte: una regex con flag `g` conserva `lastIndex` tra le
// chiamate a .test(), quindi non va riusata sia per testare sia per contare.
const URL_TEST = /https?:\/\/|www\./i;
const URL_COUNT = /https?:\/\/|www\./gi;

/** true = il messaggio è quasi certamente spam automatico. */
export function looksLikeSpam(input: {
  name: string;
  email: string;
  message: string;
}): boolean {
  const name = input.name.toLowerCase();
  const body = input.message.toLowerCase();
  const haystack = `${name} ${body}`;

  // Il nome non è un nome ma un indirizzo/slogan (es. "Hello http://… Administrator").
  if (URL_TEST.test(name)) return true;

  if (SPAM_PHRASES.some((p) => haystack.includes(p))) return true;

  // Messaggi brevi zeppi di link: nessun contatto reale scrive così.
  const links = input.message.match(URL_COUNT)?.length ?? 0;
  if (links >= 3) return true;
  if (links >= 1 && input.message.length < 120) return true;

  return false;
}

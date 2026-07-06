import "server-only";
import { prisma } from "@/lib/db/client";
import { sendPushToAll } from "@/lib/push/send";

// ─── Alert quota email (Resend Free) ──────────────────────────────────────────
// Il piano gratuito Resend consente 100 email/giorno e 3.000/mese, con invio e
// ricezione che condividono lo stesso secchiello. Qui non blocchiamo nulla:
// contiamo le email che passano e, quando ci si avvicina al limite, mandiamo UNA
// notifica push di avviso (per giorno / per mese) così si può valutare l'upgrade.

const DAILY_LIMIT = 100;
const MONTHLY_LIMIT = 3000;
const THRESHOLD = 0.8; // avvisa all'80%

/** Data odierna in UTC come "YYYY-MM-DD". */
function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Prefisso mese corrente in UTC come "YYYY-MM". */
function monthPrefix(): string {
  return new Date().toISOString().slice(0, 7);
}

type CountKind = "sent" | "received";

/**
 * Registra una email (inviata o ricevuta) nel contatore del giorno e, se si
 * supera l'80% del limite giornaliero o mensile, invia un avviso push (una sola
 * volta per giorno e una sola volta per mese). Non lancia mai: un errore nel
 * conteggio non deve mai impedire l'invio/ricezione della mail.
 */
export async function recordEmail(kind: CountKind): Promise<void> {
  try {
    const day = todayKey();

    // Incremento atomico del contatore del giorno (crea la riga se manca).
    const row = await prisma.emailCounter.upsert({
      where: { day },
      create: { day, sent: kind === "sent" ? 1 : 0, received: kind === "received" ? 1 : 0 },
      update: kind === "sent" ? { sent: { increment: 1 } } : { received: { increment: 1 } },
    });

    const dayTotal = row.sent + row.received;

    // ── Alert giornaliero ──
    // Il "check-and-set" è reso atomico dall'updateMany con `alert_day_sent: false`
    // nel where: fra invocazioni concorrenti solo UNA scrive (count === 1) e solo
    // quella manda la push → niente alert duplicati vicino al limite.
    if (dayTotal >= DAILY_LIMIT * THRESHOLD) {
      const claimed = await prisma.emailCounter.updateMany({
        where: { day, alert_day_sent: false },
        data: { alert_day_sent: true },
      });
      if (claimed.count > 0) {
        await sendPushToAll({
          title: "Attenzione — limite email giornaliero",
          body: `${dayTotal}/${DAILY_LIMIT} email oggi (invio+ricezione). Vicino al limite gratuito Resend: valuta il piano a pagamento.`,
          url: "/admina/messaggi",
          tag: "deroarts-quota-day",
        });
      }
    }

    // ── Alert mensile ──
    // Somma i totali di tutte le righe del mese corrente.
    const monthRows = await prisma.emailCounter.findMany({
      where: { day: { startsWith: monthPrefix() } },
      select: { sent: true, received: true },
    });
    const monthTotal = monthRows.reduce((acc, r) => acc + r.sent + r.received, 0);

    if (monthTotal >= MONTHLY_LIMIT * THRESHOLD) {
      // Stesso pattern atomico: marca l'alert sulla riga di oggi solo se non già
      // marcata (basta una riga del mese a fare da flag mensile).
      const claimed = await prisma.emailCounter.updateMany({
        where: { day, alert_month_sent: false },
        data: { alert_month_sent: true },
      });
      if (claimed.count > 0) {
        await sendPushToAll({
          title: "Attenzione — limite email mensile",
          body: `${monthTotal}/${MONTHLY_LIMIT} email questo mese (invio+ricezione). Vicino al limite gratuito Resend: valuta il piano a pagamento.`,
          url: "/admina/messaggi",
          tag: "deroarts-quota-month",
        });
      }
    }
  } catch (e) {
    console.error("[quota] recordEmail error:", e);
  }
}

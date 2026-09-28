// ─── Interface ────────────────────────────────────────────────────────────────

export interface MailMessage {
  to: string;
  from: string;
  subject: string;
  html: string;
  /** Optional Reply-To — lets the owner reply straight to the requester. */
  replyTo?: string;
}

export interface MailAdapter {
  sendMail(message: MailMessage): Promise<void>;
}

// ─── Fake implementation (dev) ────────────────────────────────────────────────
// Logs to the console only: nothing is sent and nothing is written to the DB.

export class FakeMailAdapter implements MailAdapter {
  async sendMail(message: MailMessage): Promise<void> {
    console.log("[FAKE MAIL] ─────────────────────────────────");
    console.log("  To      :", message.to);
    console.log("  From    :", message.from);
    console.log("  Reply-To:", message.replyTo ?? "—");
    console.log("  Subject :", message.subject);
    console.log("─────────────────────────────────────────────");
  }
}

// ─── Resend implementation (production) ───────────────────────────────────────
// Real transactional email via the Resend API. Requires RESEND_API_KEY and a
// verified sending domain (deroarts.com). The `from` address must belong to a
// verified domain, otherwise Resend rejects the message.

export class ResendMailAdapter implements MailAdapter {
  async sendMail(message: MailMessage): Promise<void> {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY mancante: impossibile inviare email.");
    }

    // Lazy-import so the SDK is only loaded when actually sending.
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);

    const { data, error } = await resend.emails.send({
      from: message.from,
      to: message.to,
      subject: message.subject,
      html: message.html,
      ...(message.replyTo ? { replyTo: message.replyTo } : {}),
    });

    if (error) {
      // Surface a clean error; the caller decides whether to swallow it.
      throw new Error(`Resend: ${error.name} — ${error.message}`);
    }
    console.log("[RESEND] inviata:", data?.id, "→", message.to);
  }
}

// ─── Interface ────────────────────────────────────────────────────────────────

export interface MailMessage {
  to: string;
  from: string;
  subject: string;
  html: string;
}

export interface MailAdapter {
  sendMail(message: MailMessage): Promise<void>;
}

// ─── Fake implementation (dev) ────────────────────────────────────────────────
// Logs to console and writes to the dev_outbox table for inspection in the admin.

export class FakeMailAdapter implements MailAdapter {
  async sendMail(message: MailMessage): Promise<void> {
    console.log("[FAKE MAIL] ─────────────────────────────────");
    console.log("  To     :", message.to);
    console.log("  From   :", message.from);
    console.log("  Subject:", message.subject);
    console.log("─────────────────────────────────────────────");

    // Lazy-import to avoid circular dep issues in non-Next.js contexts (e.g. seed).
    const { prisma } = await import("@/lib/db/client");
    await prisma.devOutbox.create({
      data: {
        to: message.to,
        from: message.from,
        subject: message.subject,
        body: message.html,
      },
    });
  }
}

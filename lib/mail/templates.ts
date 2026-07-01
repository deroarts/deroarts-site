// Italian HTML email templates for DeroArts.
// All user-facing copy is in Italian.

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const BRAND_DARK = "#0d2e22";
const BRAND_GREEN = "#1a7a5e";

// ─── Owner notification ───────────────────────────────────────────────────────

export interface OwnerNotificationData {
  projectTitle?: string;
  requesterName: string;
  requesterEmail: string;
  message: string;
}

export function ownerNotificationSubject(projectTitle?: string): string {
  return projectTitle
    ? `Nuova richiesta informazioni: ${projectTitle}`
    : "Nuova richiesta di contatto — DeroArts";
}

export function ownerNotificationHtml(data: OwnerNotificationData): string {
  const heading = data.projectTitle
    ? `Nuova richiesta per &ldquo;${escapeHtml(data.projectTitle)}&rdquo;`
    : "Nuova richiesta di contatto";

  return `<!DOCTYPE html>
<html lang="it">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:20px;background:#f5f5f5;font-family:system-ui,sans-serif;">
  <div style="max-width:580px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08);">
    <div style="background:${BRAND_DARK};padding:24px 28px;">
      <p style="margin:0;color:rgba(255,255,255,.5);font-size:12px;text-transform:uppercase;letter-spacing:1px;">DeroArts Admin</p>
      <h1 style="margin:6px 0 0;color:#fff;font-size:18px;font-weight:700;">${heading}</h1>
    </div>
    <div style="padding:28px;">
      <table style="width:100%;border-collapse:collapse;font-size:14px;color:#444;">
        ${data.projectTitle ? `
        <tr>
          <td style="padding:7px 0;color:#999;white-space:nowrap;width:110px;">Progetto</td>
          <td style="padding:7px 0;font-weight:600;color:#111;">${escapeHtml(data.projectTitle)}</td>
        </tr>` : ""}
        <tr>
          <td style="padding:7px 0;color:#999;">Nome</td>
          <td style="padding:7px 0;font-weight:600;color:#111;">${escapeHtml(data.requesterName)}</td>
        </tr>
        <tr>
          <td style="padding:7px 0;color:#999;">Email</td>
          <td style="padding:7px 0;">
            <a href="mailto:${escapeHtml(data.requesterEmail)}" style="color:${BRAND_GREEN};text-decoration:none;">
              ${escapeHtml(data.requesterEmail)}
            </a>
          </td>
        </tr>
      </table>

      <div style="margin-top:20px;padding:16px 20px;background:#f8f8f8;border-radius:8px;border-left:3px solid ${BRAND_GREEN};">
        <p style="margin:0 0 8px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:#999;">Messaggio</p>
        <p style="margin:0;color:#1a1a1a;font-size:14px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(data.message)}</p>
      </div>
    </div>
    <div style="padding:14px 28px;background:#f5f5f5;font-size:12px;color:#aaa;text-align:center;">
      DeroArts &middot; Gestisci le richieste nell&rsquo;area amministrativa
    </div>
  </div>
</body>
</html>`;
}

// ─── Auto-reply ───────────────────────────────────────────────────────────────

export interface AutoReplyData {
  projectTitle?: string;
  requesterName: string;
}

export function autoReplySubject(projectTitle?: string): string {
  return projectTitle
    ? `Conferma ricezione — ${projectTitle} | DeroArts`
    : "Abbiamo ricevuto il tuo messaggio | DeroArts";
}

export function autoReplyHtml(data: AutoReplyData): string {
  const projectLine = data.projectTitle
    ? ` riguardo a <strong>${escapeHtml(data.projectTitle)}</strong>`
    : "";

  return `<!DOCTYPE html>
<html lang="it">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:20px;background:#f5f5f5;font-family:system-ui,sans-serif;">
  <div style="max-width:580px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08);">
    <div style="background:linear-gradient(135deg,${BRAND_DARK} 0%,#1a4a35 100%);padding:32px 28px;">
      <h1 style="margin:0;color:#fff;font-size:24px;font-weight:800;letter-spacing:-.3px;">DeroArts</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,.65);font-size:14px;">Conferma ricezione richiesta</p>
    </div>
    <div style="padding:32px 28px;">
      <p style="margin:0 0 16px;color:#1a1a1a;font-size:16px;">
        Ciao <strong>${escapeHtml(data.requesterName)}</strong>,
      </p>
      <p style="margin:0 0 14px;color:#555;font-size:14px;line-height:1.7;">
        Abbiamo ricevuto la tua richiesta${projectLine} e la prenderemo in carico al pi&ugrave; presto.
      </p>
      <p style="margin:0 0 28px;color:#555;font-size:14px;line-height:1.7;">
        Ti risponderemo direttamente a questo indirizzo email nel minor tempo possibile.
      </p>
      <p style="margin:0;color:#999;font-size:13px;line-height:1.6;">
        A presto,<br>
        <strong style="color:${BRAND_GREEN};">Il team DeroArts</strong>
      </p>
    </div>
    <div style="padding:14px 28px;background:#f5f5f5;font-size:12px;color:#aaa;text-align:center;">
      Questo &egrave; un messaggio automatico &mdash; non rispondere a questa email.
    </div>
  </div>
</body>
</html>`;
}

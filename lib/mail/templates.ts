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

// Stessa palette del sito (tailwind.config.ts).
const BRAND_DARK = "#1A3A26";
const BRAND_DARKER = "#0F2419";
const BRAND_LIME = "#8FC603";
const BRAND_GREEN = "#1E9E3D";
const SURFACE = "#ECEAE8";
const SURFACE_LIGHT = "#F8F6F6";

// Shared outer shell for every email: doctype/head/body + the white card
// wrapper. `inner` is the card content (coloured header + body + footer).
function emailShell(inner: string): string {
  return `<!DOCTYPE html>
<html lang="it">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:20px;background:${SURFACE};font-family:Poppins,system-ui,-apple-system,'Segoe UI',sans-serif;">
  <div style="max-width:580px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08);">
${inner}
  </div>
</body>
</html>`;
}

// Intestazione verde come la hero del sito: sfumatura scura con un alone
// verde morbido, chiusa da una sottile linea del gradiente dei pulsanti.
// Il colore pieno resta come ripiego per i client che ignorano i gradienti.
function emailHeader(content: string): string {
  return `
    <div style="background-color:${BRAND_DARK};background-image:radial-gradient(circle at 0% 100%,rgba(30,158,61,.30) 0%,rgba(30,158,61,0) 60%),linear-gradient(135deg,${BRAND_DARK} 0%,${BRAND_DARKER} 100%);padding:30px 28px;">
${content}
    </div>
    <div style="height:3px;line-height:3px;font-size:0;background-color:${BRAND_GREEN};background-image:linear-gradient(90deg,${BRAND_LIME},${BRAND_GREEN});">&nbsp;</div>`;
}

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

  return emailShell(`${emailHeader(`
      <p style="margin:0;color:${BRAND_LIME};font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:2px;">DeroArts &middot; Modulo contatti</p>
      <h1 style="margin:8px 0 0;color:#fff;font-size:18px;font-weight:700;">${heading}</h1>`)}
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

      <div style="margin-top:20px;padding:16px 20px;background:${SURFACE_LIGHT};border-radius:8px;border-left:3px solid ${BRAND_GREEN};">
        <p style="margin:0 0 8px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:#999;">Messaggio</p>
        <p style="margin:0;color:#1a1a1a;font-size:14px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(data.message)}</p>
      </div>
    </div>
    <div style="padding:14px 28px;background:${SURFACE_LIGHT};font-size:12px;color:#aaa;text-align:center;">
      Messaggio inviato dal modulo contatti di deroarts.com
    </div>`);
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

  return emailShell(`${emailHeader(`
      <h1 style="margin:0;color:#fff;font-size:24px;font-weight:800;letter-spacing:-.3px;">DeroArts</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,.7);font-size:14px;">Conferma ricezione richiesta</p>`)}
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
    <div style="padding:14px 28px;background:${SURFACE_LIGHT};font-size:12px;color:#aaa;text-align:center;">
      Questo &egrave; un messaggio automatico &mdash; non rispondere a questa email.
    </div>`);
}

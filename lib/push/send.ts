import "server-only";
import webpush from "web-push";
import { prisma } from "@/lib/db/client";

// ─── VAPID configuration ──────────────────────────────────────────────────────
// Configured lazily once per process. If keys are missing, push is a no-op so
// the rest of the app (saving messages, sending email) is never blocked.

let configured = false;

function ensureConfigured(): boolean {
  if (configured) return true;
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:info@deroarts.com";
  if (!publicKey || !privateKey) return false;
  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
  return true;
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

/**
 * Send a push notification to every active admin subscription.
 * - No-op if push isn't enabled or VAPID keys are missing.
 * - Dead subscriptions (404/410) are pruned automatically.
 * Never throws to the caller: notification failures must not break the request.
 */
export async function sendPushToAll(payload: PushPayload): Promise<void> {
  try {
    if (!ensureConfigured()) return;

    // Respect the global on/off switch.
    const setting = await prisma.notificationSetting.findUnique({
      where: { key: "global" },
    });
    if (!setting?.push_enabled) return;

    const subs = await prisma.pushSubscription.findMany();
    if (subs.length === 0) return;

    const body = JSON.stringify(payload);

    await Promise.all(
      subs.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            },
            body
          );
        } catch (err: unknown) {
          const statusCode =
            typeof err === "object" && err !== null && "statusCode" in err
              ? (err as { statusCode?: number }).statusCode
              : undefined;
          // 404/410 → the subscription is gone; remove it.
          if (statusCode === 404 || statusCode === 410) {
            await prisma.pushSubscription
              .delete({ where: { endpoint: sub.endpoint } })
              .catch(() => {});
          } else {
            console.error("[push] invio fallito:", statusCode, err);
          }
        }
      })
    );
  } catch (e) {
    console.error("[push] sendPushToAll error:", e);
  }
}

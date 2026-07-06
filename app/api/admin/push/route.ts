import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db/client";

export const dynamic = "force-dynamic";

// ─── Push subscription management (admin only) ────────────────────────────────
// GET    → current push on/off state + this browser's subscription status
// POST   → save a subscription for this device + turn push ON globally
// DELETE → remove a subscription (unsubscribe this device)

async function requireAdmin() {
  const session = await getSession();
  return session ?? null;
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });
  }
  const [setting, count] = await Promise.all([
    prisma.notificationSetting.findUnique({ where: { key: "global" } }),
    prisma.pushSubscription.count(),
  ]);
  return NextResponse.json({
    pushEnabled: setting?.push_enabled ?? false,
    deviceCount: count,
    vapidPublicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "",
  });
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });
  }
  let body: {
    endpoint?: string;
    keys?: { p256dh?: string; auth?: string };
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body non valido." }, { status: 400 });
  }

  const endpoint = body?.endpoint;
  const p256dh = body?.keys?.p256dh;
  const auth = body?.keys?.auth;
  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json(
      { error: "Subscription incompleta." },
      { status: 400 }
    );
  }

  const userAgent = request.headers.get("user-agent")?.slice(0, 255) ?? null;

  // Upsert by endpoint so re-subscribing the same device doesn't duplicate.
  await prisma.pushSubscription.upsert({
    where: { endpoint },
    create: { endpoint, p256dh, auth, user_agent: userAgent },
    update: { p256dh, auth, user_agent: userAgent },
  });

  // Enabling on any device turns the global switch ON.
  await prisma.notificationSetting.upsert({
    where: { key: "global" },
    create: { key: "global", push_enabled: true },
    update: { push_enabled: true },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });
  }
  let body: { endpoint?: string };
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  if (body.endpoint) {
    await prisma.pushSubscription
      .delete({ where: { endpoint: body.endpoint } })
      .catch(() => {});
  }

  // If no devices remain subscribed, flip the global switch OFF.
  const remaining = await prisma.pushSubscription.count();
  if (remaining === 0) {
    await prisma.notificationSetting.upsert({
      where: { key: "global" },
      create: { key: "global", push_enabled: false },
      update: { push_enabled: false },
    });
  }

  return NextResponse.json({ ok: true, remaining });
}

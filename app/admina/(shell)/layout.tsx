import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import AdminShell from "@/components/admin/AdminShell";

// Il layout legge dal DB (sessione + conteggio non letti): mai prerenderare al
// build (in CI non c'è DATABASE_URL → prisma fallirebbe). Come le pagine admin.
export const dynamic = "force-dynamic";

export default async function ShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, unreadCount] = await Promise.all([
    getSession(),
    prisma.request.count({ where: { status: "new" } }),
  ]);

  return (
    <AdminShell adminNickname={session?.nickname} unreadCount={unreadCount}>
      {children}
    </AdminShell>
  );
}

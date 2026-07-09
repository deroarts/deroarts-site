import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import AdminShell from "@/components/admin/AdminShell";

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

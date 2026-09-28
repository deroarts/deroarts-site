import { getSession } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";

// Il layout legge la sessione (cookie): sempre dinamico, mai prerenderato al
// build. Come le pagine admin.
export const dynamic = "force-dynamic";

export default async function ShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <AdminShell adminNickname={session?.nickname}>
      {children}
    </AdminShell>
  );
}

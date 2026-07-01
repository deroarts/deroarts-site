import { getSession } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";

export default async function ShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  return (
    <AdminShell adminEmail={session?.email}>
      {children}
    </AdminShell>
  );
}

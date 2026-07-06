import { redirect } from "next/navigation";

// La sezione "Richieste" è stata sostituita da "Messaggi". Questa rotta resta
// come redirect per non rompere vecchi link/segnalibri.
interface PageProps {
  searchParams: { status?: string; projectId?: string; page?: string };
}

export default function RichiesteRedirect({ searchParams }: PageProps) {
  const p = new URLSearchParams();
  if (searchParams.status) p.set("status", searchParams.status);
  if (searchParams.projectId) p.set("projectId", searchParams.projectId);
  if (searchParams.page) p.set("page", searchParams.page);
  const qs = p.toString();
  redirect(`/admina/messaggi${qs ? `?${qs}` : ""}`);
}

import NotificationToggle from "@/components/admin/NotificationToggle";
import PinManager from "@/components/admin/PinManager";

export const metadata = { title: "Impostazioni | Admin DeroArts" };

export default function ImpostazioniPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-graphite mb-6">Impostazioni</h1>
      <div className="space-y-4">
        <NotificationToggle />
        <PinManager />
      </div>
    </div>
  );
}

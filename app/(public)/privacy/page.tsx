import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy & Cookie",
  description:
    "Informativa sul trattamento dei dati personali e sui cookie di DeroArts.",
};

// Static informational page — no DB access.
export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-graphite">
      <h1 className="text-3xl font-semibold mb-2">Privacy &amp; Cookie</h1>
      <p className="text-sm text-gray-500 mb-10">Ultimo aggiornamento: luglio 2026</p>

      <section className="space-y-6 leading-relaxed text-[15px]">
        <div>
          <h2 className="text-lg font-semibold mb-2">Titolare del trattamento</h2>
          <p>
            DeroArts — contatto: <a className="underline" href="mailto:info@deroarts.com">info@deroarts.com</a>.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Quali dati raccogliamo</h2>
          <p>
            Raccogliamo i dati che ci fornisci volontariamente tramite i moduli di contatto
            e richiesta informazioni: <strong>nome</strong>, <strong>indirizzo email</strong> e
            il <strong>messaggio</strong> che scrivi. Non raccogliamo altri dati personali e non
            usiamo strumenti di tracciamento o profilazione.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Perché e come li usiamo</h2>
          <p>
            Usiamo questi dati esclusivamente per rispondere alla tua richiesta. La base
            giuridica è il tuo consenso e l&apos;esecuzione di misure precontrattuali. I dati sono
            conservati su <strong>Supabase</strong> (infrastruttura in UE) e le email gestite tramite
            <strong> Zoho Mail</strong> (server UE). Non vendiamo né cediamo i tuoi dati a terzi.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Cookie</h2>
          <p>
            Questo sito <strong>non utilizza cookie di profilazione o di terze parti</strong> e non
            impiega analytics esterni. Viene usato solo un dato tecnico locale per ricordare che
            hai già visto l&apos;avviso privacy. I caratteri tipografici sono ospitati localmente,
            senza trasferimenti verso servizi esterni.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">I tuoi diritti</h2>
          <p>
            Puoi richiedere in qualsiasi momento l&apos;accesso, la rettifica o la cancellazione dei
            tuoi dati scrivendo a{" "}
            <a className="underline" href="mailto:info@deroarts.com">info@deroarts.com</a>.
            Hai inoltre diritto di proporre reclamo all&apos;autorità di controllo competente.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Conservazione</h2>
          <p>
            I dati delle richieste sono conservati per il tempo necessario a gestire la
            conversazione e successivi adempimenti, e rimossi su richiesta.
          </p>
        </div>
      </section>

      <div className="mt-12">
        <Link href="/" className="text-green-start hover:underline text-sm">
          ← Torna alla home
        </Link>
      </div>
    </div>
  );
}

import ContactForm from "@/components/ContactForm";
import type { Metadata } from "next";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Contatti | DeroArts",
  description:
    "Hai domande o un progetto in mente? Scrivi a DeroArts — ogni messaggio riceve risposta.",
  openGraph: {
    title: "Contatti | DeroArts",
    description: "Contatti DeroArts — per domande e nuovi progetti.",
    images: [DEFAULT_OG_IMAGE],
  },
};

export default function ContattiPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        {/* Left — Brand info */}
        <div>
          <p className="text-green-end text-sm font-semibold uppercase tracking-wider mb-2">
            Mettiti in contatto
          </p>
          <h1 className="font-serif text-3xl md:text-4xl text-graphite mb-6 leading-tight">
            Parliamo
            <br />
            del&nbsp;tuo progetto.
          </h1>

          <p className="text-gray-500 leading-relaxed mb-6 text-pretty">
            DeroArts nasce dalla&nbsp;passione per&nbsp;il&nbsp;software ben fatto: strumenti
            digitali pensati per&nbsp;le&nbsp;persone, semplici da&nbsp;usare
            e&nbsp;affidabili&nbsp;nel&nbsp;tempo.
          </p>

          <p className="text-gray-500 leading-relaxed mb-10 text-pretty">
            <span className="block">
              Una domanda su&nbsp;un&nbsp;prodotto o&nbsp;un&nbsp;progetto da&nbsp;avviare?
            </span>
            <span className="block">
              Basta scrivere: ogni&nbsp;messaggio viene letto con&nbsp;attenzione
              e&nbsp;riceve&nbsp;una&nbsp;risposta.
            </span>
          </p>
        </div>

        {/* Right — Contact form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-semibold text-graphite mb-6">
            Invia un messaggio
          </h2>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}

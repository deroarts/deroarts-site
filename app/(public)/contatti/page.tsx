import ContactForm from "@/components/ContactForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contatti | DeroArts",
  description:
    "Hai domande o vuoi saperne di più su DeroArts? Scrivici — risponderemo il prima possibile.",
  openGraph: {
    title: "Contatti | DeroArts",
    description: "Contatta DeroArts — siamo qui per aiutarti.",
  },
};

export default function ContattiPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Left — Brand info */}
        <div>
          <p className="text-green-end text-sm font-semibold uppercase tracking-wider mb-2">
            Parla con noi
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-graphite mb-6 leading-tight">
            Come possiamo
            <br />
            aiutarti?
          </h1>

          <p className="text-gray-500 leading-relaxed mb-6">
            DeroArts nasce dalla passione per il software ben fatto. Creiamo
            strumenti digitali pensati per le persone: semplici da usare,
            affidabili nel tempo.
          </p>

          <p className="text-gray-500 leading-relaxed mb-10">
            Hai una domanda su uno dei nostri prodotti? Vuoi capire se
            possiamo aiutare la tua azienda? Scrivici — leggiamo ogni
            messaggio e rispondiamo con cura.
          </p>

          {/* Contact info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-9 h-9 rounded-full bg-dark-green-gradient flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-green-start" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-graphite">Email</p>
                <a
                  href="mailto:info@deroarts.com"
                  className="text-gray-500 hover:text-green-end transition-colors"
                >
                  info@deroarts.com
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="w-9 h-9 rounded-full bg-dark-green-gradient flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-green-start" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-graphite">Sito</p>
                <a
                  href="https://deroarts.com"
                  className="text-gray-500 hover:text-green-end transition-colors"
                >
                  deroarts.com
                </a>
              </div>
            </div>
          </div>
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

import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-graphite text-gray-400 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <Image
              src="/brand/logo-horizontal-on-dark.svg"
              alt="DeroArts"
              width={120}
              height={32}
              className="h-7 w-auto mb-3"
            />
            <p className="text-sm leading-relaxed">
              Software semplice e potente per piccole e medie imprese. Qualità artigianale, pensata per le persone.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4 uppercase tracking-wider">
              Navigazione
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/progetti" className="hover:text-white transition-colors">
                  Progetti
                </Link>
              </li>
              <li>
                <Link href="/contatti" className="hover:text-white transition-colors">
                  Contatti
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white text-sm font-semibold mb-4 uppercase tracking-wider">
              Contatti
            </h4>
            <p className="text-sm">
              <a
                href="mailto:info@deroarts.com"
                className="hover:text-white transition-colors"
              >
                info@deroarts.com
              </a>
            </p>
            <p className="text-sm mt-1">deroarts.com</p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 text-xs text-center">
          © {year} DeroArts. Tutti i diritti riservati.
        </div>
      </div>
    </footer>
  );
}

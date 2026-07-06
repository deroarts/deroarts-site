import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-graphite text-gray-400 mt-auto">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center text-center">
        {/* Logo */}
        <Image
          src="/brand/logo-horizontal-on-dark.svg"
          alt="DeroArts"
          width={140}
          height={38}
          className="h-8 w-auto mb-4"
        />

        {/* Tagline */}
        <p className="text-sm leading-relaxed max-w-md mb-6">
          App, siti e software su misura. Qualità e prezzi, alla portata di tutti.
        </p>

        {/* Privacy link */}
        <Link
          href="/privacy"
          className="text-sm hover:text-white transition-colors"
        >
          Privacy &amp; Cookie
        </Link>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-white/10 w-full text-xs">
          © {year} DeroArts. Tutti i diritti riservati.
        </div>
      </div>
    </footer>
  );
}

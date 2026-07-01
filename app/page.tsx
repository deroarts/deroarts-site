import Image from "next/image";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-light-surface flex flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center gap-8">
        {/* Logo */}
        <Image
          src="/brand/logo-horizontal-on-light.svg"
          alt="DeroArts"
          width={280}
          height={80}
          priority
        />

        {/* Tagline placeholder */}
        <p className="text-graphite/60 text-lg font-medium text-center max-w-md">
          Software e applicazioni per il tuo business
        </p>

        {/* Green accent bar */}
        <div className="h-1 w-24 rounded-full bg-green-gradient" />

        {/* Coming soon note */}
        <p className="text-sm text-graphite/40 font-light">
          Sito in costruzione — torna presto
        </p>
      </div>
    </main>
  );
}

import type { Metadata, Viewport } from "next";
import { Poppins, Fraunces } from "next/font/google";
import "./globals.css";
import ScrollToTop from "@/components/ScrollToTop";
import { getSiteUrl, DEFAULT_OG_IMAGE } from "@/lib/seo";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

// Serif editoriale per i titoli (headline hero + sezioni).
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "DeroArts — Software & Applicazioni",
    template: "%s | DeroArts",
  },
  description:
    "DeroArts progetta app, siti e software su misura. Prodotti curati dall'idea al rilascio.",
  metadataBase: new URL(getSiteUrl()),
  icons: {
    icon: [
      { url: "/brand/favicon.svg", type: "image/svg+xml" },
      { url: "/brand/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/brand/favicon.svg",
    apple: "/brand/apple-touch-icon.png",
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    siteName: "DeroArts",
    locale: "it_IT",
    type: "website",
    images: [
      { ...DEFAULT_OG_IMAGE, alt: "DeroArts — Software che semplifica la vita" },
    ],
  },
};

// Mobile viewport + safe-area support. `viewportFit: "cover"` is REQUIRED to
// activate env(safe-area-inset-*) for notch/home-bar handling in installed PWA.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1A222B",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Pill U/A: visibile SOLO quando NEXT_PUBLIC_SHOW_UA_SWITCH === "true".
  // È navigazione soltanto — il bypass di login (DEV_UA_SWITCH) è uno switch
  // separato: così si può nascondere la pill senza togliere l'accesso dev.
  const showDevSwitcher = process.env.NEXT_PUBLIC_SHOW_UA_SWITCH === "true";

  return (
    <html lang="it" className={`${poppins.variable} ${fraunces.variable}`}>
      <body className="font-sans antialiased">
        <ScrollToTop />
        {children}
        {showDevSwitcher && (
          // DevSwitcher is imported lazily so it is completely absent from the
          // production bundle when DEV_UA_SWITCH is false/unset.
          <DevSwitcherLoader />
        )}
      </body>
    </html>
  );
}

// Inline async server component — avoids a top-level dynamic import that
// would run even when the switcher is disabled.
async function DevSwitcherLoader() {
  const { default: DevSwitcher } = await import("@/components/DevSwitcher");
  return <DevSwitcher />;
}

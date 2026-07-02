import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "DeroArts — Software & Applicazioni",
    template: "%s | DeroArts",
  },
  description:
    "DeroArts crea software e applicazioni per piccole e medie imprese. Scopri i nostri prodotti e richiedi informazioni.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://deroarts.com"
  ),
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
      {
        url: "/brand/og-image.png",
        width: 1200,
        height: 630,
        alt: "DeroArts — Software che semplifica la vita",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const showDevSwitcher = process.env.DEV_UA_SWITCH === "true";

  return (
    <html lang="it" className={poppins.variable}>
      <body className="font-sans antialiased">
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

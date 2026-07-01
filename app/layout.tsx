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
    icon: "/brand/favicon.svg",
    shortcut: "/brand/favicon.svg",
  },
  openGraph: {
    siteName: "DeroArts",
    locale: "it_IT",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" className={poppins.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}

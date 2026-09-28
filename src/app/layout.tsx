import type { Metadata, Viewport } from "next";
import Providers from "@/providers/Providers";
import "./globals.css";

// Absolute base so OG/Twitter image URLs resolve (Vercel URL in prod).
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Salvadanaio — Il tuo risparmio digitale",
  description:
    "Guadagna di più sui tuoi risparmi. Rendimenti superiori a qualsiasi conto deposito italiano, con prelievo istantaneo e senza vincoli.",
  openGraph: {
    title: "Salvadanaio",
    description: "Il salvadanaio digitale per gli italiani. ~5% sui tuoi risparmi.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  // Prevent zoom on input focus on iOS
  userScalable: false,
  themeColor: "#faf8f4",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

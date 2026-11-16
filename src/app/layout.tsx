import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { cookieToInitialState } from "wagmi";
import Providers from "@/providers/Providers";
import { wagmiConfig } from "@/config/wagmi";
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
  themeColor: "#F4DBCB",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Hydrate wagmi from the SSR cookie so the server and client render the same
  // connection state on first paint — no hydration mismatch, no re-sign on refresh.
  const initialState = cookieToInitialState(
    wagmiConfig,
    headers().get("cookie")
  );

  return (
    <html lang="it">
      <body>
        <Providers initialState={initialState}>{children}</Providers>
      </body>
    </html>
  );
}

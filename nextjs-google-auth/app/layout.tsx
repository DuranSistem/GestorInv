import type { Metadata } from "next";
import { Syne, IBM_Plex_Sans } from "next/font/google";
import Providers from "./providers";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-ibm",
  display: "swap",
});

export const metadata: Metadata = {
  title: "OKOMOS · Flujo de Acceso 360°",
  description: "Sistema de asesoría patrimonial OKOMOS",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${syne.variable} ${ibmPlexSans.variable}`}>
      <body style={{ margin: 0, padding: 0 }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

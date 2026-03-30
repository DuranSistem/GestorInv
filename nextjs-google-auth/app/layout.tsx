import type { Metadata } from "next";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Gestor de Inversiones",
  description: "Plataforma de gestion de inversiones",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body style={{ margin: 0, padding: 0 }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

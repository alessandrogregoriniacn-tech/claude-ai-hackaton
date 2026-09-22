import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { THEME_INIT_SCRIPT } from "@/lib/theme";

export const metadata: Metadata = {
  title: "Hagenton — Quanto avresti risparmiato",
  description:
    "Simulatore retrospettivo: scopri quanto avresti accumulato se avessi risparmiato in passato, con un rendimento annuo fisso.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" suppressHydrationWarning>
      <head>
        {/* Applica il tema salvato prima dell'idratazione: niente flash. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        <Nav />
        {children}
      </body>
    </html>
  );
}

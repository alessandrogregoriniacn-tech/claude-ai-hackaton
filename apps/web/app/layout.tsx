import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}

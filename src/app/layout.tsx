import type { Metadata } from "next";
import { Jost } from "next/font/google";
import "./globals.css";

// Fuente variable: cubre los pesos 300, 400, 500 y 700 que usa la app con un solo archivo.
const jost = Jost({
  subsets: ["latin"],
  variable: "--font-jost",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Studio ACAA | Arquitectura y Diseño",
  description: "Portafolio de arquitectura y proyectos técnicos de Studio ACAA.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={jost.variable}>
      <body>
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "OdontoLink — El enlace para tu sonrisa",
    template: "%s | OdontoLink",
  },
  description:
    "Plataforma SaaS de salud dental que conecta pacientes internacionales con las mejores clinicas dentales de la region fronteriza.",
  keywords: ["dental", "clinica dental", "turismo medico", "Tijuana", "ortodoncia", "implantes"],
  openGraph: {
    title: "OdontoLink — El enlace para tu sonrisa",
    description: "Encuentra la mejor clinica dental y agenda tu cita en minutos.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}

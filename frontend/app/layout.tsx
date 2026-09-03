import type { Metadata } from "next";
import { Nunito_Sans } from "next/font/google";
import "./globals.css";

import { BandeauReseau } from "@/components/layout/bandeau-reseau";

// Police unique de la charte, avec ses quatre graisses.
const nunitoSans = Nunito_Sans({
  variable: "--font-nunito-sans",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "EDLoc — Votre état des lieux, en toute sérénité",
  description:
    "Réalisez vos états des lieux d'entrée et de sortie sur place : saisie pièce par pièce, photos horodatées, double signature et PDF envoyé aux deux parties.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${nunitoSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {/* Le bandeau surveille la connexion sur toutes les pages, publiques comprises. */}
        <BandeauReseau />
        {children}
      </body>
    </html>
  );
}

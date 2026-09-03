import type { Metadata } from "next";

// Titre propre à la page : les composants client ne peuvent pas exporter de
// metadata, c'est donc le layout du segment qui le porte.
export const metadata: Metadata = {
  title: "Créer un compte — EDLoc",
  description: "Créez votre compte bailleur EDLoc.",
};

export default function LayoutInscription({ children }: { children: React.ReactNode }) {
  return children;
}

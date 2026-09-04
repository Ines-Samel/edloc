import type { Metadata } from "next";

// Titre propre à la page : les composants client ne peuvent pas exporter de
// metadata, c'est donc le layout du segment qui le porte.
export const metadata: Metadata = {
  title: "Connexion — EDLoc",
  description: "Connectez-vous à votre espace EDLoc.",
};

export default function LayoutConnexion({ children }: { children: React.ReactNode }) {
  return children;
}

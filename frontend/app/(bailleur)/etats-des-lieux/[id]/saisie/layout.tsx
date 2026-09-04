import type { Metadata } from "next";

// Titre propre à la page : les composants client ne peuvent pas exporter de
// metadata, c'est donc le layout du segment qui le porte.
export const metadata: Metadata = {
  title: "Saisie — EDLoc",
  description: "Décrivez le logement pièce par pièce.",
};

export default function LayoutSaisie({ children }: { children: React.ReactNode }) {
  return children;
}

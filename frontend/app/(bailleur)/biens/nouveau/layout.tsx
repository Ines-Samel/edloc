import type { Metadata } from "next";

// Titre propre à la page : les composants client ne peuvent pas exporter de
// metadata, c'est donc le layout du segment qui le porte.
export const metadata: Metadata = {
  title: "Nouveau bien — EDLoc",
  description: "Ajoutez un logement à votre parc.",
};

export default function LayoutNouveau({ children }: { children: React.ReactNode }) {
  return children;
}

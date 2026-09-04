import type { Metadata } from "next";

// Titre propre à la page : les composants client ne peuvent pas exporter de
// metadata, c'est donc le layout du segment qui le porte.
export const metadata: Metadata = {
  title: "Comparaison entrée / sortie — EDLoc",
  description: "Les écarts constatés.",
};

export default function LayoutComparaison({ children }: { children: React.ReactNode }) {
  return children;
}

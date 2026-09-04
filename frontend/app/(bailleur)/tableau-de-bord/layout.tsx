import type { Metadata } from "next";

// Titre propre à la page : les composants client ne peuvent pas exporter de
// metadata, c'est donc le layout du segment qui le porte.
export const metadata: Metadata = {
  title: "Tableau de bord — EDLoc",
  description: "Vos indicateurs et vos états des lieux récents.",
};

export default function LayoutTableauDeBord({ children }: { children: React.ReactNode }) {
  return children;
}

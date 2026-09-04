import type { Metadata } from "next";

// Titre propre à la page : les composants client ne peuvent pas exporter de
// metadata, c'est donc le layout du segment qui le porte.
export const metadata: Metadata = {
  title: "Historique — EDLoc",
  description: "Tous vos états des lieux.",
};

export default function LayoutHistorique({ children }: { children: React.ReactNode }) {
  return children;
}

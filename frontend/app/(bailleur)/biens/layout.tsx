import type { Metadata } from "next";

// Titre propre à la page : les composants client ne peuvent pas exporter de
// metadata, c'est donc le layout du segment qui le porte.
export const metadata: Metadata = {
  title: "Mes biens — EDLoc",
  description: "Vos logements et leur dernier état des lieux.",
};

export default function LayoutBiens({ children }: { children: React.ReactNode }) {
  return children;
}

import type { Metadata } from "next";

// Titre propre à la page : les composants client ne peuvent pas exporter de
// metadata, c'est donc le layout du segment qui le porte.
export const metadata: Metadata = {
  title: "Modifier le bien — EDLoc",
  description: "Modifiez les informations du logement.",
};

export default function LayoutModifier({ children }: { children: React.ReactNode }) {
  return children;
}

import type { Metadata } from "next";

// Titre propre à la page : les composants client ne peuvent pas exporter de
// metadata, c'est donc le layout du segment qui le porte.
export const metadata: Metadata = {
  title: "Nouveau mot de passe — EDLoc",
  description: "Définissez un nouveau mot de passe.",
};

export default function LayoutReinitialisation({ children }: { children: React.ReactNode }) {
  return children;
}

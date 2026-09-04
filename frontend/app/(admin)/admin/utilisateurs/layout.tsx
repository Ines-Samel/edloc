import type { Metadata } from "next";

// Titre propre à la page : les composants client ne peuvent pas exporter de
// metadata, c'est donc le layout du segment qui le porte.
export const metadata: Metadata = {
  title: "Comptes utilisateurs — EDLoc",
  description: "Administration des comptes bailleurs.",
};

export default function LayoutUtilisateurs({ children }: { children: React.ReactNode }) {
  return children;
}

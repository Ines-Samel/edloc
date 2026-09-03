import type { Metadata } from "next";

// Titre propre à la page : les composants client ne peuvent pas exporter de
// metadata, c'est donc le layout du segment qui le porte.
export const metadata: Metadata = {
  title: "Mon compte — EDLoc",
  description: "Profil, sécurité et données personnelles.",
};

export default function LayoutCompte({ children }: { children: React.ReactNode }) {
  return children;
}

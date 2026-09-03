import type { Metadata } from "next";

// Titre propre à la page : les composants client ne peuvent pas exporter de
// metadata, c'est donc le layout du segment qui le porte.
export const metadata: Metadata = {
  title: "Mot de passe oublié — EDLoc",
  description: "Recevez un lien de réinitialisation.",
};

export default function LayoutMotDePasseOublie({ children }: { children: React.ReactNode }) {
  return children;
}

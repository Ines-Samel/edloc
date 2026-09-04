import type { Metadata } from "next";

// Titre propre à la page : les composants client ne peuvent pas exporter de
// metadata, c'est donc le layout du segment qui le porte.
export const metadata: Metadata = {
  title: "Confirmation du compte — EDLoc",
  description: "Confirmez votre adresse e-mail.",
};

export default function LayoutConfirmation({ children }: { children: React.ReactNode }) {
  return children;
}

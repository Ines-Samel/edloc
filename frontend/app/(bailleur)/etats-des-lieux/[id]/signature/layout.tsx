import type { Metadata } from "next";

// Titre propre à la page : les composants client ne peuvent pas exporter de
// metadata, c'est donc le layout du segment qui le porte.
export const metadata: Metadata = {
  title: "Signature — EDLoc",
  description: "Double signature sur place.",
};

export default function LayoutSignature({ children }: { children: React.ReactNode }) {
  return children;
}

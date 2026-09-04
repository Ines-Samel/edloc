import type { Metadata } from "next";

// Titre propre à la page : les composants client ne peuvent pas exporter de
// metadata, c'est donc le layout du segment qui le porte.
export const metadata: Metadata = {
  title: "État des lieux — EDLoc",
  description: "Consultez un état des lieux.",
};

export default function LayoutId({ children }: { children: React.ReactNode }) {
  return children;
}

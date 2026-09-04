import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Choix des pièces — EDLoc",
  description: "Sélectionnez les pièces et les accès à constater.",
};

export default function LayoutPieces({ children }: { children: React.ReactNode }) {
  return children;
}

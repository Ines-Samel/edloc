import { Building2, Clock, House, PlusCircle, User, type LucideIcon } from "lucide-react";

export type EntreeNavigation = {
  href: string;
  /** Libellé complet (barre latérale desktop, menu tablette). */
  libelle: string;
  /** Libellé court (barre d'onglets mobile). */
  court: string;
  icone: LucideIcon;
};

// Entrées de la navigation bailleur, dans l'ordre des maquettes 6 à 15.
export const ENTREES_BAILLEUR: EntreeNavigation[] = [
  { href: "/tableau-de-bord", libelle: "Tableau de bord", court: "Accueil", icone: House },
  { href: "/biens", libelle: "Mes biens", court: "Biens", icone: Building2 },
  { href: "/etats-des-lieux/nouveau", libelle: "Nouvel EDL", court: "Nouveau", icone: PlusCircle },
  { href: "/historique", libelle: "Historique", court: "Historique", icone: Clock },
  { href: "/compte", libelle: "Mon compte", court: "Compte", icone: User },
];

export function estActive(chemin: string, href: string): boolean {
  return chemin === href || chemin.startsWith(`${href}/`);
}

// Titre affiché dans la barre du haut, déduit du chemin courant.
export function titreDeLaPage(chemin: string): string {
  const entree = ENTREES_BAILLEUR.find((e) => estActive(chemin, e.href));
  if (entree) return entree.libelle;
  if (chemin.startsWith("/etats-des-lieux")) return "État des lieux";
  if (chemin.startsWith("/admin")) return "Administration";
  return "EDLoc";
}

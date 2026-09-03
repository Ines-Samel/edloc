/*
 * Types des ressources renvoyées par l'API, et helpers d'affichage partagés par
 * les écrans de l'espace bailleur.
 */
import type { Completude, StatutEdl } from "@/components/edl/pastille-etat";

export type Pagination = { page: number; limite: number; total: number; totalPages: number };

export type ResumeEdl = {
  idEdl: string;
  typeEdl: "entree" | "sortie";
  statut: StatutEdl;
  dateEdl: string;
  dateSignature: string | null;
  bien: { idBien: string; adresse: string; codePostal: string; ville: string };
  locataire: { nom: string; prenom: string };
};

export type Bien = {
  idBien: string;
  adresse: string;
  codePostal: string;
  ville: string;
  typeLogement: string;
  nombrePieces: number | null;
  surface: string | null;
  nombreEdl: number;
  dernierEdl: { idEdl: string; typeEdl: "entree" | "sortie"; statut: StatutEdl; dateEdl: string } | null;
};

export type ListeBiens = { donnees: Bien[]; communes: string[]; pagination: Pagination };
export type ListeEdl = { donnees: ResumeEdl[]; pagination: Pagination };

export function formaterDate(valeur: string): string {
  return new Date(valeur).toLocaleDateString("fr-FR");
}

export function libelleTypeEdl(type: "entree" | "sortie"): string {
  return type === "entree" ? "Entrée" : "Sortie";
}

// Descriptif court d'un bien : « Lyon · T3 · 68 m² ».
export function descriptifBien(bien: Bien): string {
  const morceaux = [bien.ville, bien.typeLogement];
  if (bien.surface) morceaux.push(`${Number(bien.surface)} m²`);
  return morceaux.join(" · ");
}

/*
 * État d'avancement d'un bien, tel que l'affiche la carte de l'écran 7 :
 * aucun état des lieux → à compléter ; un brouillon en cours → en cours ;
 * sinon le nombre d'états des lieux réalisés.
 */
export function avancementBien(bien: Bien): { completude: Completude; libelle: string } {
  if (bien.nombreEdl === 0) {
    return { completude: "aCompleter", libelle: "EDL à compléter" };
  }
  if (bien.dernierEdl?.statut === "brouillon") {
    return { completude: "enCours", libelle: "EDL en cours" };
  }
  return {
    completude: "complet",
    libelle: bien.nombreEdl === 1 ? "1 état des lieux" : `${bien.nombreEdl} états des lieux`,
  };
}

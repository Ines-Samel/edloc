import type { LucideIcon } from "lucide-react";
import { CircleAlert, CircleCheck, Ellipsis, Sparkles } from "lucide-react";

/*
 * Pastilles d'état, cœur de l'exigence d'accessibilité de la charte (§5) : aucun
 * état n'est porté par la couleur seule. Chaque pastille combine trois signaux
 * indépendants — une icône, un libellé écrit en toutes lettres, et un style de
 * bordure distinct (pleine / tirets / pointillés). En niveaux de gris, les états
 * restent donc différenciables.
 */
type Apparence = { icone: LucideIcon; libelle: string; classes: string };

const ETATS_ELEMENT = {
  neuf: {
    icone: Sparkles,
    libelle: "Neuf",
    classes: "border-solid border-vert-profond text-vert-profond",
  },
  bonEtat: {
    icone: CircleCheck,
    libelle: "Bon état",
    classes: "border-solid border-vert-profond text-vert-profond",
  },
  etatUsage: {
    icone: Ellipsis,
    libelle: "Usage",
    classes: "border-dashed border-ocre-fonce text-ocre-fonce",
  },
  mauvaisEtat: {
    icone: CircleAlert,
    libelle: "Mauvais",
    classes: "border-dotted border-alerte-foncee text-alerte-foncee",
  },
} as const satisfies Record<string, Apparence>;

const COMPLETUDES = {
  complet: {
    icone: CircleCheck,
    libelle: "Complet",
    classes: "border-solid border-vert-profond text-vert-profond",
  },
  enCours: {
    icone: Ellipsis,
    libelle: "En cours",
    classes: "border-dashed border-ocre-fonce text-ocre-fonce",
  },
  aCompleter: {
    icone: CircleAlert,
    libelle: "À compléter",
    classes: "border-dotted border-alerte-foncee text-alerte-foncee",
  },
} as const satisfies Record<string, Apparence>;

const STATUTS_EDL = {
  signe: {
    icone: CircleCheck,
    libelle: "Signé",
    classes: "border-solid border-vert-profond text-vert-profond",
  },
  brouillon: {
    icone: Ellipsis,
    libelle: "En cours",
    classes: "border-dashed border-ocre-fonce text-ocre-fonce",
  },
} as const satisfies Record<string, Apparence>;

export type EtatElement = keyof typeof ETATS_ELEMENT;
export type Completude = keyof typeof COMPLETUDES;
export type StatutEdl = keyof typeof STATUTS_EDL;

function Pastille({ apparence }: { apparence: Apparence }) {
  const { icone: Icone, libelle, classes } = apparence;

  return (
    <span
      className={`text-legende inline-flex items-center gap-1.5 rounded-pilule border-2 bg-card px-3 py-1 ${classes}`}
    >
      <Icone aria-hidden className="size-4" />
      {libelle}
    </span>
  );
}

export function PastilleEtatElement({ etat }: { etat: EtatElement }) {
  return <Pastille apparence={ETATS_ELEMENT[etat]} />;
}

export function PastilleCompletude({ completude }: { completude: Completude }) {
  return <Pastille apparence={COMPLETUDES[completude]} />;
}

export function PastilleStatutEdl({ statut }: { statut: StatutEdl }) {
  return <Pastille apparence={STATUTS_EDL[statut]} />;
}

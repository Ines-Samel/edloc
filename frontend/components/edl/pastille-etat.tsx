import type { LucideIcon } from "lucide-react";
import { CircleAlert, CircleCheck, Ellipsis, Sparkles } from "lucide-react";

/*
 * Pastilles d'état, cœur de l'exigence d'accessibilité de la charte (§5) : aucun
 * état n'est porté par la couleur seule. Chaque pastille combine trois signaux
 * indépendants — une icône, un libellé écrit en toutes lettres, et un style de
 * bordure distinct (pleine / tirets / pointillés). En niveaux de gris, les états
 * restent donc différenciables.
 */
type Apparence = { icone: LucideIcon; libelle: string; classes: string; plein?: string };

const ETATS_ELEMENT = {
  neuf: {
    icone: Sparkles,
    libelle: "Neuf",
    classes: "border-solid border-vert-profond text-vert-profond",
    plein: "border-solid border-vert-profond bg-vert-profond text-white",
  },
  bonEtat: {
    icone: CircleCheck,
    libelle: "Bon état",
    classes: "border-solid border-vert-profond text-vert-profond",
    plein: "border-solid border-vert-profond bg-vert-profond text-white",
  },
  etatUsage: {
    icone: Ellipsis,
    libelle: "Usage",
    classes: "border-dashed border-ocre-fonce text-ocre-fonce",
    plein: "border-dashed border-ocre-fonce bg-ocre-fonce text-white",
  },
  mauvaisEtat: {
    icone: CircleAlert,
    libelle: "Mauvais",
    classes: "border-dotted border-alerte-foncee text-alerte-foncee",
    plein: "border-dotted border-alerte-foncee bg-alerte-foncee text-white",
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

function Pastille({
  apparence,
  libelle: libellePersonnalise,
  plein = false,
}: {
  apparence: Apparence;
  libelle?: string;
  plein?: boolean;
}) {
  const { icone: Icone, libelle: libelleParDefaut } = apparence;
  const classes = plein ? (apparence.plein ?? apparence.classes) : apparence.classes;
  const libelle = libellePersonnalise ?? libelleParDefaut;

  return (
    <span
      className={`text-legende inline-flex items-center gap-1.5 rounded-pilule border-2 px-3 py-1 ${plein ? "" : "bg-card"} ${classes}`}
    >
      <Icone aria-hidden className="size-4" />
      {libelle}
    </span>
  );
}

export function PastilleEtatElement({ etat, plein = false }: { etat: EtatElement; plein?: boolean }) {
  return <Pastille apparence={ETATS_ELEMENT[etat]} plein={plein} />;
}

export function PastilleCompletude({
  completude,
  libelle,
}: {
  completude: Completude;
  libelle?: string;
}) {
  return <Pastille apparence={COMPLETUDES[completude]} libelle={libelle} />;
}

export function PastilleStatutEdl({ statut }: { statut: StatutEdl }) {
  return <Pastille apparence={STATUTS_EDL[statut]} />;
}

/*
 * Verdict de la comparaison entrée / sortie (RG15). Le libellé nomme précisément
 * le changement plutôt que d'afficher un « écart » indifférencié : une
 * amélioration et une dégradation ne se lisent pas de la même façon.
 */
const VERDICTS = {
  identique: null,
  degrade: {
    icone: CircleAlert,
    libelle: "Dégradé",
    classes: "border-dotted border-alerte-foncee text-alerte-foncee",
  },
  ameliore: {
    icone: CircleCheck,
    libelle: "Amélioré",
    classes: "border-solid border-vert-profond text-vert-profond",
  },
  nouveau: {
    icone: Sparkles,
    libelle: "Nouveau",
    classes: "border-dashed border-ocre-fonce text-ocre-fonce",
  },
  nonConstate: {
    icone: CircleAlert,
    libelle: "Non constaté",
    classes: "border-dashed border-ocre-fonce text-ocre-fonce",
  },
} as const;

export type Verdict = keyof typeof VERDICTS;

export function PastilleVerdict({ verdict }: { verdict: Verdict }) {
  const apparence = VERDICTS[verdict];
  if (!apparence) return <span className="text-legende text-brun">—</span>;
  return <Pastille apparence={apparence} />;
}

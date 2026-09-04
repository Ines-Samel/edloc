/*
 * Catalogue des pièces proposées à la sélection, et de ce qu'elles contiennent.
 *
 * Deux niveaux, volontairement distincts :
 *  - `auto`     : éléments créés d'office avec la pièce. Une chambre a forcément
 *                 un sol, des murs et un plafond : les faire saisir serait une
 *                 corvée sans valeur.
 *  - `proposes` : éléments fréquents mais pas systématiques (fenêtre, volets,
 *                 radiateur…). Ils restent à ajouter d'un geste.
 *
 * Les extérieurs et les rubriques d'accès n'ont pas de sol/murs/plafond : leur
 * liste `auto` est vide ou réduite à ce qui existe réellement.
 */
export type PieceProposee = { libelle: string; auto: string[]; proposes: string[] };
export type GroupePieces = { titre: string; pieces: PieceProposee[] };

// Une pièce close comporte toujours ces trois éléments.
const CLOSE = ["Sol", "Murs", "Plafond"];
// Fréquents dans une pièce close, mais jamais garantis.
const COURANTS = ["Porte", "Fenêtre", "Volets", "Éclairage", "Prises et interrupteurs", "Radiateur"];

export const CATALOGUE_PIECES: GroupePieces[] = [
  {
    titre: "Pièces de vie",
    pieces: [
      { libelle: "Entrée", auto: CLOSE, proposes: [...COURANTS, "Placard", "Interphone"] },
      { libelle: "Séjour", auto: CLOSE, proposes: [...COURANTS, "Cheminée"] },
      { libelle: "Salle à manger", auto: CLOSE, proposes: COURANTS },
      {
        libelle: "Cuisine",
        auto: [...CLOSE, "Plan de travail", "Évier"],
        proposes: [
          ...COURANTS,
          "Robinetterie",
          "Meubles hauts",
          "Meubles bas",
          "Hotte",
          "Plaque de cuisson",
          "Four",
          "Réfrigérateur",
        ],
      },
      { libelle: "Chambre 1", auto: CLOSE, proposes: [...COURANTS, "Placard"] },
      { libelle: "Chambre 2", auto: CLOSE, proposes: [...COURANTS, "Placard"] },
      { libelle: "Chambre 3", auto: CLOSE, proposes: [...COURANTS, "Placard"] },
      { libelle: "Bureau", auto: CLOSE, proposes: [...COURANTS, "Placard"] },
      { libelle: "Couloir", auto: CLOSE, proposes: ["Éclairage", "Prises et interrupteurs", "Placard"] },
    ],
  },
  {
    titre: "Sanitaires",
    pieces: [
      {
        libelle: "Salle de bain",
        auto: [...CLOSE, "Lavabo", "Robinetterie"],
        proposes: [...COURANTS, "Baignoire", "Douche", "Miroir", "Meuble vasque", "VMC", "Sèche-serviettes"],
      },
      {
        libelle: "Salle d'eau",
        auto: [...CLOSE, "Douche", "Robinetterie"],
        proposes: [...COURANTS, "Lavabo", "Miroir", "VMC"],
      },
      {
        libelle: "WC",
        auto: [...CLOSE, "Cuvette", "Chasse d'eau"],
        proposes: ["Porte", "Fenêtre", "Éclairage", "Abattant", "Lave-mains", "VMC"],
      },
      { libelle: "Buanderie", auto: CLOSE, proposes: [...COURANTS, "Arrivée d'eau", "Évacuation", "VMC"] },
    ],
  },
  {
    titre: "Dépendances et extérieurs",
    pieces: [
      { libelle: "Balcon", auto: ["Sol", "Garde-corps"], proposes: ["Éclairage", "Store"] },
      { libelle: "Terrasse", auto: ["Sol"], proposes: ["Garde-corps", "Éclairage", "Store"] },
      { libelle: "Jardin", auto: [], proposes: ["Clôture", "Portail", "Végétation", "Abri de jardin", "Éclairage"] },
      { libelle: "Cave", auto: CLOSE, proposes: ["Porte", "Éclairage", "Étagères"] },
      { libelle: "Grenier", auto: ["Sol", "Charpente"], proposes: ["Trappe", "Éclairage", "Isolation"] },
      { libelle: "Cellier", auto: CLOSE, proposes: ["Porte", "Éclairage", "Étagères"] },
      { libelle: "Garage", auto: [...CLOSE, "Porte de garage"], proposes: ["Éclairage", "Prises et interrupteurs"] },
      { libelle: "Place de parking", auto: ["Sol"], proposes: ["Marquage au sol", "Numéro", "Éclairage"] },
    ],
  },
  {
    titre: "Accès, clés et compteurs",
    pieces: [
      {
        libelle: "Clés et accès",
        auto: ["Clé porte d'entrée"],
        proposes: ["Clé boîte aux lettres", "Clé cave", "Badge ou vigik", "Télécommande de garage", "Code digicode"],
      },
      { libelle: "Boîte aux lettres", auto: ["Boîte aux lettres"], proposes: ["Serrure", "Étiquette nom"] },
      {
        libelle: "Compteurs",
        auto: ["Compteur électricité", "Compteur eau froide"],
        proposes: ["Compteur eau chaude", "Compteur gaz"],
      },
      { libelle: "Sécurité", auto: ["Détecteur de fumée"], proposes: ["Interphone", "Serrure de sûreté", "Alarme"] },
    ],
  },
];

/*
 * Matériaux proposés par type d'élément. Le matériau change la lecture d'un état :
 * un parquet ne se dégrade pas comme un carrelage, et le préciser à l'entrée évite
 * une discussion à la sortie. Il est stocké dans le libellé, sous la forme
 * « Sol — Parquet », comme dans le document remis aux parties.
 */
export const MATERIAUX: Record<string, string[]> = {
  Sol: ["Parquet", "Stratifié", "Carrelage", "PVC / lino", "Moquette", "Béton ciré", "Pierre"],
  Murs: ["Peinture", "Papier peint", "Enduit", "Carrelage", "Lambris", "Béton"],
  Plafond: ["Peinture", "Enduit", "Dalles", "Lambris", "Poutres apparentes"],
  Fenêtre: ["Bois", "PVC", "Aluminium", "Mixte bois-alu"],
  Porte: ["Bois", "PVC", "Aluminium", "Vitrée", "Blindée"],
  "Porte de garage": ["Basculante", "Sectionnelle", "Enroulable", "Battante", "Motorisée"],
  Volets: ["Bois", "PVC", "Aluminium", "Roulant manuel", "Roulant électrique", "Battants"],
  Radiateur: ["Électrique", "Eau chaude", "Fonte", "Inertie", "Sèche-serviettes"],
  "Plan de travail": ["Stratifié", "Bois", "Granit", "Quartz", "Inox"],
  Évier: ["Inox", "Céramique", "Résine", "Granit"],
  Lavabo: ["Céramique", "Résine", "Verre", "Pierre"],
  Cuvette: ["Céramique", "Suspendue", "Au sol"],
  Douche: ["Bac céramique", "Bac résine", "Italienne", "Cabine"],
  Baignoire: ["Acrylique", "Fonte", "Acier", "Balnéo"],
  "Plaque de cuisson": ["Induction", "Vitrocéramique", "Gaz", "Électrique"],
  "Garde-corps": ["Métal", "Bois", "Verre", "Maçonnerie"],
  Clôture: ["Grillage", "Bois", "Végétale", "Muret"],
};

const SEPARATEUR = " — ";

// « Sol — Parquet » → « Sol »
export function nomDeBase(libelle: string): string {
  return libelle.split(SEPARATEUR)[0].trim();
}

// « Sol — Parquet » → « Parquet »
export function materiauDe(libelle: string): string | null {
  const morceaux = libelle.split(SEPARATEUR);
  return morceaux.length > 1 ? morceaux.slice(1).join(SEPARATEUR).trim() : null;
}

export function materiauxPour(libelle: string): string[] | null {
  return MATERIAUX[nomDeBase(libelle)] ?? null;
}

export function composerLibelle(base: string, materiau: string | null): string {
  return materiau ? `${base}${SEPARATEUR}${materiau}` : base;
}

function normaliser(texte: string): string {
  return texte.trim().toLowerCase();
}

function pieceDuCatalogue(libellePiece: string): PieceProposee | undefined {
  for (const groupe of CATALOGUE_PIECES) {
    const exacte = groupe.pieces.find((p) => normaliser(p.libelle) === normaliser(libellePiece));
    if (exacte) return exacte;
  }
  // Une pièce nommée « Chambre 4 » reste une chambre.
  for (const groupe of CATALOGUE_PIECES) {
    const approchante = groupe.pieces.find((p) =>
      normaliser(libellePiece).startsWith(normaliser(p.libelle).split(" ")[0]),
    );
    if (approchante) return approchante;
  }
  return undefined;
}

export function elementsAutomatiques(libellePiece: string): string[] {
  return pieceDuCatalogue(libellePiece)?.auto ?? CLOSE;
}

export function elementsProposes(libellePiece: string): string[] {
  const piece = pieceDuCatalogue(libellePiece);
  return piece ? [...piece.auto, ...piece.proposes] : [...CLOSE, ...COURANTS];
}

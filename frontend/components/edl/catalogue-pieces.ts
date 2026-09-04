/*
 * Catalogue des pièces proposées à la sélection. Il couvre le logement lui-même
 * mais aussi ce qu'un état des lieux doit constater et qu'on oublie facilement :
 * dépendances, clés, boîte aux lettres, stationnement et compteurs.
 *
 * Chaque pièce porte ses éléments courants : ils sont proposés en un geste au
 * moment de la saisie, l'utilisateur restant libre d'en ajouter d'autres.
 */
export type PieceProposee = { libelle: string; elements: string[] };
export type GroupePieces = { titre: string; pieces: PieceProposee[] };

// Éléments communs à toute pièce fermée.
const BASE = ["Murs", "Sol", "Plafond", "Porte", "Fenêtre", "Éclairage", "Prises et interrupteurs"];

export const CATALOGUE_PIECES: GroupePieces[] = [
  {
    titre: "Pièces de vie",
    pieces: [
      { libelle: "Entrée", elements: [...BASE, "Placard"] },
      { libelle: "Séjour", elements: [...BASE, "Volets", "Radiateur"] },
      { libelle: "Salle à manger", elements: [...BASE, "Volets", "Radiateur"] },
      {
        libelle: "Cuisine",
        elements: [
          ...BASE,
          "Plan de travail",
          "Évier",
          "Robinetterie",
          "Meubles hauts",
          "Meubles bas",
          "Hotte",
          "Plaque de cuisson",
          "Four",
        ],
      },
      { libelle: "Chambre 1", elements: [...BASE, "Placard", "Volets", "Radiateur"] },
      { libelle: "Chambre 2", elements: [...BASE, "Placard", "Volets", "Radiateur"] },
      { libelle: "Chambre 3", elements: [...BASE, "Placard", "Volets", "Radiateur"] },
      { libelle: "Bureau", elements: [...BASE, "Placard", "Radiateur"] },
      { libelle: "Couloir", elements: [...BASE, "Placard"] },
    ],
  },
  {
    titre: "Sanitaires",
    pieces: [
      {
        libelle: "Salle de bain",
        elements: [...BASE, "Baignoire", "Lavabo", "Robinetterie", "Miroir", "Meuble vasque", "VMC"],
      },
      {
        libelle: "Salle d'eau",
        elements: [...BASE, "Douche", "Lavabo", "Robinetterie", "Miroir", "VMC"],
      },
      { libelle: "WC", elements: [...BASE, "Cuvette", "Abattant", "Chasse d'eau", "Lave-mains"] },
      { libelle: "Buanderie", elements: [...BASE, "Arrivée d'eau", "Évacuation", "VMC"] },
    ],
  },
  {
    titre: "Dépendances et extérieurs",
    pieces: [
      { libelle: "Balcon", elements: ["Sol", "Garde-corps", "Éclairage"] },
      { libelle: "Terrasse", elements: ["Sol", "Garde-corps", "Éclairage"] },
      { libelle: "Jardin", elements: ["Clôture", "Portail", "Végétation", "Abri de jardin"] },
      { libelle: "Cave", elements: ["Porte", "Sol", "Murs", "Éclairage"] },
      { libelle: "Grenier", elements: ["Trappe", "Sol", "Charpente", "Éclairage"] },
      { libelle: "Cellier", elements: ["Porte", "Sol", "Murs", "Étagères"] },
      { libelle: "Garage", elements: ["Porte de garage", "Sol", "Murs", "Éclairage", "Prise"] },
      { libelle: "Place de parking", elements: ["Marquage au sol", "Numéro", "État du sol"] },
    ],
  },
  {
    titre: "Accès, clés et compteurs",
    pieces: [
      {
        libelle: "Clés et accès",
        elements: [
          "Clé porte d'entrée",
          "Clé boîte aux lettres",
          "Clé cave",
          "Badge ou vigik",
          "Télécommande de garage",
          "Code digicode",
        ],
      },
      { libelle: "Boîte aux lettres", elements: ["Boîte aux lettres", "Serrure", "Étiquette nom"] },
      {
        libelle: "Compteurs",
        elements: [
          "Compteur électricité",
          "Compteur eau froide",
          "Compteur eau chaude",
          "Compteur gaz",
        ],
      },
      { libelle: "Sécurité", elements: ["Détecteur de fumée", "Interphone", "Serrure de sûreté"] },
    ],
  },
];

// Éléments proposés pour une pièce donnée ; repli sur la base si le nom est libre.
export function elementsProposes(libellePiece: string): string[] {
  const normalise = (texte: string) => texte.trim().toLowerCase();
  for (const groupe of CATALOGUE_PIECES) {
    const trouvee = groupe.pieces.find((p) => normalise(p.libelle) === normalise(libellePiece));
    if (trouvee) return trouvee.elements;
  }
  // Une pièce nommée « Chambre 4 » ou « Chambre des enfants » reste une chambre.
  for (const groupe of CATALOGUE_PIECES) {
    const approchante = groupe.pieces.find((p) =>
      normalise(libellePiece).startsWith(normalise(p.libelle).split(" ")[0]),
    );
    if (approchante) return approchante.elements;
  }
  return BASE;
}

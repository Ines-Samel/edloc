import { prisma } from '../lib/prisma';

const ECHELLE: Record<string, number> = {
  neuf: 3,
  bonEtat: 2,
  etatUsage: 1,
  mauvaisEtat: 0,
};

type ElementComparaison = {
  libelle: string;
  etatEntree?: string;
  etatSortie?: string;
  commentaireEntree?: string;
  commentaireSortie?: string;
  verdict: 'identique' | 'degrade' | 'ameliore' | 'nonConstate' | 'nouveau';
};

type PieceComparaison = {
  libelle: string;
  presence: 'lesDeux' | 'entreeSeule' | 'sortieSeule';
  elements: ElementComparaison[];
};

const normaliser = (s: string) => s.trim().toLowerCase();

export async function comparer(idBailleur: string, idEdl: string) {
  // a) Charger l'EDL via propriété
  const edl = await prisma.etatDesLieux.findFirst({
    where: { idEdl, bien: { idBailleur } },
    include: {
      pieces: {
        orderBy: { ordre: 'asc' },
        include: { elements: true },
      },
    },
  });
  if (!edl) return { type: 'introuvable' as const };

  // b) Vérifier que c'est une sortie
  if (edl.typeEdl !== 'sortie') return { type: 'pasUneSortie' as const };

  // c) Charger l'EDL d'entrée de référence
  const edlEntree = await prisma.etatDesLieux.findFirst({
    where: {
      idBien: edl.idBien,
      idLocataire: edl.idLocataire,
      typeEdl: 'entree',
      statut: 'signe',
    },
    orderBy: { dateEdl: 'desc' },
    include: {
      pieces: {
        orderBy: { ordre: 'asc' },
        include: { elements: true },
      },
    },
  });
  if (!edlEntree) return { type: 'entreeManquante' as const };

  // d) Appariement par libellés normalisés
  const piecesEntreeMap = new Map(edlEntree.pieces.map((p) => [normaliser(p.libelle), p]));
  const piecesSortieMap = new Map(edl.pieces.map((p) => [normaliser(p.libelle), p]));
  const allPieceKeys = new Set([...piecesEntreeMap.keys(), ...piecesSortieMap.keys()]);

  // e) Verdicts et synthèse
  const synthese = { identiques: 0, degrades: 0, ameliores: 0, nouveaux: 0, nonConstates: 0 };
  const pieces: PieceComparaison[] = [];

  for (const key of allPieceKeys) {
    const pieceEntree = piecesEntreeMap.get(key);
    const pieceSortie = piecesSortieMap.get(key);
    const libelle = (pieceEntree ?? pieceSortie)!.libelle;

    if (!pieceSortie) {
      const elements: ElementComparaison[] = pieceEntree!.elements.map((e) => {
        synthese.nonConstates++;
        return {
          libelle: e.libelle,
          etatEntree: e.etat,
          commentaireEntree: e.commentaire ?? undefined,
          verdict: 'nonConstate' as const,
        };
      });
      pieces.push({ libelle, presence: 'entreeSeule', elements });
    } else if (!pieceEntree) {
      const elements: ElementComparaison[] = pieceSortie.elements.map((e) => {
        synthese.nouveaux++;
        return {
          libelle: e.libelle,
          etatSortie: e.etat,
          commentaireSortie: e.commentaire ?? undefined,
          verdict: 'nouveau' as const,
        };
      });
      pieces.push({ libelle, presence: 'sortieSeule', elements });
    } else {
      const elementsEntreeMap = new Map(
        pieceEntree.elements.map((e) => [normaliser(e.libelle), e]),
      );
      const elementsSortieMap = new Map(
        pieceSortie.elements.map((e) => [normaliser(e.libelle), e]),
      );
      const allElementKeys = new Set([
        ...elementsEntreeMap.keys(),
        ...elementsSortieMap.keys(),
      ]);

      const elements: ElementComparaison[] = [];

      for (const eKey of allElementKeys) {
        const elemEntree = elementsEntreeMap.get(eKey);
        const elemSortie = elementsSortieMap.get(eKey);

        if (!elemSortie) {
          synthese.nonConstates++;
          elements.push({
            libelle: elemEntree!.libelle,
            etatEntree: elemEntree!.etat,
            commentaireEntree: elemEntree!.commentaire ?? undefined,
            verdict: 'nonConstate',
          });
        } else if (!elemEntree) {
          synthese.nouveaux++;
          elements.push({
            libelle: elemSortie.libelle,
            etatSortie: elemSortie.etat,
            commentaireSortie: elemSortie.commentaire ?? undefined,
            verdict: 'nouveau',
          });
        } else {
          const scaleEntree = ECHELLE[elemEntree.etat];
          const scaleSortie = ECHELLE[elemSortie.etat];
          let verdict: 'identique' | 'degrade' | 'ameliore';
          if (scaleSortie === scaleEntree) {
            verdict = 'identique';
            synthese.identiques++;
          } else if (scaleSortie < scaleEntree) {
            verdict = 'degrade';
            synthese.degrades++;
          } else {
            verdict = 'ameliore';
            synthese.ameliores++;
          }
          elements.push({
            libelle: elemEntree.libelle,
            etatEntree: elemEntree.etat,
            etatSortie: elemSortie.etat,
            commentaireEntree: elemEntree.commentaire ?? undefined,
            commentaireSortie: elemSortie.commentaire ?? undefined,
            verdict,
          });
        }
      }

      pieces.push({ libelle, presence: 'lesDeux', elements });
    }
  }

  // f) Retour
  return {
    type: 'ok' as const,
    comparaison: {
      edlEntree: {
        idEdl: edlEntree.idEdl,
        dateEdl: edlEntree.dateEdl,
        dateSignature: edlEntree.dateSignature,
      },
      edlSortie: {
        idEdl: edl.idEdl,
        dateEdl: edl.dateEdl,
        statut: edl.statut,
      },
      pieces,
      synthese,
    },
  };
}

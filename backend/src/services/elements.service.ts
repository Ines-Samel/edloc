import { prisma } from '../lib/prisma';
import { ElementInput } from '../schemas/pieces-elements.schema';

export async function ajouterElement(idBailleur: string, idPiece: string, donnees: ElementInput) {
  const piece = await prisma.piece.findFirst({
    where: {
      idPiece,
      etatDesLieux: { bien: { idBailleur } },
    },
    include: { etatDesLieux: { select: { statut: true } } },
  });
  if (!piece) return { type: 'introuvable' as const };
  if (piece.etatDesLieux.statut === 'signe') return { type: 'verrouille' as const };

  const element = await prisma.element.create({
    data: { libelle: donnees.libelle, etat: donnees.etat, commentaire: donnees.commentaire, idPiece },
  });

  return { type: 'ok' as const, donnees: element };
}

export async function modifierElement(
  idBailleur: string,
  idElement: string,
  donnees: ElementInput,
) {
  const element = await prisma.element.findFirst({
    where: {
      idElement,
      piece: {
        etatDesLieux: { bien: { idBailleur } },
      },
    },
    include: {
      piece: {
        include: { etatDesLieux: { select: { statut: true } } },
      },
    },
  });
  if (!element) return { type: 'introuvable' as const };
  if (element.piece.etatDesLieux.statut === 'signe') return { type: 'verrouille' as const };

  const elementModifie = await prisma.element.update({
    where: { idElement },
    data: {
      libelle: donnees.libelle,
      etat: donnees.etat,
      commentaire: donnees.commentaire,
    },
  });

  return { type: 'ok' as const, donnees: elementModifie };
}

export async function supprimerElement(idBailleur: string, idElement: string) {
  const element = await prisma.element.findFirst({
    where: {
      idElement,
      piece: {
        etatDesLieux: { bien: { idBailleur } },
      },
    },
    include: {
      piece: {
        include: { etatDesLieux: { select: { statut: true } } },
      },
    },
  });
  if (!element) return { type: 'introuvable' as const };
  if (element.piece.etatDesLieux.statut === 'signe') return { type: 'verrouille' as const };

  await prisma.element.delete({ where: { idElement } });

  return { type: 'ok' as const };
}

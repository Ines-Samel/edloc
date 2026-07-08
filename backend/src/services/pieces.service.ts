import { prisma } from '../lib/prisma';
import { PieceInput } from '../schemas/pieces-elements.schema';

export async function ajouterPiece(idBailleur: string, idEdl: string, donnees: PieceInput) {
  const edl = await prisma.etatDesLieux.findFirst({
    where: {
      idEdl,
      bien: { idBailleur },
    },
  });
  if (!edl) return { type: 'introuvable' as const };
  if (edl.statut === 'signe') return { type: 'verrouille' as const };

  let ordre = donnees.ordre;
  if (ordre === undefined) {
    const aggregate = await prisma.piece.aggregate({
      where: { idEdl },
      _max: { ordre: true },
    });
    ordre = (aggregate._max.ordre ?? 0) + 1;
  }

  const piece = await prisma.piece.create({
    data: { libelle: donnees.libelle, ordre, idEdl },
  });

  return { type: 'ok' as const, donnees: piece };
}

export async function modifierPiece(idBailleur: string, idPiece: string, donnees: PieceInput) {
  const piece = await prisma.piece.findFirst({
    where: {
      idPiece,
      etatDesLieux: { bien: { idBailleur } },
    },
    include: { etatDesLieux: { select: { statut: true } } },
  });
  if (!piece) return { type: 'introuvable' as const };
  if (piece.etatDesLieux.statut === 'signe') return { type: 'verrouille' as const };

  const pieceModifiee = await prisma.piece.update({
    where: { idPiece },
    data: { libelle: donnees.libelle, ordre: donnees.ordre },
  });

  return { type: 'ok' as const, donnees: pieceModifiee };
}

export async function supprimerPiece(idBailleur: string, idPiece: string) {
  const piece = await prisma.piece.findFirst({
    where: {
      idPiece,
      etatDesLieux: { bien: { idBailleur } },
    },
    include: { etatDesLieux: { select: { statut: true } } },
  });
  if (!piece) return { type: 'introuvable' as const };
  if (piece.etatDesLieux.statut === 'signe') return { type: 'verrouille' as const };

  await prisma.piece.delete({ where: { idPiece } });

  return { type: 'ok' as const };
}

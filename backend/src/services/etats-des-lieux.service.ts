import { prisma } from '../lib/prisma';
import { CreationEdlInput, ModificationEdlInput } from '../schemas/etats-des-lieux.schema';

export async function creerEdl(idBailleur: string, donnees: CreationEdlInput) {
  const bien = await prisma.bien.findFirst({
    where: { idBien: donnees.idBien, idBailleur },
  });
  if (!bien) return { type: 'introuvable' as const };

  const locataire = donnees.locataire.email
    ? ((await prisma.locataire.findUnique({
        where: { email: donnees.locataire.email },
      })) ?? (await prisma.locataire.create({ data: donnees.locataire })))
    : await prisma.locataire.create({ data: donnees.locataire });

  const dateEdl = donnees.dateEdl ? new Date(donnees.dateEdl) : undefined;

  if (donnees.typeEdl === 'sortie') {
    const edlEntree = await prisma.etatDesLieux.findFirst({
      where: {
        idBien: donnees.idBien,
        idLocataire: locataire.idLocataire,
        typeEdl: 'entree',
        statut: 'signe',
      },
      orderBy: { dateEdl: 'desc' },
      include: {
        pieces: {
          include: { elements: true },
        },
      },
    });

    if (!edlEntree) return { type: 'entreeManquante' as const };

    const edlCree = await prisma.$transaction(async (tx) => {
      const edl = await tx.etatDesLieux.create({
        data: {
          typeEdl: 'sortie',
          dateEdl,
          idBien: donnees.idBien,
          idLocataire: locataire.idLocataire,
        },
      });

      for (const piece of edlEntree.pieces) {
        const nouvellePiece = await tx.piece.create({
          data: {
            libelle: piece.libelle,
            ordre: piece.ordre,
            idEdl: edl.idEdl,
          },
        });

        for (const element of piece.elements) {
          await tx.element.create({
            data: {
              libelle: element.libelle,
              etat: element.etat,
              idPiece: nouvellePiece.idPiece,
            },
          });
        }
      }

      return tx.etatDesLieux.findFirst({
        where: { idEdl: edl.idEdl },
        include: { bien: true, locataire: true },
      });
    });

    return { type: 'ok' as const, donnees: edlCree };
  }

  const edl = await prisma.etatDesLieux.create({
    data: {
      typeEdl: 'entree',
      dateEdl,
      idBien: donnees.idBien,
      idLocataire: locataire.idLocataire,
    },
    include: { bien: true, locataire: true },
  });

  return { type: 'ok' as const, donnees: edl };
}

export async function obtenirEdl(idBailleur: string, idEdl: string) {
  const edl = await prisma.etatDesLieux.findFirst({
    where: {
      idEdl,
      bien: { idBailleur },
    },
    include: {
      bien: true,
      locataire: true,
      pieces: {
        orderBy: { ordre: 'asc' },
        include: {
          elements: {
            include: { photos: true },
          },
        },
      },
      signatures: true,
    },
  });

  if (!edl) return { type: 'introuvable' as const };
  return { type: 'ok' as const, donnees: edl };
}

export async function modifierEdl(
  idBailleur: string,
  idEdl: string,
  donnees: ModificationEdlInput,
) {
  const edl = await prisma.etatDesLieux.findFirst({
    where: {
      idEdl,
      bien: { idBailleur },
    },
  });

  if (!edl) return { type: 'introuvable' as const };
  if (edl.statut === 'signe') return { type: 'verrouille' as const };

  const edlModifie = await prisma.etatDesLieux.update({
    where: { idEdl },
    data: { dateEdl: new Date(donnees.dateEdl) },
  });

  return { type: 'ok' as const, donnees: edlModifie };
}

export async function listerEdlParBien(idBailleur: string, idBien: string) {
  const bien = await prisma.bien.findFirst({
    where: { idBien, idBailleur },
  });

  if (!bien) return { type: 'introuvable' as const };

  const etatsDesLieux = await prisma.etatDesLieux.findMany({
    where: { idBien },
    orderBy: { dateEdl: 'desc' },
    select: {
      idEdl: true,
      typeEdl: true,
      statut: true,
      dateEdl: true,
      dateSignature: true,
      locataire: {
        select: { nom: true, prenom: true },
      },
    },
  });

  return { type: 'ok' as const, donnees: etatsDesLieux };
}

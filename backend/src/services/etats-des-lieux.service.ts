import { DeleteObjectsCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { prisma } from '../lib/prisma';
import { s3, S3_BUCKET } from '../lib/s3';
import { Prisma } from '../../generated/prisma';
import {
  CreationEdlInput,
  ModificationEdlInput,
  ListeEdlQuery,
} from '../schemas/etats-des-lieux.schema';

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
          // Ordre déterministe : sans tri explicite, PostgreSQL peut renvoyer les
          // lignes dans un ordre différent après une mise à jour, et les cartes
          // se réordonneraient sous les doigts pendant la saisie.
          elements: {
            orderBy: { libelle: 'asc' },
            include: { photos: { orderBy: { dateHorodatage: 'asc' } } },
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

// Liste transversale : tous les états des lieux du bailleur, biens confondus,
// avec filtres optionnels par bien et par période.
export async function listerEdl(idBailleur: string, query: ListeEdlQuery) {
  const { idBien, statut, dateDebut, dateFin, page, limite } = query;

  const where: Prisma.EtatDesLieuxWhereInput = { bien: { idBailleur } };

  if (idBien) {
    where.idBien = idBien;
  }

  if (statut) {
    where.statut = statut;
  }

  if (dateDebut || dateFin) {
    where.dateEdl = {
      ...(dateDebut ? { gte: new Date(dateDebut) } : {}),
      ...(dateFin ? { lte: new Date(dateFin) } : {}),
    };
  }

  const skip = (page - 1) * limite;

  const [donnees, total] = await Promise.all([
    prisma.etatDesLieux.findMany({
      where,
      orderBy: [{ dateEdl: 'desc' }, { dateSignature: 'desc' }],
      skip,
      take: limite,
      select: {
        idEdl: true,
        typeEdl: true,
        statut: true,
        dateEdl: true,
        dateSignature: true,
        bien: {
          select: { idBien: true, adresse: true, codePostal: true, ville: true },
        },
        locataire: {
          select: { nom: true, prenom: true },
        },
      },
    }),
    prisma.etatDesLieux.count({ where }),
  ]);

  return {
    donnees,
    pagination: {
      page,
      limite,
      total,
      totalPages: Math.ceil(total / limite),
    },
  };
}

/*
 * Suppression d'un état des lieux (RG16) : la cascade en base emporte pièces,
 * éléments, photos et signatures ; les fichiers du stockage objet, eux, ne sont
 * pas concernés par les clés étrangères et doivent être purgés explicitement.
 *
 * Un état des lieux signé n'est pas supprimable : il est verrouillé (RG12) et
 * constitue une preuve remise aux deux parties. Il disparaîtra avec son bien ou
 * avec le compte, au titre du droit à l'effacement.
 */
export async function supprimerEdl(idBailleur: string, idEdl: string) {
  const edl = await prisma.etatDesLieux.findFirst({
    where: { idEdl, bien: { idBailleur } },
    select: { idEdl: true, statut: true, idLocataire: true },
  });

  if (!edl) return { type: 'introuvable' as const };
  if (edl.statut === 'signe') return { type: 'verrouille' as const };

  await prisma.etatDesLieux.delete({ where: { idEdl } });

  // Le locataire n'est rattaché à aucune autre visite : le conserver reviendrait
  // à garder des données personnelles sans finalité.
  const autresEdl = await prisma.etatDesLieux.count({ where: { idLocataire: edl.idLocataire } });
  if (autresEdl === 0) {
    await prisma.locataire.delete({ where: { idLocataire: edl.idLocataire } }).catch(() => {});
  }

  try {
    const cles: string[] = [];
    let suite: string | undefined;
    do {
      const page = await s3.send(
        new ListObjectsV2Command({
          Bucket: S3_BUCKET,
          Prefix: `edl/${idEdl}/`,
          ContinuationToken: suite,
        }),
      );
      for (const objet of page.Contents ?? []) if (objet.Key) cles.push(objet.Key);
      suite = page.NextContinuationToken;
    } while (suite);

    for (let i = 0; i < cles.length; i += 1000) {
      await s3.send(
        new DeleteObjectsCommand({
          Bucket: S3_BUCKET,
          Delete: { Objects: cles.slice(i, i + 1000).map((Key) => ({ Key })) },
        }),
      );
    }
  } catch (err) {
    // La ligne est supprimée : on ne rejoue pas l'échec du stockage à l'appelant.
    console.error('Erreur de purge du stockage objet :', err);
  }

  return { type: 'ok' as const };
}

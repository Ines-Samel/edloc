import { DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { prisma } from '../lib/prisma';
import { s3, S3_BUCKET } from '../lib/s3';
import { ListeUtilisateursQuery } from '../schemas/admin.schema';

const SELECT_BAILLEUR = {
  idBailleur: true,
  nom: true,
  prenom: true,
  email: true,
  telephone: true,
  actif: true,
  dateCreation: true,
} as const;

export async function listerBailleurs(query: ListeUtilisateursQuery) {
  const { recherche, page, limite } = query;

  const where = recherche
    ? {
        OR: [
          { nom: { contains: recherche, mode: 'insensitive' as const } },
          { prenom: { contains: recherche, mode: 'insensitive' as const } },
          { email: { contains: recherche, mode: 'insensitive' as const } },
        ],
      }
    : undefined;

  const skip = (page - 1) * limite;

  const [bailleurs, total] = await Promise.all([
    prisma.bailleur.findMany({
      where,
      skip,
      take: limite,
      orderBy: { dateCreation: 'desc' },
      select: {
        ...SELECT_BAILLEUR,
        _count: { select: { biens: true } },
        biens: {
          select: { _count: { select: { etatsDesLieux: true } } },
        },
      },
    }),
    prisma.bailleur.count({ where }),
  ]);

  const donnees = bailleurs.map(({ biens: biensData, ...bailleur }) => ({
    ...bailleur,
    totalEdls: biensData.reduce((acc, b) => acc + b._count.etatsDesLieux, 0),
  }));

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

export async function changerStatut(idBailleur: string, actif: boolean) {
  const existant = await prisma.bailleur.findUnique({ where: { idBailleur } });
  if (!existant) return { type: 'introuvable' as const };

  const bailleur = await prisma.bailleur.update({
    where: { idBailleur },
    data: { actif },
    select: SELECT_BAILLEUR,
  });

  return { type: 'ok' as const, donnees: bailleur };
}

export async function supprimerBailleur(idBailleur: string) {
  const bailleur = await prisma.bailleur.findUnique({
    where: { idBailleur },
    include: {
      biens: {
        include: {
          etatsDesLieux: {
            include: {
              pieces: {
                include: {
                  elements: {
                    include: { photos: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
  if (!bailleur) return { type: 'introuvable' as const };

  // a) Collecter les clés S3
  const cles: string[] = [];
  for (const bien of bailleur.biens) {
    for (const edl of bien.etatsDesLieux) {
      cles.push(`edl/${edl.idEdl}/etat-des-lieux.pdf`);
      for (const piece of edl.pieces) {
        for (const element of piece.elements) {
          for (const photo of element.photos) {
            cles.push(photo.chemin);
          }
        }
      }
    }
  }

  // b) Suppression en base (cascades)
  await prisma.bailleur.delete({ where: { idBailleur } });

  // c) Suppression S3 par lots après le delete
  if (cles.length > 0) {
    try {
      for (let i = 0; i < cles.length; i += 1000) {
        const lot = cles.slice(i, i + 1000).map((Key) => ({ Key }));
        await s3.send(
          new DeleteObjectsCommand({ Bucket: S3_BUCKET, Delete: { Objects: lot } }),
        );
      }
    } catch (err) {
      console.error('Erreur suppression S3 :', err);
    }
  }

  return { type: 'ok' as const };
}

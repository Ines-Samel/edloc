import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { randomUUID } from 'crypto';
import { prisma } from '../lib/prisma';
import { s3, S3_BUCKET } from '../lib/s3';

function extensionDepuisMimetype(mimetype: string): string {
  if (mimetype === 'image/jpeg') return 'jpg';
  if (mimetype === 'image/png') return 'png';
  if (mimetype === 'image/webp') return 'webp';
  return 'bin';
}

function contentTypeDepuisExtension(chemin: string): string {
  if (chemin.endsWith('.jpg')) return 'image/jpeg';
  if (chemin.endsWith('.png')) return 'image/png';
  if (chemin.endsWith('.webp')) return 'image/webp';
  return 'application/octet-stream';
}

export async function ajouterPhoto(
  idBailleur: string,
  idElement: string,
  fichier: Express.Multer.File,
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
        include: { etatDesLieux: { select: { idEdl: true, statut: true } } },
      },
    },
  });
  if (!element) return { type: 'introuvable' as const };
  if (element.piece.etatDesLieux.statut === 'signe') return { type: 'verrouille' as const };

  const ext = extensionDepuisMimetype(fichier.mimetype);
  const cle = `edl/${element.piece.etatDesLieux.idEdl}/${idElement}/${randomUUID()}.${ext}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: cle,
      Body: fichier.buffer,
      ContentType: fichier.mimetype,
    }),
  );

  const photo = await prisma.photo.create({
    data: { chemin: cle, idElement },
  });

  return { type: 'ok' as const, donnees: photo };
}

export async function recupererFichier(idBailleur: string, idPhoto: string) {
  const photo = await prisma.photo.findFirst({
    where: {
      idPhoto,
      element: {
        piece: {
          etatDesLieux: { bien: { idBailleur } },
        },
      },
    },
  });
  if (!photo) return { type: 'introuvable' as const };

  const reponse = await s3.send(
    new GetObjectCommand({ Bucket: S3_BUCKET, Key: photo.chemin }),
  );

  const flux = reponse.Body as Readable;
  const contentType = contentTypeDepuisExtension(photo.chemin);

  return { type: 'ok' as const, donnees: { flux, contentType } };
}

export async function supprimerPhoto(idBailleur: string, idPhoto: string) {
  const photo = await prisma.photo.findFirst({
    where: {
      idPhoto,
      element: {
        piece: {
          etatDesLieux: { bien: { idBailleur } },
        },
      },
    },
    include: {
      element: {
        include: {
          piece: {
            include: { etatDesLieux: { select: { statut: true } } },
          },
        },
      },
    },
  });
  if (!photo) return { type: 'introuvable' as const };
  if (photo.element.piece.etatDesLieux.statut === 'signe') return { type: 'verrouille' as const };

  await s3.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: photo.chemin }));
  await prisma.photo.delete({ where: { idPhoto } });

  return { type: 'ok' as const };
}

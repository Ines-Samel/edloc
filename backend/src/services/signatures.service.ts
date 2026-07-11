import { GetObjectCommand, NoSuchKey } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { prisma } from '../lib/prisma';
import { s3, S3_BUCKET } from '../lib/s3';
import { SignatureInput } from '../schemas/signatures.schema';
import { genererEtStockerPdf } from './pdf.service';

export async function signer(idBailleur: string, idEdl: string, donnees: SignatureInput) {
  const edl = await prisma.etatDesLieux.findFirst({
    where: { idEdl, bien: { idBailleur } },
    include: { pieces: true, signatures: true },
  });
  if (!edl) return { type: 'introuvable' as const };
  if (edl.statut === 'signe') return { type: 'verrouille' as const };
  if (edl.pieces.length === 0) return { type: 'sansPiece' as const };

  const dejaSigne = edl.signatures.some((s) => s.roleSignataire === donnees.roleSignataire);
  if (dejaSigne) return { type: 'dejaSigne' as const };

  const estDeuxieme = edl.signatures.length === 1;

  if (!estDeuxieme) {
    const signature = await prisma.signature.create({
      data: {
        roleSignataire: donnees.roleSignataire,
        donneesSignature: donnees.donneesSignature,
        idEdl,
      },
    });
    return { type: 'ok' as const, verrouille: false, signature };
  }

  const [signature] = await prisma.$transaction([
    prisma.signature.create({
      data: {
        roleSignataire: donnees.roleSignataire,
        donneesSignature: donnees.donneesSignature,
        idEdl,
      },
    }),
    prisma.etatDesLieux.update({
      where: { idEdl },
      data: { statut: 'signe', dateSignature: new Date() },
    }),
  ]);

  try {
    await genererEtStockerPdf(idEdl);
  } catch (err) {
    console.error('Erreur génération PDF :', err);
  }

  return { type: 'ok' as const, verrouille: true, signature };
}

export async function recupererPdf(idBailleur: string, idEdl: string) {
  const edl = await prisma.etatDesLieux.findFirst({
    where: { idEdl, bien: { idBailleur } },
  });
  if (!edl) return { type: 'introuvable' as const };
  if (edl.statut !== 'signe') return { type: 'nonSigne' as const };

  const cle = `edl/${idEdl}/etat-des-lieux.pdf`;

  try {
    const reponse = await s3.send(new GetObjectCommand({ Bucket: S3_BUCKET, Key: cle }));
    return { type: 'ok' as const, flux: reponse.Body as Readable };
  } catch (err) {
    if (err instanceof NoSuchKey) {
      await genererEtStockerPdf(idEdl);
      const reponse = await s3.send(new GetObjectCommand({ Bucket: S3_BUCKET, Key: cle }));
      return { type: 'ok' as const, flux: reponse.Body as Readable };
    }
    throw err;
  }
}

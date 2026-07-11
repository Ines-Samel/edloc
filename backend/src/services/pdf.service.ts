import PDFDocument from 'pdfkit';
import { Readable } from 'stream';
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { prisma } from '../lib/prisma';
import { s3, S3_BUCKET } from '../lib/s3';

const ETATS: Record<string, string> = {
  neuf: 'Neuf',
  bonEtat: 'Bon état',
  etatUsage: "État d'usage",
  mauvaisEtat: 'Mauvais état',
};

async function streamToBuffer(readable: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of readable) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export async function genererEtStockerPdf(idEdl: string): Promise<string> {
  const edl = await prisma.etatDesLieux.findFirst({
    where: { idEdl },
    include: {
      bien: {
        include: { bailleur: { select: { nom: true, prenom: true, email: true } } },
      },
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

  if (!edl) throw new Error(`EDL introuvable : ${idEdl}`);

  // Pré-téléchargement de toutes les photos
  const photoBuffers = new Map<string, Buffer>();
  for (const piece of edl.pieces) {
    for (const element of piece.elements) {
      for (const photo of element.photos) {
        try {
          const rep = await s3.send(new GetObjectCommand({ Bucket: S3_BUCKET, Key: photo.chemin }));
          photoBuffers.set(photo.idPhoto, await streamToBuffer(rep.Body as Readable));
        } catch {
          // Photo inaccessible, on continue
        }
      }
    }
  }

  const typeLabel = edl.typeEdl === 'entree' ? "d'entrée" : 'de sortie';

  const pdfBuffer = await new Promise<Buffer>((resolve) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const buffers: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));

    const proche = () => doc.y > doc.page.height - 150;

    // a) En-tête
    doc.fontSize(18).font('Helvetica-Bold').text(`EDLoc — État des lieux ${typeLabel}`);
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica');
    doc.text(`${edl.bien.adresse}, ${edl.bien.codePostal} ${edl.bien.ville}`);
    doc.text(`Date de l'état des lieux : ${edl.dateEdl.toLocaleDateString('fr-FR')}`);
    if (edl.dateSignature) {
      doc.text(`Date de signature : ${edl.dateSignature.toLocaleDateString('fr-FR')}`);
    }

    doc.moveDown();

    // b) Parties
    doc.fontSize(14).font('Helvetica-Bold').text('Bailleur');
    doc.fontSize(12).font('Helvetica');
    doc.text(`${edl.bien.bailleur.prenom} ${edl.bien.bailleur.nom}`);
    doc.text(`Email : ${edl.bien.bailleur.email}`);

    doc.moveDown();

    doc.fontSize(14).font('Helvetica-Bold').text('Locataire');
    doc.fontSize(12).font('Helvetica');
    doc.text(`${edl.locataire.prenom} ${edl.locataire.nom}`);
    if (edl.locataire.email) {
      doc.text(`Email : ${edl.locataire.email}`);
    }

    // c) Pièces
    for (const piece of edl.pieces) {
      if (proche()) doc.addPage();
      doc.moveDown();
      doc.fontSize(14).font('Helvetica-Bold').text(piece.libelle);
      doc.fontSize(12).font('Helvetica');

      for (const element of piece.elements) {
        if (proche()) doc.addPage();
        const etatLabel = ETATS[element.etat] ?? element.etat;
        doc.text(`${element.libelle} — ${etatLabel}`);
        if (element.commentaire) {
          doc.fontSize(10).text(element.commentaire, { indent: 20 });
          doc.fontSize(12);
        }

        for (const photo of element.photos) {
          const buf = photoBuffers.get(photo.idPhoto);
          if (buf) {
            if (doc.y > doc.page.height - 200) doc.addPage();
            try {
              doc.image(buf, { width: 150 });
            } catch {
              // Image non intégrable, on continue
            }
            doc
              .fontSize(9)
              .text(photo.dateHorodatage.toLocaleString('fr-FR'), { indent: 20 });
            doc.fontSize(12);
          }
        }
      }
    }

    // d) Signatures
    if (proche()) doc.addPage();
    doc.moveDown();
    doc.fontSize(14).font('Helvetica-Bold').text('Signatures');
    doc.fontSize(12).font('Helvetica');

    for (const sig of edl.signatures) {
      if (doc.y > doc.page.height - 200) doc.addPage();
      const roleLabel = sig.roleSignataire === 'bailleur' ? 'Bailleur' : 'Locataire';
      doc.text(`${roleLabel} — ${sig.dateSignature.toLocaleDateString('fr-FR')}`);
      const base64Data = sig.donneesSignature.replace(/^data:image\/png;base64,/, '');
      const imgBuffer = Buffer.from(base64Data, 'base64');
      try {
        doc.image(imgBuffer, { width: 180 });
      } catch {
        // Image non intégrable
      }
      doc.moveDown(0.5);
    }

    doc.end();
  });

  const cle = `edl/${idEdl}/etat-des-lieux.pdf`;
  await s3.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: cle,
      Body: pdfBuffer,
      ContentType: 'application/pdf',
    }),
  );

  return cle;
}

import { GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { prisma } from '../lib/prisma';
import { s3, S3_BUCKET } from '../lib/s3';
import { mailer, EMAIL_EXPEDITEUR } from '../lib/mailer';

async function streamToBuffer(readable: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of readable) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export async function envoyerPdfSigne(idEdl: string): Promise<string[]> {
  const edl = await prisma.etatDesLieux.findFirst({
    where: { idEdl },
    include: {
      bien: {
        select: {
          adresse: true,
          codePostal: true,
          ville: true,
          bailleur: { select: { email: true } },
        },
      },
      locataire: { select: { email: true } },
    },
  });

  if (!edl) throw new Error(`EDL introuvable : ${idEdl}`);

  const cle = `edl/${idEdl}/etat-des-lieux.pdf`;
  const reponse = await s3.send(new GetObjectCommand({ Bucket: S3_BUCKET, Key: cle }));
  const pdfBuffer = await streamToBuffer(reponse.Body as Readable);

  const destinataires: string[] = [edl.bien.bailleur.email];
  if (edl.locataire.email) {
    destinataires.push(edl.locataire.email);
  }

  const typeLabel = edl.typeEdl === 'entree' ? "d'entrée" : 'de sortie';
  const adresse = `${edl.bien.adresse}, ${edl.bien.codePostal} ${edl.bien.ville}`;
  const dateSigne = edl.dateSignature?.toLocaleDateString('fr-FR') ?? '';

  await mailer.sendMail({
    from: EMAIL_EXPEDITEUR,
    to: destinataires,
    subject: `Votre état des lieux ${typeLabel} — ${adresse}`,
    text: `Bonjour,\n\nVotre état des lieux ${typeLabel} pour le bien situé au ${adresse} a été signé le ${dateSigne}.\n\nVous trouverez ce document en pièce jointe, à conserver.\n\nCordialement,\nL'équipe EDLoc`,
    attachments: [{ filename: 'etat-des-lieux.pdf', content: pdfBuffer }],
  });

  return destinataires;
}

// Base des liens envoyés par e-mail : pages publiques du front (écrans 4 et 5 des maquettes).
const URL_FRONTEND = process.env.URL_FRONTEND ?? 'http://localhost:3000';

export async function envoyerConfirmationCompte(
  destinataire: string,
  prenom: string,
  jeton: string,
): Promise<void> {
  const lien = `${URL_FRONTEND}/confirmation?jeton=${jeton}`;

  await mailer.sendMail({
    from: EMAIL_EXPEDITEUR,
    to: destinataire,
    subject: 'Confirmez votre adresse e-mail — EDLoc',
    text: `Bonjour ${prenom},\n\nBienvenue sur EDLoc. Pour activer votre compte, confirmez votre adresse e-mail en ouvrant le lien ci-dessous :\n\n${lien}\n\nCe lien est valable 24 heures et ne peut servir qu'une seule fois. Tant que votre adresse n'est pas confirmée, la connexion reste impossible.\n\nSi vous n'êtes pas à l'origine de cette inscription, ignorez simplement ce message.\n\nCordialement,\nL'équipe EDLoc`,
  });
}

export async function envoyerReinitialisationMotDePasse(
  destinataire: string,
  prenom: string,
  jeton: string,
): Promise<void> {
  const lien = `${URL_FRONTEND}/reinitialisation?jeton=${jeton}`;

  await mailer.sendMail({
    from: EMAIL_EXPEDITEUR,
    to: destinataire,
    subject: 'Réinitialisation de votre mot de passe — EDLoc',
    text: `Bonjour ${prenom},\n\nVous avez demandé la réinitialisation de votre mot de passe EDLoc. Définissez-en un nouveau en ouvrant le lien ci-dessous :\n\n${lien}\n\nCe lien est valable 1 heure et ne peut servir qu'une seule fois.\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez ce message : votre mot de passe actuel reste valable.\n\nCordialement,\nL'équipe EDLoc`,
  });
}

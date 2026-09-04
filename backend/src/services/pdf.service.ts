import PDFDocument from 'pdfkit';
import { Readable } from 'stream';
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { prisma } from '../lib/prisma';
import { s3, S3_BUCKET } from '../lib/s3';

/*
 * Génération du PDF récapitulatif (RG13). La mise en page reprend la charte
 * graphique : fond crème, cartes bordées, pastilles d'état combinant couleur,
 * libellé écrit et style de trait — un document imprimé en noir et blanc reste
 * donc lisible, ce qui compte pour une pièce à valeur de preuve.
 *
 * Les polices sont celles fournies par PDFKit (Helvetica) : Nunito Sans exigerait
 * d'embarquer les fichiers de police dans le dépôt.
 */
const COULEURS = {
  terracotta: '#c05b3c',
  terracottaFonce: '#a64b2a',
  creme: '#faf6f1',
  sable: '#eae1d6',
  encre: '#2b2420',
  brun: '#5c5142',
  vertProfond: '#3f6047',
  ocreFonce: '#8a5a00',
  alerteFoncee: '#9c3222',
  blanc: '#ffffff',
};

type StyleTrait = 'plein' | 'tirets' | 'pointilles';

const ETATS: Record<string, { libelle: string; couleur: string; trait: StyleTrait }> = {
  neuf: { libelle: 'Neuf', couleur: COULEURS.vertProfond, trait: 'plein' },
  bonEtat: { libelle: 'Bon état', couleur: COULEURS.vertProfond, trait: 'plein' },
  etatUsage: { libelle: "État d'usage", couleur: COULEURS.ocreFonce, trait: 'tirets' },
  mauvaisEtat: { libelle: 'Mauvais état', couleur: COULEURS.alerteFoncee, trait: 'pointilles' },
};

const MARGE = 45;
const LARGEUR_PAGE = 595.28;
const LARGEUR_UTILE = LARGEUR_PAGE - MARGE * 2;
const BAS_DE_PAGE = 841.89 - MARGE - 30;

type Doc = PDFKit.PDFDocument;

async function streamToBuffer(readable: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of readable) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

function appliquerTrait(doc: Doc, trait: StyleTrait) {
  if (trait === 'tirets') doc.dash(3, { space: 2 });
  else if (trait === 'pointilles') doc.dash(1, { space: 2 });
  else doc.undash();
}

function carte(
  doc: Doc,
  x: number,
  y: number,
  largeur: number,
  hauteur: number,
  options: { fond?: string; bordure?: string; trait?: StyleTrait } = {},
) {
  const { fond = COULEURS.blanc, bordure = COULEURS.sable, trait = 'plein' } = options;
  appliquerTrait(doc, trait);
  doc.roundedRect(x, y, largeur, hauteur, 6).fillAndStroke(fond, bordure);
  doc.undash();
}

// Le logo de la charte, redessiné en vectoriel : maison terracotta traversée
// d'une coche vert profond qui dépasse du toit.
function logo(doc: Doc, x: number, y: number, taille: number) {
  const e = taille / 64;
  doc.save();
  doc
    .lineWidth(5.5 * e)
    .lineJoin('round')
    .lineCap('round');
  doc
    .moveTo(x + 10 * e, y + 27.5 * e)
    .lineTo(x + 32 * e, y + 9 * e)
    .lineTo(x + 54 * e, y + 27.5 * e)
    .lineTo(x + 54 * e, y + 52 * e)
    .lineTo(x + 10 * e, y + 52 * e)
    .closePath()
    .stroke(COULEURS.terracotta);
  doc
    .lineWidth(6.5 * e)
    .moveTo(x + 19 * e, y + 33.5 * e)
    .lineTo(x + 29.5 * e, y + 44 * e)
    .lineTo(x + 53 * e, y + 6.5 * e)
    .stroke(COULEURS.vertProfond);
  doc.restore();
}

// Icône de la pastille : une forme distincte par état, lisible sans la couleur.
function iconeEtat(doc: Doc, x: number, y: number, etat: string, couleur: string) {
  const r = 4.5;
  doc.save().lineWidth(1.4).lineCap('round');
  doc.circle(x + r, y + r, r).fillAndStroke(couleur, couleur);
  doc.lineWidth(1.2).strokeColor(COULEURS.blanc);
  if (etat === 'neuf') {
    // Une étoile à quatre branches, distincte de la coche du bon état : sans cela
    // les deux pastilles vertes ne se différencieraient que par leur libellé.
    doc
      .moveTo(x + r, y + 1.8)
      .lineTo(x + r, y + 7.2)
      .moveTo(x + 1.8, y + r)
      .lineTo(x + 7.2, y + r)
      .moveTo(x + 2.8, y + 2.8)
      .lineTo(x + 6.2, y + 6.2)
      .moveTo(x + 6.2, y + 2.8)
      .lineTo(x + 2.8, y + 6.2)
      .stroke();
  } else if (etat === 'bonEtat') {
    doc
      .moveTo(x + 2.4, y + 4.6)
      .lineTo(x + 4, y + 6.4)
      .lineTo(x + 6.8, y + 2.8)
      .stroke();
  } else if (etat === 'etatUsage') {
    doc
      .moveTo(x + 2.4, y + r)
      .lineTo(x + 6.6, y + r)
      .stroke();
  } else {
    doc
      .moveTo(x + r, y + 2.2)
      .lineTo(x + r, y + 5.4)
      .stroke();
    doc.circle(x + r, y + 7.1, 0.6).fill(COULEURS.blanc);
  }
  doc.restore();
}

// Pastille d'état, alignée à droite. Retourne sa largeur pour le calcul du titre.
function pastilleEtat(doc: Doc, droite: number, y: number, etat: string): number {
  const { libelle, couleur, trait } = ETATS[etat] ?? ETATS.bonEtat;
  doc.font('Helvetica-Bold').fontSize(8.5);
  const largeurTexte = doc.widthOfString(libelle);
  const largeur = largeurTexte + 30;
  const x = droite - largeur;

  appliquerTrait(doc, trait);
  doc.lineWidth(1).roundedRect(x, y, largeur, 18, 9).fillAndStroke(COULEURS.blanc, couleur);
  doc.undash();

  iconeEtat(doc, x + 8, y + 4.5, etat, couleur);
  doc.fillColor(couleur).text(libelle, x + 22, y + 5.5, { width: largeurTexte + 4 });
  return largeur;
}

export async function genererEtStockerPdf(idEdl: string): Promise<string> {
  const edl = await prisma.etatDesLieux.findFirst({
    where: { idEdl },
    include: {
      bien: {
        include: {
          bailleur: { select: { nom: true, prenom: true, email: true, telephone: true } },
        },
      },
      locataire: true,
      pieces: {
        orderBy: { ordre: 'asc' },
        include: {
          elements: {
            orderBy: { libelle: 'asc' },
            include: { photos: { orderBy: { dateHorodatage: 'asc' } } },
          },
        },
      },
      signatures: true,
    },
  });

  if (!edl) throw new Error(`EDL introuvable : ${idEdl}`);

  // Pré-téléchargement des photos : la génération elle-même reste synchrone.
  const photoBuffers = new Map<string, Buffer>();
  for (const piece of edl.pieces) {
    for (const element of piece.elements) {
      for (const photo of element.photos) {
        try {
          const rep = await s3.send(new GetObjectCommand({ Bucket: S3_BUCKET, Key: photo.chemin }));
          photoBuffers.set(photo.idPhoto, await streamToBuffer(rep.Body as Readable));
        } catch {
          // Photo inaccessible : le document se génère sans elle.
        }
      }
    }
  }

  const typeLibelle = edl.typeEdl === 'entree' ? "D'ENTRÉE" : 'DE SORTIE';
  const reference = `EDL-${edl.dateEdl.getFullYear()}-${idEdl.slice(0, 8).toUpperCase()}`;
  const dateDocument = (edl.dateSignature ?? edl.dateEdl).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Les relevés de compteurs, s'ils ont été saisis, sont remontés en en-tête.
  const pieceCompteurs = edl.pieces.find((p) => p.libelle.trim().toLowerCase() === 'compteurs');
  const releves = pieceCompteurs?.elements
    .map((e) => {
      const nom = e.libelle.replace(/^Compteur\s+/i, '');
      return [nom.charAt(0).toUpperCase() + nom.slice(1), e.commentaire].filter(Boolean).join(' ');
    })
    .join(' · ');

  const pdfBuffer = await new Promise<Buffer>((resolve) => {
    const doc = new PDFDocument({ size: 'A4', margin: MARGE, bufferPages: true });
    const buffers: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));

    let y = MARGE;

    const fondPage = () => {
      doc.rect(0, 0, LARGEUR_PAGE, 841.89).fill(COULEURS.creme);
    };

    const nouvellePage = () => {
      doc.addPage();
      fondPage();
      y = MARGE;
    };

    const placePour = (hauteur: number) => {
      if (y + hauteur > BAS_DE_PAGE) nouvellePage();
    };

    fondPage();

    // ---- En-tête ----
    logo(doc, MARGE, y, 34);
    doc
      .font('Helvetica-Bold')
      .fontSize(15)
      .fillColor(COULEURS.terracottaFonce)
      .text('EDLoc', MARGE + 42, y + 9);
    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .fillColor(COULEURS.terracottaFonce)
      .text(`ÉTAT DES LIEUX ${typeLibelle}`, MARGE, y + 4, {
        width: LARGEUR_UTILE,
        align: 'right',
      });
    doc
      .font('Helvetica')
      .fontSize(8.5)
      .fillColor(COULEURS.brun)
      .text(
        `Document ${edl.dateSignature ? 'généré et signé' : 'généré'} le ${dateDocument}`,
        MARGE,
        y + 17,
        { width: LARGEUR_UTILE, align: 'right' },
      );

    y += 44;
    doc
      .lineWidth(1)
      .moveTo(MARGE, y)
      .lineTo(MARGE + LARGEUR_UTILE, y)
      .stroke(COULEURS.sable);
    y += 22;

    // ---- Adresse ----
    doc
      .font('Helvetica-Bold')
      .fontSize(17)
      .fillColor(COULEURS.encre)
      .text(`${edl.bien.adresse} — ${edl.bien.codePostal} ${edl.bien.ville}`, MARGE, y, {
        width: LARGEUR_UTILE,
      });
    y = doc.y + 16;

    // ---- Parties, type et compteurs, en cartes ----
    const largeurColonne = (LARGEUR_UTILE - 14) / 2;

    const carteInfo = (x: number, yCarte: number, titre: string, lignes: string[], hauteur: number) => {
      carte(doc, x, yCarte, largeurColonne, hauteur, { fond: COULEURS.blanc });
      doc
        .font('Helvetica-Bold')
        .fontSize(7.5)
        .fillColor(COULEURS.terracottaFonce)
        .text(titre.toUpperCase(), x + 12, yCarte + 11, { width: largeurColonne - 24 });
      let yLigne = yCarte + 26;
      lignes.forEach((ligne, index) => {
        doc
          .font(index === 0 ? 'Helvetica-Bold' : 'Helvetica')
          .fontSize(index === 0 ? 10.5 : 8.5)
          .fillColor(index === 0 ? COULEURS.encre : COULEURS.brun)
          .text(ligne, x + 12, yLigne, { width: largeurColonne - 24 });
        yLigne = doc.y + 3;
      });
    };

    const bailleur = edl.bien.bailleur;
    const contactBailleur = [bailleur.email, bailleur.telephone].filter(Boolean).join(' · ');
    const contactLocataire = [edl.locataire.email, edl.locataire.telephone]
      .filter(Boolean)
      .join(' · ');

    placePour(80);
    carteInfo(MARGE, y, 'Bailleur', [`${bailleur.prenom} ${bailleur.nom}`, contactBailleur], 58);
    carteInfo(
      MARGE + largeurColonne + 14,
      y,
      'Locataire',
      [`${edl.locataire.prenom} ${edl.locataire.nom}`, contactLocataire || '—'],
      58,
    );
    y += 68;

    const hauteurSeconde = releves ? 62 : 48;
    placePour(hauteurSeconde + 40);
    carteInfo(
      MARGE,
      y,
      "Type d'état des lieux",
      [edl.typeEdl === 'entree' ? 'Entrée' : 'Sortie'],
      hauteurSeconde,
    );
    carteInfo(
      MARGE + largeurColonne + 14,
      y,
      'Compteurs relevés',
      [releves || 'Non renseignés'],
      hauteurSeconde,
    );
    y += hauteurSeconde + 12;

    // ---- Légende ----
    placePour(40);
    carte(doc, MARGE, y, LARGEUR_UTILE, 30, { fond: COULEURS.blanc });
    doc
      .font('Helvetica')
      .fontSize(8.5)
      .fillColor(COULEURS.brun)
      .text('Légende :', MARGE + 12, y + 11);
    let xLegende = MARGE + 62;
    for (const etat of ['neuf', 'bonEtat', 'etatUsage', 'mauvaisEtat'] as const) {
      const { libelle, couleur } = ETATS[etat];
      iconeEtat(doc, xLegende, y + 10, etat, couleur);
      doc.font('Helvetica-Bold').fontSize(8.5).fillColor(couleur).text(libelle, xLegende + 14, y + 11);
      xLegende += doc.widthOfString(libelle) + 32;
    }
    y += 46;

    // ---- Pièces et éléments ----
    for (const piece of edl.pieces) {
      placePour(60);

      // Puce ronde portant l'initiale de la pièce, comme dans la maquette.
      doc.circle(MARGE + 10, y + 10, 10).fill(COULEURS.sable);
      doc
        .font('Helvetica-Bold')
        .fontSize(9)
        .fillColor(COULEURS.terracottaFonce)
        .text(piece.libelle.charAt(0).toUpperCase(), MARGE + 4, y + 6.5, {
          width: 12,
          align: 'center',
        });
      doc
        .font('Helvetica-Bold')
        .fontSize(13)
        .fillColor(COULEURS.encre)
        .text(piece.libelle, MARGE + 28, y + 4);
      y += 30;

      if (piece.elements.length === 0) {
        doc
          .font('Helvetica-Oblique')
          .fontSize(9)
          .fillColor(COULEURS.brun)
          .text('Aucun élément constaté.', MARGE + 12, y);
        y += 22;
        continue;
      }

      for (const element of piece.elements) {
        const photos = element.photos
          .map((photo) => ({ photo, buffer: photoBuffers.get(photo.idPhoto) }))
          .filter((p) => p.buffer);

        // Hauteur calculée avant de dessiner : titre, commentaire, vignettes et
        // leur horodatage. C'est ce calcul qui évitait le chevauchement.
        doc.font('Helvetica').fontSize(9);
        const hauteurCommentaire = element.commentaire
          ? doc.heightOfString(element.commentaire, { width: LARGEUR_UTILE - 150 }) + 6
          : 0;
        const hauteurPhotos = photos.length > 0 ? 78 : 0;
        const hauteurCarte = 34 + hauteurCommentaire + hauteurPhotos;

        placePour(hauteurCarte + 10);
        carte(doc, MARGE, y, LARGEUR_UTILE, hauteurCarte, { fond: COULEURS.blanc });

        pastilleEtat(doc, MARGE + LARGEUR_UTILE - 12, y + 11, element.etat);
        doc
          .font('Helvetica-Bold')
          .fontSize(10.5)
          .fillColor(COULEURS.encre)
          .text(element.libelle, MARGE + 14, y + 13, { width: LARGEUR_UTILE - 160 });

        let yInterne = y + 30;
        if (element.commentaire) {
          doc
            .font('Helvetica')
            .fontSize(9)
            .fillColor(COULEURS.brun)
            .text(element.commentaire, MARGE + 14, yInterne, { width: LARGEUR_UTILE - 150 });
          yInterne = doc.y + 6;
        }

        if (photos.length > 0) {
          let xPhoto = MARGE + 14;
          for (const { photo, buffer } of photos) {
            if (xPhoto + 60 > MARGE + LARGEUR_UTILE - 14) break;
            try {
              doc.image(buffer!, xPhoto, yInterne, { fit: [56, 46], align: 'center' });
              doc.lineWidth(0.8).roundedRect(xPhoto, yInterne, 56, 46, 4).stroke(COULEURS.sable);
            } catch {
              // Image non intégrable : on saute la vignette.
            }
            // L'horodatage se place SOUS la vignette, jamais par-dessus.
            doc
              .font('Helvetica')
              .fontSize(6.5)
              .fillColor(COULEURS.brun)
              .text(
                photo.dateHorodatage.toLocaleString('fr-FR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                }),
                xPhoto,
                yInterne + 49,
                { width: 56, align: 'center' },
              );
            xPhoto += 64;
          }
        }

        y += hauteurCarte + 8;
      }

      y += 8;
    }

    // ---- Signatures ----
    placePour(150);
    y += 6;
    doc.font('Helvetica-Bold').fontSize(13).fillColor(COULEURS.encre).text('Signatures', MARGE, y);
    y = doc.y + 6;
    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor(COULEURS.brun)
      .text(
        "Les parties reconnaissent avoir relu l'intégralité du présent état des lieux et l'approuver sans réserve.",
        MARGE,
        y,
        { width: LARGEUR_UTILE },
      );
    y = doc.y + 12;

    const ordre = ['bailleur', 'locataire'] as const;
    ordre.forEach((role, index) => {
      const signature = edl.signatures.find((s) => s.roleSignataire === role);
      const x = MARGE + index * (largeurColonne + 14);
      carte(doc, x, y, largeurColonne, 96, { fond: COULEURS.blanc });

      const nom =
        role === 'bailleur'
          ? `${bailleur.prenom} ${bailleur.nom}`
          : `${edl.locataire.prenom} ${edl.locataire.nom}`;
      doc
        .font('Helvetica-Bold')
        .fontSize(7.5)
        .fillColor(COULEURS.terracottaFonce)
        .text(`${role.toUpperCase()} — ${nom.toUpperCase()}`, x + 12, y + 11, {
          width: largeurColonne - 24,
        });

      if (signature) {
        try {
          const image = Buffer.from(
            signature.donneesSignature.replace(/^data:image\/png;base64,/, ''),
            'base64',
          );
          doc.image(image, x + 12, y + 28, { fit: [largeurColonne - 24, 40] });
        } catch {
          // Signature non intégrable.
        }
        doc
          .font('Helvetica')
          .fontSize(8)
          .fillColor(COULEURS.brun)
          .text(
            `Signé électroniquement le ${signature.dateSignature.toLocaleDateString('fr-FR')} à ${signature.dateSignature.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`,
            x + 12,
            y + 74,
            { width: largeurColonne - 24 },
          );
      } else {
        doc
          .font('Helvetica-Oblique')
          .fontSize(8.5)
          .fillColor(COULEURS.brun)
          .text('En attente de signature.', x + 12, y + 46, { width: largeurColonne - 24 });
      }
    });

    // ---- Pied de page sur chaque page ----
    const plage = doc.bufferedPageRange();
    for (let index = 0; index < plage.count; index += 1) {
      doc.switchToPage(plage.start + index);

      // Sans cette neutralisation, écrire au ras du bas déclenche l'ajout d'une
      // page vide par PDFKit — et le pied de page se retrouvait dessus.
      const margeBasse = doc.page.margins.bottom;
      doc.page.margins.bottom = 0;

      const yPied = 841.89 - MARGE - 12;
      doc
        .lineWidth(1)
        .moveTo(MARGE, yPied - 10)
        .lineTo(MARGE + LARGEUR_UTILE, yPied - 10)
        .stroke(COULEURS.sable);

      doc.font('Helvetica').fontSize(7.5).fillColor(COULEURS.brun);
      doc.text(
        "Document généré par EDLoc — valeur probatoire selon les conditions d'utilisation.",
        MARGE,
        yPied,
        { lineBreak: false },
      );

      const mention = `Réf. ${reference} · Page ${index + 1} / ${plage.count}`;
      doc.text(mention, MARGE + LARGEUR_UTILE - doc.widthOfString(mention), yPied, {
        lineBreak: false,
      });

      doc.page.margins.bottom = margeBasse;
    }

    doc.flushPages();
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

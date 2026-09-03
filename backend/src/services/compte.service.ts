import argon2 from 'argon2';
import { prisma } from '../lib/prisma';
import { ProfilInput, ChangementMotDePasseInput } from '../schemas/compte.schema';
import { envoyerJetonConfirmation } from './auth.service';
// La suppression d'un bailleur (cascade en base + purge du stockage objet) est déjà
// implémentée pour l'administration : elle est réutilisée telle quelle ici (RG16).
import { supprimerBailleur } from './admin.service';

const SELECT_PROFIL = {
  idBailleur: true,
  nom: true,
  prenom: true,
  email: true,
  telephone: true,
  emailVerifie: true,
  dateCreation: true,
} as const;

export async function obtenirProfil(idBailleur: string) {
  const bailleur = await prisma.bailleur.findUnique({
    where: { idBailleur },
    select: SELECT_PROFIL,
  });
  if (!bailleur) return { type: 'introuvable' as const };
  return { type: 'ok' as const, donnees: bailleur };
}

export async function modifierProfil(idBailleur: string, donnees: ProfilInput) {
  const bailleur = await prisma.bailleur.findUnique({ where: { idBailleur } });
  if (!bailleur) return { type: 'introuvable' as const };

  const emailModifie = donnees.email !== bailleur.email;

  if (emailModifie) {
    // Unicité de l'adresse (RG2), y compris face au compte administrateur : la connexion
    // cherche l'adresse dans les deux tables, un doublon masquerait l'un des deux comptes.
    const [bailleurExistant, adminExistant] = await Promise.all([
      prisma.bailleur.findUnique({ where: { email: donnees.email } }),
      prisma.administrateur.findUnique({ where: { email: donnees.email } }),
    ]);
    if (bailleurExistant || adminExistant) return { type: 'emailIndisponible' as const };
  }

  const profil = await prisma.bailleur.update({
    where: { idBailleur },
    data: {
      nom: donnees.nom,
      prenom: donnees.prenom,
      email: donnees.email,
      telephone: donnees.telephone ?? null,
      // Une nouvelle adresse doit être prouvée avant de resservir à la connexion (RG17).
      ...(emailModifie ? { emailVerifie: false } : {}),
    },
    select: SELECT_PROFIL,
  });

  if (emailModifie) {
    await envoyerJetonConfirmation(profil, 'changementAdresse');
  }

  return { type: 'ok' as const, donnees: profil, emailAConfirmer: emailModifie };
}

export async function changerMotDePasse(idBailleur: string, donnees: ChangementMotDePasseInput) {
  const bailleur = await prisma.bailleur.findUnique({ where: { idBailleur } });
  if (!bailleur) return { type: 'introuvable' as const };

  const valide = await argon2.verify(bailleur.motDePasseHashe, donnees.motDePasseActuel);
  if (!valide) return { type: 'motDePasseIncorrect' as const };

  const motDePasseHashe = await argon2.hash(donnees.nouveauMotDePasse);

  await prisma.$transaction([
    prisma.bailleur.update({ where: { idBailleur }, data: { motDePasseHashe } }),
    // Les demandes de réinitialisation en cours n'ont plus lieu d'être.
    prisma.jetonEmail.updateMany({
      where: { idBailleur, type: 'reinitialisation', dateUtilisation: null },
      data: { dateExpiration: new Date() },
    }),
  ]);

  return { type: 'ok' as const };
}

// Export de portabilité (RGPD) : l'intégralité des données du bailleur en JSON.
// Les fichiers binaires (photos, PDF) ne sont pas embarqués mais adressés par leur route.
export async function exporterDonnees(idBailleur: string) {
  const bailleur = await prisma.bailleur.findUnique({
    where: { idBailleur },
    select: {
      ...SELECT_PROFIL,
      actif: true,
      biens: {
        orderBy: [{ ville: 'asc' }, { adresse: 'asc' }],
        include: {
          etatsDesLieux: {
            orderBy: { dateEdl: 'desc' },
            include: {
              locataire: true,
              signatures: {
                select: { roleSignataire: true, dateSignature: true },
              },
              pieces: {
                orderBy: { ordre: 'asc' },
                include: {
                  elements: {
                    orderBy: { libelle: 'asc' },
                    include: {
                      photos: {
                        orderBy: { dateHorodatage: 'asc' },
                        select: { idPhoto: true, dateHorodatage: true },
                      },
                    },
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

  const { biens, ...compte } = bailleur;

  const donnees = {
    dateExport: new Date().toISOString(),
    compte,
    biens: biens.map((bien) => ({
      ...bien,
      etatsDesLieux: bien.etatsDesLieux.map((edl) => ({
        ...edl,
        pdf: edl.statut === 'signe' ? `/api/etats-des-lieux/${edl.idEdl}/pdf` : null,
        pieces: edl.pieces.map((piece) => ({
          ...piece,
          elements: piece.elements.map((element) => ({
            ...element,
            photos: element.photos.map((photo) => ({
              ...photo,
              fichier: `/api/photos/${photo.idPhoto}/fichier`,
            })),
          })),
        })),
      })),
    })),
  };

  return { type: 'ok' as const, donnees };
}

export async function supprimerCompte(idBailleur: string, motDePasse: string) {
  const bailleur = await prisma.bailleur.findUnique({ where: { idBailleur } });
  if (!bailleur) return { type: 'introuvable' as const };

  const valide = await argon2.verify(bailleur.motDePasseHashe, motDePasse);
  if (!valide) return { type: 'motDePasseIncorrect' as const };

  return supprimerBailleur(idBailleur);
}

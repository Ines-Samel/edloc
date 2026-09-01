import jwt from 'jsonwebtoken';
import argon2 from 'argon2';
import { prisma } from '../lib/prisma';
import {
  InscriptionInput,
  ConnexionInput,
  ConfirmationInput,
  ReinitialisationInput,
} from '../schemas/auth.schema';
import { JetonPayload } from '../middlewares/auth.jwt';
import { creerJeton, verifierJeton } from './jetons.service';
import { envoyerConfirmationCompte, envoyerReinitialisationMotDePasse } from './emails.service';

export function genererJeton(sub: string, role: JetonPayload['role']): string {
  return jwt.sign({ sub, role }, process.env.JWT_SECRET!, { expiresIn: '24h' });
}

// Émet un jeton de confirmation et envoie l'e-mail correspondant.
// Un échec d'envoi est journalisé sans interrompre l'appelant : la réponse HTTP
// doit rester identique dans tous les cas (anti-énumération).
export async function envoyerJetonConfirmation(
  bailleur: { idBailleur: string; email: string; prenom: string },
  contexte: 'inscription' | 'changementAdresse' = 'inscription',
): Promise<void> {
  try {
    const jeton = await creerJeton(bailleur.idBailleur, 'verification');
    await envoyerConfirmationCompte(bailleur.email, bailleur.prenom, jeton, contexte);
  } catch (err) {
    console.error("Erreur d'envoi de l'e-mail de confirmation :", err);
  }
}

export async function inscrire(donnees: InscriptionInput): Promise<void> {
  // Le hachage est calculé avant toute lecture en base pour que le temps de réponse
  // ne trahisse pas l'existence de l'adresse (RG2, RG3).
  const motDePasseHashe = await argon2.hash(donnees.motDePasse);

  const existant = await prisma.bailleur.findUnique({ where: { email: donnees.email } });

  // Adresse déjà inscrite : aucun compte n'est créé et la réponse reste identique.
  // Si l'adresse n'est pas encore confirmée, on en profite pour renvoyer l'e-mail.
  if (existant) {
    if (!existant.emailVerifie && existant.actif) {
      await envoyerJetonConfirmation(existant);
    }
    return;
  }

  const bailleur = await prisma.bailleur.create({
    data: {
      nom: donnees.nom,
      prenom: donnees.prenom,
      email: donnees.email,
      motDePasseHashe,
      telephone: donnees.telephone,
    },
    select: { idBailleur: true, email: true, prenom: true },
  });

  await envoyerJetonConfirmation(bailleur);
}

export async function connecter(donnees: ConnexionInput) {
  const bailleur = await prisma.bailleur.findUnique({ where: { email: donnees.email } });

  if (bailleur) {
    const valide = await argon2.verify(bailleur.motDePasseHashe, donnees.motDePasse);
    if (!valide) return null;
    // Motif du refus révélé seulement après vérification du mot de passe (RG17).
    if (!bailleur.emailVerifie) return { type: 'nonConfirme' as const };
    if (!bailleur.actif) return { type: 'desactive' as const };
    const jeton = genererJeton(bailleur.idBailleur, 'bailleur');
    return { type: 'ok' as const, jeton, role: 'bailleur' as const };
  }

  const admin = await prisma.administrateur.findUnique({ where: { email: donnees.email } });

  if (admin) {
    const valide = await argon2.verify(admin.motDePasseHashe, donnees.motDePasse);
    if (!valide) return null;
    const jeton = genererJeton(admin.idAdministrateur, 'administrateur');
    return { type: 'ok' as const, jeton, role: 'administrateur' as const };
  }

  return null;
}

export async function confirmerCompte(donnees: ConfirmationInput) {
  const jetonEmail = await verifierJeton(donnees.jeton, 'verification');
  if (!jetonEmail) return { type: 'jetonInvalide' as const };

  // Le jeton n'est consommé que si l'activation aboutit : les deux écritures sont solidaires.
  await prisma.$transaction([
    prisma.bailleur.update({
      where: { idBailleur: jetonEmail.idBailleur },
      data: { emailVerifie: true },
    }),
    prisma.jetonEmail.update({
      where: { idJeton: jetonEmail.idJeton },
      data: { dateUtilisation: new Date() },
    }),
  ]);

  return { type: 'ok' as const };
}

// Réponse générique dans tous les cas : rien de ce qui suit ne remonte à l'appelant.
export async function renvoyerConfirmation(email: string): Promise<void> {
  const bailleur = await prisma.bailleur.findUnique({ where: { email } });
  if (!bailleur || bailleur.emailVerifie || !bailleur.actif) return;
  await envoyerJetonConfirmation(bailleur);
}

// Idem : la demande de réinitialisation ne révèle jamais si l'adresse est connue (US22).
export async function demanderReinitialisation(email: string): Promise<void> {
  const bailleur = await prisma.bailleur.findUnique({ where: { email } });
  if (!bailleur || !bailleur.actif) return;

  try {
    const jeton = await creerJeton(bailleur.idBailleur, 'reinitialisation');
    await envoyerReinitialisationMotDePasse(bailleur.email, bailleur.prenom, jeton);
  } catch (err) {
    console.error("Erreur d'envoi de l'e-mail de réinitialisation :", err);
  }
}

export async function reinitialiserMotDePasse(donnees: ReinitialisationInput) {
  const jetonEmail = await verifierJeton(donnees.jeton, 'reinitialisation');
  if (!jetonEmail) return { type: 'jetonInvalide' as const };

  const motDePasseHashe = await argon2.hash(donnees.motDePasse);

  await prisma.$transaction([
    // Avoir reçu le lien prouve l'accès à la boîte mail : l'adresse est donc confirmée du même coup.
    prisma.bailleur.update({
      where: { idBailleur: jetonEmail.idBailleur },
      data: { motDePasseHashe, emailVerifie: true },
    }),
    prisma.jetonEmail.update({
      where: { idJeton: jetonEmail.idJeton },
      data: { dateUtilisation: new Date() },
    }),
  ]);

  return { type: 'ok' as const };
}

export async function profil(payload: JetonPayload) {
  if (payload.role === 'bailleur') {
    const bailleur = await prisma.bailleur.findUnique({
      where: { idBailleur: payload.sub },
      select: { idBailleur: true, nom: true, prenom: true, email: true },
    });
    if (!bailleur) return null;
    return {
      id: bailleur.idBailleur,
      nom: bailleur.nom,
      prenom: bailleur.prenom,
      email: bailleur.email,
      role: 'bailleur' as const,
    };
  }

  const admin = await prisma.administrateur.findUnique({
    where: { idAdministrateur: payload.sub },
    select: { idAdministrateur: true, email: true },
  });
  if (!admin) return null;
  return { id: admin.idAdministrateur, email: admin.email, role: 'administrateur' as const };
}

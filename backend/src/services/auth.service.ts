import jwt from 'jsonwebtoken';
import argon2 from 'argon2';
import { prisma } from '../lib/prisma';
import { InscriptionInput, ConnexionInput } from '../schemas/auth.schema';
import { JetonPayload } from '../middlewares/auth.jwt';

export function genererJeton(sub: string, role: JetonPayload['role']): string {
  return jwt.sign({ sub, role }, process.env.JWT_SECRET!, { expiresIn: '24h' });
}

export async function inscrire(donnees: InscriptionInput) {
  const existant = await prisma.bailleur.findUnique({ where: { email: donnees.email } });

  if (existant) return null;

  const motDePasseHashe = await argon2.hash(donnees.motDePasse);

  const bailleur = await prisma.bailleur.create({
    data: {
      nom: donnees.nom,
      prenom: donnees.prenom,
      email: donnees.email,
      motDePasseHashe,
      telephone: donnees.telephone,
    },
    select: {
      idBailleur: true,
      nom: true,
      prenom: true,
      email: true,
    },
  });

  return bailleur;
}

export async function connecter(donnees: ConnexionInput) {
  const bailleur = await prisma.bailleur.findUnique({ where: { email: donnees.email } });

  if (bailleur) {
    const valide = await argon2.verify(bailleur.motDePasseHashe, donnees.motDePasse);
    if (!valide) return null;
    const jeton = genererJeton(bailleur.idBailleur, 'bailleur');
    return { jeton, role: 'bailleur' as const };
  }

  const admin = await prisma.administrateur.findUnique({ where: { email: donnees.email } });

  if (admin) {
    const valide = await argon2.verify(admin.motDePasseHashe, donnees.motDePasse);
    if (!valide) return null;
    const jeton = genererJeton(admin.idAdministrateur, 'administrateur');
    return { jeton, role: 'administrateur' as const };
  }

  return null;
}

export async function profil(payload: JetonPayload) {
  if (payload.role === 'bailleur') {
    const bailleur = await prisma.bailleur.findUnique({
      where: { idBailleur: payload.sub },
      select: { idBailleur: true, nom: true, prenom: true, email: true },
    });
    if (!bailleur) return null;
    return { id: bailleur.idBailleur, nom: bailleur.nom, prenom: bailleur.prenom, email: bailleur.email, role: 'bailleur' as const };
  }

  const admin = await prisma.administrateur.findUnique({
    where: { idAdministrateur: payload.sub },
    select: { idAdministrateur: true, email: true },
  });
  if (!admin) return null;
  return { id: admin.idAdministrateur, email: admin.email, role: 'administrateur' as const };
}

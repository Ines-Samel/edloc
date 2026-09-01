import { createHash, randomBytes } from 'crypto';
import { prisma } from '../lib/prisma';
import { TypeJeton } from '../../generated/prisma';

// Durées de validité fixées par la conception (RG18) : 24 h pour la confirmation, 1 h pour la réinitialisation.
const DUREES_MINUTES: Record<TypeJeton, number> = {
  verification: 24 * 60,
  reinitialisation: 60,
};

// Le jeton circule en clair dans l'e-mail et n'est conservé que haché (RG18).
// SHA-256 suffit ici : contrairement à un mot de passe, le jeton est un secret aléatoire
// de 256 bits, hors de portée d'une attaque par dictionnaire ou par force brute.
function hacher(jeton: string): string {
  return createHash('sha256').update(jeton).digest('hex');
}

export async function creerJeton(idBailleur: string, type: TypeJeton): Promise<string> {
  // Un seul jeton actif par type et par bailleur : les précédents sont expirés immédiatement.
  await prisma.jetonEmail.updateMany({
    where: { idBailleur, type, dateUtilisation: null, dateExpiration: { gt: new Date() } },
    data: { dateExpiration: new Date() },
  });

  const jeton = randomBytes(32).toString('base64url');
  const dateExpiration = new Date(Date.now() + DUREES_MINUTES[type] * 60_000);

  await prisma.jetonEmail.create({
    data: { type, jetonHashe: hacher(jeton), dateExpiration, idBailleur },
  });

  return jeton;
}

// Retourne le jeton s'il est valide (bon type, non utilisé, non expiré), sinon null.
// La consommation (dateUtilisation) est laissée à l'appelant, qui la joint en transaction
// à l'action réalisée : le jeton n'est brûlé que si cette action aboutit.
export async function verifierJeton(jeton: string, type: TypeJeton) {
  return prisma.jetonEmail.findFirst({
    where: {
      jetonHashe: hacher(jeton),
      type,
      dateUtilisation: null,
      dateExpiration: { gt: new Date() },
    },
  });
}

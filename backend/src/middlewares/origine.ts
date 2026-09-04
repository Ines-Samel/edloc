import { Request, Response, NextFunction } from 'express';

export const ORIGINES_AUTORISEES = (process.env.CORS_ORIGINE ?? 'http://localhost:3000')
  .split(',')
  .map((origine) => origine.trim())
  .filter(Boolean);

const METHODES_SURES = ['GET', 'HEAD', 'OPTIONS'];

/*
 * Protection CSRF. Avec un cookie, le navigateur joint l'authentification à toute
 * requête vers l'API, y compris déclenchée par un site tiers : on vérifie donc que
 * l'origine des requêtes qui modifient des données fait bien partie de la liste
 * autorisée. Ce contrôle protège même en SameSite=None, indispensable si le front
 * et l'API ne partagent pas le même domaine.
 *
 * Une requête sans en-tête Origin (curl, fichiers .http, tests) est laissée passer :
 * la CSRF suppose un navigateur, et les navigateurs envoient toujours cet en-tête
 * sur les requêtes non sûres.
 */
export function verifierOrigine(req: Request, res: Response, next: NextFunction): void {
  if (METHODES_SURES.includes(req.method)) {
    next();
    return;
  }

  const origine = req.headers.origin;

  if (!origine || ORIGINES_AUTORISEES.includes(origine)) {
    next();
    return;
  }

  res.status(403).json({ erreur: 'Origine non autorisée' });
}

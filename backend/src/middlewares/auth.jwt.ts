import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { NOM_COOKIE_JETON } from '../lib/cookies';

export interface JetonPayload {
  sub: string;
  role: 'bailleur' | 'administrateur';
}

declare module 'express-serve-static-core' {
  interface Request {
    utilisateur?: JetonPayload;
  }
}

export function authJwt(req: Request, res: Response, next: NextFunction): void {
  // Le jeton n'est plus lu dans un en-tête Authorization : il arrive par le cookie
  // httpOnly posé à la connexion, hors de portée du JavaScript de la page.
  const jeton = req.cookies?.[NOM_COOKIE_JETON];

  if (!jeton) {
    res.status(401).json({ erreur: 'Authentification requise' });
    return;
  }

  try {
    const payload = jwt.verify(jeton, process.env.JWT_SECRET!) as JetonPayload;
    req.utilisateur = payload;
    next();
  } catch {
    res.status(401).json({ erreur: 'Jeton invalide ou expiré' });
  }
}

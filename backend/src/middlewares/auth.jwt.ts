import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

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
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ erreur: 'Authentification requise' });
    return;
  }

  const jeton = authHeader.slice(7);

  try {
    const payload = jwt.verify(jeton, process.env.JWT_SECRET!) as JetonPayload;
    req.utilisateur = payload;
    next();
  } catch {
    res.status(401).json({ erreur: 'Jeton invalide ou expiré' });
  }
}

import { Request, Response, NextFunction } from 'express';

export function roleBailleur(req: Request, res: Response, next: NextFunction): void {
  if (req.utilisateur?.role !== 'bailleur') {
    res.status(403).json({ erreur: 'Accès réservé aux comptes bailleurs' });
    return;
  }
  next();
}

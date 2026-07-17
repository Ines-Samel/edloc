import { Request, Response, NextFunction } from 'express';

export function roleAdmin(req: Request, res: Response, next: NextFunction): void {
  if (req.utilisateur?.role !== 'administrateur') {
    res.status(403).json({ erreur: "Accès réservé à l'administrateur" });
    return;
  }
  next();
}

import { NextFunction, Request, Response } from 'express';
import multer from 'multer';

// Route inconnue → 404 JSON
export function ressourceIntrouvable(_req: Request, res: Response) {
  res.status(404).json({ erreur: 'Ressource introuvable' });
}

// Erreur globale → réponse générique, détails uniquement côté serveur
export function gestionErreurs(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({ erreur: 'Corps de requête JSON invalide' });
    return;
  }
  if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
    res.status(400).json({ erreur: 'La photo dépasse la taille maximale de 10 Mo' });
    return;
  }
  if (err instanceof Error && err.message === 'Format de photo non pris en charge (JPEG, PNG ou WebP)') {
    res.status(400).json({ erreur: 'Format de photo non pris en charge (JPEG, PNG ou WebP)' });
    return;
  }
  console.error(err);
  res.status(500).json({ erreur: 'Erreur interne du serveur' });
}
import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export function valider(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const resultat = schema.safeParse(req.body);

    if (!resultat.success) {
      const details = resultat.error.issues.map((issue) => ({
        champ: issue.path.join('.'),
        message: issue.message,
      }));
      res.status(400).json({ erreur: 'Données invalides', details });
      return;
    }

    req.body = resultat.data;
    next();
  };
}

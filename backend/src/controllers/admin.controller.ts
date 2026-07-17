import { Request, Response } from 'express';
import { z } from 'zod';
import { listerBailleurs, changerStatut, supprimerBailleur } from '../services/admin.service';
import { StatutInput, ListeUtilisateursQuery } from '../schemas/admin.schema';

function estUUID(id: string): boolean {
  return z.string().uuid().safeParse(id).success;
}

export async function lister(_req: Request, res: Response): Promise<void> {
  const query = res.locals.query as ListeUtilisateursQuery;
  const resultat = await listerBailleurs(query);
  res.status(200).json(resultat);
}

export async function changerStatutBailleur(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  if (!estUUID(id)) {
    res.status(404).json({ erreur: 'Ressource introuvable' });
    return;
  }
  const { actif } = req.body as StatutInput;
  const resultat = await changerStatut(id, actif);

  if (resultat.type === 'introuvable') {
    res.status(404).json({ erreur: 'Ressource introuvable' });
    return;
  }
  res.status(200).json(resultat.donnees);
}

export async function supprimer(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  if (!estUUID(id)) {
    res.status(404).json({ erreur: 'Ressource introuvable' });
    return;
  }
  const resultat = await supprimerBailleur(id);

  if (resultat.type === 'introuvable') {
    res.status(404).json({ erreur: 'Ressource introuvable' });
    return;
  }
  res.status(204).send();
}

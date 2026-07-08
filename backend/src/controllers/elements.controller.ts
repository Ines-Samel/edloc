import { Request, Response } from 'express';
import { z } from 'zod';
import { ajouterElement, modifierElement, supprimerElement } from '../services/elements.service';
import { ElementInput } from '../schemas/pieces-elements.schema';

function estUUID(id: string): boolean {
  return z.string().uuid().safeParse(id).success;
}

export async function ajouter(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  if (!estUUID(id)) {
    res.status(404).json({ erreur: 'Ressource introuvable' });
    return;
  }
  const idBailleur = req.utilisateur!.sub;
  const donnees = req.body as ElementInput;
  const resultat = await ajouterElement(idBailleur, id, donnees);

  if (resultat.type === 'introuvable') {
    res.status(404).json({ erreur: 'Ressource introuvable' });
    return;
  }
  if (resultat.type === 'verrouille') {
    res.status(409).json({ erreur: 'Cet état des lieux est verrouillé' });
    return;
  }
  res.status(201).json(resultat.donnees);
}

export async function modifier(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  if (!estUUID(id)) {
    res.status(404).json({ erreur: 'Ressource introuvable' });
    return;
  }
  const idBailleur = req.utilisateur!.sub;
  const donnees = req.body as ElementInput;
  const resultat = await modifierElement(idBailleur, id, donnees);

  if (resultat.type === 'introuvable') {
    res.status(404).json({ erreur: 'Ressource introuvable' });
    return;
  }
  if (resultat.type === 'verrouille') {
    res.status(409).json({ erreur: 'Cet état des lieux est verrouillé' });
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
  const idBailleur = req.utilisateur!.sub;
  const resultat = await supprimerElement(idBailleur, id);

  if (resultat.type === 'introuvable') {
    res.status(404).json({ erreur: 'Ressource introuvable' });
    return;
  }
  if (resultat.type === 'verrouille') {
    res.status(409).json({ erreur: 'Cet état des lieux est verrouillé' });
    return;
  }
  res.status(204).send();
}

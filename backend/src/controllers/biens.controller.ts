import { Request, Response } from 'express';
import { z } from 'zod';
import {
  listerBiens,
  creerBien,
  obtenirBien,
  modifierBien,
  supprimerBien,
} from '../services/biens.service';
import { BienInput, ListeBiensQuery } from '../schemas/biens.schema';

function estUUID(id: string): boolean {
  return z.string().uuid().safeParse(id).success;
}

export async function lister(req: Request, res: Response): Promise<void> {
  const idBailleur = req.utilisateur!.sub;
  const query = res.locals.query as ListeBiensQuery;
  const resultat = await listerBiens(idBailleur, query);
  res.status(200).json(resultat);
}

export async function creer(req: Request, res: Response): Promise<void> {
  const idBailleur = req.utilisateur!.sub;
  const donnees = req.body as BienInput;
  const bien = await creerBien(idBailleur, donnees);
  res.status(201).json(bien);
}

export async function obtenir(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  if (!estUUID(id)) {
    res.status(404).json({ erreur: 'Ressource introuvable' });
    return;
  }
  const idBailleur = req.utilisateur!.sub;
  const bien = await obtenirBien(idBailleur, id);
  if (!bien) {
    res.status(404).json({ erreur: 'Ressource introuvable' });
    return;
  }
  res.status(200).json(bien);
}

export async function modifier(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  if (!estUUID(id)) {
    res.status(404).json({ erreur: 'Ressource introuvable' });
    return;
  }
  const idBailleur = req.utilisateur!.sub;
  const donnees = req.body as BienInput;
  const bien = await modifierBien(idBailleur, id, donnees);
  if (!bien) {
    res.status(404).json({ erreur: 'Ressource introuvable' });
    return;
  }
  res.status(200).json(bien);
}

export async function supprimer(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  if (!estUUID(id)) {
    res.status(404).json({ erreur: 'Ressource introuvable' });
    return;
  }
  const idBailleur = req.utilisateur!.sub;
  const supprime = await supprimerBien(idBailleur, id);
  if (!supprime) {
    res.status(404).json({ erreur: 'Ressource introuvable' });
    return;
  }
  res.status(204).send();
}

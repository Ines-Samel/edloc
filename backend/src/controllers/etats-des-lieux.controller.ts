import { Request, Response } from 'express';
import { z } from 'zod';
import {
  creerEdl,
  obtenirEdl,
  modifierEdl,
  listerEdlParBien,
} from '../services/etats-des-lieux.service';
import { CreationEdlInput, ModificationEdlInput } from '../schemas/etats-des-lieux.schema';

function estUUID(id: string): boolean {
  return z.string().uuid().safeParse(id).success;
}

export async function creer(req: Request, res: Response): Promise<void> {
  const idBailleur = req.utilisateur!.sub;
  const donnees = req.body as CreationEdlInput;
  const resultat = await creerEdl(idBailleur, donnees);

  if (resultat.type === 'introuvable') {
    res.status(404).json({ erreur: 'Ressource introuvable' });
    return;
  }
  if (resultat.type === 'entreeManquante') {
    res.status(422).json({
      erreur: "Aucun état des lieux d'entrée signé pour ce bien et ce locataire",
    });
    return;
  }
  res.status(201).json(resultat.donnees);
}

export async function obtenir(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  if (!estUUID(id)) {
    res.status(404).json({ erreur: 'Ressource introuvable' });
    return;
  }
  const idBailleur = req.utilisateur!.sub;
  const resultat = await obtenirEdl(idBailleur, id);

  if (resultat.type === 'introuvable') {
    res.status(404).json({ erreur: 'Ressource introuvable' });
    return;
  }
  res.status(200).json(resultat.donnees);
}

export async function modifier(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  if (!estUUID(id)) {
    res.status(404).json({ erreur: 'Ressource introuvable' });
    return;
  }
  const idBailleur = req.utilisateur!.sub;
  const donnees = req.body as ModificationEdlInput;
  const resultat = await modifierEdl(idBailleur, id, donnees);

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

export async function listerParBien(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  if (!estUUID(id)) {
    res.status(404).json({ erreur: 'Ressource introuvable' });
    return;
  }
  const idBailleur = req.utilisateur!.sub;
  const resultat = await listerEdlParBien(idBailleur, id);

  if (resultat.type === 'introuvable') {
    res.status(404).json({ erreur: 'Ressource introuvable' });
    return;
  }
  res.status(200).json(resultat.donnees);
}

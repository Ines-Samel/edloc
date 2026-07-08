import { Request, Response } from 'express';
import { z } from 'zod';
import { ajouterPhoto, recupererFichier, supprimerPhoto } from '../services/photos.service';

function estUUID(id: string): boolean {
  return z.string().uuid().safeParse(id).success;
}

export async function ajouter(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  if (!estUUID(id)) {
    res.status(404).json({ erreur: 'Ressource introuvable' });
    return;
  }
  if (!req.file) {
    res.status(400).json({ erreur: 'Aucun fichier fourni (champ photo)' });
    return;
  }
  const idBailleur = req.utilisateur!.sub;
  const resultat = await ajouterPhoto(idBailleur, id, req.file);

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

export async function recuperer(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  if (!estUUID(id)) {
    res.status(404).json({ erreur: 'Ressource introuvable' });
    return;
  }
  const idBailleur = req.utilisateur!.sub;
  const resultat = await recupererFichier(idBailleur, id);

  if (resultat.type === 'introuvable') {
    res.status(404).json({ erreur: 'Ressource introuvable' });
    return;
  }
  res.setHeader('Content-Type', resultat.donnees.contentType);
  resultat.donnees.flux.pipe(res);
}

export async function supprimer(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  if (!estUUID(id)) {
    res.status(404).json({ erreur: 'Ressource introuvable' });
    return;
  }
  const idBailleur = req.utilisateur!.sub;
  const resultat = await supprimerPhoto(idBailleur, id);

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

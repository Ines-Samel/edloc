import { Request, Response } from 'express';
import { z } from 'zod';
import { signer, recupererPdf, renvoyerPdf } from '../services/signatures.service';
import { SignatureInput } from '../schemas/signatures.schema';

function estUUID(id: string): boolean {
  return z.string().uuid().safeParse(id).success;
}

export async function signerEdl(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  if (!estUUID(id)) {
    res.status(404).json({ erreur: 'Ressource introuvable' });
    return;
  }
  const idBailleur = req.utilisateur!.sub;
  const donnees = req.body as SignatureInput;
  const resultat = await signer(idBailleur, id, donnees);

  if (resultat.type === 'introuvable') {
    res.status(404).json({ erreur: 'Ressource introuvable' });
    return;
  }
  if (resultat.type === 'verrouille') {
    res.status(409).json({ erreur: 'Cet état des lieux est verrouillé' });
    return;
  }
  if (resultat.type === 'dejaSigne') {
    res.status(409).json({ erreur: 'Ce rôle a déjà signé cet état des lieux' });
    return;
  }
  if (resultat.type === 'sansPiece') {
    res.status(422).json({
      erreur: "Impossible de signer : l'état des lieux ne contient aucune pièce",
    });
    return;
  }
  res.status(201).json({ verrouille: resultat.verrouille, signature: resultat.signature });
}

export async function telechargerPdf(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  if (!estUUID(id)) {
    res.status(404).json({ erreur: 'Ressource introuvable' });
    return;
  }
  const idBailleur = req.utilisateur!.sub;
  const resultat = await recupererPdf(idBailleur, id);

  if (resultat.type === 'introuvable') {
    res.status(404).json({ erreur: 'Ressource introuvable' });
    return;
  }
  if (resultat.type === 'nonSigne') {
    res.status(409).json({ erreur: "Cet état des lieux n'est pas encore signé" });
    return;
  }
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename="etat-des-lieux.pdf"');
  resultat.flux.pipe(res);
}

export async function renvoyer(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  if (!estUUID(id)) {
    res.status(404).json({ erreur: 'Ressource introuvable' });
    return;
  }
  const idBailleur = req.utilisateur!.sub;
  const resultat = await renvoyerPdf(idBailleur, id);

  if (resultat.type === 'introuvable') {
    res.status(404).json({ erreur: 'Ressource introuvable' });
    return;
  }
  if (resultat.type === 'nonSigne') {
    res.status(409).json({ erreur: "Cet état des lieux n'est pas encore signé" });
    return;
  }
  res.status(200).json({ message: 'PDF envoyé', destinataires: resultat.destinataires });
}

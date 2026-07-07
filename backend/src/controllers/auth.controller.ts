import { Request, Response } from 'express';
import { inscrire, connecter, profil } from '../services/auth.service';
import { InscriptionInput, ConnexionInput } from '../schemas/auth.schema';

export async function inscription(req: Request, res: Response): Promise<void> {
  const donnees = req.body as InscriptionInput;
  const bailleur = await inscrire(donnees);

  if (!bailleur) {
    res.status(400).json({ erreur: "L'inscription a échoué" });
    return;
  }

  res.status(201).json(bailleur);
}

export async function connexion(req: Request, res: Response): Promise<void> {
  const donnees = req.body as ConnexionInput;
  const resultat = await connecter(donnees);

  if (!resultat) {
    res.status(401).json({ erreur: 'Identifiants invalides' });
    return;
  }

  res.status(200).json(resultat);
}

export async function me(req: Request, res: Response): Promise<void> {
  const utilisateur = req.utilisateur!;
  const compte = await profil(utilisateur);

  if (!compte) {
    res.status(401).json({ erreur: 'Authentification requise' });
    return;
  }

  res.status(200).json(compte);
}

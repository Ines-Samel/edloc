import { Request, Response } from 'express';
import {
  obtenirProfil,
  modifierProfil,
  changerMotDePasse,
  exporterDonnees,
  supprimerCompte,
} from '../services/compte.service';
import {
  ProfilInput,
  ChangementMotDePasseInput,
  SuppressionCompteInput,
} from '../schemas/compte.schema';

export async function obtenir(req: Request, res: Response): Promise<void> {
  const idBailleur = req.utilisateur!.sub;
  const resultat = await obtenirProfil(idBailleur);

  if (resultat.type === 'introuvable') {
    res.status(404).json({ erreur: 'Ressource introuvable' });
    return;
  }
  res.status(200).json(resultat.donnees);
}

export async function modifier(req: Request, res: Response): Promise<void> {
  const idBailleur = req.utilisateur!.sub;
  const donnees = req.body as ProfilInput;
  const resultat = await modifierProfil(idBailleur, donnees);

  if (resultat.type === 'introuvable') {
    res.status(404).json({ erreur: 'Ressource introuvable' });
    return;
  }
  if (resultat.type === 'emailIndisponible') {
    res.status(409).json({ erreur: 'Cette adresse e-mail est déjà utilisée' });
    return;
  }
  res.status(200).json({
    ...resultat.donnees,
    // Le client affiche l'avertissement : la connexion sera refusée tant que la
    // nouvelle adresse n'aura pas été confirmée.
    emailAConfirmer: resultat.emailAConfirmer,
  });
}

export async function modifierMotDePasse(req: Request, res: Response): Promise<void> {
  const idBailleur = req.utilisateur!.sub;
  const donnees = req.body as ChangementMotDePasseInput;
  const resultat = await changerMotDePasse(idBailleur, donnees);

  if (resultat.type === 'introuvable') {
    res.status(404).json({ erreur: 'Ressource introuvable' });
    return;
  }
  if (resultat.type === 'motDePasseIncorrect') {
    res.status(403).json({ erreur: 'Mot de passe actuel incorrect' });
    return;
  }
  res.status(200).json({ message: 'Votre mot de passe a été modifié' });
}

export async function exporter(req: Request, res: Response): Promise<void> {
  const idBailleur = req.utilisateur!.sub;
  const resultat = await exporterDonnees(idBailleur);

  if (resultat.type === 'introuvable') {
    res.status(404).json({ erreur: 'Ressource introuvable' });
    return;
  }
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="edloc-mes-donnees.json"');
  res.status(200).send(JSON.stringify(resultat.donnees, null, 2));
}

export async function supprimer(req: Request, res: Response): Promise<void> {
  const idBailleur = req.utilisateur!.sub;
  const { motDePasse } = req.body as SuppressionCompteInput;
  const resultat = await supprimerCompte(idBailleur, motDePasse);

  if (resultat.type === 'introuvable') {
    res.status(404).json({ erreur: 'Ressource introuvable' });
    return;
  }
  if (resultat.type === 'motDePasseIncorrect') {
    res.status(403).json({ erreur: 'Mot de passe incorrect' });
    return;
  }
  res.status(204).send();
}

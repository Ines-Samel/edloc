import { Request, Response } from 'express';
import { NOM_COOKIE_JETON, optionsCookieJeton, optionsCookieAvecDuree } from '../lib/cookies';
import {
  inscrire,
  connecter,
  confirmerCompte,
  renvoyerConfirmation,
  demanderReinitialisation,
  reinitialiserMotDePasse,
  profil,
} from '../services/auth.service';
import {
  InscriptionInput,
  ConnexionInput,
  ConfirmationInput,
  RenvoiConfirmationInput,
  MotDePasseOublieInput,
  ReinitialisationInput,
} from '../schemas/auth.schema';

// Réponses volontairement identiques que l'adresse existe ou non (anti-énumération).
const MESSAGE_CONFIRMATION =
  'Si cette adresse peut être inscrite, un e-mail de confirmation vient de vous être envoyé. Vérifiez votre boîte mail.';
const MESSAGE_MOT_DE_PASSE_OUBLIE =
  'Si un compte existe pour cette adresse, un e-mail de réinitialisation vient de vous être envoyé. Vérifiez votre boîte mail.';

export async function inscription(req: Request, res: Response): Promise<void> {
  const donnees = req.body as InscriptionInput;
  await inscrire(donnees);

  // 202 : la demande est acceptée, mais aucune ressource n'est exposée en réponse —
  // un 201 porteur du compte créé révélerait que l'adresse était libre.
  res.status(202).json({ message: MESSAGE_CONFIRMATION });
}

export async function connexion(req: Request, res: Response): Promise<void> {
  const donnees = req.body as ConnexionInput;
  const resultat = await connecter(donnees);

  if (!resultat) {
    res.status(401).json({ erreur: 'Identifiants invalides' });
    return;
  }
  if (resultat.type === 'nonConfirme') {
    res.status(403).json({
      erreur:
        "Votre adresse e-mail n'a pas encore été confirmée. Ouvrez le lien reçu par e-mail ou demandez-en un nouveau.",
    });
    return;
  }
  if (resultat.type === 'desactive') {
    res.status(403).json({ erreur: 'Votre compte a été désactivé' });
    return;
  }
  // Le jeton part dans un cookie httpOnly et n'apparaît jamais dans le corps de
  // la réponse : le JavaScript de la page ne peut donc ni le lire ni le stocker.
  res.cookie(NOM_COOKIE_JETON, resultat.jeton, optionsCookieAvecDuree());
  res.status(200).json({ role: resultat.role });
}

export async function confirmation(req: Request, res: Response): Promise<void> {
  const donnees = req.body as ConfirmationInput;
  const resultat = await confirmerCompte(donnees);

  if (resultat.type === 'jetonInvalide') {
    res.status(400).json({ erreur: 'Ce lien de confirmation est invalide ou a expiré' });
    return;
  }
  res
    .status(200)
    .json({ message: 'Votre compte est confirmé. Vous pouvez maintenant vous connecter.' });
}

export async function renvoiConfirmation(req: Request, res: Response): Promise<void> {
  const { email } = req.body as RenvoiConfirmationInput;
  await renvoyerConfirmation(email);
  res.status(202).json({ message: MESSAGE_CONFIRMATION });
}

export async function motDePasseOublie(req: Request, res: Response): Promise<void> {
  const { email } = req.body as MotDePasseOublieInput;
  await demanderReinitialisation(email);
  res.status(202).json({ message: MESSAGE_MOT_DE_PASSE_OUBLIE });
}

export async function reinitialisation(req: Request, res: Response): Promise<void> {
  const donnees = req.body as ReinitialisationInput;
  const resultat = await reinitialiserMotDePasse(donnees);

  if (resultat.type === 'jetonInvalide') {
    res.status(400).json({ erreur: 'Ce lien de réinitialisation est invalide ou a expiré' });
    return;
  }
  res
    .status(200)
    .json({ message: 'Votre mot de passe a été modifié. Vous pouvez maintenant vous connecter.' });
}

export async function deconnexion(_req: Request, res: Response): Promise<void> {
  // clearCookie n'efface que si les options correspondent à celles de la pose.
  res.clearCookie(NOM_COOKIE_JETON, optionsCookieJeton());
  res.status(204).send();
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

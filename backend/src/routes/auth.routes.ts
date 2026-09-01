import { Router } from 'express';
import { valider } from '../middlewares/validate';
import { authJwt } from '../middlewares/auth.jwt';
import {
  inscriptionSchema,
  connexionSchema,
  confirmationSchema,
  renvoiConfirmationSchema,
  motDePasseOublieSchema,
  reinitialisationSchema,
} from '../schemas/auth.schema';
import {
  inscription,
  connexion,
  confirmation,
  renvoiConfirmation,
  motDePasseOublie,
  reinitialisation,
  me,
} from '../controllers/auth.controller';

export const authRoutes = Router();

authRoutes.post('/inscription', valider(inscriptionSchema), inscription);
authRoutes.post('/connexion', valider(connexionSchema), connexion);
authRoutes.post('/confirmation', valider(confirmationSchema), confirmation);
authRoutes.post('/renvoyer-confirmation', valider(renvoiConfirmationSchema), renvoiConfirmation);
authRoutes.post('/mot-de-passe-oublie', valider(motDePasseOublieSchema), motDePasseOublie);
authRoutes.post('/reinitialisation', valider(reinitialisationSchema), reinitialisation);
authRoutes.get('/me', authJwt, me);

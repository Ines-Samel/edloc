import { Router } from 'express';
import { valider } from '../middlewares/validate';
import { authJwt } from '../middlewares/auth.jwt';
import { inscriptionSchema, connexionSchema } from '../schemas/auth.schema';
import { inscription, connexion, me } from '../controllers/auth.controller';

export const authRoutes = Router();

authRoutes.post('/inscription', valider(inscriptionSchema), inscription);
authRoutes.post('/connexion', valider(connexionSchema), connexion);
authRoutes.get('/me', authJwt, me);

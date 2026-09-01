import { Router } from 'express';
import { authJwt } from '../middlewares/auth.jwt';
import { roleBailleur } from '../middlewares/role.bailleur';
import { valider } from '../middlewares/validate';
import {
  profilSchema,
  changementMotDePasseSchema,
  suppressionCompteSchema,
} from '../schemas/compte.schema';
import {
  obtenir,
  modifier,
  modifierMotDePasse,
  exporter,
  supprimer,
} from '../controllers/compte.controller';

export const compteRoutes = Router();

compteRoutes.use(authJwt);
compteRoutes.use(roleBailleur);

compteRoutes.get('/', obtenir);
compteRoutes.put('/', valider(profilSchema), modifier);
compteRoutes.put('/mot-de-passe', valider(changementMotDePasseSchema), modifierMotDePasse);
compteRoutes.get('/export', exporter);
compteRoutes.delete('/', valider(suppressionCompteSchema), supprimer);

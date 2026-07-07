import { Router } from 'express';
import { authJwt } from '../middlewares/auth.jwt';
import { valider, validerQuery } from '../middlewares/validate';
import { bienSchema, listeBiensQuerySchema } from '../schemas/biens.schema';
import {
  lister,
  creer,
  obtenir,
  modifier,
  supprimer,
} from '../controllers/biens.controller';

export const biensRoutes = Router();

biensRoutes.use(authJwt);

biensRoutes.get('/', validerQuery(listeBiensQuerySchema), lister);
biensRoutes.post('/', valider(bienSchema), creer);
biensRoutes.get('/:id', obtenir);
biensRoutes.put('/:id', valider(bienSchema), modifier);
biensRoutes.delete('/:id', supprimer);

import { Router } from 'express';
import { authJwt } from '../middlewares/auth.jwt';
import { valider } from '../middlewares/validate';
import { creationEdlSchema, modificationEdlSchema } from '../schemas/etats-des-lieux.schema';
import { creer, obtenir, modifier } from '../controllers/etats-des-lieux.controller';

export const etatsDesLieuxRoutes = Router();

etatsDesLieuxRoutes.use(authJwt);

etatsDesLieuxRoutes.post('/', valider(creationEdlSchema), creer);
etatsDesLieuxRoutes.get('/:id', obtenir);
etatsDesLieuxRoutes.patch('/:id', valider(modificationEdlSchema), modifier);

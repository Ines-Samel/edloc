import { Router } from 'express';
import { authJwt } from '../middlewares/auth.jwt';
import { valider } from '../middlewares/validate';
import { elementSchema } from '../schemas/pieces-elements.schema';
import { modifier, supprimer } from '../controllers/elements.controller';

export const elementsRoutes = Router();

elementsRoutes.use(authJwt);

elementsRoutes.put('/:id', valider(elementSchema), modifier);
elementsRoutes.delete('/:id', supprimer);

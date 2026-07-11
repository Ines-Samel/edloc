import { Router } from 'express';
import { authJwt } from '../middlewares/auth.jwt';
import { valider } from '../middlewares/validate';
import { pieceSchema, elementSchema } from '../schemas/pieces-elements.schema';
import { modifier, supprimer } from '../controllers/pieces.controller';
import { ajouter as ajouterElement } from '../controllers/elements.controller';

export const piecesRoutes = Router();

piecesRoutes.use(authJwt);

piecesRoutes.put('/:id', valider(pieceSchema), modifier);
piecesRoutes.delete('/:id', supprimer);
piecesRoutes.post('/:id/elements', valider(elementSchema), ajouterElement);

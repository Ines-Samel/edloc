import { Router } from 'express';
import { authJwt } from '../middlewares/auth.jwt';
import { valider } from '../middlewares/validate';
import { creationEdlSchema, modificationEdlSchema } from '../schemas/etats-des-lieux.schema';
import { pieceSchema } from '../schemas/pieces-elements.schema';
import { creer, obtenir, modifier } from '../controllers/etats-des-lieux.controller';
import { ajouter as ajouterPiece } from '../controllers/pieces.controller';

export const etatsDesLieuxRoutes = Router();

etatsDesLieuxRoutes.use(authJwt);

etatsDesLieuxRoutes.post('/', valider(creationEdlSchema), creer);
etatsDesLieuxRoutes.get('/:id', obtenir);
etatsDesLieuxRoutes.patch('/:id', valider(modificationEdlSchema), modifier);
etatsDesLieuxRoutes.post('/:id/pieces', valider(pieceSchema), ajouterPiece);

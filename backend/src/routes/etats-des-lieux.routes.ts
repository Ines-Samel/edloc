import { Router } from 'express';
import { authJwt } from '../middlewares/auth.jwt';
import { valider, validerQuery } from '../middlewares/validate';
import {
  creationEdlSchema,
  modificationEdlSchema,
  listeEdlQuerySchema,
} from '../schemas/etats-des-lieux.schema';
import { pieceSchema } from '../schemas/pieces-elements.schema';
import { signatureSchema } from '../schemas/signatures.schema';
import {
  lister,
  creer,
  obtenir,
  modifier,
  comparer,
  supprimer,
} from '../controllers/etats-des-lieux.controller';
import { ajouter as ajouterPiece } from '../controllers/pieces.controller';
import { signerEdl, telechargerPdf, renvoyer } from '../controllers/signatures.controller';

export const etatsDesLieuxRoutes = Router();

etatsDesLieuxRoutes.use(authJwt);

etatsDesLieuxRoutes.get('/', validerQuery(listeEdlQuerySchema), lister);
etatsDesLieuxRoutes.post('/', valider(creationEdlSchema), creer);
etatsDesLieuxRoutes.get('/:id', obtenir);
etatsDesLieuxRoutes.patch('/:id', valider(modificationEdlSchema), modifier);
etatsDesLieuxRoutes.delete('/:id', supprimer);
etatsDesLieuxRoutes.post('/:id/pieces', valider(pieceSchema), ajouterPiece);
etatsDesLieuxRoutes.post('/:id/signatures', valider(signatureSchema), signerEdl);
etatsDesLieuxRoutes.get('/:id/pdf', telechargerPdf);
etatsDesLieuxRoutes.post('/:id/envoi-pdf', renvoyer);
etatsDesLieuxRoutes.get('/:id/comparaison', comparer);

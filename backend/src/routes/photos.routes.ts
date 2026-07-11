import { Router } from 'express';
import { authJwt } from '../middlewares/auth.jwt';
import { recuperer, supprimer } from '../controllers/photos.controller';

export const photosRoutes = Router();

photosRoutes.use(authJwt);

photosRoutes.get('/:id/fichier', recuperer);
photosRoutes.delete('/:id', supprimer);

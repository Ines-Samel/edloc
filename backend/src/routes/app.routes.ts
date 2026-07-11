import { Router } from 'express';
import { authRoutes } from './auth.routes';
import { biensRoutes } from './biens.routes';
import { etatsDesLieuxRoutes } from './etats-des-lieux.routes';
import { piecesRoutes } from './pieces.routes';
import { elementsRoutes } from './elements.routes';
import { photosRoutes } from './photos.routes';

export const appRoutes = Router();

appRoutes.use('/auth', authRoutes);
appRoutes.use('/biens', biensRoutes);
appRoutes.use('/etats-des-lieux', etatsDesLieuxRoutes);
appRoutes.use('/pieces', piecesRoutes);
appRoutes.use('/elements', elementsRoutes);
appRoutes.use('/photos', photosRoutes);


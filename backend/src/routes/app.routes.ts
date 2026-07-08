import { Router } from 'express';
import { authRoutes } from './auth.routes';
import { biensRoutes } from './biens.routes';
import { etatsDesLieuxRoutes } from './etats-des-lieux.routes';

export const appRoutes = Router();

appRoutes.use('/auth', authRoutes);
appRoutes.use('/biens', biensRoutes);
appRoutes.use('/etats-des-lieux', etatsDesLieuxRoutes);


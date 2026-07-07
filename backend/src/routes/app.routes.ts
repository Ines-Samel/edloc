import { Router } from 'express';
import { authRoutes } from './auth.routes';
import { biensRoutes } from './biens.routes';

export const appRoutes = Router();

appRoutes.use('/auth', authRoutes);
appRoutes.use('/biens', biensRoutes);


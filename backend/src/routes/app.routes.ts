import { Router } from 'express';
import { authRoutes } from './auth.routes';

export const appRoutes = Router();

appRoutes.use('/auth', authRoutes);


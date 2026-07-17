import { Router } from 'express';
import { authJwt } from '../middlewares/auth.jwt';
import { roleAdmin } from '../middlewares/role.admin';
import { valider, validerQuery } from '../middlewares/validate';
import { statutSchema, listeUtilisateursQuerySchema } from '../schemas/admin.schema';
import { lister, changerStatutBailleur, supprimer } from '../controllers/admin.controller';

export const adminRoutes = Router();

adminRoutes.use(authJwt);
adminRoutes.use(roleAdmin);

adminRoutes.get('/utilisateurs', validerQuery(listeUtilisateursQuerySchema), lister);
adminRoutes.patch('/utilisateurs/:id/statut', valider(statutSchema), changerStatutBailleur);
adminRoutes.delete('/utilisateurs/:id', supprimer);

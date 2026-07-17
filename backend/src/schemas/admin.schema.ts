import { z } from 'zod';

export const statutSchema = z.object({
  actif: z.boolean(),
});

export const listeUtilisateursQuerySchema = z.object({
  recherche: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limite: z.coerce.number().int().min(1).max(100).default(20),
});

export type StatutInput = z.infer<typeof statutSchema>;
export type ListeUtilisateursQuery = z.infer<typeof listeUtilisateursQuerySchema>;

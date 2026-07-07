import { z } from 'zod';

export const bienSchema = z.object({
  adresse: z.string().trim().min(1).max(255),
  codePostal: z
    .string()
    .regex(/^\d{5}$/, 'Le code postal doit comporter exactement 5 chiffres'),
  ville: z.string().trim().min(1).max(100),
  typeLogement: z.string().trim().min(1).max(50),
  nombrePieces: z.number().int().positive().optional(),
  surface: z.number().positive().max(9999.99).optional(),
});

export const listeBiensQuerySchema = z.object({
  recherche: z.string().trim().optional(),
  commune: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limite: z.coerce.number().int().min(1).max(100).default(20),
});

export type BienInput = z.infer<typeof bienSchema>;
export type ListeBiensQuery = z.infer<typeof listeBiensQuerySchema>;

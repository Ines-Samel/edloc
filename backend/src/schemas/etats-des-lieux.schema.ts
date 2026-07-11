import { z } from 'zod';

export const locataireSchema = z.object({
  nom: z.string().trim().min(1).max(100),
  prenom: z.string().trim().min(1).max(100),
  email: z.string().email('Adresse e-mail invalide').max(255).optional(),
  telephone: z.string().trim().max(20).optional(),
});

export const creationEdlSchema = z.object({
  idBien: z.string().uuid(),
  typeEdl: z.enum(['entree', 'sortie']),
  dateEdl: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'La date doit être au format AAAA-MM-JJ')
    .optional(),
  locataire: locataireSchema,
});

export const modificationEdlSchema = z.object({
  dateEdl: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'La date doit être au format AAAA-MM-JJ'),
});

export type LocataireInput = z.infer<typeof locataireSchema>;
export type CreationEdlInput = z.infer<typeof creationEdlSchema>;
export type ModificationEdlInput = z.infer<typeof modificationEdlSchema>;

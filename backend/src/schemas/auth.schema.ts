import { z } from 'zod';

export const inscriptionSchema = z.object({
  nom: z.string().trim().min(1, 'Le nom est requis').max(100),
  prenom: z.string().trim().min(1, 'Le prénom est requis').max(100),
  email: z.string().email('Adresse e-mail invalide').max(255),
  motDePasse: z
    .string()
    .min(12, 'Le mot de passe doit contenir au moins 12 caractères')
    .max(128),
  telephone: z.string().max(20).optional(),
});

export const connexionSchema = z.object({
  email: z.string().email('Adresse e-mail invalide'),
  motDePasse: z.string().min(1, 'Le mot de passe est requis'),
});

export type InscriptionInput = z.infer<typeof inscriptionSchema>;
export type ConnexionInput = z.infer<typeof connexionSchema>;

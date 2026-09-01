import { z } from 'zod';

export const profilSchema = z.object({
  nom: z.string().trim().min(1, 'Le nom est requis').max(100),
  prenom: z.string().trim().min(1, 'Le prénom est requis').max(100),
  email: z.string().email('Adresse e-mail invalide').max(255),
  telephone: z.string().trim().max(20).optional(),
});

export const changementMotDePasseSchema = z.object({
  motDePasseActuel: z.string().min(1, 'Le mot de passe actuel est requis'),
  nouveauMotDePasse: z
    .string()
    .min(12, 'Le mot de passe doit contenir au moins 12 caractères')
    .max(128),
});

// La suppression est irréversible (RG16) : le mot de passe est redemandé pour la confirmer.
export const suppressionCompteSchema = z.object({
  motDePasse: z.string().min(1, 'Le mot de passe est requis'),
});

export type ProfilInput = z.infer<typeof profilSchema>;
export type ChangementMotDePasseInput = z.infer<typeof changementMotDePasseSchema>;
export type SuppressionCompteInput = z.infer<typeof suppressionCompteSchema>;

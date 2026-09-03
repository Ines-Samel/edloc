import { z } from "zod";

/*
 * Schémas de validation des formulaires publics. Ils reprennent les règles de
 * l'API (backend/src/schemas/auth.schema.ts) pour signaler les erreurs avant
 * l'appel réseau ; l'API revalide systématiquement de son côté.
 */

const email = z.string().trim().email("Adresse e-mail invalide").max(255);
const motDePasse = z
  .string()
  .min(12, "Le mot de passe doit contenir au moins 12 caractères")
  .max(128);

export const connexionSchema = z.object({
  email,
  motDePasse: z.string().min(1, "Le mot de passe est requis"),
});

export const inscriptionSchema = z.object({
  nom: z.string().trim().min(1, "Le nom est requis").max(100),
  prenom: z.string().trim().min(1, "Le prénom est requis").max(100),
  email,
  telephone: z.string().trim().max(20).optional(),
  motDePasse,
});

// Le formulaire demande une confirmation ; l'API, elle, n'attend que motDePasse.
export const inscriptionFormulaireSchema = inscriptionSchema
  .extend({ confirmation: z.string().min(1, "Confirmez le mot de passe") })
  .refine((valeurs) => valeurs.motDePasse === valeurs.confirmation, {
    path: ["confirmation"],
    message: "Les deux mots de passe ne correspondent pas",
  });

export const motDePasseOublieSchema = z.object({ email });

export const reinitialisationSchema = z
  .object({
    motDePasse,
    confirmation: z.string().min(1, "Confirmez le nouveau mot de passe"),
  })
  .refine((valeurs) => valeurs.motDePasse === valeurs.confirmation, {
    path: ["confirmation"],
    message: "Les deux mots de passe ne correspondent pas",
  });

export const renvoiConfirmationSchema = z.object({ email });

export type ConnexionInput = z.infer<typeof connexionSchema>;
export type InscriptionInput = z.infer<typeof inscriptionSchema>;
export type InscriptionFormulaireInput = z.infer<typeof inscriptionFormulaireSchema>;
export type MotDePasseOublieInput = z.infer<typeof motDePasseOublieSchema>;
export type ReinitialisationInput = z.infer<typeof reinitialisationSchema>;
export type RenvoiConfirmationInput = z.infer<typeof renvoiConfirmationSchema>;

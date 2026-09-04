import { z } from "zod";

// Reprend les règles de l'API (backend/src/schemas/compte.schema.ts).
export const profilSchema = z.object({
  nom: z.string().trim().min(1, "Le nom est requis").max(100),
  prenom: z.string().trim().min(1, "Le prénom est requis").max(100),
  email: z.string().trim().email("Adresse e-mail invalide").max(255),
  telephone: z.string().trim().max(20).optional(),
});

export const changementMotDePasseSchema = z
  .object({
    motDePasseActuel: z.string().min(1, "Le mot de passe actuel est requis"),
    nouveauMotDePasse: z
      .string()
      .min(12, "Le mot de passe doit contenir au moins 12 caractères")
      .max(128),
    confirmation: z.string().min(1, "Confirmez le nouveau mot de passe"),
  })
  .refine((valeurs) => valeurs.nouveauMotDePasse === valeurs.confirmation, {
    path: ["confirmation"],
    message: "Les deux mots de passe ne correspondent pas",
  });

export type ProfilInput = z.infer<typeof profilSchema>;
export type ChangementMotDePasseInput = z.infer<typeof changementMotDePasseSchema>;

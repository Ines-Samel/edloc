import { z } from "zod";

// Reprend les règles de l'API (backend/src/schemas/etats-des-lieux.schema.ts).
export const creationEdlSchema = z.object({
  idBien: z.string().uuid("Sélectionnez un bien"),
  typeEdl: z.enum(["entree", "sortie"]),
  locataire: z.object({
    nom: z.string().trim().min(1, "Le nom du locataire est requis").max(100),
    prenom: z.string().trim().min(1, "Le prénom du locataire est requis").max(100),
    email: z.string().trim().email("Adresse e-mail invalide").max(255).optional(),
  }),
});

export type CreationEdlInput = z.infer<typeof creationEdlSchema>;

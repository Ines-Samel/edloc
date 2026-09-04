import { z } from "zod";

// Reprend les règles de l'API (backend/src/schemas/biens.schema.ts).
export const bienSchema = z.object({
  adresse: z.string().trim().min(1, "L'adresse est requise").max(255),
  codePostal: z
    .string()
    .trim()
    .regex(/^\d{5}$/, "Le code postal doit comporter exactement 5 chiffres"),
  ville: z.string().trim().min(1, "La commune est requise").max(100),
  typeLogement: z.string().trim().min(1, "Le type de logement est requis").max(50),
  nombrePieces: z.coerce.number().int().positive("Indiquez un nombre de pièces valide").optional(),
  surface: z.coerce.number().positive("Indiquez une surface valide").max(9999.99).optional(),
});

export type BienInput = z.infer<typeof bienSchema>;

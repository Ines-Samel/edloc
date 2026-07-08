import { z } from 'zod';

export const pieceSchema = z.object({
  libelle: z.string().trim().min(1).max(100),
  ordre: z.number().int().positive().optional(),
});

export const elementSchema = z.object({
  libelle: z.string().trim().min(1).max(100),
  etat: z.enum(['neuf', 'bonEtat', 'etatUsage', 'mauvaisEtat']),
  commentaire: z.string().trim().max(1000).optional(),
});

export type PieceInput = z.infer<typeof pieceSchema>;
export type ElementInput = z.infer<typeof elementSchema>;

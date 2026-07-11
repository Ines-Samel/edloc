import { z } from 'zod';

export const signatureSchema = z.object({
  roleSignataire: z.enum(['bailleur', 'locataire']),
  donneesSignature: z
    .string()
    .regex(
      /^data:image\/png;base64,[A-Za-z0-9+/=]+$/,
      'La signature doit être une image PNG encodée en base64 (200 Ko maximum)',
    )
    .max(280000, 'La signature doit être une image PNG encodée en base64 (200 Ko maximum)'),
});

export type SignatureInput = z.infer<typeof signatureSchema>;

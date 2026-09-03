import type { ZodType } from "zod";

import { ErreurApi } from "@/lib/api";

export type ErreursChamps = Record<string, string>;

/*
 * Valide les données du formulaire côté client. Retourne les valeurs typées, ou
 * les messages d'erreur indexés par nom de champ.
 */
export function valider<T>(
  schema: ZodType<T>,
  valeurs: unknown,
): { succes: true; donnees: T } | { succes: false; erreurs: ErreursChamps } {
  const resultat = schema.safeParse(valeurs);

  if (resultat.success) return { succes: true, donnees: resultat.data };

  const erreurs: ErreursChamps = {};
  for (const probleme of resultat.error.issues) {
    const champ = probleme.path.join(".");
    if (!erreurs[champ]) erreurs[champ] = probleme.message;
  }
  return { succes: false, erreurs };
}

/*
 * Traduit une erreur de l'API en messages exploitables : le détail par champ
 * quand l'API en fournit (validation Zod côté serveur), sinon un message global.
 */
export function erreursDepuisApi(erreur: unknown): {
  message: string;
  champs: ErreursChamps;
} {
  if (erreur instanceof ErreurApi) {
    const champs: ErreursChamps = {};
    for (const detail of erreur.details ?? []) {
      if (!champs[detail.champ]) champs[detail.champ] = detail.message;
    }
    return { message: erreur.message, champs };
  }

  return {
    message: "Impossible de contacter le serveur. Vérifiez votre connexion et réessayez.",
    champs: {},
  };
}

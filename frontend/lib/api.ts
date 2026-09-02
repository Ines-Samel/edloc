const BASE_API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export type DetailValidation = { champ: string; message: string };

// L'API répond ses erreurs sous la forme { erreur, details? } : on les remonte telles quelles
// pour que les formulaires puissent afficher le message par champ.
export class ErreurApi extends Error {
  constructor(
    public readonly statut: number,
    message: string,
    public readonly details?: DetailValidation[],
  ) {
    super(message);
    this.name = "ErreurApi";
  }
}

type OptionsApi = Omit<RequestInit, "body"> & { body?: unknown };

/*
 * Le jeton d'authentification vit dans un cookie httpOnly posé par l'API : il est
 * inaccessible au JavaScript, donc rien à lire ni à joindre ici. Il suffit de
 * demander au navigateur d'envoyer les cookies, y compris si l'API est sur un
 * autre domaine que le front.
 */
export async function api<T>(chemin: string, options: OptionsApi = {}): Promise<T> {
  const { body, headers, ...reste } = options;
  const estFormData = body instanceof FormData;

  const reponse = await fetch(`${BASE_API}${chemin}`, {
    ...reste,
    credentials: "include",
    headers: {
      // FormData (envoi de photo) définit lui-même son Content-Type avec sa frontière.
      ...(body !== undefined && !estFormData ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: estFormData ? (body as FormData) : body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (reponse.status === 204) return undefined as T;

  const donnees = await reponse.json().catch(() => null);

  if (!reponse.ok) {
    throw new ErreurApi(
      reponse.status,
      donnees?.erreur ?? "Une erreur est survenue. Réessayez.",
      donnees?.details,
    );
  }

  return donnees as T;
}

import { lireJeton } from "./jeton";

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

export async function api<T>(chemin: string, options: OptionsApi = {}): Promise<T> {
  const { body, headers, ...reste } = options;
  const jeton = lireJeton();
  const estFormData = body instanceof FormData;

  const reponse = await fetch(`${BASE_API}${chemin}`, {
    ...reste,
    headers: {
      // FormData (envoi de photo) définit lui-même son Content-Type avec sa frontière.
      ...(body !== undefined && !estFormData ? { "Content-Type": "application/json" } : {}),
      ...(jeton ? { Authorization: `Bearer ${jeton}` } : {}),
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

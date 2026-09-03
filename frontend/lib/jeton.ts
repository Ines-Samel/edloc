// Le jeton JWT délivré par l'API est conservé côté navigateur : les pages des zones
// protégées sont donc des composants client, et la garde d'accès se fait dans leur layout.
const CLE_JETON = "edloc.jeton";

export function lireJeton(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(CLE_JETON);
}

export function enregistrerJeton(jeton: string): void {
  window.localStorage.setItem(CLE_JETON, jeton);
}

export function effacerJeton(): void {
  window.localStorage.removeItem(CLE_JETON);
}

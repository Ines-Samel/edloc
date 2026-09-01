import Link from "next/link";

import { Button } from "@/components/ui/button";

// Écran 1 (page d'accueil) — version d'amorçage : titre, baseline et les deux actions.
// Les trois fonctionnalités illustrées et le parcours en trois étapes viendront avec
// le jalon des pages publiques.
export default function PageAccueil() {
  return (
    <>
      <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-16 text-center">
        <p className="text-legende uppercase tracking-widest text-brun">EDLoc</p>

        <h1 className="text-titre-1 max-w-2xl text-balance sm:text-5xl">
          L&apos;état des lieux, en toute sérénité.
        </h1>

        <p className="text-courant max-w-xl text-brun">
          Réalisez vos états des lieux d&apos;entrée et de sortie sur place, avec le locataire :
          saisie pièce par pièce, photos horodatées, double signature et PDF envoyé aux deux
          parties.
        </p>

        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <Button asChild>
            <Link href="/inscription">Créer un compte gratuitement</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/connexion">Se connecter</Link>
          </Button>
        </div>
      </main>

      <footer className="border-t border-sable px-6 py-6">
        <ul className="text-legende flex flex-wrap justify-center gap-6 text-brun">
          <li>
            <Link href="/mentions-legales" className="underline underline-offset-4">
              Mentions légales
            </Link>
          </li>
          <li>
            <Link href="/confidentialite" className="underline underline-offset-4">
              Politique de confidentialité
            </Link>
          </li>
        </ul>
      </footer>
    </>
  );
}

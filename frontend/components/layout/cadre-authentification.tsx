import Link from "next/link";

import { LogoEdloc } from "@/components/layout/logo-edloc";

/*
 * Cadre commun aux écrans publics d'authentification (écrans 2 à 5 des maquettes),
 * décliné dans les trois formats :
 *   - mobile   : contenu à même le fond crème ;
 *   - tablette : carte blanche centrée ;
 *   - desktop  : deux panneaux, ambiance sable à gauche (logo et baseline),
 *                formulaire à droite.
 */
export function CadreAuthentification({
  titre,
  description,
  marque = false,
  children,
  pied,
}: {
  titre: string;
  description?: string;
  /** Affiche le mot-symbole et la baseline sous le logo (écran de connexion,
   *  maquette 2) ; sur desktop ils figurent déjà dans le panneau d'ambiance. */
  marque?: boolean;
  children: React.ReactNode;
  pied?: React.ReactNode;
}) {
  return (
    <main className="flex flex-1 flex-col lg:flex-row">
      {/* Panneau d'ambiance — desktop uniquement. La baseline n'apparaît que sur
          l'accueil et les écrans d'authentification, jamais dans la navigation. */}
      <aside className="hidden bg-sable lg:flex lg:w-1/2 lg:flex-col lg:items-center lg:justify-center lg:gap-6">
        <LogoEdloc className="size-40" />
        <p className="text-titre-1 text-terracotta-fonce">EDLoc</p>
        <p className="text-courant text-brun">Votre état des lieux, en toute sérénité.</p>
      </aside>

      <div className="flex flex-1 items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-md sm:rounded-carte sm:bg-card sm:p-10 sm:shadow-sm lg:bg-transparent lg:p-0 lg:shadow-none">
          <div className="flex flex-col items-center gap-2 text-center">
            <LogoEdloc className="size-16 lg:hidden" />
            {marque ? (
              <div className="lg:hidden">
                <p className="text-titre-2 text-terracotta-fonce">EDLoc</p>
                <p className="text-legende text-brun">Votre état des lieux, en toute sérénité.</p>
              </div>
            ) : null}
            <h1 className="text-titre-2 mt-2">{titre}</h1>
            {description ? (
              <p className="text-legende max-w-xs text-brun sm:max-w-sm">{description}</p>
            ) : null}
          </div>

          <div className="mt-8">{children}</div>

          {pied ? <div className="mt-6 text-center">{pied}</div> : null}
        </div>
      </div>
    </main>
  );
}

// Lien de retour discret, repris tel quel sur plusieurs écrans.
export function LienRetourConnexion() {
  return (
    <Link
      href="/connexion"
      className="text-legende text-terracotta-fonce underline-offset-4 hover:underline"
    >
      ← Retour à la connexion
    </Link>
  );
}

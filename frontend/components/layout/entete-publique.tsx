import Link from "next/link";

import { LogoEdloc } from "@/components/layout/logo-edloc";
import { Button } from "@/components/ui/button";

// En-tête des pages publiques : logo à gauche, action de connexion à droite
// (maquette 1). Les ancres de navigation n'apparaissent qu'à partir de la tablette.
export function EntetePublique({ ancres = false }: { ancres?: boolean }) {
  return (
    <header className="border-b border-sable">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" aria-label="EDLoc — accueil" className="flex items-center gap-2">
          <LogoEdloc className="size-9" />
          <span className="text-sous-titre text-terracotta-fonce">EDLoc</span>
        </Link>

        <div className="flex items-center gap-6">
          {ancres ? (
            <nav aria-label="Sections de la page" className="hidden sm:flex sm:items-center sm:gap-6">
              <a href="#fonctionnalites" className="text-legende text-brun hover:text-encre">
                Fonctionnalités
              </a>
              <a href="#fonctionnement" className="text-legende text-brun hover:text-encre">
                Comment ça marche
              </a>
            </nav>
          ) : null}

          <Button asChild variant="outline" size="sm">
            <Link href="/connexion">Se connecter</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

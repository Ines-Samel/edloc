import Link from "next/link";

import { EntetePublique } from "@/components/layout/entete-publique";
import { PiedPublic } from "@/components/layout/pied-public";
import { Button } from "@/components/ui/button";
import { LogoEdloc } from "@/components/layout/logo-edloc";

// Page 404 : elle remplace l'écran brut de Next, hors charte. Le ton reste
// rassurant — la charte vise un public peu à l'aise avec l'informatique.
export default function PageIntrouvable() {
  return (
    <>
      <EntetePublique />
      <main
        id="contenu-principal"
        tabIndex={-1}
        className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center"
      >
        <LogoEdloc className="size-20" />
        <p className="text-titre-1 text-terracotta-fonce">404</p>
        <h1 className="text-titre-2">Cette page n&apos;existe pas</h1>
        <p className="text-courant text-brun">
          Le lien est peut-être incomplet, ou la page a été déplacée. Rien
          n&apos;est perdu : vos états des lieux restent accessibles depuis
          votre espace.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Button asChild>
            <Link href="/">Retour à l&apos;accueil</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/tableau-de-bord">Aller à mon espace</Link>
          </Button>
        </div>
      </main>

      <PiedPublic />
    </>
  );
}

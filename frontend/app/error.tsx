"use client";

import { useEffect } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { LogoEdloc } from "@/components/layout/logo-edloc";
import { Message } from "@/components/ui/message";

/*
 * Page d'erreur (frontière d'erreur de l'App Router). Sans elle, une exception non
 * gérée affiche un écran technique de Next, hors charte et anxiogène.
 * `reset` réessaie le rendu sans recharger toute l'application.
 */
export default function PageErreur({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Le détail reste en console : il n'est jamais montré à l'utilisateur.
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <LogoEdloc className="size-20" />
      <h1 className="text-titre-2">Une erreur est survenue</h1>

      <Message ton="erreur">
        L&apos;affichage de cette page a échoué. Votre saisie n&apos;est pas perdue : réessayez, ou
        revenez à l&apos;accueil.
      </Message>

      <div className="flex flex-col gap-4 sm:flex-row">
        <Button onClick={reset}>Réessayer</Button>
        <Button asChild variant="outline">
          <Link href="/">Retour à l&apos;accueil</Link>
        </Button>
      </div>

      {error.digest ? (
        <p className="text-legende text-brun">Référence de l&apos;incident : {error.digest}</p>
      ) : null}
    </main>
  );
}

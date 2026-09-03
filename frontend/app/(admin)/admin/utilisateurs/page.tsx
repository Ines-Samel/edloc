"use client";

import { Message } from "@/components/ui/message";

// Page d'attente : l'écran 16 (liste des comptes, activation, suppression RGPD)
// sera construit avec le jalon de l'administration.
export default function PageComptesUtilisateurs() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <h1 className="text-titre-1">Comptes utilisateurs</h1>
      <Message ton="information">
        La liste des bailleurs, l&apos;activation des comptes et la suppression RGPD arrivent avec
        le jalon de l&apos;administration.
      </Message>
    </div>
  );
}

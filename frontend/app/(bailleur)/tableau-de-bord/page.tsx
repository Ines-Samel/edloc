"use client";

import { Message } from "@/components/ui/message";
import { useCompte } from "@/lib/session";

// Page d'attente : l'écran 6 (indicateurs et états des lieux récents) sera
// construit avec le jalon des écrans bailleur.
export default function PageTableauDeBord() {
  const compte = useCompte();
  const prenom = compte.role === "bailleur" ? compte.prenom : "";

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <h1 className="text-titre-1">Bonjour {prenom}</h1>
      <Message ton="information">
        Le tableau de bord (indicateurs et états des lieux récents) arrive avec le prochain jalon.
        La navigation et la session sont en place.
      </Message>
    </div>
  );
}

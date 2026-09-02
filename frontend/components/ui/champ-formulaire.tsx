import * as React from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/*
 * Champ de formulaire complet : libellé, saisie, aide et message d'erreur reliés
 * par aria-describedby, et aria-invalid pour que l'erreur soit annoncée par les
 * lecteurs d'écran — l'erreur n'est jamais signalée par la seule couleur.
 */
export function ChampFormulaire({
  id,
  libelle,
  erreur,
  aide,
  ...props
}: React.ComponentProps<typeof Input> & {
  id: string;
  libelle: string;
  erreur?: string;
  aide?: string;
}) {
  const idAide = `${id}-aide`;
  const idErreur = `${id}-erreur`;
  const decritPar = [aide ? idAide : null, erreur ? idErreur : null].filter(Boolean).join(" ");

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{libelle}</Label>
      <Input
        id={id}
        aria-invalid={erreur ? true : undefined}
        aria-describedby={decritPar || undefined}
        {...props}
      />
      {aide ? (
        <p id={idAide} className="text-legende text-brun">
          {aide}
        </p>
      ) : null}
      {erreur ? (
        <p id={idErreur} className="text-legende text-alerte-foncee">
          {erreur}
        </p>
      ) : null}
    </div>
  );
}

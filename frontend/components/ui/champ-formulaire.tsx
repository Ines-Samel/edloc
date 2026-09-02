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
  actionFin,
  ...props
}: React.ComponentProps<typeof Input> & {
  id: string;
  libelle: string;
  erreur?: string;
  aide?: string;
  /** Contrôle affiché à l'intérieur du champ, aligné à droite. */
  actionFin?: React.ReactNode;
}) {
  const idAide = `${id}-aide`;
  const idErreur = `${id}-erreur`;
  const decritPar = [aide ? idAide : null, erreur ? idErreur : null].filter(Boolean).join(" ");

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{libelle}</Label>
      <div className="relative">
        <Input
          id={id}
          aria-invalid={erreur ? true : undefined}
          aria-describedby={decritPar || undefined}
          // Réserve la place de l'action pour que la saisie ne passe pas dessous.
          className={actionFin ? "pr-14" : undefined}
          {...props}
        />
        {actionFin}
      </div>
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

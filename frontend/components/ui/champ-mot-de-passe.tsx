"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { ChampFormulaire } from "@/components/ui/champ-formulaire";

/*
 * Champ de mot de passe avec révélateur. Saisir un mot de passe long à l'aveugle,
 * debout et sur mobile, est une source d'erreurs : le bouton permet de vérifier
 * sa saisie. Il conserve une cible tactile de 48 px et annonce son état via
 * aria-pressed ; son libellé décrit l'action, jamais seulement l'icône.
 */
export function ChampMotDePasse({
  ...props
}: Omit<React.ComponentProps<typeof ChampFormulaire>, "type" | "actionFin">) {
  const [visible, setVisible] = useState(false);
  const Icone = visible ? EyeOff : Eye;

  return (
    <ChampFormulaire
      {...props}
      type={visible ? "text" : "password"}
      actionFin={
        <button
          type="button"
          onClick={() => setVisible((etat) => !etat)}
          aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 flex w-cible items-center justify-center rounded-pilule text-brun transition-colors hover:text-encre"
        >
          <Icone aria-hidden className="size-5" />
        </button>
      }
    />
  );
}

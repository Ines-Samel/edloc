"use client";

import { CircleAlert, CircleCheck, Ellipsis, Sparkles } from "lucide-react";

import type { EtatElement } from "@/components/edl/pastille-etat";

/*
 * Choix de l'état d'un élément (RG8). Les quatre options reprennent les trois
 * signaux de la charte : icône, libellé écrit, style de bordure. Ce sont de vrais
 * boutons radio — l'ensemble reste donc navigable au clavier et annoncé comme un
 * groupe de choix, ce qu'une rangée de <button> ne permettrait pas.
 */
const OPTIONS = [
  {
    valeur: "neuf",
    libelle: "Neuf",
    icone: Sparkles,
    bordure: "border-solid border-vert-profond",
    inactif: "text-vert-profond",
    actif: "bg-vert-profond text-white",
  },
  {
    valeur: "bonEtat",
    libelle: "Bon état",
    icone: CircleCheck,
    bordure: "border-solid border-vert-profond",
    inactif: "text-vert-profond",
    actif: "bg-vert-profond text-white",
  },
  {
    valeur: "etatUsage",
    libelle: "Usage",
    icone: Ellipsis,
    bordure: "border-dashed border-ocre-fonce",
    inactif: "text-ocre-fonce",
    actif: "bg-ocre-fonce text-white",
  },
  {
    valeur: "mauvaisEtat",
    libelle: "Mauvais",
    icone: CircleAlert,
    bordure: "border-dotted border-alerte-foncee",
    inactif: "text-alerte-foncee",
    actif: "bg-alerte-foncee text-white",
  },
] as const satisfies readonly { valeur: EtatElement; [cle: string]: unknown }[];

export function SelecteurEtat({
  nom,
  valeur,
  onChanger,
  desactive = false,
}: {
  nom: string;
  valeur: EtatElement;
  onChanger: (etat: EtatElement) => void;
  desactive?: boolean;
}) {
  return (
    <fieldset className="flex flex-wrap gap-2" disabled={desactive}>
      <legend className="sr-only">État de l&apos;élément</legend>
      {OPTIONS.map(({ valeur: option, libelle, icone: Icone, bordure, inactif, actif }) => {
        const selectionne = valeur === option;
        return (
          <label
            key={option}
            className={`text-legende flex min-h-cible cursor-pointer items-center gap-1.5 rounded-pilule border-2 px-3 ${bordure} ${
              selectionne ? actif : `bg-card ${inactif}`
            } ${desactive ? "cursor-not-allowed opacity-70" : ""}`}
          >
            <input
              type="radio"
              name={nom}
              value={option}
              checked={selectionne}
              onChange={() => onChanger(option)}
              className="sr-only"
            />
            <Icone aria-hidden className="size-4" />
            {libelle}
          </label>
        );
      })}
    </fieldset>
  );
}

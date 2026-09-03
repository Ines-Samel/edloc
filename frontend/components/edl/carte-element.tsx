"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

import type { EtatElement } from "@/components/edl/pastille-etat";
import { SelecteurEtat } from "@/components/edl/selecteur-etat";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { ElementEdl } from "@/lib/edloc";

/*
 * Carte d'un élément constaté : son état, son commentaire et ses photos.
 * L'état est enregistré au clic ; le commentaire à la sortie du champ, pour ne
 * pas envoyer une requête à chaque frappe.
 */
export function CarteElement({
  element,
  verrouille,
  onEnregistrer,
  onSupprimer,
}: {
  element: ElementEdl;
  verrouille: boolean;
  onEnregistrer: (modifications: { etat?: EtatElement; commentaire?: string }) => Promise<void>;
  onSupprimer: () => Promise<void>;
}) {
  const commentaireServeur = element.commentaire ?? "";
  const [commentaire, setCommentaire] = useState(commentaireServeur);
  const [dernierRecu, setDernierRecu] = useState(commentaireServeur);

  // Le commentaire peut changer hors de la carte (rechargement de l'état des lieux) :
  // on réaligne la saisie pendant le rendu plutôt que dans un effet, ce qui évite
  // un rendu intermédiaire affichant l'ancienne valeur.
  if (commentaireServeur !== dernierRecu) {
    setDernierRecu(commentaireServeur);
    setCommentaire(commentaireServeur);
  }

  return (
    <article className="flex flex-col gap-4 rounded-carte border border-sable bg-card p-5">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-sous-titre">{element.libelle}</h3>
        {!verrouille ? (
          <Button
            variant="destructive"
            size="icon-sm"
            aria-label={`Supprimer l'élément ${element.libelle}`}
            onClick={onSupprimer}
          >
            <Trash2 aria-hidden className="size-4" />
          </Button>
        ) : null}
      </div>

      <SelecteurEtat
        nom={`etat-${element.idElement}`}
        valeur={element.etat}
        desactive={verrouille}
        onChanger={(etat) => onEnregistrer({ etat })}
      />

      <div className="flex flex-col gap-2">
        <Label htmlFor={`commentaire-${element.idElement}`} className="sr-only">
          Commentaire sur {element.libelle}
        </Label>
        <textarea
          id={`commentaire-${element.idElement}`}
          value={commentaire}
          disabled={verrouille}
          onChange={(evenement) => setCommentaire(evenement.target.value)}
          onBlur={() => {
            if (commentaireServeur !== commentaire) onEnregistrer({ commentaire });
          }}
          rows={2}
          maxLength={1000}
          placeholder="Commentaire (facultatif) : traces d'usure, rayures…"
          className="text-courant w-full rounded-carte border border-input bg-card px-4 py-3 placeholder:text-brun disabled:bg-sable"
        />
      </div>
    </article>
  );
}

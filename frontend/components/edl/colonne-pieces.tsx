"use client";

import { CircleAlert, CircleCheck } from "lucide-react";

import { completudePiece, type PieceEdl } from "@/lib/edloc";

/*
 * Colonne des pièces, présente dès la tablette (maquette 9). Chaque pièce porte
 * son état de complétude avec les trois signaux : icône, libellé accessible et
 * style distinct de la pièce active.
 */
export function ColonnePieces({
  pieces,
  indexActif,
  onSelectionner,
}: {
  pieces: PieceEdl[];
  indexActif: number;
  onSelectionner: (index: number) => void;
}) {
  return (
    <nav aria-label="Pièces de l'état des lieux" className="flex flex-col gap-1">
      {pieces.map((piece, index) => {
        const complete = completudePiece(piece) === "complet";
        const actif = index === indexActif;
        const Icone = complete ? CircleCheck : CircleAlert;

        return (
          <button
            key={piece.idPiece}
            type="button"
            onClick={() => onSelectionner(index)}
            aria-current={actif ? "true" : undefined}
            className={`text-courant flex min-h-cible items-center justify-between gap-3 rounded-carte px-3 text-left ${
              actif ? "bg-sable font-bold text-terracotta-fonce" : "text-brun hover:bg-sable"
            }`}
          >
            <span className="truncate">{piece.libelle}</span>
            <span className="flex items-center gap-1.5">
              <span className="sr-only">
                {complete ? "Pièce renseignée" : "Pièce à compléter"}
              </span>
              <Icone
                aria-hidden
                className={`size-4 shrink-0 ${complete ? "text-vert-profond" : "text-alerte-foncee"}`}
              />
            </span>
          </button>
        );
      })}
    </nav>
  );
}

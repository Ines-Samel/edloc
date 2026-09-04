"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import {
  PastilleCompletude,
  PastilleEtatElement,
  PastilleVerdict,
  type EtatElement,
  type Verdict,
} from "@/components/edl/pastille-etat";
import { Button } from "@/components/ui/button";
import { Message } from "@/components/ui/message";
import { api } from "@/lib/api";
import { formaterDate } from "@/lib/edloc";

type ElementCompare = {
  libelle: string;
  etatEntree?: EtatElement;
  etatSortie?: EtatElement;
  commentaireEntree?: string;
  commentaireSortie?: string;
  verdict: Verdict;
};

type PieceCompare = {
  libelle: string;
  presence: "lesDeux" | "entreeSeule" | "sortieSeule";
  elements: ElementCompare[];
};

type Comparaison = {
  edlEntree: { idEdl: string; dateEdl: string; dateSignature: string | null };
  edlSortie: { idEdl: string; dateEdl: string; statut: string };
  pieces: PieceCompare[];
  synthese: {
    identiques: number;
    degrades: number;
    ameliores: number;
    nouveaux: number;
    nonConstates: number;
  };
};

// Écran 12 : comparaison entrée / sortie (RG15).
export default function PageComparaison({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [comparaison, setComparaison] = useState<Comparaison | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [pieceFiltree, setPieceFiltree] = useState<string>("toutes");

  useEffect(() => {
    api<Comparaison>(`/etats-des-lieux/${id}/comparaison`)
      .then(setComparaison)
      .catch((err) =>
        setErreur(
          err instanceof Error && err.message
            ? err.message
            : "La comparaison n'a pas pu être calculée.",
        ),
      );
  }, [id]);

  if (erreur) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
        <Message ton="erreur">{erreur}</Message>
        <Button asChild variant="outline" className="self-start">
          <Link href={`/etats-des-lieux/${id}`}>Retour à l&apos;état des lieux</Link>
        </Button>
      </div>
    );
  }

  if (!comparaison) {
    return (
      <p className="text-courant text-brun" role="status">
        Calcul de la comparaison…
      </p>
    );
  }

  const { synthese } = comparaison;
  const totalEcarts =
    synthese.degrades + synthese.ameliores + synthese.nouveaux + synthese.nonConstates;
  const piecesVisibles = comparaison.pieces.filter(
    (piece) => pieceFiltree === "toutes" || piece.libelle === pieceFiltree,
  );

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <Link
        href={`/etats-des-lieux/${id}`}
        className="text-legende flex items-center gap-1 text-terracotta-fonce hover:underline"
      >
        <ChevronLeft aria-hidden className="size-4" />
        Retour à l&apos;état des lieux
      </Link>

      <header className="flex flex-col gap-2">
        <h1 className="text-titre-1">Comparaison entrée / sortie</h1>
        <p className="text-legende text-brun">
          Entrée · {formaterDate(comparaison.edlEntree.dateEdl)} → Sortie ·{" "}
          {formaterDate(comparaison.edlSortie.dateEdl)}
        </p>
        <p className="text-legende text-brun">
          {totalEcarts === 0
            ? `Aucun écart : les ${synthese.identiques} éléments sont identiques à l'entrée.`
            : `${totalEcarts} écart${totalEcarts > 1 ? "s" : ""} — ${synthese.degrades} dégradé${synthese.degrades > 1 ? "s" : ""}, ${synthese.ameliores} amélioré${synthese.ameliores > 1 ? "s" : ""}, ${synthese.nouveaux} nouveau${synthese.nouveaux > 1 ? "x" : ""}, ${synthese.nonConstates} non constaté${synthese.nonConstates > 1 ? "s" : ""}.`}
        </p>
      </header>

      {comparaison.pieces.length > 1 ? (
        <div role="group" aria-label="Filtrer par pièce" className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={pieceFiltree === "toutes" ? "default" : "outline"}
            aria-pressed={pieceFiltree === "toutes"}
            onClick={() => setPieceFiltree("toutes")}
          >
            Toutes pièces
          </Button>
          {comparaison.pieces.map((piece) => (
            <Button
              key={piece.libelle}
              size="sm"
              variant={pieceFiltree === piece.libelle ? "default" : "outline"}
              aria-pressed={pieceFiltree === piece.libelle}
              onClick={() => setPieceFiltree(piece.libelle)}
            >
              {piece.libelle}
            </Button>
          ))}
        </div>
      ) : null}

      {piecesVisibles.map((piece) => {
        const ecarts = piece.elements.filter((e) => e.verdict !== "identique").length;
        return (
          <section key={piece.libelle} className="rounded-carte border border-sable bg-card">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sable px-5 py-4">
              <h2 className="text-sous-titre">
                {piece.libelle}
                {piece.presence !== "lesDeux" ? (
                  <span className="text-legende ml-2 font-normal text-brun">
                    {piece.presence === "entreeSeule"
                      ? "(absente de la sortie)"
                      : "(absente de l'entrée)"}
                  </span>
                ) : null}
              </h2>
              {/* En-tête de pièce : le nombre d'écarts, comme dans la maquette. */}
              <PastilleCompletude
                completude={ecarts > 0 ? "aCompleter" : "complet"}
                libelle={ecarts === 0 ? "Aucun écart" : `${ecarts} écart${ecarts > 1 ? "s" : ""}`}
              />
            </div>

            <ul className="divide-y divide-sable">
              {piece.elements.map((element) => {
                const ecart = element.verdict !== "identique";
                return (
                  <li
                    key={element.libelle}
                    // Trois signaux cumulés sur un écart : fond teinté, bordure
                    // pointillée et pastille nommant le changement.
                    className={`flex flex-col gap-3 px-5 py-4 ${
                      ecart ? "border-l-4 border-dotted border-alerte-foncee bg-alerte/5" : ""
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="text-courant flex-1 font-bold">{element.libelle}</span>
                      <PastilleVerdict verdict={element.verdict} />
                    </div>

                    <div className="flex flex-wrap gap-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-legende text-brun">Entrée</span>
                        {element.etatEntree ? (
                          <PastilleEtatElement etat={element.etatEntree} plein />
                        ) : (
                          <span className="text-legende text-brun">—</span>
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-legende text-brun">Sortie</span>
                        {element.etatSortie ? (
                          <PastilleEtatElement etat={element.etatSortie} plein />
                        ) : (
                          <span className="text-legende text-brun">—</span>
                        )}
                      </div>
                    </div>

                    {element.commentaireEntree || element.commentaireSortie ? (
                      <dl className="text-legende flex flex-col gap-1 text-brun">
                        {element.commentaireEntree ? (
                          <div className="flex gap-2">
                            <dt className="font-bold">À l&apos;entrée :</dt>
                            <dd>{element.commentaireEntree}</dd>
                          </div>
                        ) : null}
                        {element.commentaireSortie ? (
                          <div className="flex gap-2">
                            <dt className="font-bold">À la sortie :</dt>
                            <dd>{element.commentaireSortie}</dd>
                          </div>
                        ) : null}
                      </dl>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

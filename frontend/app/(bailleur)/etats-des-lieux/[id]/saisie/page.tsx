"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

import { CarteElement } from "@/components/edl/carte-element";
import { elementsProposes } from "@/components/edl/catalogue-pieces";
import { ColonnePieces } from "@/components/edl/colonne-pieces";
import { SelecteurEtat } from "@/components/edl/selecteur-etat";
import type { EtatElement } from "@/components/edl/pastille-etat";
import { EtapesEdl } from "@/components/edl/etapes-edl";
import { Button } from "@/components/ui/button";
import { ChampFormulaire } from "@/components/ui/champ-formulaire";
import { Message } from "@/components/ui/message";
import { api } from "@/lib/api";
import { piecesRenseignees, type EdlComplet, type PieceEdl } from "@/lib/edloc";

// Écran 9 : saisie pièce par pièce, cœur de l'application.
export default function PageSaisie({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [edl, setEdl] = useState<EdlComplet | null>(null);
  const [indexPiece, setIndexPiece] = useState(0);
  const [erreur, setErreur] = useState<string | null>(null);
  const [nouvelElement, setNouvelElement] = useState<{
    libelle: string;
    etat: EtatElement;
  }>({
    libelle: "",
    etat: "bonEtat",
  });

  const recharger = useCallback(
    () =>
      api<EdlComplet>(`/etats-des-lieux/${id}`)
        .then((donnees) => {
          setEdl(donnees);
          setErreur(null);
        })
        .catch(() => setErreur("Cet état des lieux est introuvable.")),
    [id],
  );

  useEffect(() => {
    recharger();
  }, [recharger]);

  // Toute écriture est suivie d'un rechargement : l'écran reflète l'état réel du
  // serveur, y compris les refus (état des lieux signé, donc verrouillé).
  async function agir(action: () => Promise<unknown>) {
    try {
      await action();
      await recharger();
    } catch {
      setErreur(
        "L'enregistrement a échoué. Vérifiez votre connexion et réessayez.",
      );
    }
  }

  if (erreur && !edl) return <Message ton="erreur">{erreur}</Message>;

  if (!edl) {
    return (
      <p className="text-courant text-brun" role="status">
        Chargement…
      </p>
    );
  }

  const verrouille = edl.statut === "signe";
  const pieces = edl.pieces;
  const piece: PieceEdl | undefined = pieces[indexPiece];
  const renseignees = piecesRenseignees(pieces);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <EtapesEdl etapeCourante="saisie" />

      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h1 className="text-titre-1">
            {edl.bien.adresse} —{" "}
            {edl.typeEdl === "entree" ? "entrée" : "sortie"}
          </h1>
          <p className="text-legende text-brun">
            {edl.locataire.prenom} {edl.locataire.nom}
          </p>
        </div>

        {/* Progression : pièces renseignées sur le total (RG10). */}
        <div className="flex flex-col gap-2">
          <p className="text-legende text-brun">
            {renseignees} pièce{renseignees > 1 ? "s" : ""} renseignée
            {renseignees > 1 ? "s" : ""} sur {pieces.length}
          </p>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={pieces.length}
            aria-valuenow={renseignees}
            aria-label="Progression de la saisie"
            className="h-2 w-full overflow-hidden rounded-pilule bg-sable"
          >
            <div
              className="h-full rounded-pilule bg-terracotta-fonce transition-all"
              style={{
                width: pieces.length
                  ? `${(renseignees / pieces.length) * 100}%`
                  : "0%",
              }}
            />
          </div>
        </div>
      </header>

      {erreur ? <Message ton="erreur">{erreur}</Message> : null}
      {verrouille ? (
        <Message ton="information">
          Cet état des lieux est signé : il n&apos;est plus modifiable.
        </Message>
      ) : null}

      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <aside className="flex flex-col gap-3 sm:w-56 sm:shrink-0">
          <ColonnePieces
            pieces={pieces}
            indexActif={indexPiece}
            onSelectionner={setIndexPiece}
          />
          {!verrouille ? (
            <Button asChild variant="outline" size="sm">
              <Link href={`/etats-des-lieux/${id}/pieces`}>
                <Plus aria-hidden className="size-4" />
                Ajouter une pièce
              </Link>
            </Button>
          ) : null}
        </aside>

        <section className="flex min-w-0 flex-1 flex-col gap-4">
          {pieces.length === 0 ? (
            <Message ton="information">
              Commencez par ajouter une pièce, puis décrivez ses éléments un par
              un.
            </Message>
          ) : null}

          {piece ? (
            <>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-titre-2">{piece.libelle}</h2>
                <p className="text-legende text-brun">
                  Pièce {indexPiece + 1} sur {pieces.length} ·{" "}
                  {piece.elements.length} élément
                  {piece.elements.length > 1 ? "s" : ""}
                </p>
              </div>

              {piece.elements.map((element) => (
                <CarteElement
                  key={element.idElement}
                  element={element}
                  verrouille={verrouille}
                  onEnregistrer={(modifications) =>
                    agir(() =>
                      api(`/elements/${element.idElement}`, {
                        method: "PUT",
                        body: {
                          libelle: modifications.libelle ?? element.libelle,
                          etat: modifications.etat ?? element.etat,
                          commentaire:
                            modifications.commentaire ??
                            element.commentaire ??
                            undefined,
                        },
                      }),
                    )
                  }
                  onSupprimer={() =>
                    agir(() =>
                      api(`/elements/${element.idElement}`, {
                        method: "DELETE",
                      }),
                    )
                  }
                  onRecharger={recharger}
                />
              ))}

              {!verrouille ? (
                <div className="flex flex-col gap-3 rounded-carte border-2 border-dashed border-sable p-5">
                  {(() => {
                    const dejaPresents = new Set(
                      piece.elements.map((e) => e.libelle.trim().toLowerCase()),
                    );
                    const suggestions = elementsProposes(piece.libelle).filter(
                      (libelle) =>
                        !dejaPresents.has(libelle.trim().toLowerCase()),
                    );
                    if (suggestions.length === 0) return null;
                    return (
                      <div className="flex flex-col gap-2">
                        <p className="text-libelle">
                          Éléments courants pour « {piece.libelle} »
                        </p>
                        <ul className="flex flex-wrap gap-2">
                          {suggestions.map((libelle) => (
                            <li key={libelle}>
                              <button
                                type="button"
                                onClick={() =>
                                  agir(() =>
                                    api(`/pieces/${piece.idPiece}/elements`, {
                                      method: "POST",
                                      body: { libelle, etat: "bonEtat" },
                                    }),
                                  )
                                }
                                className="text-legende flex min-h-cible items-center gap-1.5 rounded-pilule border-2 border-terracotta-fonce bg-card px-4 text-terracotta-fonce hover:bg-sable"
                              >
                                <Plus aria-hidden className="size-4" />
                                {libelle}
                              </button>
                            </li>
                          ))}
                        </ul>
                        <p className="text-legende text-brun">
                          Ajoutés en « Bon état » ; corrigez ensuite ce qui
                          diffère.
                        </p>
                      </div>
                    );
                  })()}

                  <form
                    className="flex flex-col gap-4 border-t border-sable pt-4"
                    onSubmit={async (evenement) => {
                      evenement.preventDefault();
                      if (!nouvelElement.libelle.trim()) return;
                      await agir(() =>
                        api(`/pieces/${piece.idPiece}/elements`, {
                          method: "POST",
                          body: {
                            libelle: nouvelElement.libelle.trim(),
                            etat: nouvelElement.etat,
                          },
                        }),
                      );
                      setNouvelElement({ libelle: "", etat: "bonEtat" });
                    }}
                  >
                    <ChampFormulaire
                      id="nouvel-element"
                      libelle="Ajouter un élément"
                      placeholder="Murs, Sol, Fenêtres, Robinetterie…"
                      value={nouvelElement.libelle}
                      onChange={(evenement) =>
                        setNouvelElement((etat) => ({
                          ...etat,
                          libelle: evenement.target.value,
                        }))
                      }
                    />
                    {/* L'état est choisi dès la création : RG8 impose qu'un élément en porte un. */}
                    <SelecteurEtat
                      nom="etat-nouvel-element"
                      valeur={nouvelElement.etat}
                      onChanger={(etat) =>
                        setNouvelElement((actuel) => ({ ...actuel, etat }))
                      }
                    />
                    <Button type="submit" variant="outline">
                      <Plus aria-hidden className="size-4" />
                      Ajouter cet élément
                    </Button>
                  </form>
                </div>
              ) : null}

              <div className="flex justify-between gap-4">
                <Button
                  variant="outline"
                  disabled={indexPiece === 0}
                  onClick={() => setIndexPiece((i) => Math.max(0, i - 1))}
                >
                  Précédent
                </Button>

                {indexPiece < pieces.length - 1 ? (
                  <Button onClick={() => setIndexPiece((i) => i + 1)}>
                    Suivant
                  </Button>
                ) : (
                  <Button asChild>
                    <Link href={`/etats-des-lieux/${id}/recapitulatif`}>
                      Voir le récapitulatif
                    </Link>
                  </Button>
                )}
              </div>
            </>
          ) : null}
        </section>
      </div>
    </div>
  );
}

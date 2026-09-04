"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Plus } from "lucide-react";

import { CATALOGUE_PIECES } from "@/components/edl/catalogue-pieces";
import { EtapesEdl } from "@/components/edl/etapes-edl";
import { Button } from "@/components/ui/button";
import { ChampFormulaire } from "@/components/ui/champ-formulaire";
import { Message } from "@/components/ui/message";
import { api } from "@/lib/api";
import type { EdlComplet } from "@/lib/edloc";

const normaliser = (texte: string) => texte.trim().toLowerCase();

// Étape 2 du parcours : choisir ce qu'on va constater, sans avoir à le taper.
export default function PageChoixPieces({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [edl, setEdl] = useState<EdlComplet | null>(null);
  const [selection, setSelection] = useState<string[]>([]);
  const [surMesure, setSurMesure] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [enregistrement, setEnregistrement] = useState(false);

  useEffect(() => {
    api<EdlComplet>(`/etats-des-lieux/${id}`)
      .then((donnees) => {
        setEdl(donnees);
        // Les pièces déjà créées arrivent cochées : l'étape reste modifiable.
        setSelection(donnees.pieces.map((piece) => piece.libelle));
      })
      .catch(() => setErreur("Cet état des lieux est introuvable."));
  }, [id]);

  if (erreur && !edl) return <Message ton="erreur">{erreur}</Message>;
  if (!edl) {
    return (
      <p className="text-courant text-brun" role="status">
        Chargement…
      </p>
    );
  }

  const verrouille = edl.statut === "signe";
  const estSelectionnee = (libelle: string) =>
    selection.some((choisi) => normaliser(choisi) === normaliser(libelle));

  // Une pièce déjà remplie ne peut pas être décochée : ce serait perdre la saisie.
  const pieceRemplie = (libelle: string) =>
    edl.pieces.some(
      (piece) => normaliser(piece.libelle) === normaliser(libelle) && piece.elements.length > 0,
    );

  function basculer(libelle: string) {
    if (pieceRemplie(libelle)) return;
    setSelection((actuelle) =>
      estSelectionnee(libelle)
        ? actuelle.filter((choisi) => normaliser(choisi) !== normaliser(libelle))
        : [...actuelle, libelle],
    );
  }

  function ajouterSurMesure(evenement: React.FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    const libelle = surMesure.trim();
    if (!libelle || estSelectionnee(libelle)) {
      setSurMesure("");
      return;
    }
    setSelection((actuelle) => [...actuelle, libelle]);
    setSurMesure("");
  }

  async function validerEtContinuer() {
    setEnregistrement(true);
    setErreur(null);
    try {
      const existantes = edl!.pieces;

      // Créer les pièces nouvellement cochées, dans l'ordre de la sélection.
      for (const libelle of selection) {
        if (!existantes.some((piece) => normaliser(piece.libelle) === normaliser(libelle))) {
          await api(`/etats-des-lieux/${id}/pieces`, { method: "POST", body: { libelle } });
        }
      }

      // Retirer celles qui ont été décochées — uniquement si elles sont vides.
      for (const piece of existantes) {
        if (piece.elements.length === 0 && !estSelectionnee(piece.libelle)) {
          await api(`/pieces/${piece.idPiece}`, { method: "DELETE" });
        }
      }

      router.push(`/etats-des-lieux/${id}/saisie`);
    } catch {
      setErreur("L'enregistrement des pièces a échoué. Réessayez.");
      setEnregistrement(false);
    }
  }

  const surMesureChoisies = selection.filter(
    (libelle) =>
      !CATALOGUE_PIECES.some((groupe) =>
        groupe.pieces.some((piece) => normaliser(piece.libelle) === normaliser(libelle)),
      ),
  );

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      <EtapesEdl etapeCourante="pieces" />

      <header className="flex flex-col gap-2">
        <h1 className="text-titre-1">Quelles pièces allez-vous constater ?</h1>
        <p className="text-courant text-brun">
          Cochez ce que comprend le logement. N&apos;oubliez pas les dépendances, les clés et les
          compteurs : ils font partie de l&apos;état des lieux. Vous pourrez tout ajuster ensuite.
        </p>
      </header>

      {erreur ? <Message ton="erreur">{erreur}</Message> : null}
      {verrouille ? (
        <Message ton="information">
          Cet état des lieux est signé : les pièces ne sont plus modifiables.
        </Message>
      ) : null}

      {CATALOGUE_PIECES.map((groupe) => (
        <section key={groupe.titre} className="flex flex-col gap-3">
          <h2 className="text-titre-2">{groupe.titre}</h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {groupe.pieces.map((piece) => {
              const choisie = estSelectionnee(piece.libelle);
              const remplie = pieceRemplie(piece.libelle);
              return (
                <li key={piece.libelle}>
                  <label
                    className={`flex min-h-cible cursor-pointer items-start gap-3 rounded-carte border-2 px-4 py-3 ${
                      choisie
                        ? "border-terracotta-fonce bg-sable"
                        : "border-sable bg-card hover:border-brun"
                    } ${remplie || verrouille ? "cursor-not-allowed opacity-70" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={choisie}
                      disabled={remplie || verrouille}
                      onChange={() => basculer(piece.libelle)}
                      className="mt-1 size-5 shrink-0 accent-terracotta-fonce"
                    />
                    <span className="flex flex-col gap-1">
                      <span className="text-courant font-bold">{piece.libelle}</span>
                      <span className="text-legende text-brun">
                        {remplie
                          ? "Déjà renseignée"
                          : `${piece.elements.length} éléments proposés`}
                      </span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      {!verrouille ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-titre-2">Une autre pièce ?</h2>
          <form onSubmit={ajouterSurMesure} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <ChampFormulaire
                id="piece-sur-mesure"
                libelle="Nom de la pièce"
                placeholder="Dressing, Atelier, Chambre 4…"
                value={surMesure}
                onChange={(evenement) => setSurMesure(evenement.target.value)}
              />
            </div>
            <Button type="submit" variant="outline">
              <Plus aria-hidden className="size-4" />
              Ajouter
            </Button>
          </form>

          {surMesureChoisies.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {surMesureChoisies.map((libelle) => (
                <li key={libelle}>
                  <button
                    type="button"
                    onClick={() => basculer(libelle)}
                    disabled={pieceRemplie(libelle)}
                    className="text-legende flex min-h-cible items-center gap-2 rounded-pilule border-2 border-terracotta-fonce bg-sable px-4 text-terracotta-fonce"
                  >
                    {libelle}
                    <span aria-hidden>×</span>
                    <span className="sr-only">Retirer {libelle}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}

      <div className="flex flex-col gap-4 border-t border-sable pt-6 sm:flex-row sm:items-center sm:justify-between">
        <Button asChild variant="outline">
          <Link href={`/etats-des-lieux/${id}`}>Précédent</Link>
        </Button>

        <div className="flex flex-col items-end gap-2">
          <p className="text-legende text-brun" aria-live="polite">
            {selection.length} pièce{selection.length > 1 ? "s" : ""} sélectionnée
            {selection.length > 1 ? "s" : ""}
          </p>
          <Button onClick={validerEtContinuer} disabled={selection.length === 0 || enregistrement}>
            {enregistrement ? "Enregistrement…" : "Suivant : la saisie"}
            <ArrowRight aria-hidden className="size-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

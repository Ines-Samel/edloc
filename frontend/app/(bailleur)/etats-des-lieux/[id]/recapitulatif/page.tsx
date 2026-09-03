"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { PastilleCompletude, PastilleEtatElement } from "@/components/edl/pastille-etat";
import { Button } from "@/components/ui/button";
import { Message } from "@/components/ui/message";
import { api } from "@/lib/api";
import { completudePiece, type EdlComplet } from "@/lib/edloc";

// Écran 10 : relecture avant signature, pièce par pièce.
export default function PageRecapitulatif({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [edl, setEdl] = useState<EdlComplet | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    api<EdlComplet>(`/etats-des-lieux/${id}`)
      .then(setEdl)
      .catch(() => setErreur("Cet état des lieux est introuvable."));
  }, [id]);

  if (erreur) return <Message ton="erreur">{erreur}</Message>;
  if (!edl) {
    return (
      <p className="text-courant text-brun" role="status">
        Chargement…
      </p>
    );
  }

  const signe = edl.statut === "signe";
  const aucunePiece = edl.pieces.length === 0;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <Link
        href={`/etats-des-lieux/${id}/saisie`}
        className="text-legende flex items-center gap-1 text-terracotta-fonce hover:underline"
      >
        <ChevronLeft aria-hidden className="size-4" />
        Retour à la saisie
      </Link>

      <header className="flex flex-col gap-1">
        <h1 className="text-titre-1">Récapitulatif</h1>
        <p className="text-legende text-brun">
          {edl.bien.adresse} · {edl.typeEdl === "entree" ? "Entrée" : "Sortie"} ·{" "}
          {edl.locataire.prenom} {edl.locataire.nom}
        </p>
      </header>

      {edl.pieces.map((piece) => (
        <section key={piece.idPiece} className="rounded-carte border border-sable bg-card">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sable px-5 py-4">
            <h2 className="text-sous-titre">{piece.libelle}</h2>
            <PastilleCompletude completude={completudePiece(piece)} />
          </div>

          {piece.elements.length === 0 ? (
            <p className="text-legende px-5 py-4 text-brun">
              Aucun élément constaté dans cette pièce.
            </p>
          ) : (
            <ul className="divide-y divide-sable">
              {piece.elements.map((element) => (
                <li
                  key={element.idElement}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
                >
                  <span className="text-courant flex-1">{element.libelle}</span>
                  <PastilleEtatElement etat={element.etat} />
                  <span className="text-legende w-20 text-right text-brun">
                    {element.photos.length === 0
                      ? "—"
                      : `${element.photos.length} photo${element.photos.length > 1 ? "s" : ""}`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}

      {aucunePiece ? (
        <Message ton="information">
          Aucune pièce n&apos;a encore été saisie. Revenez à la saisie pour en ajouter.
        </Message>
      ) : null}

      {signe ? (
        <Message ton="succes">
          Cet état des lieux est signé par les deux parties : il n&apos;est plus modifiable.
        </Message>
      ) : (
        <Message ton="information">
          Vérifiez chaque pièce avant de passer à la signature : une fois signé, l&apos;état des
          lieux est verrouillé.
        </Message>
      )}

      {!signe ? (
        <Button asChild disabled={aucunePiece} className="w-full sm:w-auto sm:self-end">
          <Link href={`/etats-des-lieux/${id}/signature`}>Passer à la signature</Link>
        </Button>
      ) : (
        <Button asChild className="w-full sm:w-auto sm:self-end">
          <Link href={`/etats-des-lieux/${id}`}>Voir l&apos;état des lieux</Link>
        </Button>
      )}
    </div>
  );
}

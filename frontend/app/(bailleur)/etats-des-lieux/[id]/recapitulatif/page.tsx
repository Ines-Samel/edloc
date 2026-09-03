"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { ListeRecapitulative } from "@/components/edl/liste-recapitulative";
import { Button } from "@/components/ui/button";
import { Message } from "@/components/ui/message";
import { api } from "@/lib/api";
import type { EdlComplet } from "@/lib/edloc";

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

      <ListeRecapitulative pieces={edl.pieces} />

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

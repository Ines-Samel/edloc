"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Mail, PenLine, Scale } from "lucide-react";

import { ListeRecapitulative } from "@/components/edl/liste-recapitulative";
import { PastilleStatutEdl } from "@/components/edl/pastille-etat";
import { Button } from "@/components/ui/button";
import { Message } from "@/components/ui/message";
import { BASE_API, api } from "@/lib/api";
import { formaterDate, libelleTypeEdl, type EdlComplet } from "@/lib/edloc";

// Détail d'un état des lieux : relecture, PDF et actions contextuelles.
// Aucune maquette dédiée ; l'écran reprend la présentation du récapitulatif.
export default function PageEtatDesLieux({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [edl, setEdl] = useState<EdlComplet | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState<"attente" | "encours" | "envoye">("attente");

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

  async function renvoyerPdf() {
    setEnvoi("encours");
    try {
      await api(`/etats-des-lieux/${id}/envoi-pdf`, { method: "POST" });
      setEnvoi("envoye");
    } catch {
      setErreur("L'envoi du PDF a échoué. Réessayez.");
      setEnvoi("attente");
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-titre-1">
            {libelleTypeEdl(edl.typeEdl)} — {edl.bien.adresse}
          </h1>
          <PastilleStatutEdl statut={edl.statut} />
        </div>
        <p className="text-legende text-brun">
          {edl.bien.codePostal} {edl.bien.ville} · {edl.locataire.prenom} {edl.locataire.nom} ·
          Réalisé le {formaterDate(edl.dateEdl)}
          {edl.dateSignature ? ` · Signé le ${formaterDate(edl.dateSignature)}` : ""}
        </p>
      </header>

      <div className="flex flex-wrap gap-4">
        {signe ? (
          <>
            <Button asChild>
              <a href={`${BASE_API}/etats-des-lieux/${id}/pdf`} target="_blank" rel="noreferrer">
                <FileText aria-hidden className="size-5" />
                Ouvrir le PDF
              </a>
            </Button>
            <Button variant="outline" onClick={renvoyerPdf} disabled={envoi === "encours"}>
              <Mail aria-hidden className="size-5" />
              {envoi === "encours" ? "Envoi…" : "Renvoyer le PDF par e-mail"}
            </Button>
          </>
        ) : (
          <>
            <Button asChild>
              <Link href={`/etats-des-lieux/${id}/saisie`}>
                <PenLine aria-hidden className="size-5" />
                Continuer la saisie
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/etats-des-lieux/${id}/recapitulatif`}>Relire et signer</Link>
            </Button>
          </>
        )}

        {edl.typeEdl === "sortie" ? (
          <Button asChild variant="outline">
            <Link href={`/etats-des-lieux/${id}/comparaison`}>
              <Scale aria-hidden className="size-5" />
              Comparer avec l&apos;entrée
            </Link>
          </Button>
        ) : null}
      </div>

      {envoi === "envoye" ? (
        <Message ton="succes">
          Le PDF vient d&apos;être renvoyé par e-mail aux parties concernées.
        </Message>
      ) : null}

      <ListeRecapitulative pieces={edl.pieces} />
    </div>
  );
}

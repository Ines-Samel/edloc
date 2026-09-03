"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, FileText, SquarePen } from "lucide-react";

import { PastilleStatutEdl } from "@/components/edl/pastille-etat";
import { SuppressionBien } from "@/components/biens/suppression-bien";
import { Button } from "@/components/ui/button";
import { Message } from "@/components/ui/message";
import { BASE_API, api } from "@/lib/api";
import { descriptifBien, formaterDate, libelleTypeEdl, type Bien } from "@/lib/edloc";

type LigneHistorique = {
  idEdl: string;
  typeEdl: "entree" | "sortie";
  statut: "brouillon" | "signe";
  dateEdl: string;
  dateSignature: string | null;
  locataire: { nom: string; prenom: string };
};

const FILTRES = [
  { valeur: "tous", libelle: "Tous" },
  { valeur: "entree", libelle: "Entrée" },
  { valeur: "sortie", libelle: "Sortie" },
] as const;

// Écran 13 : tous les états des lieux d'un bien, du plus récent au plus ancien.
export default function PageHistoriqueBien({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [bien, setBien] = useState<Bien | null>(null);
  const [lignes, setLignes] = useState<LigneHistorique[] | null>(null);
  const [filtre, setFiltre] = useState<(typeof FILTRES)[number]["valeur"]>("tous");
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api<Bien>(`/biens/${id}`), api<LigneHistorique[]>(`/biens/${id}/etats-des-lieux`)])
      .then(([detail, historique]) => {
        setBien(detail);
        setLignes(historique);
      })
      .catch(() => setErreur("Ce bien est introuvable, ou son historique n'a pas pu être chargé."));
  }, [id]);

  const visibles = lignes?.filter((l) => filtre === "tous" || l.typeEdl === filtre) ?? [];

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <Link
        href="/biens"
        className="text-legende flex items-center gap-1 text-terracotta-fonce hover:underline"
      >
        <ChevronLeft aria-hidden className="size-4" />
        Mes biens
      </Link>

      {erreur ? <Message ton="erreur">{erreur}</Message> : null}

      {bien ? (
        <header className="flex flex-col gap-4 rounded-carte border border-sable bg-card px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-titre-2">{bien.adresse}</h1>
            <p className="text-legende text-brun">{descriptifBien(bien)}</p>
          </div>

          <div className="flex items-center gap-3">
            <Button asChild variant="outline" size="sm">
              <Link href={`/biens/${id}/modifier`}>
                <SquarePen aria-hidden className="size-4" />
                Modifier
              </Link>
            </Button>
            <SuppressionBien idBien={id} nombreEdl={lignes?.length ?? 0} />
          </div>
        </header>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-titre-2">Historique</h2>

        <div role="group" aria-label="Filtrer par type" className="flex gap-2">
          {FILTRES.map(({ valeur, libelle }) => (
            <Button
              key={valeur}
              size="sm"
              variant={filtre === valeur ? "default" : "outline"}
              aria-pressed={filtre === valeur}
              onClick={() => setFiltre(valeur)}
            >
              {libelle}
            </Button>
          ))}
        </div>
      </div>

      {lignes === null && !erreur ? (
        <p className="text-courant text-brun" role="status">
          Chargement…
        </p>
      ) : null}

      {lignes && visibles.length === 0 ? (
        <Message ton="information">
          {lignes.length === 0
            ? "Aucun état des lieux pour ce bien. Créez-en un depuis « Nouvel EDL »."
            : "Aucun état des lieux de ce type pour ce bien."}
        </Message>
      ) : null}

      {visibles.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {visibles.map((ligne) => (
            <li
              key={ligne.idEdl}
              className="flex flex-col gap-3 rounded-carte border border-sable bg-card px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <Link href={`/etats-des-lieux/${ligne.idEdl}`} className="flex flex-1 flex-col gap-2">
                <span className="text-sous-titre">{formaterDate(ligne.dateEdl)}</span>
                <span className="text-legende text-brun">
                  {libelleTypeEdl(ligne.typeEdl)} · {ligne.locataire.prenom} {ligne.locataire.nom}
                </span>
              </Link>

              <div className="flex items-center gap-3">
                <PastilleStatutEdl statut={ligne.statut} />
                {ligne.statut === "signe" ? (
                  <Button asChild variant="outline" size="sm">
                    {/* Le cookie de session accompagne la requête : le PDF s'ouvre directement. */}
                    <a href={`${BASE_API}/etats-des-lieux/${ligne.idEdl}/pdf`} target="_blank" rel="noreferrer">
                      <FileText aria-hidden className="size-4" />
                      PDF
                    </a>
                  </Button>
                ) : (
                  <span className="text-legende text-brun">PDF après signature</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

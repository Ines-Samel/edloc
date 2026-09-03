"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { PastilleStatutEdl } from "@/components/edl/pastille-etat";
import { Message } from "@/components/ui/message";
import { api } from "@/lib/api";
import {
  formaterDate,
  libelleTypeEdl,
  type ListeBiens,
  type ListeEdl,
  type ResumeEdl,
} from "@/lib/edloc";
import { useCompte } from "@/lib/session";

type Indicateurs = { biens: number; enCours: number; signes: number };

// Écran 6 : indicateurs et états des lieux récents.
export default function PageTableauDeBord() {
  const compte = useCompte();
  const prenom = compte.role === "bailleur" ? compte.prenom : "";

  const [indicateurs, setIndicateurs] = useState<Indicateurs | null>(null);
  const [recents, setRecents] = useState<ResumeEdl[] | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    // Les totaux sont lus dans la pagination : inutile de rapatrier les lignes.
    Promise.all([
      api<ListeBiens>("/biens?limite=1"),
      api<ListeEdl>("/etats-des-lieux?statut=brouillon&limite=1"),
      api<ListeEdl>("/etats-des-lieux?statut=signe&limite=1"),
      api<ListeEdl>("/etats-des-lieux?limite=5"),
    ])
      .then(([biens, enCours, signes, derniers]) => {
        setIndicateurs({
          biens: biens.pagination.total,
          enCours: enCours.pagination.total,
          signes: signes.pagination.total,
        });
        setRecents(derniers.donnees);
      })
      .catch(() => setErreur("Impossible de charger votre tableau de bord. Réessayez."));
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <h1 className="text-titre-1">Bonjour {prenom}</h1>

      {erreur ? <Message ton="erreur">{erreur}</Message> : null}

      <section aria-labelledby="titre-indicateurs">
        <h2 id="titre-indicateurs" className="sr-only">
          Vue d&apos;ensemble
        </h2>
        <ul className="flex flex-col gap-4 sm:flex-row">
          {[
            { libelle: "Biens", valeur: indicateurs?.biens },
            { libelle: "EDL en cours", valeur: indicateurs?.enCours },
            { libelle: "EDL signés", valeur: indicateurs?.signes },
          ].map(({ libelle, valeur }) => (
            <li
              key={libelle}
              className="flex flex-1 flex-col gap-1 rounded-carte border border-sable bg-card px-5 py-4"
            >
              <span className="text-legende text-brun">{libelle}</span>
              <span className="text-titre-1" aria-live="polite">
                {valeur ?? "—"}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="titre-recents" className="flex flex-col gap-4">
        <h2 id="titre-recents" className="text-titre-2">
          États des lieux récents
        </h2>

        {recents === null && !erreur ? (
          <p className="text-courant text-brun" role="status">
            Chargement…
          </p>
        ) : null}

        {recents?.length === 0 ? (
          <Message ton="information">
            Aucun état des lieux pour l&apos;instant. Commencez par ajouter un bien, puis créez
            votre premier état des lieux.
          </Message>
        ) : null}

        {recents && recents.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {recents.map((edl) => (
              <li key={edl.idEdl}>
                <Link
                  href={`/etats-des-lieux/${edl.idEdl}`}
                  className="flex min-h-cible flex-col gap-2 rounded-carte border border-sable bg-card px-5 py-4 hover:border-terracotta-fonce sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="flex flex-col gap-1">
                    <span className="text-sous-titre">
                      {edl.bien.adresse} — {edl.bien.ville}
                    </span>
                    <span className="text-legende text-brun">
                      {libelleTypeEdl(edl.typeEdl)} · {edl.locataire.prenom} {edl.locataire.nom}
                    </span>
                  </span>
                  <span className="flex items-center gap-3">
                    <PastilleStatutEdl statut={edl.statut} />
                    <span className="text-legende text-brun">{formaterDate(edl.dateEdl)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </div>
  );
}

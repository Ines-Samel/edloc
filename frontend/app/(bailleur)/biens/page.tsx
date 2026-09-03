"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Plus, Search } from "lucide-react";

import { PastilleCompletude } from "@/components/edl/pastille-etat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Message } from "@/components/ui/message";
import { api } from "@/lib/api";
import { avancementBien, descriptifBien, type Bien, type ListeBiens } from "@/lib/edloc";

// Écran 7 : liste des biens, recherche libre sur l'adresse et filtre par commune.
export default function PageBiens() {
  const [recherche, setRecherche] = useState("");
  const [commune, setCommune] = useState("");
  const [biens, setBiens] = useState<Bien[] | null>(null);
  const [communes, setCommunes] = useState<string[]>([]);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    // La recherche est différée : on n'interroge pas l'API à chaque frappe.
    const minuteur = setTimeout(() => {
      const parametres = new URLSearchParams();
      if (recherche.trim()) parametres.set("recherche", recherche.trim());
      if (commune) parametres.set("commune", commune);

      api<ListeBiens>(`/biens?${parametres.toString()}`)
        .then((liste) => {
          setBiens(liste.donnees);
          setCommunes(liste.communes);
          setErreur(null);
        })
        .catch(() => setErreur("Impossible de charger vos biens. Réessayez."));
    }, 300);

    return () => clearTimeout(minuteur);
  }, [recherche, commune]);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-titre-1">Mes biens</h1>
        <Button asChild variant="outline" size="sm">
          <Link href="/biens/nouveau">
            <Plus aria-hidden className="size-4" />
            Bien
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Label htmlFor="recherche" className="sr-only">
            Rechercher un bien
          </Label>
          <Search
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-4 my-auto size-5 text-brun"
          />
          <Input
            id="recherche"
            type="search"
            value={recherche}
            onChange={(evenement) => setRecherche(evenement.target.value)}
            placeholder="Rechercher un bien…"
            className="pl-12"
          />
        </div>

        <div className="sm:w-64">
          <Label htmlFor="commune" className="sr-only">
            Filtrer par commune
          </Label>
          <select
            id="commune"
            value={commune}
            onChange={(evenement) => setCommune(evenement.target.value)}
            className="text-courant h-cible w-full rounded-carte border border-input bg-card px-4"
          >
            <option value="">Commune : toutes</option>
            {communes.map((ville) => (
              <option key={ville} value={ville}>
                {ville}
              </option>
            ))}
          </select>
        </div>
      </div>

      {erreur ? <Message ton="erreur">{erreur}</Message> : null}

      {biens === null && !erreur ? (
        <p className="text-courant text-brun" role="status">
          Chargement…
        </p>
      ) : null}

      {biens?.length === 0 ? (
        <Message ton="information">
          {recherche || commune
            ? "Aucun bien ne correspond à cette recherche."
            : "Vous n'avez pas encore de bien. Ajoutez-en un pour commencer."}
        </Message>
      ) : null}

      {biens && biens.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2">
          {biens.map((bien) => {
            const { completude, libelle } = avancementBien(bien);
            return (
              <li key={bien.idBien}>
                <Link
                  href={`/biens/${bien.idBien}/historique`}
                  className="flex min-h-cible items-center justify-between gap-4 rounded-carte border border-sable bg-card px-5 py-4 hover:border-terracotta-fonce"
                >
                  <span className="flex flex-col gap-2">
                    <span className="text-sous-titre">{bien.adresse}</span>
                    <span className="text-legende text-brun">{descriptifBien(bien)}</span>
                    <PastilleCompletude completude={completude} libelle={libelle} />
                  </span>
                  <ChevronRight aria-hidden className="size-5 shrink-0 text-brun" />
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

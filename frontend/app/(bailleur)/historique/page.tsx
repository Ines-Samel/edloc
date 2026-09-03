"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText } from "lucide-react";

import { PastilleStatutEdl } from "@/components/edl/pastille-etat";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Message } from "@/components/ui/message";
import { BASE_API, api } from "@/lib/api";
import {
  formaterDate,
  libelleTypeEdl,
  type Bien,
  type ListeBiens,
  type ListeEdl,
  type Pagination,
  type ResumeEdl,
} from "@/lib/edloc";

// Périodes proposées en pilules (maquette 14). Le calcul se fait côté client puis
// part à l'API sous forme de date de début.
const PERIODES = [
  { valeur: "tous", libelle: "Tous" },
  { valeur: "semaine", libelle: "Cette semaine" },
  { valeur: "mois", libelle: "Ce mois" },
] as const;

function dateDebutDe(periode: (typeof PERIODES)[number]["valeur"]): string | null {
  const maintenant = new Date();
  if (periode === "mois") {
    return new Date(maintenant.getFullYear(), maintenant.getMonth(), 1).toISOString().slice(0, 10);
  }
  if (periode === "semaine") {
    // Semaine commençant le lundi.
    const jour = (maintenant.getDay() + 6) % 7;
    const lundi = new Date(maintenant);
    lundi.setDate(maintenant.getDate() - jour);
    return lundi.toISOString().slice(0, 10);
  }
  return null;
}

// Écran 14 : tous les états des lieux du bailleur, biens confondus.
export default function PageHistorique() {
  const [periode, setPeriode] = useState<(typeof PERIODES)[number]["valeur"]>("tous");
  const [idBien, setIdBien] = useState("");
  const [page, setPage] = useState(1);
  const [liste, setListe] = useState<ResumeEdl[] | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [biens, setBiens] = useState<Bien[]>([]);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    api<ListeBiens>("/biens?limite=100")
      .then((r) => setBiens(r.donnees))
      .catch(() => setBiens([]));
  }, []);

  useEffect(() => {
    const parametres = new URLSearchParams({ page: String(page), limite: "20" });
    const debut = dateDebutDe(periode);
    if (debut) parametres.set("dateDebut", debut);
    if (idBien) parametres.set("idBien", idBien);

    api<ListeEdl>(`/etats-des-lieux?${parametres.toString()}`)
      .then((r) => {
        setListe(r.donnees);
        setPagination(r.pagination);
        setErreur(null);
      })
      .catch(() => setErreur("L'historique n'a pas pu être chargé. Réessayez."));
  }, [periode, idBien, page]);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <h1 className="text-titre-1">Historique</h1>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div role="group" aria-label="Filtrer par période" className="flex flex-wrap gap-2">
          {PERIODES.map(({ valeur, libelle }) => (
            <Button
              key={valeur}
              size="sm"
              variant={periode === valeur ? "default" : "outline"}
              aria-pressed={periode === valeur}
              onClick={() => {
                setPeriode(valeur);
                setPage(1);
              }}
            >
              {libelle}
            </Button>
          ))}
        </div>

        {biens.length > 1 ? (
          <div className="sm:w-64">
            <Label htmlFor="filtre-bien" className="sr-only">
              Filtrer par bien
            </Label>
            <select
              id="filtre-bien"
              value={idBien}
              onChange={(evenement) => {
                setIdBien(evenement.target.value);
                setPage(1);
              }}
              className="text-courant h-cible w-full rounded-carte border border-input bg-card px-4"
            >
              <option value="">Bien : tous</option>
              {biens.map((bien) => (
                <option key={bien.idBien} value={bien.idBien}>
                  {bien.adresse}
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </div>

      {erreur ? <Message ton="erreur">{erreur}</Message> : null}

      {liste === null && !erreur ? (
        <p className="text-courant text-brun" role="status">
          Chargement…
        </p>
      ) : null}

      {liste?.length === 0 ? (
        <Message ton="information">
          Aucun état des lieux sur cette période. Élargissez le filtre ou créez-en un.
        </Message>
      ) : null}

      {liste && liste.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {liste.map((edl) => (
            <li
              key={edl.idEdl}
              className="flex flex-col gap-3 rounded-carte border border-sable bg-card px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <Link href={`/etats-des-lieux/${edl.idEdl}`} className="flex flex-1 flex-col gap-1">
                <span className="text-sous-titre">
                  {edl.bien.adresse} — {edl.bien.ville}
                </span>
                <span className="text-legende text-brun">
                  {libelleTypeEdl(edl.typeEdl)} · {edl.locataire.prenom} {edl.locataire.nom} ·{" "}
                  {formaterDate(edl.dateEdl)}
                </span>
              </Link>

              <div className="flex items-center gap-3">
                <PastilleStatutEdl statut={edl.statut} />
                {edl.statut === "signe" ? (
                  <Button asChild variant="outline" size="sm">
                    <a
                      href={`${BASE_API}/etats-des-lieux/${edl.idEdl}/pdf`}
                      target="_blank"
                      rel="noreferrer"
                    >
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

      {pagination && pagination.totalPages > 1 ? (
        <nav aria-label="Pagination" className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Précédent
          </Button>
          <p className="text-legende text-brun" aria-live="polite">
            Page {pagination.page} sur {pagination.totalPages} · {pagination.total} état
            {pagination.total > 1 ? "s" : ""} des lieux
          </p>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Suivant
          </Button>
        </nav>
      ) : null}
    </div>
  );
}

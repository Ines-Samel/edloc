"use client";

import { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";

import { SuppressionUtilisateur } from "@/components/admin/suppression-utilisateur";
import { PastilleCompletude } from "@/components/edl/pastille-etat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Message } from "@/components/ui/message";
import { api } from "@/lib/api";
import { formaterDate, type Pagination } from "@/lib/edloc";

type Utilisateur = {
  idBailleur: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string | null;
  actif: boolean;
  dateCreation: string;
  totalEdls: number;
  _count: { biens: number };
};

// Écran 16 : administration des comptes, réservée au rôle administrateur.
export default function PageComptesUtilisateurs() {
  const [recherche, setRecherche] = useState("");
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[] | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [erreur, setErreur] = useState<string | null>(null);

  const charger = useCallback(async () => {
    const parametres = new URLSearchParams({ page: String(page), limite: "20" });
    if (recherche.trim()) parametres.set("recherche", recherche.trim());
    try {
      const reponse = await api<{ donnees: Utilisateur[]; pagination: Pagination }>(
        `/admin/utilisateurs?${parametres.toString()}`,
      );
      setUtilisateurs(reponse.donnees);
      setPagination(reponse.pagination);
      setErreur(null);
    } catch {
      setErreur("La liste des comptes n'a pas pu être chargée.");
    }
  }, [page, recherche]);

  useEffect(() => {
    const minuteur = setTimeout(charger, 300);
    return () => clearTimeout(minuteur);
  }, [charger]);

  async function basculerStatut(utilisateur: Utilisateur) {
    try {
      await api(`/admin/utilisateurs/${utilisateur.idBailleur}/statut`, {
        method: "PATCH",
        body: { actif: !utilisateur.actif },
      });
      await charger();
    } catch {
      setErreur("Le changement de statut a échoué.");
    }
  }

  const desactives = utilisateurs?.filter((u) => !u.actif).length ?? 0;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-titre-1">Comptes utilisateurs</h1>
          {pagination ? (
            <p className="text-legende text-brun">
              {pagination.total} bailleur{pagination.total > 1 ? "s" : ""} inscrit
              {pagination.total > 1 ? "s" : ""}
              {desactives > 0
                ? ` · ${desactives} compte${desactives > 1 ? "s" : ""} désactivé${desactives > 1 ? "s" : ""}`
                : ""}
            </p>
          ) : null}
        </div>

        <div className="relative w-full sm:w-80">
          <Label htmlFor="recherche" className="sr-only">
            Rechercher un compte
          </Label>
          <Search
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-4 my-auto size-5 text-brun"
          />
          <Input
            id="recherche"
            type="search"
            value={recherche}
            onChange={(evenement) => {
              setRecherche(evenement.target.value);
              setPage(1);
            }}
            placeholder="Rechercher un compte…"
            className="pl-12"
          />
        </div>
      </div>

      {erreur ? <Message ton="erreur">{erreur}</Message> : null}

      {utilisateurs === null && !erreur ? (
        <p className="text-courant text-brun" role="status">
          Chargement…
        </p>
      ) : null}

      {utilisateurs?.length === 0 ? (
        <Message ton="information">
          {recherche ? "Aucun compte ne correspond à cette recherche." : "Aucun bailleur inscrit."}
        </Message>
      ) : null}

      {utilisateurs && utilisateurs.length > 0 ? (
        // L'interface est pensée pour le desktop ; sur un écran étroit le tableau
        // défile horizontalement plutôt que de se déformer.
        <div className="overflow-x-auto rounded-carte border border-sable bg-card">
          <table className="w-full min-w-3xl border-collapse">
            <thead>
              <tr className="border-b border-sable text-left">
                {["Nom", "E-mail", "Inscrit le", "Biens", "EDL", "Statut", "Actions"].map(
                  (entete) => (
                    <th key={entete} scope="col" className="text-legende px-4 py-3 text-brun">
                      {entete}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {utilisateurs.map((utilisateur) => (
                <tr key={utilisateur.idBailleur} className="border-b border-sable last:border-0">
                  <th scope="row" className="text-courant px-4 py-3 text-left font-bold">
                    {utilisateur.prenom} {utilisateur.nom}
                  </th>
                  <td className="text-courant px-4 py-3">{utilisateur.email}</td>
                  <td className="text-courant px-4 py-3">
                    {formaterDate(utilisateur.dateCreation)}
                  </td>
                  <td className="text-courant px-4 py-3">{utilisateur._count.biens}</td>
                  <td className="text-courant px-4 py-3">{utilisateur.totalEdls}</td>
                  <td className="px-4 py-3">
                    <PastilleCompletude
                      completude={utilisateur.actif ? "complet" : "enCours"}
                      libelle={utilisateur.actif ? "Actif" : "Désactivé"}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" onClick={() => basculerStatut(utilisateur)}>
                        {utilisateur.actif ? "Désactiver" : "Réactiver"}
                        <span className="sr-only">
                          {" "}
                          le compte de {utilisateur.prenom} {utilisateur.nom}
                        </span>
                      </Button>
                      <SuppressionUtilisateur
                        idBailleur={utilisateur.idBailleur}
                        nomComplet={`${utilisateur.prenom} ${utilisateur.nom}`}
                        totalEdls={utilisateur.totalEdls}
                        onSupprime={charger}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
            Page {pagination.page} sur {pagination.totalPages}
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

      <Message ton="information">
        Toute suppression est précédée d&apos;une confirmation et entraîne l&apos;effacement des
        données du compte (biens, états des lieux, photos) — conformité RGPD.
      </Message>
    </div>
  );
}

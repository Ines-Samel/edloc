"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

/*
 * Suppression d'un compte bailleur par l'administrateur (RGPD). La confirmation
 * annonce la cascade réelle : biens, états des lieux, photos, signatures et les
 * fichiers correspondants sur le stockage objet.
 */
export function SuppressionUtilisateur({
  idBailleur,
  nomComplet,
  totalEdls,
  onSupprime,
}: {
  idBailleur: string;
  nomComplet: string;
  totalEdls: number;
  onSupprime: () => Promise<void>;
}) {
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function supprimer() {
    setEnCours(true);
    setErreur(null);
    try {
      await api(`/admin/utilisateurs/${idBailleur}`, { method: "DELETE" });
      await onSupprime();
    } catch {
      setErreur("La suppression a échoué.");
      setEnCours(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 aria-hidden className="size-4" />
          <span className="sr-only">Supprimer le compte de </span>Supprimer
          <span className="sr-only"> {nomComplet}</span>
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer le compte de {nomComplet} ?</AlertDialogTitle>
          <AlertDialogDescription>
            {totalEdls > 0
              ? `Les ${totalEdls} état${totalEdls > 1 ? "s" : ""} des lieux de ce bailleur seront effacés, avec leurs biens, photos et signatures, ainsi que les fichiers correspondants. `
              : "Les données de ce bailleur seront effacées. "}
            Cette action est définitive et relève du droit à l&apos;effacement (RGPD).
          </AlertDialogDescription>
        </AlertDialogHeader>

        {erreur ? <p className="text-legende text-alerte-foncee">{erreur}</p> : null}

        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <Button variant="destructive" onClick={supprimer} disabled={enCours}>
            {enCours ? "Suppression…" : "Supprimer définitivement"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { erreursDepuisApi } from "@/lib/formulaire";

/*
 * Abandon d'un état des lieux en cours (RG16). Un constat commencé puis
 * interrompu — visite annulée, mauvais bien, locataire qui se désiste — n'a
 * aucune raison de rester dans la liste : il fausse les indicateurs et encombre
 * l'historique. La suppression emporte pièces, éléments, photos et signatures.
 */
export function SuppressionEdl({
  idEdl,
  nombrePieces,
  variante = "destructive",
}: {
  idEdl: string;
  nombrePieces: number;
  variante?: "destructive" | "outline";
}) {
  const router = useRouter();
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function supprimer() {
    setEnCours(true);
    setErreur(null);
    try {
      await api(`/etats-des-lieux/${idEdl}`, { method: "DELETE" });
      router.push("/historique");
    } catch (err) {
      setErreur(erreursDepuisApi(err).message);
      setEnCours(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={variante} size="sm">
          <Trash2 aria-hidden className="size-4" />
          Abandonner
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Abandonner cet état des lieux ?</AlertDialogTitle>
          <AlertDialogDescription>
            {nombrePieces === 0
              ? "Ce brouillon sera supprimé. "
              : nombrePieces === 1
                ? "La pièce déjà saisie sera supprimée, avec ses éléments et ses photos. "
                : `Les ${nombrePieces} pièces déjà saisies seront supprimées, avec leurs éléments et leurs photos. `}
            Cette action est définitive.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {erreur ? <p className="text-legende text-alerte-foncee">{erreur}</p> : null}

        <AlertDialogFooter>
          <AlertDialogCancel>Continuer la saisie</AlertDialogCancel>
          <Button variant="destructive" onClick={supprimer} disabled={enCours}>
            {enCours ? "Suppression…" : "Abandonner définitivement"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

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
import { ChampMotDePasse } from "@/components/ui/champ-mot-de-passe";
import { api } from "@/lib/api";
import { erreursDepuisApi } from "@/lib/formulaire";

/*
 * Suppression du compte (RGPD, RG16). L'API redemande le mot de passe : la
 * confirmation n'est donc pas seulement visuelle, elle prouve que c'est bien le
 * titulaire du compte qui agit.
 */
export function SuppressionCompte() {
  const router = useRouter();
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);

  async function supprimer() {
    setSuppressionEnCours(true);
    setErreur(null);
    try {
      await api("/compte", { method: "DELETE", body: { motDePasse } });
      router.replace("/");
    } catch (err) {
      setErreur(erreursDepuisApi(err).message);
      setSuppressionEnCours(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 aria-hidden className="size-5" />
          Supprimer mon compte
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer définitivement votre compte ?</AlertDialogTitle>
          <AlertDialogDescription>
            Vos biens, états des lieux, photos et signatures seront effacés, ainsi que les fichiers
            correspondants. Cette action est irréversible et aucune sauvegarde ne sera conservée.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <ChampMotDePasse
          id="motDePasseSuppression"
          libelle="Confirmez avec votre mot de passe"
          autoComplete="current-password"
          value={motDePasse}
          onChange={(evenement) => setMotDePasse(evenement.target.value)}
          erreur={erreur ?? undefined}
        />

        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={supprimer}
            disabled={!motDePasse || suppressionEnCours}
          >
            {suppressionEnCours ? "Suppression…" : "Supprimer définitivement"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

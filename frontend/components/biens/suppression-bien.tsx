"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { api } from "@/lib/api";

/*
 * Suppression d'un bien. La charte impose qu'une action destructive soit toujours
 * suivie d'une confirmation ; celle-ci annonce explicitement la cascade (RG16),
 * car supprimer un bien efface aussi ses états des lieux, photos et signatures.
 */
export function SuppressionBien({ idBien, nombreEdl }: { idBien: string; nombreEdl: number }) {
  const router = useRouter();
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function supprimer() {
    setSuppressionEnCours(true);
    try {
      await api(`/biens/${idBien}`, { method: "DELETE" });
      router.push("/biens");
    } catch {
      setErreur("La suppression a échoué. Réessayez.");
      setSuppressionEnCours(false);
    }
  }

  return (
    <>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="sm">
            <Trash2 aria-hidden className="size-4" />
            Supprimer
          </Button>
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce bien ?</AlertDialogTitle>
            <AlertDialogDescription>
              {nombreEdl > 0
                ? `Cette action supprimera aussi ${nombreEdl === 1 ? "l'état des lieux rattaché à ce bien" : `les ${nombreEdl} états des lieux rattachés à ce bien`}, avec leurs photos et leurs signatures. Elle est définitive.`
                : "Cette action est définitive."}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={supprimer}
              disabled={suppressionEnCours}
              className={buttonVariants({ variant: "default" })}
            >
              {suppressionEnCours ? "Suppression…" : "Supprimer définitivement"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {erreur ? <p className="text-legende text-alerte-foncee">{erreur}</p> : null}
    </>
  );
}

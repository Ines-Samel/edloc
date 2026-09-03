"use client";

import { useRef, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { BASE_API, api } from "@/lib/api";
import type { Photo } from "@/lib/edloc";

const TAILLE_MAXI = 10 * 1024 * 1024;
const FORMATS = ["image/jpeg", "image/png"];

function horodatage(valeur: string): string {
  return new Date(valeur).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/*
 * Photos d'un élément (RG9 : rattachées à l'élément et horodatées automatiquement).
 * Les vignettes pointent vers la route proxy de l'API : le cookie de session part
 * avec la requête, donc une simple balise <img> suffit.
 * Le format et le poids sont vérifiés avant l'envoi, pour éviter un aller-retour
 * inutile — l'API applique de toute façon les mêmes limites.
 */
export function GaleriePhotos({
  idElement,
  libelleElement,
  photos,
  verrouille,
  onChangement,
}: {
  idElement: string;
  libelleElement: string;
  photos: Photo[];
  verrouille: boolean;
  onChangement: () => Promise<void>;
}) {
  const champFichier = useRef<HTMLInputElement>(null);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function envoyer(fichier: File) {
    if (!FORMATS.includes(fichier.type)) {
      setErreur("Format non pris en charge : choisissez une photo JPEG ou PNG.");
      return;
    }
    if (fichier.size > TAILLE_MAXI) {
      setErreur("Cette photo dépasse 10 Mo. Réduisez sa taille avant de l'ajouter.");
      return;
    }

    setErreur(null);
    setEnvoiEnCours(true);

    const corps = new FormData();
    corps.append("photo", fichier);

    try {
      await api(`/elements/${idElement}/photos`, { method: "POST", body: corps });
      await onChangement();
    } catch {
      setErreur("L'envoi de la photo a échoué. Vérifiez votre connexion et réessayez.");
    } finally {
      setEnvoiEnCours(false);
      if (champFichier.current) champFichier.current.value = "";
    }
  }

  async function supprimer(idPhoto: string) {
    try {
      await api(`/photos/${idPhoto}`, { method: "DELETE" });
      await onChangement();
    } catch {
      setErreur("La suppression de la photo a échoué.");
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-wrap items-center gap-3">
        {photos.map((photo) => (
          <li key={photo.idPhoto} className="relative">
            <a
              href={`${BASE_API}/photos/${photo.idPhoto}/fichier`}
              target="_blank"
              rel="noreferrer"
              className="block"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- image servie par
                  l'API derrière authentification : l'optimiseur de Next ne peut pas la charger */}
              <img
                src={`${BASE_API}/photos/${photo.idPhoto}/fichier`}
                alt={`${libelleElement}, photo du ${horodatage(photo.dateHorodatage)}`}
                className="size-20 rounded-carte border border-sable object-cover"
              />
            </a>
            {!verrouille ? (
              <Button
                variant="destructive"
                size="icon-sm"
                aria-label={`Supprimer la photo du ${horodatage(photo.dateHorodatage)}`}
                onClick={() => supprimer(photo.idPhoto)}
                className="absolute -right-2 -top-2 bg-card"
              >
                <Trash2 aria-hidden className="size-4" />
              </Button>
            ) : null}
          </li>
        ))}

        {!verrouille ? (
          <li>
            <label
              className={`flex size-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-carte border-2 border-dashed border-terracotta-fonce text-terracotta-fonce ${
                envoiEnCours ? "opacity-60" : ""
              }`}
            >
              <ImagePlus aria-hidden className="size-6" />
              <span className="text-legende">{envoiEnCours ? "Envoi…" : "Photo"}</span>
              <input
                ref={champFichier}
                type="file"
                accept="image/jpeg,image/png"
                // Ouvre directement l'appareil photo arrière sur mobile.
                capture="environment"
                disabled={envoiEnCours}
                onChange={(evenement) => {
                  const fichier = evenement.target.files?.[0];
                  if (fichier) envoyer(fichier);
                }}
                className="sr-only"
              />
              <span className="sr-only">Ajouter une photo à {libelleElement}</span>
            </label>
          </li>
        ) : null}
      </ul>

      {photos.length > 0 ? (
        <p className="text-legende text-brun">
          {photos.length} photo{photos.length > 1 ? "s" : ""} · horodatée
          {photos.length > 1 ? "s" : ""} automatiquement
        </p>
      ) : null}

      {erreur ? (
        <p role="alert" className="text-legende text-alerte-foncee">
          {erreur}
        </p>
      ) : null}
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ChampFormulaire } from "@/components/ui/champ-formulaire";
import { Message } from "@/components/ui/message";
import { erreursDepuisApi, valider, type ErreursChamps } from "@/lib/formulaire";
import { bienSchema, type BienInput } from "@/schemas/biens.schema";
import type { Bien } from "@/lib/edloc";

/*
 * Formulaire d'un bien, partagé par la création et la modification : les deux
 * écrans manipulent exactement les mêmes champs et les mêmes règles.
 */
export function FormulaireBien({
  bien,
  libelleAction,
  retour,
  onEnvoyer,
}: {
  bien?: Bien;
  libelleAction: string;
  retour: string;
  onEnvoyer: (donnees: BienInput) => Promise<void>;
}) {
  const [erreurs, setErreurs] = useState<ErreursChamps>({});
  const [messageErreur, setMessageErreur] = useState<string | null>(null);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  async function soumettre(evenement: React.FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    const saisie = Object.fromEntries(new FormData(evenement.currentTarget));
    for (const champ of ["nombrePieces", "surface"]) {
      if (saisie[champ] === "") delete saisie[champ];
    }

    const validation = valider(bienSchema, saisie);
    if (!validation.succes) {
      setErreurs(validation.erreurs);
      setMessageErreur(null);
      return;
    }

    setErreurs({});
    setMessageErreur(null);
    setEnvoiEnCours(true);

    try {
      await onEnvoyer(validation.donnees);
    } catch (erreur) {
      const { message, champs } = erreursDepuisApi(erreur);
      setMessageErreur(message);
      setErreurs(champs);
      setEnvoiEnCours(false);
    }
  }

  return (
    <form onSubmit={soumettre} noValidate className="flex flex-col gap-6">
      {messageErreur ? <Message ton="erreur">{messageErreur}</Message> : null}

      <ChampFormulaire
        id="adresse"
        name="adresse"
        libelle="Adresse du logement"
        autoComplete="street-address"
        placeholder="12 rue des Lilas"
        defaultValue={bien?.adresse}
        erreur={erreurs.adresse}
      />

      <div className="flex flex-col gap-6 sm:flex-row">
        <div className="sm:w-40">
          <ChampFormulaire
            id="codePostal"
            name="codePostal"
            libelle="Code postal"
            inputMode="numeric"
            autoComplete="postal-code"
            placeholder="69003"
            defaultValue={bien?.codePostal}
            erreur={erreurs.codePostal}
          />
        </div>
        <div className="flex-1">
          <ChampFormulaire
            id="ville"
            name="ville"
            libelle="Commune"
            autoComplete="address-level2"
            placeholder="Lyon"
            defaultValue={bien?.ville}
            erreur={erreurs.ville}
          />
        </div>
      </div>

      <ChampFormulaire
        id="typeLogement"
        name="typeLogement"
        libelle="Type de logement"
        placeholder="Studio, T2, Maison…"
        defaultValue={bien?.typeLogement}
        erreur={erreurs.typeLogement}
      />

      <div className="flex flex-col gap-6 sm:flex-row">
        <div className="flex-1">
          <ChampFormulaire
            id="nombrePieces"
            name="nombrePieces"
            libelle="Nombre de pièces"
            inputMode="numeric"
            aide="Facultatif."
            defaultValue={bien?.nombrePieces ?? undefined}
            erreur={erreurs.nombrePieces}
          />
        </div>
        <div className="flex-1">
          <ChampFormulaire
            id="surface"
            name="surface"
            libelle="Surface (m²)"
            inputMode="decimal"
            aide="Facultatif."
            defaultValue={bien?.surface ? Number(bien.surface) : undefined}
            erreur={erreurs.surface}
          />
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row-reverse">
        <Button type="submit" disabled={envoiEnCours} className="sm:flex-1">
          {envoiEnCours ? "Enregistrement…" : libelleAction}
        </Button>
        <Button asChild variant="outline" className="sm:flex-1">
          <Link href={retour}>Annuler</Link>
        </Button>
      </div>
    </form>
  );
}

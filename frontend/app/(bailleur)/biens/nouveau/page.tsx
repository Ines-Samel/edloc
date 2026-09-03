"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ChampFormulaire } from "@/components/ui/champ-formulaire";
import { Message } from "@/components/ui/message";
import { api } from "@/lib/api";
import { erreursDepuisApi, valider, type ErreursChamps } from "@/lib/formulaire";
import { bienSchema } from "@/schemas/biens.schema";
import type { Bien } from "@/lib/edloc";

// Formulaire de création d'un bien (aucune maquette dédiée : il reprend les
// conventions de formulaire des écrans d'authentification).
export default function PageNouveauBien() {
  const router = useRouter();
  const [erreurs, setErreurs] = useState<ErreursChamps>({});
  const [messageErreur, setMessageErreur] = useState<string | null>(null);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  async function soumettre(evenement: React.FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    const saisie = Object.fromEntries(new FormData(evenement.currentTarget));
    // Les champs facultatifs laissés vides ne doivent pas être envoyés.
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
      const bien = await api<Bien>("/biens", { method: "POST", body: validation.donnees });
      router.push(`/biens/${bien.idBien}/historique`);
    } catch (erreur) {
      const { message, champs } = erreursDepuisApi(erreur);
      setMessageErreur(message);
      setErreurs(champs);
      setEnvoiEnCours(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <h1 className="text-titre-1">Nouveau bien</h1>

      <form onSubmit={soumettre} noValidate className="flex flex-col gap-6">
        {messageErreur ? <Message ton="erreur">{messageErreur}</Message> : null}

        <ChampFormulaire
          id="adresse"
          name="adresse"
          libelle="Adresse du logement"
          autoComplete="street-address"
          placeholder="12 rue des Lilas"
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
              erreur={erreurs.ville}
            />
          </div>
        </div>

        <ChampFormulaire
          id="typeLogement"
          name="typeLogement"
          libelle="Type de logement"
          placeholder="Studio, T2, Maison…"
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
              erreur={erreurs.surface}
            />
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row-reverse">
          <Button type="submit" disabled={envoiEnCours} className="sm:flex-1">
            {envoiEnCours ? "Enregistrement…" : "Enregistrer le bien"}
          </Button>
          <Button asChild variant="outline" className="sm:flex-1">
            <Link href="/biens">Annuler</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}

"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ChampFormulaire } from "@/components/ui/champ-formulaire";
import { Label } from "@/components/ui/label";
import { Message } from "@/components/ui/message";
import { api } from "@/lib/api";
import { erreursDepuisApi, valider, type ErreursChamps } from "@/lib/formulaire";
import type { Bien, ListeBiens } from "@/lib/edloc";
import { creationEdlSchema } from "@/schemas/etats-des-lieux.schema";

function FormulaireNouvelEdl() {
  const router = useRouter();
  // Permet d'arriver depuis un bien précis : /etats-des-lieux/nouveau?idBien=…
  const idBienInitial = useSearchParams().get("idBien") ?? "";

  const [biens, setBiens] = useState<Bien[] | null>(null);
  const [idBien, setIdBien] = useState(idBienInitial);
  const [typeEdl, setTypeEdl] = useState<"entree" | "sortie">("entree");
  const [erreurs, setErreurs] = useState<ErreursChamps>({});
  const [messageErreur, setMessageErreur] = useState<string | null>(null);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  useEffect(() => {
    api<ListeBiens>("/biens?limite=100")
      .then((liste) => {
        setBiens(liste.donnees);
        setIdBien((actuel) => actuel || (liste.donnees[0]?.idBien ?? ""));
      })
      .catch(() => setMessageErreur("Impossible de charger vos biens. Réessayez."));
  }, []);

  async function soumettre(evenement: React.FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    const saisie = Object.fromEntries(new FormData(evenement.currentTarget));

    const donnees = {
      idBien,
      typeEdl,
      locataire: {
        nom: saisie.nom,
        prenom: saisie.prenom,
        ...(saisie.email ? { email: saisie.email } : {}),
      },
    };

    const validation = valider(creationEdlSchema, donnees);
    if (!validation.succes) {
      // Les erreurs du locataire arrivent préfixées (locataire.nom) : on les remet à plat.
      const aplaties: ErreursChamps = {};
      for (const [champ, message] of Object.entries(validation.erreurs)) {
        aplaties[champ.replace("locataire.", "")] = message;
      }
      setErreurs(aplaties);
      setMessageErreur(null);
      return;
    }

    setErreurs({});
    setMessageErreur(null);
    setEnvoiEnCours(true);

    try {
      const edl = await api<{ idEdl: string }>("/etats-des-lieux", {
        method: "POST",
        body: validation.donnees,
      });
      router.push(`/etats-des-lieux/${edl.idEdl}/saisie`);
    } catch (erreur) {
      const { message, champs } = erreursDepuisApi(erreur);
      setMessageErreur(message);
      setErreurs(champs);
      setEnvoiEnCours(false);
    }
  }

  if (biens?.length === 0) {
    return (
      <Message ton="information">
        Ajoutez d&apos;abord un bien : un état des lieux se rattache toujours à un logement.
      </Message>
    );
  }

  return (
    <form onSubmit={soumettre} noValidate className="flex flex-col gap-6">
      {messageErreur ? <Message ton="erreur">{messageErreur}</Message> : null}

      <div className="flex flex-col gap-2">
        <Label htmlFor="idBien">Bien concerné</Label>
        <select
          id="idBien"
          value={idBien}
          onChange={(evenement) => setIdBien(evenement.target.value)}
          className="text-courant h-cible w-full rounded-carte border border-input bg-card px-4"
        >
          {biens === null ? <option value="">Chargement…</option> : null}
          {biens?.map((bien) => (
            <option key={bien.idBien} value={bien.idBien}>
              {bien.adresse} — {bien.ville}
            </option>
          ))}
        </select>
        {erreurs.idBien ? (
          <p className="text-legende text-alerte-foncee">{erreurs.idBien}</p>
        ) : null}
      </div>

      {/* Segment Entrée / Sortie : de vrais boutons radio, pour rester utilisable
          au clavier et annoncé correctement par les lecteurs d'écran. */}
      <fieldset className="flex flex-col gap-2">
        <legend className="text-libelle mb-2">Type d&apos;état des lieux</legend>
        <div className="flex rounded-pilule border-2 border-sable p-1">
          {(
            [
              { valeur: "entree", libelle: "Entrée" },
              { valeur: "sortie", libelle: "Sortie" },
            ] as const
          ).map(({ valeur, libelle }) => (
            <label
              key={valeur}
              className={`text-libelle flex min-h-cible flex-1 cursor-pointer items-center justify-center rounded-pilule px-4 ${
                typeEdl === valeur ? "bg-terracotta-fonce text-white" : "text-brun"
              }`}
            >
              <input
                type="radio"
                name="typeEdl"
                value={valeur}
                checked={typeEdl === valeur}
                onChange={() => setTypeEdl(valeur)}
                className="sr-only"
              />
              {libelle}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-6">
        <legend className="text-titre-2 mb-2">Locataire</legend>

        <div className="flex flex-col gap-6 sm:flex-row">
          <div className="flex-1">
            <ChampFormulaire
              id="nom"
              name="nom"
              libelle="Nom"
              autoComplete="off"
              erreur={erreurs.nom}
            />
          </div>
          <div className="flex-1">
            <ChampFormulaire
              id="prenom"
              name="prenom"
              libelle="Prénom"
              autoComplete="off"
              erreur={erreurs.prenom}
            />
          </div>
        </div>

        <ChampFormulaire
          id="email"
          name="email"
          type="email"
          libelle="E-mail"
          autoComplete="off"
          aide="Facultatif — nécessaire pour lui envoyer le PDF signé."
          erreur={erreurs.email}
        />
      </fieldset>

      <Button type="submit" disabled={envoiEnCours || !idBien} className="w-full">
        {envoiEnCours ? "Création en cours…" : "Commencer l'état des lieux"}
      </Button>
    </form>
  );
}

// Écran 8 : création d'un état des lieux.
export default function PageNouvelEdl() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <h1 className="text-titre-1">Nouvel état des lieux</h1>
      <Suspense>
        <FormulaireNouvelEdl />
      </Suspense>
    </div>
  );
}

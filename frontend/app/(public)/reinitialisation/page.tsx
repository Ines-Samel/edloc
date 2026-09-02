"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import {
  CadreAuthentification,
  LienRetourConnexion,
} from "@/components/layout/cadre-authentification";
import { Button } from "@/components/ui/button";
import { ChampMotDePasse } from "@/components/ui/champ-mot-de-passe";
import { Message } from "@/components/ui/message";
import { api } from "@/lib/api";
import { erreursDepuisApi, valider, type ErreursChamps } from "@/lib/formulaire";
import { reinitialisationSchema } from "@/schemas/auth.schema";

function FormulaireReinitialisation() {
  // Le jeton arrive dans le lien reçu par e-mail : /reinitialisation?jeton=…
  const jeton = useSearchParams().get("jeton");

  const [erreurs, setErreurs] = useState<ErreursChamps>({});
  const [messageErreur, setMessageErreur] = useState<string | null>(null);
  const [motDePasseModifie, setMotDePasseModifie] = useState<string | null>(null);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  async function soumettre(evenement: React.FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    const saisie = Object.fromEntries(new FormData(evenement.currentTarget));

    const validation = valider(reinitialisationSchema, saisie);
    if (!validation.succes) {
      setErreurs(validation.erreurs);
      setMessageErreur(null);
      return;
    }

    setErreurs({});
    setMessageErreur(null);
    setEnvoiEnCours(true);

    try {
      const { message } = await api<{ message: string }>("/auth/reinitialisation", {
        method: "POST",
        body: { jeton, motDePasse: validation.donnees.motDePasse },
      });
      setMotDePasseModifie(message);
    } catch (erreur) {
      const { message, champs } = erreursDepuisApi(erreur);
      setMessageErreur(message);
      setErreurs(champs);
    } finally {
      setEnvoiEnCours(false);
    }
  }

  if (!jeton) {
    return (
      <CadreAuthentification titre="Lien incomplet" pied={<LienRetourConnexion />}>
        <Message ton="erreur">
          Ce lien de réinitialisation est incomplet. Ouvrez-le directement depuis l&apos;e-mail
          reçu, ou demandez-en un nouveau.
        </Message>
      </CadreAuthentification>
    );
  }

  if (motDePasseModifie) {
    return (
      <CadreAuthentification titre="Mot de passe modifié">
        <div className="flex flex-col gap-6">
          <Message ton="succes">{motDePasseModifie}</Message>
          <Button asChild className="w-full">
            <Link href="/connexion">Se connecter</Link>
          </Button>
        </div>
      </CadreAuthentification>
    );
  }

  return (
    <CadreAuthentification
      titre="Nouveau mot de passe"
      description="Choisissez un mot de passe de 12 caractères minimum, puis saisissez-le une seconde fois."
      pied={<LienRetourConnexion />}
    >
      <form onSubmit={soumettre} noValidate className="flex flex-col gap-6">
        {messageErreur ? <Message ton="erreur">{messageErreur}</Message> : null}

        <ChampMotDePasse
          id="motDePasse"
          name="motDePasse"
          libelle="Nouveau mot de passe"
          autoComplete="new-password"
          aide="12 caractères minimum."
          erreur={erreurs.motDePasse}
        />

        <ChampMotDePasse
          id="confirmation"
          name="confirmation"
          libelle="Confirmation"
          autoComplete="new-password"
          erreur={erreurs.confirmation}
        />

        <Button type="submit" disabled={envoiEnCours} className="w-full">
          {envoiEnCours ? "Modification en cours…" : "Définir le mot de passe"}
        </Button>
      </form>
    </CadreAuthentification>
  );
}

export default function PageReinitialisation() {
  // useSearchParams impose une frontière Suspense pour préserver le rendu statique.
  return (
    <Suspense>
      <FormulaireReinitialisation />
    </Suspense>
  );
}

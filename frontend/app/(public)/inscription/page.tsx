"use client";

import { useState } from "react";
import Link from "next/link";

import { CadreAuthentification } from "@/components/layout/cadre-authentification";
import { Button } from "@/components/ui/button";
import { ChampFormulaire } from "@/components/ui/champ-formulaire";
import { ChampMotDePasse } from "@/components/ui/champ-mot-de-passe";
import { Message } from "@/components/ui/message";
import { api } from "@/lib/api";
import { erreursDepuisApi, valider, type ErreursChamps } from "@/lib/formulaire";
import { inscriptionFormulaireSchema } from "@/schemas/auth.schema";

export default function PageInscription() {
  const [erreurs, setErreurs] = useState<ErreursChamps>({});
  const [messageErreur, setMessageErreur] = useState<string | null>(null);
  const [confirmationEnvoyee, setConfirmationEnvoyee] = useState<string | null>(null);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  async function soumettre(evenement: React.FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    const saisie = Object.fromEntries(new FormData(evenement.currentTarget));
    if (saisie.telephone === "") delete saisie.telephone;

    const validation = valider(inscriptionFormulaireSchema, saisie);
    if (!validation.succes) {
      setErreurs(validation.erreurs);
      setMessageErreur(null);
      return;
    }

    setErreurs({});
    setMessageErreur(null);
    setEnvoiEnCours(true);

    try {
      // La confirmation ne sert qu'au formulaire : elle n'est pas envoyée à l'API.
      const { confirmation, ...compte } = validation.donnees;
      void confirmation;
      const { message } = await api<{ message: string }>("/auth/inscription", {
        method: "POST",
        body: compte,
      });
      // Réponse volontairement générique : elle ne dit pas si l'adresse existait déjà.
      setConfirmationEnvoyee(message);
    } catch (erreur) {
      const { message, champs } = erreursDepuisApi(erreur);
      setMessageErreur(message);
      setErreurs(champs);
    } finally {
      setEnvoiEnCours(false);
    }
  }

  if (confirmationEnvoyee) {
    return (
      <CadreAuthentification titre="Vérifiez votre boîte mail">
        <div className="flex flex-col gap-6">
          <Message ton="succes">{confirmationEnvoyee}</Message>
          <p className="text-courant text-brun">
            Le lien de confirmation est valable 24 heures. Tant que votre adresse n&apos;est pas
            confirmée, la connexion reste impossible.
          </p>
          <Button asChild className="w-full">
            <Link href="/connexion">Aller à la connexion</Link>
          </Button>
        </div>
      </CadreAuthentification>
    );
  }

  return (
    <CadreAuthentification
      titre="Créer un compte"
      description="Quelques informations suffisent : vous recevrez un e-mail pour confirmer votre adresse."
      pied={
        <p className="text-legende text-brun">
          Vous avez déjà un compte ?{" "}
          <Link href="/connexion" className="text-terracotta-fonce underline underline-offset-4">
            Se connecter
          </Link>
        </p>
      }
    >
      <form onSubmit={soumettre} noValidate className="flex flex-col gap-6">
        {messageErreur ? <Message ton="erreur">{messageErreur}</Message> : null}

        <div className="flex flex-col gap-6 sm:flex-row">
          <div className="flex-1">
            <ChampFormulaire
              id="prenom"
              name="prenom"
              libelle="Prénom"
              autoComplete="given-name"
              erreur={erreurs.prenom}
            />
          </div>
          <div className="flex-1">
            <ChampFormulaire
              id="nom"
              name="nom"
              libelle="Nom"
              autoComplete="family-name"
              erreur={erreurs.nom}
            />
          </div>
        </div>

        <ChampFormulaire
          id="email"
          name="email"
          type="email"
          libelle="E-mail"
          autoComplete="email"
          placeholder="camille@exemple.fr"
          erreur={erreurs.email}
        />

        <ChampFormulaire
          id="telephone"
          name="telephone"
          type="tel"
          libelle="Téléphone"
          autoComplete="tel"
          aide="Facultatif."
          erreur={erreurs.telephone}
        />

        <ChampMotDePasse
          id="motDePasse"
          name="motDePasse"
          libelle="Mot de passe"
          autoComplete="new-password"
          aide="12 caractères minimum."
          erreur={erreurs.motDePasse}
        />

        <ChampMotDePasse
          id="confirmation"
          name="confirmation"
          libelle="Confirmation du mot de passe"
          autoComplete="new-password"
          erreur={erreurs.confirmation}
        />

        <Button type="submit" disabled={envoiEnCours} className="w-full">
          {envoiEnCours ? "Création en cours…" : "Créer mon compte"}
        </Button>
      </form>
    </CadreAuthentification>
  );
}

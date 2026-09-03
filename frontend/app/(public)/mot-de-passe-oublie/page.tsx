"use client";

import { useState } from "react";

import {
  CadreAuthentification,
  LienRetourConnexion,
} from "@/components/layout/cadre-authentification";
import { Button } from "@/components/ui/button";
import { ChampFormulaire } from "@/components/ui/champ-formulaire";
import { Message } from "@/components/ui/message";
import { api } from "@/lib/api";
import { erreursDepuisApi, valider, type ErreursChamps } from "@/lib/formulaire";
import { motDePasseOublieSchema } from "@/schemas/auth.schema";

export default function PageMotDePasseOublie() {
  const [erreurs, setErreurs] = useState<ErreursChamps>({});
  const [messageErreur, setMessageErreur] = useState<string | null>(null);
  const [demandeEnvoyee, setDemandeEnvoyee] = useState<string | null>(null);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  async function soumettre(evenement: React.FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    const saisie = Object.fromEntries(new FormData(evenement.currentTarget));

    const validation = valider(motDePasseOublieSchema, saisie);
    if (!validation.succes) {
      setErreurs(validation.erreurs);
      setMessageErreur(null);
      return;
    }

    setErreurs({});
    setMessageErreur(null);
    setEnvoiEnCours(true);

    try {
      const { message } = await api<{ message: string }>("/auth/mot-de-passe-oublie", {
        method: "POST",
        body: validation.donnees,
      });
      // Réponse identique que l'adresse existe ou non (anti-énumération).
      setDemandeEnvoyee(message);
    } catch (erreur) {
      const { message, champs } = erreursDepuisApi(erreur);
      setMessageErreur(message);
      setErreurs(champs);
    } finally {
      setEnvoiEnCours(false);
    }
  }

  if (demandeEnvoyee) {
    return (
      <CadreAuthentification titre="Vérifiez votre boîte mail" pied={<LienRetourConnexion />}>
        <div className="flex flex-col gap-6">
          <Message ton="succes">{demandeEnvoyee}</Message>
          <p className="text-courant text-brun">
            Le lien reçu est valable une heure et ne peut servir qu&apos;une seule fois.
          </p>
        </div>
      </CadreAuthentification>
    );
  }

  return (
    <CadreAuthentification
      titre="Mot de passe oublié"
      description="Saisissez votre adresse e-mail : si un compte existe, vous recevrez un lien de réinitialisation."
      pied={<LienRetourConnexion />}
    >
      <form onSubmit={soumettre} noValidate className="flex flex-col gap-6">
        {messageErreur ? <Message ton="erreur">{messageErreur}</Message> : null}

        <ChampFormulaire
          id="email"
          name="email"
          type="email"
          libelle="E-mail"
          autoComplete="email"
          placeholder="camille@exemple.fr"
          erreur={erreurs.email}
        />

        <Button type="submit" disabled={envoiEnCours} className="w-full">
          {envoiEnCours ? "Envoi en cours…" : "Envoyer le lien"}
        </Button>
      </form>
    </CadreAuthentification>
  );
}

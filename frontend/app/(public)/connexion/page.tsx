"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { CadreAuthentification } from "@/components/layout/cadre-authentification";
import { Button } from "@/components/ui/button";
import { ChampFormulaire } from "@/components/ui/champ-formulaire";
import { ChampMotDePasse } from "@/components/ui/champ-mot-de-passe";
import { Message } from "@/components/ui/message";
import { api } from "@/lib/api";
import { erreursDepuisApi, valider, type ErreursChamps } from "@/lib/formulaire";
import { connexionSchema } from "@/schemas/auth.schema";

export default function PageConnexion() {
  const router = useRouter();
  const [erreurs, setErreurs] = useState<ErreursChamps>({});
  const [messageErreur, setMessageErreur] = useState<string | null>(null);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  async function soumettre(evenement: React.FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    const donneesFormulaire = new FormData(evenement.currentTarget);
    const saisie = Object.fromEntries(donneesFormulaire);

    const validation = valider(connexionSchema, saisie);
    if (!validation.succes) {
      setErreurs(validation.erreurs);
      setMessageErreur(null);
      return;
    }

    setErreurs({});
    setMessageErreur(null);
    setEnvoiEnCours(true);

    try {
      // La réponse ne contient que le rôle : le jeton arrive dans un cookie httpOnly.
      const { role } = await api<{ role: "bailleur" | "administrateur" }>("/auth/connexion", {
        method: "POST",
        body: validation.donnees,
      });
      router.push(role === "administrateur" ? "/admin/utilisateurs" : "/tableau-de-bord");
    } catch (erreur) {
      const { message, champs } = erreursDepuisApi(erreur);
      setMessageErreur(message);
      setErreurs(champs);
      setEnvoiEnCours(false);
    }
  }

  return (
    <CadreAuthentification
      titre="Connexion"
      marque
      pied={
        <p className="text-legende text-brun">
          Pas encore de compte ?{" "}
          <Link
            href="/inscription"
            className="text-terracotta-fonce underline underline-offset-4"
          >
            Créer un compte
          </Link>
        </p>
      }
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

        <div className="flex flex-col gap-2">
          <ChampMotDePasse
            id="motDePasse"
            name="motDePasse"
            libelle="Mot de passe"
            autoComplete="current-password"
            erreur={erreurs.motDePasse}
          />
          <Link
            href="/mot-de-passe-oublie"
            className="text-legende self-end text-terracotta-fonce underline-offset-4 hover:underline"
          >
            Mot de passe oublié ?
          </Link>
        </div>

        <Button type="submit" disabled={envoiEnCours} className="w-full">
          {envoiEnCours ? "Connexion en cours…" : "Se connecter"}
        </Button>
      </form>
    </CadreAuthentification>
  );
}

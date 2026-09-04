"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CircleCheck } from "lucide-react";

import {
  CadreAuthentification,
  LienRetourConnexion,
} from "@/components/layout/cadre-authentification";
import { Button } from "@/components/ui/button";
import { ChampFormulaire } from "@/components/ui/champ-formulaire";
import { Message } from "@/components/ui/message";
import { api } from "@/lib/api";
import { erreursDepuisApi, valider, type ErreursChamps } from "@/lib/formulaire";
import { renvoiConfirmationSchema } from "@/schemas/auth.schema";

type Etat = "verification" | "confirme" | "echec";

function FormulaireRenvoi() {
  const [erreurs, setErreurs] = useState<ErreursChamps>({});
  const [messageErreur, setMessageErreur] = useState<string | null>(null);
  const [renvoyeMessage, setRenvoyeMessage] = useState<string | null>(null);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  async function soumettre(evenement: React.FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    const saisie = Object.fromEntries(new FormData(evenement.currentTarget));

    const validation = valider(renvoiConfirmationSchema, saisie);
    if (!validation.succes) {
      setErreurs(validation.erreurs);
      return;
    }

    setErreurs({});
    setMessageErreur(null);
    setEnvoiEnCours(true);

    try {
      const { message } = await api<{ message: string }>("/auth/renvoyer-confirmation", {
        method: "POST",
        body: validation.donnees,
      });
      setRenvoyeMessage(message);
    } catch (erreur) {
      setMessageErreur(erreursDepuisApi(erreur).message);
    } finally {
      setEnvoiEnCours(false);
    }
  }

  if (renvoyeMessage) return <Message ton="succes">{renvoyeMessage}</Message>;

  return (
    <form onSubmit={soumettre} noValidate className="flex flex-col gap-6">
      {messageErreur ? <Message ton="erreur">{messageErreur}</Message> : null}

      <ChampFormulaire
        id="email"
        name="email"
        type="email"
        libelle="E-mail"
        autoComplete="email"
        aide="Nous vous renverrons un lien de confirmation valable 24 heures."
        erreur={erreurs.email}
      />

      <Button type="submit" disabled={envoiEnCours} className="w-full">
        {envoiEnCours ? "Envoi en cours…" : "Renvoyer l'e-mail de confirmation"}
      </Button>
    </form>
  );
}

function Confirmation() {
  // Le jeton arrive dans le lien reçu à l'inscription : /confirmation?jeton=…
  const jeton = useSearchParams().get("jeton");
  const [etat, setEtat] = useState<Etat>(jeton ? "verification" : "echec");
  const [messageErreur, setMessageErreur] = useState<string | null>(
    jeton ? null : "Ce lien de confirmation est incomplet.",
  );
  // Le jeton est à usage unique : cette garde évite un second appel, qui échouerait
  // (double exécution des effets en mode strict, navigation arrière…).
  const appelLance = useRef(false);

  useEffect(() => {
    if (!jeton || appelLance.current) return;
    appelLance.current = true;

    api("/auth/confirmation", { method: "POST", body: { jeton } })
      .then(() => setEtat("confirme"))
      .catch((erreur) => {
        setMessageErreur(erreursDepuisApi(erreur).message);
        setEtat("echec");
      });
  }, [jeton]);

  if (etat === "verification") {
    return (
      <CadreAuthentification titre="Vérification en cours…">
        <p className="text-courant text-center text-brun" role="status">
          Nous validons votre lien de confirmation.
        </p>
      </CadreAuthentification>
    );
  }

  if (etat === "confirme") {
    return (
      <CadreAuthentification titre="Compte confirmé !">
        <div className="flex flex-col items-center gap-6">
          <CircleCheck aria-hidden className="size-16 text-vert-profond" />
          <p className="text-courant text-center text-brun">
            Votre adresse e-mail est vérifiée. Vous pouvez maintenant vous connecter.
          </p>
          <Button asChild className="w-full">
            <Link href="/connexion">Se connecter</Link>
          </Button>
        </div>
      </CadreAuthentification>
    );
  }

  return (
    <CadreAuthentification
      titre="Lien invalide ou expiré"
      description="Le lien de confirmation est valable 24 heures et ne peut servir qu'une seule fois. Demandez-en un nouveau ci-dessous."
      pied={<LienRetourConnexion />}
    >
      <div className="flex flex-col gap-6">
        {messageErreur ? <Message ton="erreur">{messageErreur}</Message> : null}
        <FormulaireRenvoi />
      </div>
    </CadreAuthentification>
  );
}

export default function PageConfirmation() {
  // useSearchParams impose une frontière Suspense pour préserver le rendu statique.
  return (
    <Suspense>
      <Confirmation />
    </Suspense>
  );
}

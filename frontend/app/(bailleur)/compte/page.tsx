"use client";

import { useEffect, useState } from "react";
import { Download, KeyRound } from "lucide-react";

import { SuppressionCompte } from "@/components/compte/suppression-compte";
import { Button } from "@/components/ui/button";
import { ChampFormulaire } from "@/components/ui/champ-formulaire";
import { ChampMotDePasse } from "@/components/ui/champ-mot-de-passe";
import { Message } from "@/components/ui/message";
import { BASE_API, api } from "@/lib/api";
import { erreursDepuisApi, valider, type ErreursChamps } from "@/lib/formulaire";
import { changementMotDePasseSchema, profilSchema } from "@/schemas/compte.schema";

type Profil = {
  idBailleur: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string | null;
  emailVerifie: boolean;
  dateCreation: string;
};

// Écran 15 : profil, sécurité et droits RGPD.
export default function PageCompte() {
  const [profil, setProfil] = useState<Profil | null>(null);
  const [erreursProfil, setErreursProfil] = useState<ErreursChamps>({});
  const [messageProfil, setMessageProfil] = useState<{ ton: "succes" | "erreur"; texte: string } | null>(null);
  const [enregistrement, setEnregistrement] = useState(false);

  const [formulaireMotDePasse, setFormulaireMotDePasse] = useState(false);
  const [erreursMotDePasse, setErreursMotDePasse] = useState<ErreursChamps>({});
  const [messageMotDePasse, setMessageMotDePasse] = useState<{ ton: "succes" | "erreur"; texte: string } | null>(null);

  useEffect(() => {
    api<Profil>("/compte")
      .then(setProfil)
      .catch(() => setMessageProfil({ ton: "erreur", texte: "Votre profil n'a pas pu être chargé." }));
  }, []);

  async function enregistrerProfil(evenement: React.FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    const saisie = Object.fromEntries(new FormData(evenement.currentTarget));
    if (saisie.telephone === "") delete saisie.telephone;

    const validation = valider(profilSchema, saisie);
    if (!validation.succes) {
      setErreursProfil(validation.erreurs);
      setMessageProfil(null);
      return;
    }

    setErreursProfil({});
    setEnregistrement(true);
    try {
      const misAJour = await api<Profil & { emailAConfirmer: boolean }>("/compte", {
        method: "PUT",
        body: validation.donnees,
      });
      setProfil(misAJour);
      setMessageProfil({
        ton: "succes",
        texte: misAJour.emailAConfirmer
          ? "Profil enregistré. Confirmez votre nouvelle adresse via l'e-mail qui vient de vous être envoyé : la connexion sera refusée tant qu'elle ne l'est pas."
          : "Vos informations ont été enregistrées.",
      });
    } catch (err) {
      const { message, champs } = erreursDepuisApi(err);
      setErreursProfil(champs);
      setMessageProfil({ ton: "erreur", texte: message });
    } finally {
      setEnregistrement(false);
    }
  }

  async function changerMotDePasse(evenement: React.FormEvent<HTMLFormElement>) {
    evenement.preventDefault();
    const formulaire = evenement.currentTarget;
    const saisie = Object.fromEntries(new FormData(formulaire));

    const validation = valider(changementMotDePasseSchema, saisie);
    if (!validation.succes) {
      setErreursMotDePasse(validation.erreurs);
      setMessageMotDePasse(null);
      return;
    }

    setErreursMotDePasse({});
    try {
      await api("/compte/mot-de-passe", {
        method: "PUT",
        body: {
          motDePasseActuel: validation.donnees.motDePasseActuel,
          nouveauMotDePasse: validation.donnees.nouveauMotDePasse,
        },
      });
      formulaire.reset();
      setFormulaireMotDePasse(false);
      setMessageMotDePasse({ ton: "succes", texte: "Votre mot de passe a été modifié." });
    } catch (err) {
      const { message, champs } = erreursDepuisApi(err);
      setErreursMotDePasse(champs);
      setMessageMotDePasse({ ton: "erreur", texte: message });
    }
  }

  if (!profil) {
    return (
      <p className="text-courant text-brun" role="status">
        Chargement…
      </p>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
      <h1 className="text-titre-1">Mon compte</h1>

      <section aria-labelledby="titre-profil" className="flex flex-col gap-6">
        <h2 id="titre-profil" className="text-titre-2">
          Informations personnelles
        </h2>

        {messageProfil ? <Message ton={messageProfil.ton}>{messageProfil.texte}</Message> : null}

        <form onSubmit={enregistrerProfil} noValidate className="flex flex-col gap-6">
          <div className="flex flex-col gap-6 sm:flex-row">
            <div className="flex-1">
              <ChampFormulaire
                id="prenom"
                name="prenom"
                libelle="Prénom"
                autoComplete="given-name"
                defaultValue={profil.prenom}
                erreur={erreursProfil.prenom}
              />
            </div>
            <div className="flex-1">
              <ChampFormulaire
                id="nom"
                name="nom"
                libelle="Nom"
                autoComplete="family-name"
                defaultValue={profil.nom}
                erreur={erreursProfil.nom}
              />
            </div>
          </div>

          <ChampFormulaire
            id="email"
            name="email"
            type="email"
            libelle="E-mail"
            autoComplete="email"
            defaultValue={profil.email}
            aide="Changer d'adresse demande une nouvelle confirmation."
            erreur={erreursProfil.email}
          />

          <ChampFormulaire
            id="telephone"
            name="telephone"
            type="tel"
            libelle="Téléphone"
            autoComplete="tel"
            aide="Facultatif."
            defaultValue={profil.telephone ?? ""}
            erreur={erreursProfil.telephone}
          />

          <Button type="submit" disabled={enregistrement} className="sm:self-end">
            {enregistrement ? "Enregistrement…" : "Enregistrer les modifications"}
          </Button>
        </form>
      </section>

      <section aria-labelledby="titre-securite" className="flex flex-col gap-4 border-t border-sable pt-8">
        <h2 id="titre-securite" className="text-titre-2">
          Sécurité
        </h2>

        {messageMotDePasse ? (
          <Message ton={messageMotDePasse.ton}>{messageMotDePasse.texte}</Message>
        ) : null}

        {formulaireMotDePasse ? (
          <form onSubmit={changerMotDePasse} noValidate className="flex flex-col gap-6">
            <ChampMotDePasse
              id="motDePasseActuel"
              name="motDePasseActuel"
              libelle="Mot de passe actuel"
              autoComplete="current-password"
              erreur={erreursMotDePasse.motDePasseActuel}
            />
            <ChampMotDePasse
              id="nouveauMotDePasse"
              name="nouveauMotDePasse"
              libelle="Nouveau mot de passe"
              autoComplete="new-password"
              aide="12 caractères minimum."
              erreur={erreursMotDePasse.nouveauMotDePasse}
            />
            <ChampMotDePasse
              id="confirmation"
              name="confirmation"
              libelle="Confirmation"
              autoComplete="new-password"
              erreur={erreursMotDePasse.confirmation}
            />
            <div className="flex flex-col gap-4 sm:flex-row-reverse">
              <Button type="submit" className="sm:flex-1">
                Modifier le mot de passe
              </Button>
              <Button
                type="button"
                variant="outline"
                className="sm:flex-1"
                onClick={() => setFormulaireMotDePasse(false)}
              >
                Annuler
              </Button>
            </div>
          </form>
        ) : (
          <Button
            variant="outline"
            className="sm:self-start"
            onClick={() => setFormulaireMotDePasse(true)}
          >
            <KeyRound aria-hidden className="size-5" />
            Modifier le mot de passe
          </Button>
        )}
      </section>

      <section aria-labelledby="titre-donnees" className="flex flex-col gap-4 border-t border-sable pt-8">
        <h2 id="titre-donnees" className="text-titre-2">
          Mes données (RGPD)
        </h2>
        <p className="text-courant text-brun">
          Vous pouvez récupérer l&apos;ensemble de vos données à tout moment, ou supprimer
          définitivement votre compte.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Button asChild variant="outline">
            {/* Le fichier est servi par l'API en pièce jointe ; le cookie suffit. */}
            <a href={`${BASE_API}/compte/export`}>
              <Download aria-hidden className="size-5" />
              Exporter mes données
            </a>
          </Button>
          <SuppressionCompte />
        </div>
      </section>
    </div>
  );
}

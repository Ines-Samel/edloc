import Link from "next/link";
import { Camera, FileText, PenLine } from "lucide-react";

import { EntetePublique } from "@/components/layout/entete-publique";
import { IllustrationAccueil } from "@/components/layout/illustration-accueil";
import { PiedPublic } from "@/components/layout/pied-public";
import { Button } from "@/components/ui/button";

// Écran 1 des maquettes : hero, trois fonctionnalités, parcours en trois étapes.
const FONCTIONNALITES = [
  {
    icone: Camera,
    titre: "Photos horodatées",
    texte: "Chaque photo est datée automatiquement : des preuves fiables en cas de litige.",
  },
  {
    icone: PenLine,
    titre: "Signature sur place",
    texte: "Bailleur et locataire signent sur le même appareil, à la fin de la visite.",
  },
  {
    icone: FileText,
    titre: "PDF automatique",
    texte: "Envoyé aux deux parties dès la double signature, sans rien à faire de plus.",
  },
];

const ETAPES = [
  { titre: "Créez le logement", texte: "Adresse, pièces, locataire." },
  { titre: "Constatez ensemble", texte: "Pièce par pièce, avec photos." },
  { titre: "Signez, c'est envoyé", texte: "Le PDF part aux deux parties." },
];

export default function PageAccueil() {
  return (
    <>
      <EntetePublique ancres />

      <main className="flex-1">
        {/* Hero — un seul bouton principal, la connexion restant en action secondaire
            dans l'en-tête (charte §4). */}
        <section className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-14 lg:flex-row lg:items-center lg:gap-16">
          <div className="flex flex-1 flex-col gap-6">
            <h1 className="text-titre-1 sm:text-5xl">
              L&apos;état des lieux,
              <br />
              <span className="text-terracotta-fonce">en toute sérénité.</span>
            </h1>

            <p className="text-courant max-w-md text-brun">
              Réalisez, signez et archivez vos états des lieux directement sur place, à deux, sans
              paperasse.
            </p>

            <div>
              <Button asChild>
                <Link href="/inscription">Créer un compte gratuitement</Link>
              </Button>
              <p className="text-legende mt-3 text-brun">
                Gratuit pour les particuliers · Aucune carte bancaire requise
              </p>
            </div>
          </div>

          <div className="flex-1">
            <IllustrationAccueil />
          </div>
        </section>

        <section
          id="fonctionnalites"
          aria-labelledby="titre-fonctionnalites"
          className="mx-auto max-w-6xl px-6 py-10"
        >
          <h2 id="titre-fonctionnalites" className="sr-only">
            Fonctionnalités
          </h2>
          <ul className="flex flex-col gap-6 sm:flex-row">
            {FONCTIONNALITES.map(({ icone: Icone, titre, texte }) => (
              <li
                key={titre}
                className="flex flex-1 flex-col gap-3 rounded-carte border border-sable bg-card p-6"
              >
                <Icone aria-hidden className="size-7 text-terracotta-fonce" />
                <h3 className="text-sous-titre">{titre}</h3>
                <p className="text-legende text-brun">{texte}</p>
              </li>
            ))}
          </ul>
        </section>

        <section
          id="fonctionnement"
          aria-labelledby="titre-fonctionnement"
          className="mx-auto max-w-6xl px-6 py-10"
        >
          <h2 id="titre-fonctionnement" className="text-titre-2">
            Comment ça marche ?
          </h2>
          <ol className="mt-6 flex flex-col gap-6 sm:flex-row sm:gap-10">
            {ETAPES.map(({ titre, texte }, index) => (
              <li key={titre} className="flex flex-1 items-start gap-4">
                <span
                  aria-hidden
                  className="text-libelle flex size-9 shrink-0 items-center justify-center rounded-pilule bg-terracotta-fonce text-white"
                >
                  {index + 1}
                </span>
                <div>
                  <h3 className="text-sous-titre">
                    <span className="sr-only">Étape {index + 1} — </span>
                    {titre}
                  </h3>
                  <p className="text-legende text-brun">{texte}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </main>

      <PiedPublic />
    </>
  );
}

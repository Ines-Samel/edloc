import type { Metadata } from "next";
import Link from "next/link";

import { CadreDocument, SectionDocument } from "@/components/layout/cadre-document";

export const metadata: Metadata = {
  title: "Mentions légales — EDLoc",
  description: "Éditeur, hébergement et conditions d'utilisation du service EDLoc.",
};

// Les informations que seul l'éditeur peut fournir sont laissées en attente et
// signalées visuellement, pour qu'aucune ne parte en production par oubli.
function ACompleter({ children }: { children: React.ReactNode }) {
  return <mark className="rounded bg-ocre/40 px-1 text-encre">[À compléter : {children}]</mark>;
}

export default function PageMentionsLegales() {
  return (
    <CadreDocument titre="Mentions légales" miseAJour="septembre 2026">
      <SectionDocument titre="Éditeur du site">
        <p className="text-courant">
          Le service EDLoc est édité par <ACompleter>nom et prénom ou raison sociale</ACompleter>,{" "}
          <ACompleter>statut juridique et, le cas échéant, numéro SIREN</ACompleter>, dont
          l&apos;adresse est <ACompleter>adresse postale</ACompleter>.
        </p>
        <p className="text-courant">
          Contact : <ACompleter>adresse e-mail de contact</ACompleter>. Directeur de la publication
          : <ACompleter>nom du directeur de la publication</ACompleter>.
        </p>
      </SectionDocument>

      <SectionDocument titre="Hébergement">
        <p className="text-courant">
          L&apos;application et sa base de données sont hébergées par Railway Corporation,{" "}
          <ACompleter>adresse de l&apos;hébergeur</ACompleter>. Les photos et les PDF des états des
          lieux sont conservés sur un stockage objet Cloudflare R2.
        </p>
      </SectionDocument>

      <SectionDocument titre="Prestataires techniques">
        <p className="text-courant">
          L&apos;envoi des e-mails (confirmation de compte, réinitialisation de mot de passe, envoi
          du PDF signé) est assuré par Brevo. Ces prestataires agissent en qualité de
          sous-traitants ; le détail figure dans la{" "}
          <Link
            href="/confidentialite"
            className="text-terracotta-fonce underline underline-offset-4"
          >
            politique de confidentialité
          </Link>
          .
        </p>
      </SectionDocument>

      <SectionDocument titre="Propriété intellectuelle">
        <p className="text-courant">
          La structure du site, son identité visuelle, ses textes et ses éléments graphiques sont
          protégés par le droit d&apos;auteur. Toute reproduction ou représentation, totale ou
          partielle, sans autorisation écrite préalable est interdite.
        </p>
        <p className="text-courant">
          Les états des lieux, photos et signatures déposés par les utilisateurs restent leur
          propriété. EDLoc n&apos;en fait aucun usage autre que la fourniture du service.
        </p>
      </SectionDocument>

      <SectionDocument titre="Responsabilité">
        <p className="text-courant">
          EDLoc met à disposition un outil de constat et de conservation. La valeur juridique
          d&apos;un état des lieux dépend de son contenu et des signatures des parties :
          l&apos;éditeur ne peut être tenu responsable des constats établis par les utilisateurs,
          ni de l&apos;usage qui en est fait.
        </p>
        <p className="text-courant">
          L&apos;utilisation du service nécessite une connexion internet. L&apos;éditeur
          s&apos;efforce d&apos;assurer la disponibilité de l&apos;application sans pouvoir la
          garantir de façon ininterrompue.
        </p>
      </SectionDocument>

      <SectionDocument titre="Données personnelles">
        <p className="text-courant">
          Le traitement des données personnelles, les durées de conservation et les modalités
          d&apos;exercice de vos droits sont décrits dans la{" "}
          <Link
            href="/confidentialite"
            className="text-terracotta-fonce underline underline-offset-4"
          >
            politique de confidentialité
          </Link>
          .
        </p>
      </SectionDocument>
    </CadreDocument>
  );
}

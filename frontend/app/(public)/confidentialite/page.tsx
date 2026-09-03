import type { Metadata } from "next";
import Link from "next/link";

import { CadreDocument, SectionDocument } from "@/components/layout/cadre-document";

export const metadata: Metadata = {
  title: "Politique de confidentialité — EDLoc",
  description:
    "Données collectées par EDLoc, finalités, durées de conservation, sécurité et exercice de vos droits.",
};

function ACompleter({ children }: { children: React.ReactNode }) {
  return <mark className="rounded bg-ocre/40 px-1 text-encre">[À compléter : {children}]</mark>;
}

function Liste({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="text-courant flex list-disc flex-col gap-2 pl-6">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

export default function PageConfidentialite() {
  return (
    <CadreDocument titre="Politique de confidentialité" miseAJour="septembre 2026">
      <SectionDocument titre="Responsable du traitement">
        <p className="text-courant">
          Le responsable du traitement est <ACompleter>identité de l&apos;éditeur</ACompleter>,
          joignable à <ACompleter>adresse e-mail de contact</ACompleter>. Cette politique décrit
          les données traitées par EDLoc et la façon dont vous gardez la main dessus.
        </p>
      </SectionDocument>

      <SectionDocument titre="Données collectées">
        <Liste
          items={[
            <>
              <strong>Votre compte</strong> : nom, prénom, adresse e-mail, téléphone (facultatif),
              date de création. Le mot de passe n&apos;est jamais conservé en clair.
            </>,
            <>
              <strong>Vos biens</strong> : adresse, code postal, commune, type de logement, nombre
              de pièces, surface.
            </>,
            <>
              <strong>Vos états des lieux</strong> : type (entrée ou sortie), dates, statut, pièces
              et éléments constatés avec leur état et vos commentaires.
            </>,
            <>
              <strong>Les locataires concernés</strong> : nom, prénom, et si vous les renseignez,
              adresse e-mail et téléphone — nécessaires pour leur transmettre le PDF signé.
            </>,
            <>
              <strong>Les photos</strong> des éléments constatés, horodatées automatiquement, et
              les <strong>signatures</strong> des deux parties, conservées sous forme d&apos;image.
            </>,
          ]}
        />
      </SectionDocument>

      <SectionDocument titre="Finalités et bases légales">
        <Liste
          items={[
            <>
              Fournir le service : création des états des lieux, génération et envoi du PDF,
              comparaison entrée / sortie — <em>exécution du contrat</em>.
            </>,
            <>
              Confirmer votre adresse e-mail et sécuriser l&apos;accès à votre compte —{" "}
              <em>intérêt légitime</em> à protéger les comptes et les données qu&apos;ils
              contiennent.
            </>,
            <>
              Conserver les états des lieux signés comme éléments de preuve entre les parties —{" "}
              <em>intérêt légitime</em> des utilisateurs.
            </>,
          ]}
        />
      </SectionDocument>

      <SectionDocument titre="Destinataires et sous-traitants">
        <p className="text-courant">
          Vos données ne sont ni vendues ni cédées. Elles sont traitées par les prestataires
          strictement nécessaires au fonctionnement du service :
        </p>
        <Liste
          items={[
            <>
              <strong>Railway</strong> — hébergement de l&apos;application et de la base de données.
            </>,
            <>
              <strong>Cloudflare R2</strong> — stockage des photos et des PDF.
            </>,
            <>
              <strong>Brevo</strong> — envoi des e-mails de confirmation, de réinitialisation et
              des PDF signés.
            </>,
          ]}
        />
        <p className="text-courant">
          Région d&apos;hébergement retenue : <ACompleter>région des serveurs</ACompleter>.
        </p>
      </SectionDocument>

      <SectionDocument titre="Durées de conservation">
        <Liste
          items={[
            <>
              Données de compte : conservées tant que le compte existe, puis effacées à sa
              suppression.
            </>,
            <>
              États des lieux, photos et PDF :{" "}
              <ACompleter>durée retenue, par exemple 5 ans après la fin du bail</ACompleter>.
            </>,
            <>
              Jetons envoyés par e-mail : 24 heures pour la confirmation de compte, 1 heure pour la
              réinitialisation de mot de passe. Ils sont conservés hachés et invalidés après usage.
            </>,
          ]}
        />
        <p className="text-courant">
          La suppression de votre compte entraîne l&apos;effacement en cascade de vos biens, états
          des lieux, pièces, éléments, photos et signatures, ainsi que des fichiers correspondants
          sur le stockage objet.
        </p>
      </SectionDocument>

      <SectionDocument titre="Sécurité">
        <Liste
          items={[
            <>Les mots de passe sont hachés avec Argon2id et ne sont jamais stockés en clair.</>,
            <>
              La session repose sur un cookie <code>httpOnly</code>, inaccessible au JavaScript de
              la page : un script malveillant ne peut pas la dérober.
            </>,
            <>
              Chaque requête vérifie côté serveur que la donnée visée appartient bien au compte
              connecté : un bailleur ne peut accéder qu&apos;à ses propres biens et états des lieux.
            </>,
            <>Les échanges entre votre navigateur et le service sont chiffrés (HTTPS).</>,
          ]}
        />
      </SectionDocument>

      <SectionDocument titre="Vos droits">
        <p className="text-courant">
          Vous disposez d&apos;un droit d&apos;accès, de rectification, d&apos;effacement, de
          limitation, d&apos;opposition et de portabilité. Deux d&apos;entre eux s&apos;exercent
          directement depuis la page{" "}
          <Link href="/compte" className="text-terracotta-fonce underline underline-offset-4">
            Mon compte
          </Link>{" "}
          : l&apos;export de vos données au format JSON, et la suppression définitive de votre
          compte. La rectification de votre profil s&apos;y fait également.
        </p>
        <p className="text-courant">
          Pour toute autre demande, écrivez à <ACompleter>adresse e-mail de contact</ACompleter>.
          Vous pouvez également introduire une réclamation auprès de la CNIL (
          <a
            href="https://www.cnil.fr"
            className="text-terracotta-fonce underline underline-offset-4"
          >
            cnil.fr
          </a>
          ).
        </p>
      </SectionDocument>

      <SectionDocument titre="Cookies">
        <p className="text-courant">
          EDLoc dépose un seul cookie, nommé <code>edloc_jeton</code>. Il maintient votre session
          après connexion et n&apos;a aucune finalité publicitaire ni statistique. Strictement
          nécessaire au fonctionnement du service, il ne requiert pas de consentement préalable. Se
          déconnecter le supprime.
        </p>
      </SectionDocument>
    </CadreDocument>
  );
}

import { EntetePublique } from "@/components/layout/entete-publique";
import { PiedPublic } from "@/components/layout/pied-public";

/*
 * Cadre des pages de contenu légal. La largeur est bornée à environ 70 caractères :
 * au-delà, l'œil perd la ligne — un critère de lisibilité qui compte pour le public
 * peu à l'aise avec ce type de document.
 */
export function CadreDocument({
  titre,
  miseAJour,
  children,
}: {
  titre: string;
  miseAJour: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <EntetePublique />
      <main id="contenu-principal" tabIndex={-1} className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
        <h1 className="text-titre-1">{titre}</h1>
        <p className="text-legende mt-2 text-brun">Dernière mise à jour : {miseAJour}</p>
        <div className="mt-10 flex flex-col gap-10">{children}</div>
      </main>
      <PiedPublic />
    </>
  );
}

// Section d'un document légal : un titre de niveau 2 et son contenu.
export function SectionDocument({
  titre,
  children,
}: {
  titre: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-titre-2">{titre}</h2>
      {children}
    </section>
  );
}

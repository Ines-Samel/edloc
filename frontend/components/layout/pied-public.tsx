import Link from "next/link";

// Pied de page légal, commun à toutes les pages publiques (maquette 1).
export function PiedPublic() {
  return (
    <footer className="border-t border-sable">
      <div className="text-legende mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-3 gap-y-2 px-6 py-6 text-brun">
        <Link href="/mentions-legales" className="underline underline-offset-4 hover:text-encre">
          Mentions légales
        </Link>
        <span aria-hidden>·</span>
        <Link href="/confidentialite" className="underline underline-offset-4 hover:text-encre">
          Politique de confidentialité
        </Link>
        <span aria-hidden>·</span>
        <span>© EDLoc 2026</span>
      </div>
    </footer>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu } from "lucide-react";

import { LogoEdloc } from "@/components/layout/logo-edloc";
import { MenuCompte } from "@/components/layout/menu-compte";
import { ENTREES_BAILLEUR, estActive, titreDeLaPage } from "@/components/layout/navigation";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

/*
 * Navigation de l'espace bailleur, déclinée selon les trois formats des maquettes :
 *   - mobile   : barre d'onglets en bas de l'écran ;
 *   - tablette : barre haute avec menu ☰ ouvrant un panneau ;
 *   - desktop  : barre latérale permanente.
 * Une seule source de vérité pour les entrées : components/layout/navigation.ts.
 */

function LienActif({ chemin, href }: { chemin: string; href: string }) {
  return estActive(chemin, href);
}

export function BarreLaterale() {
  const chemin = usePathname();
  const router = useRouter();

  return (
    <nav
      aria-label="Navigation principale"
      className="hidden w-64 shrink-0 flex-col border-r border-sable bg-sidebar px-4 py-6 lg:flex"
    >
      <Link href="/tableau-de-bord" className="mb-8 flex items-center gap-2 px-3">
        <LogoEdloc className="size-9" />
        <span className="text-sous-titre text-terracotta-fonce">EDLoc</span>
      </Link>

      <ul className="flex flex-col gap-1">
        {ENTREES_BAILLEUR.map(({ href, libelle, icone: Icone }) => {
          const active = LienActif({ chemin, href });
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`text-courant flex min-h-cible items-center gap-3 rounded-carte px-3 ${
                  active
                    ? "border-l-4 border-terracotta-fonce bg-sidebar-accent font-bold text-terracotta-fonce"
                    : "text-brun hover:bg-sidebar-accent hover:text-encre"
                }`}
              >
                <Icone aria-hidden className="size-5" />
                {libelle}
              </Link>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        onClick={async () => {
          await api("/auth/deconnexion", { method: "POST" }).catch(() => {});
          router.replace("/connexion");
        }}
        className="text-courant mt-auto flex min-h-cible items-center gap-3 rounded-carte px-3 text-brun hover:bg-sidebar-accent hover:text-encre"
      >
        <LogOut aria-hidden className="size-5" />
        Se déconnecter
      </button>
    </nav>
  );
}

export function EnteteApplication() {
  const chemin = usePathname();
  const [panneauOuvert, setPanneauOuvert] = useState(false);

  return (
    <header className="flex items-center justify-between gap-3 border-b border-sable px-4 py-3 lg:hidden">
      <div className="flex items-center gap-3">
        {/* Menu ☰ : tablette uniquement — en mobile la barre d'onglets suffit. */}
        <Sheet open={panneauOuvert} onOpenChange={setPanneauOuvert}>
          <SheetTrigger
            aria-label="Ouvrir le menu"
            className="hidden size-11 items-center justify-center rounded-carte text-encre sm:flex lg:hidden"
          >
            <Menu aria-hidden className="size-6" />
          </SheetTrigger>

          <SheetContent side="left" className="w-72 p-6">
            <SheetTitle className="text-titre-2 mb-6">Navigation</SheetTitle>
            <ul className="flex flex-col gap-1">
              {ENTREES_BAILLEUR.map(({ href, libelle, icone: Icone }) => {
                const active = estActive(chemin, href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={() => setPanneauOuvert(false)}
                      aria-current={active ? "page" : undefined}
                      className={`text-courant flex min-h-cible items-center gap-3 rounded-carte px-3 ${
                        active
                          ? "bg-sidebar-accent font-bold text-terracotta-fonce"
                          : "text-brun hover:bg-sidebar-accent"
                      }`}
                    >
                      <Icone aria-hidden className="size-5" />
                      {libelle}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </SheetContent>
        </Sheet>

        <Link href="/tableau-de-bord" className="flex items-center gap-2">
          <LogoEdloc className="size-8" />
          <span className="text-sous-titre text-terracotta-fonce sm:inline">EDLoc</span>
        </Link>
      </div>

      <p className="text-sous-titre hidden truncate sm:block">{titreDeLaPage(chemin)}</p>

      <MenuCompte />
    </header>
  );
}

export function BarreOnglets() {
  const chemin = usePathname();

  return (
    <nav
      aria-label="Navigation principale"
      className="sticky bottom-0 border-t border-sable bg-creme sm:hidden"
    >
      <ul className="flex items-stretch justify-around">
        {ENTREES_BAILLEUR.map(({ href, court, icone: Icone }) => {
          const active = estActive(chemin, href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`text-legende flex min-h-cible flex-col items-center justify-center gap-1 py-2 ${
                  active ? "text-terracotta-fonce" : "text-brun"
                }`}
              >
                <Icone aria-hidden className="size-5" />
                {court}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

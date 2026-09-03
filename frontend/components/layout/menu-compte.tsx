"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, UserCog } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/lib/api";
import { initialesDe, useCompte } from "@/lib/session";

/*
 * Avatar en haut à droite (présent dans les maquettes 6 à 15), transformé en menu :
 * c'est là que se trouve la déconnexion, absente des maquettes.
 */
export function MenuCompte() {
  const compte = useCompte();
  const router = useRouter();
  const [deconnexionEnCours, setDeconnexionEnCours] = useState(false);

  async function seDeconnecter() {
    setDeconnexionEnCours(true);
    try {
      // Vide le cookie de session côté serveur ; le client n'y a pas accès.
      await api("/auth/deconnexion", { method: "POST" });
    } finally {
      router.replace("/connexion");
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Menu du compte"
        className="text-libelle flex size-11 items-center justify-center rounded-pilule border-2 border-terracotta-fonce text-terracotta-fonce"
      >
        {initialesDe(compte)}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuLabel>
          <span className="block truncate">{compte.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {compte.role === "bailleur" ? (
          <DropdownMenuItem asChild>
            <Link href="/compte">
              <UserCog aria-hidden className="size-4" />
              Mon compte
            </Link>
          </DropdownMenuItem>
        ) : null}

        <DropdownMenuItem onClick={seDeconnecter} disabled={deconnexionEnCours}>
          <LogOut aria-hidden className="size-4" />
          {deconnexionEnCours ? "Déconnexion…" : "Se déconnecter"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

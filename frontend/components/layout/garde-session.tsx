"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { LogoEdloc } from "@/components/layout/logo-edloc";
import { FournisseurSession, useDetectionSession } from "@/lib/session";

/*
 * Garde d'accès des zones protégées. Elle interroge l'API au chargement puis :
 *   - session absente ou expirée  → redirection vers la connexion ;
 *   - rôle insuffisant            → redirection également, sans indiquer que la
 *     page existe ;
 *   - session valide              → le compte est mis à disposition des pages.
 */
export function GardeSession({
  role,
  children,
}: {
  role: "bailleur" | "administrateur";
  children: React.ReactNode;
}) {
  const session = useDetectionSession();
  const router = useRouter();

  const acces = session.statut === "connecte" && session.compte.role === role;
  const refuse = session.statut === "anonyme" || (session.statut === "connecte" && !acces);

  useEffect(() => {
    if (refuse) router.replace("/connexion");
  }, [refuse, router]);

  if (session.statut === "connecte" && acces) {
    return <FournisseurSession compte={session.compte}>{children}</FournisseurSession>;
  }

  // Écran d'attente pendant la vérification, et pendant la redirection.
  return (
    <div
      role="status"
      className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center"
    >
      <LogoEdloc className="size-16 animate-pulse" />
      <p className="text-courant text-brun">
        {refuse ? "Redirection vers la connexion…" : "Vérification de votre session…"}
      </p>
    </div>
  );
}

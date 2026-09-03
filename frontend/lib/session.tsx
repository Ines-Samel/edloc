"use client";

import { createContext, useContext, useEffect, useState } from "react";

import { api } from "@/lib/api";

export type Compte =
  | { id: string; nom: string; prenom: string; email: string; role: "bailleur" }
  | { id: string; email: string; role: "administrateur" };

export type EtatSession =
  | { statut: "chargement" }
  | { statut: "connecte"; compte: Compte }
  | { statut: "anonyme" };

const ContexteSession = createContext<Compte | null>(null);

/*
 * Le jeton étant dans un cookie httpOnly, le client ne peut pas l'inspecter :
 * la seule façon de savoir si la session est valide est de le demander à l'API.
 * Ce hook effectue cet appel une fois au montage.
 */
export function useDetectionSession(): EtatSession {
  const [etat, setEtat] = useState<EtatSession>({ statut: "chargement" });

  useEffect(() => {
    let abandonne = false;

    api<Compte>("/auth/me")
      .then((compte) => {
        if (!abandonne) setEtat({ statut: "connecte", compte });
      })
      .catch(() => {
        if (!abandonne) setEtat({ statut: "anonyme" });
      });

    return () => {
      abandonne = true;
    };
  }, []);

  return etat;
}

export function FournisseurSession({
  compte,
  children,
}: {
  compte: Compte;
  children: React.ReactNode;
}) {
  return <ContexteSession.Provider value={compte}>{children}</ContexteSession.Provider>;
}

// Utilisable dans toute page rendue à l'intérieur d'une zone protégée.
export function useCompte(): Compte {
  const compte = useContext(ContexteSession);
  if (!compte) {
    throw new Error("useCompte doit être appelé dans une zone protégée par GardeSession");
  }
  return compte;
}

export function initialesDe(compte: Compte): string {
  if (compte.role === "bailleur") {
    return `${compte.prenom.charAt(0)}${compte.nom.charAt(0)}`.toUpperCase();
  }
  return "AD";
}

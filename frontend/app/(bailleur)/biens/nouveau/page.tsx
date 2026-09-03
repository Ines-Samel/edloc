"use client";

import { useRouter } from "next/navigation";

import { FormulaireBien } from "@/components/biens/formulaire-bien";
import { api } from "@/lib/api";
import type { Bien } from "@/lib/edloc";

export default function PageNouveauBien() {
  const router = useRouter();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <h1 className="text-titre-1">Nouveau bien</h1>
      <FormulaireBien
        libelleAction="Enregistrer le bien"
        retour="/biens"
        onEnvoyer={async (donnees) => {
          const bien = await api<Bien>("/biens", { method: "POST", body: donnees });
          router.push(`/biens/${bien.idBien}/historique`);
        }}
      />
    </div>
  );
}

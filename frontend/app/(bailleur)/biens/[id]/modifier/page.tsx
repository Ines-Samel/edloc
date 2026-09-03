"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { FormulaireBien } from "@/components/biens/formulaire-bien";
import { Message } from "@/components/ui/message";
import { api } from "@/lib/api";
import type { Bien } from "@/lib/edloc";

export default function PageModifierBien({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [bien, setBien] = useState<Bien | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    api<Bien>(`/biens/${id}`)
      .then(setBien)
      .catch(() => setErreur("Ce bien est introuvable."));
  }, [id]);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <h1 className="text-titre-1">Modifier le bien</h1>

      {erreur ? <Message ton="erreur">{erreur}</Message> : null}

      {bien ? (
        <FormulaireBien
          bien={bien}
          libelleAction="Enregistrer les modifications"
          retour={`/biens/${id}/historique`}
          onEnvoyer={async (donnees) => {
            await api(`/biens/${id}`, { method: "PUT", body: donnees });
            router.push(`/biens/${id}/historique`);
          }}
        />
      ) : null}

      {!bien && !erreur ? (
        <p className="text-courant text-brun" role="status">
          Chargement…
        </p>
      ) : null}
    </div>
  );
}

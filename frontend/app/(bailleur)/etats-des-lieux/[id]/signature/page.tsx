"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";

import { useZoneSignature } from "@/components/edl/zone-signature";
import { Button } from "@/components/ui/button";
import { Message } from "@/components/ui/message";
import { api } from "@/lib/api";
import { piecesRenseignees, type EdlComplet } from "@/lib/edloc";

type RoleSignataire = "bailleur" | "locataire";

const ETAPES: { role: RoleSignataire; libelle: string }[] = [
  { role: "bailleur", libelle: "Bailleur" },
  { role: "locataire", libelle: "Locataire" },
];

// Écran 11 : double signature sur place, bailleur puis locataire (RG11, RG12).
export default function PageSignature({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [edl, setEdl] = useState<EdlComplet | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const { zone, vide, effacer } = useZoneSignature({ onChangement: setSignature });

  const recharger = useCallback(
    () =>
      api<EdlComplet>(`/etats-des-lieux/${id}`)
        .then(setEdl)
        .catch(() => setErreur("Cet état des lieux est introuvable.")),
    [id],
  );

  useEffect(() => {
    recharger();
  }, [recharger]);

  if (erreur && !edl) return <Message ton="erreur">{erreur}</Message>;
  if (!edl) {
    return (
      <p className="text-courant text-brun" role="status">
        Chargement…
      </p>
    );
  }

  const signes = new Set(edl.signatures.map((s) => s.roleSignataire));
  const roleAttendu = ETAPES.find((etape) => !signes.has(etape.role))?.role;
  const verrouille = edl.statut === "signe";

  async function signer() {
    if (!signature || !roleAttendu) return;
    setEnvoiEnCours(true);
    setErreur(null);
    try {
      await api(`/etats-des-lieux/${id}/signatures`, {
        method: "POST",
        body: { roleSignataire: roleAttendu, donneesSignature: signature },
      });
      effacer();
      await recharger();
    } catch (err) {
      setErreur(
        err instanceof Error && err.message
          ? err.message
          : "La signature n'a pas pu être enregistrée.",
      );
    } finally {
      setEnvoiEnCours(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 lg:flex-row lg:items-start">
      {/* Panneau de rappel, affiché à côté de la signature dès le grand écran. */}
      <aside className="flex flex-col gap-3 rounded-carte border border-sable bg-card p-5 lg:w-64 lg:shrink-0">
        <h2 className="text-sous-titre">Récapitulatif</h2>
        <dl className="flex flex-col gap-3">
          {[
            { terme: "Bien", valeur: edl.bien.adresse },
            { terme: "Locataire", valeur: `${edl.locataire.prenom} ${edl.locataire.nom}` },
            { terme: "Type", valeur: edl.typeEdl === "entree" ? "Entrée" : "Sortie" },
            {
              terme: "Pièces",
              valeur: `${piecesRenseignees(edl.pieces)} / ${edl.pieces.length} complètes`,
            },
            {
              terme: "Photos",
              valeur: String(
                edl.pieces.reduce(
                  (total, piece) =>
                    total + piece.elements.reduce((n, element) => n + element.photos.length, 0),
                  0,
                ),
              ),
            },
          ].map(({ terme, valeur }) => (
            <div key={terme}>
              <dt className="text-legende text-brun">{terme}</dt>
              <dd className="text-courant font-bold">{valeur}</dd>
            </div>
          ))}
        </dl>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <h1 className="text-titre-1">
          Signature{roleAttendu ? ` · ${roleAttendu === "bailleur" ? "Bailleur" : "Locataire"}` : ""}
        </h1>

        {/* Étapes : chaque état combine une icône, un libellé et une couleur. */}
        <ol className="flex items-center gap-4">
          {ETAPES.map((etape, index) => {
            const fait = signes.has(etape.role);
            const courant = etape.role === roleAttendu;
            return (
              <li key={etape.role} className="flex flex-1 flex-col items-center gap-2">
                <span
                  className={`text-libelle flex size-10 items-center justify-center rounded-pilule ${
                    fait
                      ? "bg-vert-profond text-white"
                      : courant
                        ? "bg-terracotta-fonce text-white"
                        : "bg-sable text-brun"
                  }`}
                >
                  {fait ? <Check aria-hidden className="size-5" /> : index + 1}
                </span>
                <span className={`text-legende ${courant ? "text-terracotta-fonce" : "text-brun"}`}>
                  {etape.libelle}
                  <span className="sr-only">
                    {fait ? " — signé" : courant ? " — en cours" : " — à venir"}
                  </span>
                </span>
              </li>
            );
          })}
        </ol>

        {erreur ? <Message ton="erreur">{erreur}</Message> : null}

        {verrouille ? (
          <>
            <Message ton="succes">
              Les deux parties ont signé. L&apos;état des lieux est verrouillé, et le PDF a été
              envoyé par e-mail au bailleur
              {edl.locataire.email ? " et au locataire" : ""}.
            </Message>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button asChild>
                <Link href={`/etats-des-lieux/${id}`}>Voir l&apos;état des lieux</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/tableau-de-bord">Retour au tableau de bord</Link>
              </Button>
            </div>
          </>
        ) : (
          <>
            {zone}

            <div className="flex flex-col gap-4 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={effacer} disabled={vide || envoiEnCours}>
                Effacer
              </Button>
              <Button variant="validation" onClick={signer} disabled={vide || envoiEnCours}>
                <Check aria-hidden className="size-5" />
                {envoiEnCours ? "Enregistrement…" : "Signer"}
              </Button>
            </div>

            <p className="text-legende text-brun">
              {roleAttendu === "bailleur"
                ? "Le bailleur signe en premier, puis passe l'appareil au locataire."
                : "Passez l'appareil au locataire : sa signature verrouille l'état des lieux."}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

import { Check } from "lucide-react";

/*
 * Fil des étapes du parcours d'état des lieux, affiché en haut de chaque écran
 * concerné. Il répond à une demande simple : savoir où l'on en est et ce qui
 * reste à faire. Chaque étape combine un numéro (ou une coche), un libellé écrit
 * et une couleur — jamais la couleur seule.
 */
export const ETAPES_EDL = [
  { cle: "informations", libelle: "Informations" },
  { cle: "pieces", libelle: "Pièces" },
  { cle: "saisie", libelle: "Saisie" },
  { cle: "recapitulatif", libelle: "Récapitulatif" },
  { cle: "signature", libelle: "Signature" },
] as const;

export type EtapeEdl = (typeof ETAPES_EDL)[number]["cle"];

export function EtapesEdl({ etapeCourante }: { etapeCourante: EtapeEdl }) {
  const indexCourant = ETAPES_EDL.findIndex((etape) => etape.cle === etapeCourante);
  const progression = ((indexCourant + 1) / ETAPES_EDL.length) * 100;

  return (
    <div className="flex flex-col gap-3">
      <div
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={ETAPES_EDL.length}
        aria-valuenow={indexCourant + 1}
        aria-label={`Étape ${indexCourant + 1} sur ${ETAPES_EDL.length} : ${ETAPES_EDL[indexCourant].libelle}`}
        className="h-2 w-full overflow-hidden rounded-pilule bg-sable"
      >
        <div
          className="h-full rounded-pilule bg-terracotta-fonce transition-all"
          style={{ width: `${progression}%` }}
        />
      </div>

      <ol className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {ETAPES_EDL.map((etape, index) => {
          const faite = index < indexCourant;
          const courante = index === indexCourant;
          return (
            <li key={etape.cle} className="flex items-center gap-2">
              <span
                aria-hidden
                className={`text-legende flex size-7 shrink-0 items-center justify-center rounded-pilule ${
                  faite
                    ? "bg-vert-profond text-white"
                    : courante
                      ? "bg-terracotta-fonce text-white"
                      : "bg-sable text-brun"
                }`}
              >
                {faite ? <Check aria-hidden className="size-4" /> : index + 1}
              </span>
              <span
                className={`text-legende ${courante ? "font-bold text-terracotta-fonce" : "text-brun"}`}
              >
                {etape.libelle}
                <span className="sr-only">
                  {faite ? " — terminée" : courante ? " — étape en cours" : " — à venir"}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

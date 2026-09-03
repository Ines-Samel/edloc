import { CircleAlert, CircleCheck, Info } from "lucide-react";

/*
 * Bloc de message. Conformément à la charte (§5), l'état n'est jamais porté par
 * la seule couleur : chaque message combine une icône, un libellé explicite et
 * un style de bordure distinct (pleine pour un succès, pointillés pour une erreur).
 */
const TONS = {
  succes: {
    icone: CircleCheck,
    libelle: "Succès",
    classes: "border-solid border-vert-profond text-vert-profond",
  },
  erreur: {
    icone: CircleAlert,
    libelle: "Erreur",
    classes: "border-dotted border-alerte-foncee text-alerte-foncee",
  },
  information: {
    icone: Info,
    libelle: "Information",
    classes: "border-dashed border-ocre-fonce text-ocre-fonce",
  },
} as const;

export function Message({
  ton,
  children,
}: {
  ton: keyof typeof TONS;
  children: React.ReactNode;
}) {
  const { icone: Icone, libelle, classes } = TONS[ton];

  return (
    <div
      role={ton === "erreur" ? "alert" : "status"}
      className={`text-courant flex items-start gap-3 rounded-carte border-2 bg-card p-4 ${classes}`}
    >
      <Icone aria-hidden className="mt-0.5 size-5 shrink-0" />
      <p>
        <span className="font-bold">{libelle} — </span>
        {children}
      </p>
    </div>
  );
}

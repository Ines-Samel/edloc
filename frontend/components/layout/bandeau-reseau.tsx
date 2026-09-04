"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { CloudOff, Wifi } from "lucide-react";

/*
 * Détection de la perte de réseau, exigée par le cahier des charges (section 5,
 * Disponibilité) : « une perte de réseau est détectée et signalée à l'utilisateur
 * afin d'éviter toute perte de saisie ».
 *
 * L'état de connexion est lu avec useSyncExternalStore : c'est le mécanisme prévu
 * pour s'abonner à une valeur extérieure à React qui diffère entre le rendu serveur
 * (où navigator n'existe pas) et le navigateur.
 */
function souscrireAuReseau(rappel: () => void) {
  window.addEventListener("online", rappel);
  window.addEventListener("offline", rappel);
  return () => {
    window.removeEventListener("online", rappel);
    window.removeEventListener("offline", rappel);
  };
}

export function BandeauReseau() {
  const enLigne = useSyncExternalStore(
    souscrireAuReseau,
    () => navigator.onLine,
    // Au rendu serveur, on suppose la connexion présente : le bandeau
    // n'apparaîtrait sinon qu'un instant à chaque chargement de page.
    () => true,
  );

  const [precedent, setPrecedent] = useState(enLigne);
  const [retabli, setRetabli] = useState(false);

  // Transition hors ligne → en ligne : on confirme brièvement le rétablissement.
  if (precedent !== enLigne) {
    setPrecedent(enLigne);
    setRetabli(enLigne);
  }

  useEffect(() => {
    if (!retabli) return;
    const minuteur = setTimeout(() => setRetabli(false), 5000);
    return () => clearTimeout(minuteur);
  }, [retabli]);

  if (enLigne && !retabli) return null;

  return (
    <div
      role="status"
      aria-live="assertive"
      className={`text-courant flex items-center justify-center gap-3 px-4 py-3 text-center ${
        enLigne ? "bg-vert-profond text-white" : "bg-alerte-foncee text-white"
      }`}
    >
      {enLigne ? (
        <>
          <Wifi aria-hidden className="size-5 shrink-0" />
          <span>
            <span className="font-bold">Connexion rétablie</span> — vous pouvez reprendre votre
            saisie.
          </span>
        </>
      ) : (
        <>
          <CloudOff aria-hidden className="size-5 shrink-0" />
          <span>
            <span className="font-bold">Connexion perdue</span> — vos dernières saisies ne sont plus
            enregistrées. Ne fermez pas cette page : elles repartiront dès le retour du réseau.
          </span>
        </>
      )}
    </div>
  );
}

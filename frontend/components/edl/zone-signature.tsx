"use client";

import { useEffect, useRef, useState } from "react";

/*
 * Zone de signature au doigt. Le tracé est capturé sur un canvas via les
 * événements « pointer », qui couvrent d'un coup le doigt, le stylet et la souris.
 * `touch-action: none` empêche la page de défiler pendant qu'on signe — sans quoi
 * signer sur un téléphone tenu à la main est impossible.
 * Le canvas est dimensionné selon la densité de l'écran, sinon le trait est flou.
 *
 * Exporté comme un hook (et non comme un composant) parce qu'il rend un fragment
 * tout en exposant son état à l'appelant : la page a besoin de savoir si la zone
 * est vide et de pouvoir l'effacer depuis ses propres boutons.
 */
export function useZoneSignature({
  onChangement,
  desactive = false,
}: {
  onChangement: (donneesPng: string | null) => void;
  desactive?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const traceEnCours = useRef(false);
  const [vide, setVide] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const densite = window.devicePixelRatio || 1;
    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = width * densite;
    canvas.height = height * densite;

    const contexte = canvas.getContext("2d");
    if (!contexte) return;
    contexte.scale(densite, densite);
    // Fond blanc : la signature est ensuite intégrée telle quelle dans le PDF.
    contexte.fillStyle = "#ffffff";
    contexte.fillRect(0, 0, width, height);
    contexte.lineWidth = 2.5;
    contexte.lineCap = "round";
    contexte.lineJoin = "round";
    contexte.strokeStyle = "#2b2420";
  }, []);

  function positionner(evenement: React.PointerEvent<HTMLCanvasElement>) {
    const rectangle = evenement.currentTarget.getBoundingClientRect();
    return { x: evenement.clientX - rectangle.left, y: evenement.clientY - rectangle.top };
  }

  function commencer(evenement: React.PointerEvent<HTMLCanvasElement>) {
    if (desactive) return;
    const contexte = canvasRef.current?.getContext("2d");
    if (!contexte) return;
    evenement.currentTarget.setPointerCapture(evenement.pointerId);
    traceEnCours.current = true;
    const { x, y } = positionner(evenement);
    contexte.beginPath();
    contexte.moveTo(x, y);
  }

  function tracer(evenement: React.PointerEvent<HTMLCanvasElement>) {
    if (!traceEnCours.current) return;
    const contexte = canvasRef.current?.getContext("2d");
    if (!contexte) return;
    const { x, y } = positionner(evenement);
    contexte.lineTo(x, y);
    contexte.stroke();
    if (vide) setVide(false);
  }

  function terminer() {
    if (!traceEnCours.current) return;
    traceEnCours.current = false;
    const canvas = canvasRef.current;
    if (canvas) onChangement(canvas.toDataURL("image/png"));
  }

  function effacer() {
    const canvas = canvasRef.current;
    const contexte = canvas?.getContext("2d");
    if (!canvas || !contexte) return;
    const { width, height } = canvas.getBoundingClientRect();
    contexte.fillStyle = "#ffffff";
    contexte.fillRect(0, 0, width, height);
    setVide(true);
    onChangement(null);
  }

  return {
    vide,
    effacer,
    zone: (
      <div className="rounded-carte border-2 border-dashed border-brun p-3">
        <div className="relative">
          {vide ? (
            <p className="text-courant pointer-events-none absolute inset-0 flex items-center justify-center text-brun">
              Signez ici
            </p>
          ) : null}
          <canvas
            ref={canvasRef}
            onPointerDown={commencer}
            onPointerMove={tracer}
            onPointerUp={terminer}
            onPointerLeave={terminer}
            aria-label="Zone de signature : tracez votre signature avec le doigt ou la souris"
            className="h-48 w-full touch-none rounded-carte bg-white"
          />
        </div>
        <div className="mt-2 h-px bg-sable" />
      </div>
    ),
  };
}

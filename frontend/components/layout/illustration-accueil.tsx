/*
 * Zone visuelle du hero (maquette 1). La conception y prévoit une photo ou une
 * vidéo montrant un bailleur et un locataire réalisant l'état des lieux ensemble,
 * afin d'humaniser la page ; en attendant ce média, cette illustration en tient
 * lieu, comme dans la maquette.
 */
export function IllustrationAccueil() {
  return (
    <figure className="flex flex-col gap-3 rounded-carte bg-sable p-6">
      <svg
        viewBox="0 0 320 148"
        role="img"
        aria-label="Un bailleur et un locataire réalisent l'état des lieux ensemble, sur un même appareil."
        className="h-auto w-full"
      >
        {/* Porte du logement */}
        <rect
          x="18"
          y="26"
          width="56"
          height="100"
          rx="4"
          fill="var(--color-creme)"
          stroke="var(--color-brun)"
          strokeWidth="2"
        />
        <line x1="46" y1="26" x2="46" y2="126" stroke="var(--color-brun)" strokeWidth="2" />
        {/* Sol */}
        <line x1="10" y1="126" x2="310" y2="126" stroke="var(--color-brun)" strokeWidth="2" />
        {/* Bailleur : la tête et les épaules se rejoignent */}
        <circle cx="150" cy="56" r="15" fill="var(--color-terracotta)" />
        <path d="M130 126V96a20 20 0 0 1 40 0v30z" fill="var(--color-terracotta)" />
        {/* Locataire */}
        <circle cx="216" cy="48" r="17" fill="var(--color-vert-profond)" />
        <path d="M193 126V90a23 23 0 0 1 46 0v36z" fill="var(--color-vert-profond)" />
        {/* L'appareil partagé, tenu entre les deux */}
        <rect
          x="166"
          y="86"
          width="34"
          height="24"
          rx="3"
          fill="var(--color-creme)"
          stroke="var(--color-encre)"
          strokeWidth="2"
        />
        {/* La validation */}
        <circle cx="258" cy="34" r="15" fill="none" stroke="var(--color-vert-profond)" strokeWidth="2.5" />
        <path
          d="M251 34l5 6 11-13"
          fill="none"
          stroke="var(--color-vert-profond)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <figcaption className="text-legende text-center text-brun">
        Photo / vidéo : l&apos;état des lieux réalisé à deux
      </figcaption>
    </figure>
  );
}

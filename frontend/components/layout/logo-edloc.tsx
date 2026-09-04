/*
 * Logo de la charte : une maison au trait terracotta arrondi, traversée par une
 * coche vert profond qui naît à l'intérieur et dépasse du toit — « le logement,
 * c'est OK ». La coche déborde volontairement du cadre du toit : ne pas la rogner.
 */
export function LogoEdloc({
  className,
  titre = "EDLoc",
}: {
  className?: string;
  titre?: string;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label={titre}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10 27.5 32 9l22 18.5V52a3 3 0 0 1-3 3H13a3 3 0 0 1-3-3V27.5Z"
        stroke="var(--color-terracotta)"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 33.5 29.5 44 53 6.5"
        stroke="var(--color-vert-profond)"
        strokeWidth="6.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

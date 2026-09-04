/*
 * Lien d'évitement (WCAG 2.4.1). Invisible tant qu'il n'a pas le focus, il permet
 * à quelqu'un qui navigue au clavier de sauter la navigation — cinq onglets en
 * mobile, six entrées de barre latérale en desktop — pour atteindre le contenu.
 */
export function LienEvitement() {
  return (
    <a
      href="#contenu-principal"
      className="text-libelle sr-only rounded-carte bg-terracotta-fonce px-4 py-3 text-white focus-visible:not-sr-only focus-visible:absolute focus-visible:left-4 focus-visible:top-4 focus-visible:z-50"
    >
      Aller au contenu principal
    </a>
  );
}

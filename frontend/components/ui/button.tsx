import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

/*
 * Composant shadcn/ui adapté à la charte EDLoc (§4 Boutons) :
 * forme pilule, texte Bold 700 de 16 px, hauteur minimale de 48 px pour la cible
 * tactile, survol qui assombrit le fond de 8 % et appui de 15 %.
 * L'anneau de focus (3 px encre chaude, décalé de 3 px) est appliqué globalement
 * dans globals.css : les classes focus-visible de shadcn sont donc retirées.
 * Les noms de variantes restent ceux du registre shadcn pour que les composants
 * ajoutés ultérieurement (dialogue, formulaire…) continuent de fonctionner.
 */
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 rounded-pilule border-2 border-transparent text-base font-bold whitespace-nowrap transition-colors outline-none select-none disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        // Action majeure de l'écran — une seule par écran.
        default:
          "bg-primary text-primary-foreground hover:bg-[color-mix(in_oklch,var(--primary),black_8%)] active:bg-[color-mix(in_oklch,var(--primary),black_15%)] disabled:bg-sable disabled:text-brun",
        // Action alternative : contour 2 px terracotta foncé.
        outline:
          "border-primary bg-transparent text-primary hover:bg-sable active:bg-[color-mix(in_oklch,var(--secondary),black_8%)] disabled:border-sable disabled:text-brun",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),black_8%)] active:bg-[color-mix(in_oklch,var(--secondary),black_15%)] disabled:text-brun",
        // Signature, envoi : vert profond + icône ✓.
        validation:
          "bg-vert-profond text-white hover:bg-[color-mix(in_oklch,var(--color-vert-profond),black_8%)] active:bg-[color-mix(in_oklch,var(--color-vert-profond),black_15%)] disabled:bg-sable disabled:text-brun",
        ghost: "bg-transparent hover:bg-muted disabled:text-brun",
        // Destructif : texte seul, toujours suivi d'une confirmation.
        destructive:
          "bg-transparent text-destructive hover:bg-destructive/10 active:bg-destructive/20 disabled:text-brun",
        link: "text-primary underline underline-offset-4 hover:no-underline disabled:text-brun",
      },
      size: {
        // Cible tactile de la charte : 48 px de haut minimum.
        default: "h-cible px-8",
        lg: "h-14 px-10",
        icon: "size-cible",
        // Tailles réduites réservées aux zones denses en desktop (tableaux,
        // barres d'outils) : jamais dans le parcours tactile de l'état des lieux.
        sm: "h-10 px-5 text-sm",
        "icon-sm": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }

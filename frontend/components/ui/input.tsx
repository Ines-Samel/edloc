import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Adapté à la charte EDLoc : hauteur de 48 px (cible tactile), texte de
        // 16 px — en dessous, iOS zoome automatiquement au focus — et anneau de
        // focus global défini dans globals.css.
        "h-cible w-full min-w-0 rounded-carte border border-input bg-card px-4 text-base transition-colors outline-none placeholder:text-brun disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-sable disabled:text-brun aria-invalid:border-destructive aria-invalid:border-2",
        className
      )}
      {...props}
    />
  )
}

export { Input }

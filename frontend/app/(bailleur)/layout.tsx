import { GardeSession } from "@/components/layout/garde-session";
import {
  BarreLaterale,
  BarreOnglets,
  EnteteApplication,
} from "@/components/layout/navigation-bailleur";

// Toutes les pages de ce groupe exigent une session de bailleur valide.
export default function LayoutBailleur({ children }: { children: React.ReactNode }) {
  return (
    <GardeSession role="bailleur">
      <div className="flex flex-1">
        <BarreLaterale />
        <div className="flex min-w-0 flex-1 flex-col">
          <EnteteApplication />
          <main id="contenu-principal" tabIndex={-1} className="flex-1 px-4 py-6 sm:px-6">{children}</main>
          <BarreOnglets />
        </div>
      </div>
    </GardeSession>
  );
}

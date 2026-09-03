import Link from "next/link";

import { GardeSession } from "@/components/layout/garde-session";
import { LogoEdloc } from "@/components/layout/logo-edloc";
import { MenuCompte } from "@/components/layout/menu-compte";

/*
 * Zone d'administration : réservée au rôle administrateur et pensée pour le
 * format desktop uniquement (cahier des charges, section 4.6). La navigation y
 * est donc minimale — une seule page.
 */
export default function LayoutAdmin({ children }: { children: React.ReactNode }) {
  return (
    <GardeSession role="administrateur">
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-sable px-6 py-3">
          <Link href="/admin/utilisateurs" className="flex items-center gap-2">
            <LogoEdloc className="size-8" />
            <span className="text-sous-titre text-terracotta-fonce">EDLoc — administration</span>
          </Link>
          <MenuCompte />
        </header>
        <main className="flex-1 px-6 py-6">{children}</main>
      </div>
    </GardeSession>
  );
}

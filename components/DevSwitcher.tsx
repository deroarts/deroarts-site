/* ==========================================================================
   DEV-ONLY — DevSwitcher
   Remove this component or set DEV_UA_SWITCH=false before going to production.
   This component is only rendered when process.env.DEV_UA_SWITCH === "true".
   PERMANENT RULE: this U/A switch is a development-only tool and must ALWAYS
   remain independent from any auth / privacy / security / RLS logic — it must
   never be blocked by them. It is temporary and will be removed before prod.
   ========================================================================== */

"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export default function DevSwitcher() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admina");

  return (
    <div className="fixed bottom-4 right-4 z-[9999]">
      <Link
        href={isAdmin ? "/" : "/admina"}
        title={isAdmin ? "Vai a User" : "Vai ad Admin"}
        className="flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold text-white shadow bg-green-gradient transition-colors"
      >
        {isAdmin ? "A" : "U"}
      </Link>
    </div>
  );
}

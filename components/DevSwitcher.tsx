/* ==========================================================================
   DevSwitcher — U/A navigation pill.
   Visibility gate (in layout): NEXT_PUBLIC_SHOW_UA_SWITCH === "true" → shown
   everywhere incl. production. It is ONLY a navigation shortcut between the
   public site and /admina; it does NOT bypass auth. The auth bypass is a
   SEPARATE, dev-only switch (DEV_UA_SWITCH in middleware) that is never enabled
   in production — so in prod clicking "A" still requires the admin login.
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

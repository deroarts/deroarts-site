/* ==========================================================================
   DEV-ONLY — DevSwitcher
   Remove this component or set DEV_UA_SWITCH=false before going to production.
   This component is only rendered when process.env.DEV_UA_SWITCH === "true".
   It bypasses no auth — it merely navigates between the public site and the
   admin login page. Admin routes remain fully protected by middleware.
   ========================================================================== */

"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export default function DevSwitcher() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex items-center rounded-full bg-graphite/90 backdrop-blur-sm shadow-lg border border-white/10 overflow-hidden text-sm font-medium">
      <Link
        href="/"
        className={`flex items-center gap-1.5 px-3.5 py-2 transition-colors ${
          !isAdmin
            ? "bg-green-gradient text-white"
            : "text-white/50 hover:text-white"
        }`}
        title="Vista pubblica"
      >
        <span>👤</span>
        <span className="hidden sm:inline">Visitatore</span>
      </Link>
      <div className="w-px h-5 bg-white/10" />
      <Link
        href="/admin"
        className={`flex items-center gap-1.5 px-3.5 py-2 transition-colors ${
          isAdmin
            ? "bg-green-gradient text-white"
            : "text-white/50 hover:text-white"
        }`}
        title="Area admin"
      >
        <span>🔑</span>
        <span className="hidden sm:inline">Admin</span>
      </Link>
    </div>
  );
}

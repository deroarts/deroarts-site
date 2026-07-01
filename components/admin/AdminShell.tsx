"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/admin/login/actions";

const NAV_ITEMS = [
  {
    href: "/admin/progetti",
    label: "Progetti",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    href: "/admin/categorie",
    label: "Categorie",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
  },
  {
    href: "/admin/richieste",
    label: "Richieste",
    badge: true, // receives unreadCount
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    href: "/admin/impostazioni",
    label: "Impostazioni",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

function NavLinks({
  onNavigate,
  unreadCount,
}: {
  onNavigate?: () => void;
  unreadCount: number;
}) {
  const pathname = usePathname();
  const isDev = process.env.NODE_ENV !== "production";

  return (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {NAV_ITEMS.map((item) => {
        const active = pathname.startsWith(item.href);
        const showBadge = item.badge && unreadCount > 0;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              active
                ? "bg-green-start/20 text-green-start"
                : "text-white/60 hover:text-white hover:bg-white/10"
            }`}
          >
            <span className={active ? "text-green-start" : ""}>{item.icon}</span>
            <span className="flex-1">{item.label}</span>
            {showBadge && (
              <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>
        );
      })}

      {/* Dev Outbox — only in development */}
      {isDev && (
        <Link
          href="/admin/dev-outbox"
          onClick={onNavigate}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
            pathname.startsWith("/admin/dev-outbox")
              ? "bg-green-start/20 text-green-start"
              : "text-white/40 hover:text-white/80 hover:bg-white/10"
          }`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span className="flex-1">Dev Outbox</span>
          <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-mono">
            DEV
          </span>
        </Link>
      )}
    </nav>
  );
}

interface AdminShellProps {
  children: React.ReactNode;
  adminEmail?: string;
  unreadCount?: number;
}

export default function AdminShell({
  children,
  adminEmail,
  unreadCount = 0,
}: AdminShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex h-screen bg-light-surface overflow-hidden">
      {/* ── Desktop sidebar ─────────────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-60 bg-dark-green-gradient flex-shrink-0 shadow-xl">
        <div className="flex items-center gap-2 px-5 py-5 border-b border-white/10">
          <Image
            src="/brand/logo-horizontal-on-dark.svg"
            alt="DeroArts"
            width={120}
            height={32}
            className="h-7 w-auto"
          />
        </div>

        <NavLinks unreadCount={unreadCount} />

        <div className="px-3 pb-4 border-t border-white/10 pt-4">
          {adminEmail && (
            <p className="text-xs text-white/40 px-3 mb-3 truncate">{adminEmail}</p>
          )}
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Esci
            </button>
          </form>
        </div>
      </aside>

      {/* ── Mobile overlay ───────────────────────────────────────────────── */}
      {drawerOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* ── Mobile drawer ────────────────────────────────────────────────── */}
      <aside
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-64 bg-dark-green-gradient flex flex-col shadow-2xl transition-transform duration-300 ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <Image
            src="/brand/logo-horizontal-on-dark.svg"
            alt="DeroArts"
            width={110}
            height={30}
            className="h-7 w-auto"
          />
          <button
            onClick={() => setDrawerOpen(false)}
            className="text-white/60 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <NavLinks
          unreadCount={unreadCount}
          onNavigate={() => setDrawerOpen(false)}
        />

        <div className="px-3 pb-4 border-t border-white/10 pt-4">
          {adminEmail && (
            <p className="text-xs text-white/40 px-3 mb-3 truncate">{adminEmail}</p>
          )}
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Esci
            </button>
          </form>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-auto">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 shadow-sm">
          <button
            onClick={() => setDrawerOpen(true)}
            className="text-graphite hover:text-green-end transition-colors p-1"
            aria-label="Apri menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Image
            src="/brand/symbol.svg"
            alt="DeroArts"
            width={28}
            height={28}
            className="h-7 w-7"
          />
          <span className="text-sm font-semibold text-graphite flex-1">Admin</span>

          {/* Unread bell — mobile */}
          {unreadCount > 0 && (
            <Link
              href="/admin/richieste?status=new"
              className="relative text-gray-400 hover:text-graphite transition-colors"
              title={`${unreadCount} richiesta/e nuove`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-0.5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center leading-none">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            </Link>
          )}
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

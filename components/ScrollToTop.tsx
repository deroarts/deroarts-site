"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * ScrollToTop — disattiva il ripristino automatico dello scroll del browser e,
 * al primo caricamento e a ogni cambio pagina, riporta la vista in cima. Così
 * ogni pagina (e ogni refresh) parte sempre dall'inizio, in tutta l'app.
 */
export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

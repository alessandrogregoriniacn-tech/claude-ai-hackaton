"use client";

import { useEffect, useState } from "react";
import { THEME_KEY, type Theme } from "@/lib/theme";

function getInitialTheme(): Theme {
  if (typeof document === "undefined") return "light";
  const attr = document.documentElement.getAttribute("data-theme");
  return attr === "dark" ? "dark" : "light";
}

export function ThemeToggle() {
  // Prima del mount usiamo un valore stabile per non divergere dall'HTML SSR;
  // dopo il mount leggiamo il tema realmente applicato dallo script inline.
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");

  // Il tema reale è nel DOM (impostato da uno script inline): lettura
  // intenzionale dopo il mount per non divergere dall'HTML prerenderizzato.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setTheme(getInitialTheme());
    setMounted(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // storage non disponibile: il tema resta valido solo per la sessione.
    }
  }

  const isDark = theme === "dark";
  const label = isDark ? "Passa al tema chiaro" : "Passa al tema scuro";

  return (
    <button
      type="button"
      onClick={toggle}
      role="switch"
      aria-checked={isDark}
      aria-label={label}
      title={label}
      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-pill border border-border bg-surface text-foreground transition hover:border-foreground/40"
    >
      {/* Prima del mount mostriamo un segnaposto neutro per evitare mismatch */}
      <span aria-hidden className="text-lg leading-none">
        {mounted ? (isDark ? "☀️" : "🌙") : "🌗"}
      </span>
    </button>
  );
}

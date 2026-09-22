"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageToggle } from "./LanguageToggle";
import { useI18n } from "./I18nProvider";

const LINKS = [
  { href: "/", key: "home" },
  { href: "/simulazione", key: "simulazione" },
  { href: "/storico", key: "storico" },
  { href: "/confronta", key: "confronta" },
  { href: "/faq", key: "faq" },
] as const;

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { t } = useI18n();

  return (
    <header className="theme-transition sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
      <nav
        aria-label={t.nav.ariaLabel}
        className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-3"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-semibold"
          onClick={() => setOpen(false)}
        >
          <span
            aria-hidden="true"
            className="inline-block h-3 w-3 rounded-pill bg-accent"
          />
          Hagenton
        </Link>

        {/* Link desktop */}
        <ul className="hidden items-center gap-1 sm:flex">
          {LINKS.map((l) => {
            const active = isActive(pathname, l.href);
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex min-h-11 items-center rounded-pill px-4 text-sm font-medium transition duration-200 motion-safe:hover:scale-105 motion-safe:active:scale-95 ${
                    active
                      ? "bg-primary text-primary-foreground motion-safe:animate-scale-in"
                      : "link-underline text-muted hover:text-foreground"
                  }`}
                >
                  {t.nav.links[l.key]}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
          {/* Toggle menu mobile */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? t.nav.closeMenu : t.nav.openMenu}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-pill border border-border bg-surface text-foreground transition hover:border-foreground/40 sm:hidden"
          >
            <span aria-hidden className="text-lg leading-none">
              {open ? "✕" : "☰"}
            </span>
          </button>
        </div>
      </nav>

      {/* Menu mobile */}
      {open ? (
        <ul
          id="mobile-menu"
          className="mx-auto flex max-w-5xl flex-col gap-1 px-6 pb-3 motion-safe:animate-slide-down sm:hidden"
        >
          {LINKS.map((l) => {
            const active = isActive(pathname, l.href);
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={`flex min-h-11 items-center rounded-md px-4 text-sm font-medium transition duration-200 ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted hover:bg-surface hover:text-foreground"
                  }`}
                >
                  {t.nav.links[l.key]}
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </header>
  );
}

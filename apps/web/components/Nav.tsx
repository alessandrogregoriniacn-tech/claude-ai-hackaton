"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/simulazione", label: "Simulazione" },
  { href: "/storico", label: "Storico" },
  { href: "/faq", label: "FAQ" },
] as const;

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="theme-transition sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
      <nav
        aria-label="Navigazione principale"
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
                  className={`inline-flex min-h-11 items-center rounded-pill px-4 text-sm font-medium transition ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted hover:bg-surface hover:text-foreground"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {/* Toggle menu mobile */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Chiudi il menu" : "Apri il menu"}
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
          className="mx-auto flex max-w-5xl flex-col gap-1 px-6 pb-3 sm:hidden"
        >
          {LINKS.map((l) => {
            const active = isActive(pathname, l.href);
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={`flex min-h-11 items-center rounded-md px-4 text-sm font-medium transition ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted hover:bg-surface hover:text-foreground"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>
      ) : null}
    </header>
  );
}

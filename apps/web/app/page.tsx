"use client";

import Link from "next/link";
import { useI18n } from "@/components/I18nProvider";

export default function HomePage() {
  const { t } = useI18n();
  const sections = [
    { href: "/simulazione", ...t.home.cards.simulazione },
    { href: "/storico", ...t.home.cards.storico },
    { href: "/faq", ...t.home.cards.faq },
  ];

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <section className="rounded-card bg-accent px-6 py-10 text-accent-foreground motion-safe:animate-fade-in-up sm:px-10 sm:py-14">
        <p className="text-sm font-semibold uppercase tracking-wide">
          {t.home.eyebrow}
        </p>
        <h1 className="mt-2 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
          {t.home.title}
        </h1>
        <p className="mt-4 max-w-2xl text-base">{t.home.intro}</p>
        <Link
          href="/simulazione"
          className="mt-6 inline-flex min-h-11 items-center rounded-pill bg-primary px-6 py-3 font-semibold text-primary-foreground transition duration-200 hover:opacity-90 active:opacity-80 motion-safe:hover:scale-105 motion-safe:active:scale-95"
        >
          {t.home.heroCta}
        </Link>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">{t.home.sectionsTitle}</h2>
        <p className="mt-1 text-muted">{t.home.sectionsSubtitle}</p>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {sections.map((s, i) => (
            <Link
              key={s.href}
              href={s.href}
              style={{ animationDelay: `${i * 90}ms` }}
              className="group flex flex-col rounded-card border border-border bg-surface p-6 transition duration-200 hover:border-foreground/30 motion-safe:animate-fade-in-up motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-lg"
            >
              <h3 className="text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 flex-1 text-sm text-muted">{s.description}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-foreground">
                {s.cta}{" "}
                <span
                  aria-hidden="true"
                  className="transition-transform duration-200 motion-safe:group-hover:translate-x-1"
                >
                  →
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <footer className="mt-12 border-t border-border pt-6 text-xs text-muted">
        {t.home.footer}
      </footer>
    </main>
  );
}

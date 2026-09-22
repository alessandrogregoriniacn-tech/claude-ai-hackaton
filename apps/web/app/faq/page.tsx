"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { FaqSearchInput } from "@/components/FaqSearchInput";
import { useI18n } from "@/components/I18nProvider";
import { filterFaqGroups } from "@/lib/faqSearch";

/**
 * Apre automaticamente la voce collegata da un link tipo `/faq#id-domanda`
 * (es. dal popover informativo di uno strumento nel simulatore): senza questo
 * effetto il browser scrolla comunque all'elemento, ma l'<details> resta
 * chiuso e la risposta non è visibile. Gira solo al primo render, quindi resta
 * valido anche con la ricerca (che parte sempre vuota). Gli id delle voci
 * sono stabili tra le lingue: il deep-link funziona indipendentemente dalla
 * lingua selezionata.
 */
function useOpenFaqFromHash() {
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const target = document.getElementById(hash);
    if (target instanceof HTMLDetailsElement) {
      target.open = true;
      target.scrollIntoView({ block: "start" });
    }
  }, []);
}

export default function FaqPage() {
  const { t } = useI18n();
  useOpenFaqFromHash();

  const [query, setQuery] = useState("");
  const hasQuery = query.trim().length > 0;

  const { groups: visibleGroups, matchCount } = useMemo(
    () => filterFaqGroups(t.faq.groups, query),
    [query, t.faq.groups],
  );

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t.faq.title}</h1>
        <p className="mt-2 text-muted">{t.faq.subtitle}</p>
      </header>

      <FaqSearchInput
        value={query}
        onChange={setQuery}
        resultCount={matchCount}
        hasQuery={hasQuery}
      />

      {hasQuery && matchCount === 0 ? (
        <p className="rounded-card border border-border bg-surface p-6 text-muted">
          {t.faq.noResultsForQuery(query.trim())}
        </p>
      ) : (
        <div className="space-y-8">
          {visibleGroups.map((group) => (
            <section key={group.title} aria-labelledby={`faq-group-${group.title}`}>
              <h2
                id={`faq-group-${group.title}`}
                className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted"
              >
                {group.title}
              </h2>
              <div className="space-y-3">
                {group.items.map((item) => (
                  <details
                    key={item.id}
                    id={item.id}
                    className="group rounded-card border border-border bg-surface p-5 scroll-mt-6"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                      {item.q}
                      <span
                        aria-hidden
                        className="text-muted transition group-open:rotate-45"
                      >
                        +
                      </span>
                    </summary>
                    <p className="mt-3 text-muted">{item.a}</p>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <div className="mt-10 rounded-card bg-accent px-6 py-8 text-accent-foreground">
        <h2 className="text-lg font-semibold">{t.faq.ctaTitle}</h2>
        <p className="mt-1 text-sm">{t.faq.ctaBody}</p>
        <Link
          href="/simulazione"
          className="mt-4 inline-flex min-h-11 items-center rounded-pill bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:opacity-90 active:opacity-80"
        >
          {t.faq.ctaButton}
        </Link>
      </div>
    </main>
  );
}

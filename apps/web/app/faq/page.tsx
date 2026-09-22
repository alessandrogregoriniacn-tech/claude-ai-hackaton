"use client";

import Link from "next/link";
import { INSTRUMENT_RETURNS } from "@/lib/constants";
import { useI18n } from "@/components/I18nProvider";

export default function FaqPage() {
  const { t, fmtPercent } = useI18n();
  const faqs = t.faq.items({
    azionaria: fmtPercent(INSTRUMENT_RETURNS.azionaria),
    obbligazionaria: fmtPercent(INSTRUMENT_RETURNS.obbligazionaria),
    bitcoin: fmtPercent(INSTRUMENT_RETURNS.bitcoin),
  });

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t.faq.title}</h1>
        <p className="mt-2 text-muted">{t.faq.subtitle}</p>
      </header>

      <div className="space-y-3">
        {faqs.map((item) => (
          <details
            key={item.q}
            className="group rounded-card border border-border bg-surface p-5"
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

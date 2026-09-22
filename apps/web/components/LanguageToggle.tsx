"use client";

import { useI18n } from "./I18nProvider";
import type { Lang } from "@/lib/i18n/dictionaries";

/** Alterna la lingua dell'interfaccia tra italiano e inglese. */
export function LanguageToggle() {
  const { lang, setLang, t } = useI18n();
  const next: Lang = lang === "it" ? "en" : "it";
  const label = t.langToggle.switchTo(t.langToggle[next]);

  return (
    <button
      type="button"
      onClick={() => setLang(next)}
      aria-label={label}
      title={label}
      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-pill border border-border bg-surface text-sm font-semibold uppercase text-foreground transition hover:border-foreground/40"
    >
      <span aria-hidden="true">{lang}</span>
    </button>
  );
}

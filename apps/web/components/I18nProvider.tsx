"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { CURRENCY } from "@/lib/constants";
import {
  DEFAULT_LANG,
  DICTIONARIES,
  LOCALE_BY_LANG,
  MONTH_LABELS_BY_LANG,
  type Dict,
  type Lang,
} from "@/lib/i18n/dictionaries";
import { LANG_KEY, isLang } from "@/lib/i18n/config";

interface I18nValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  /** Dizionario della lingua corrente. */
  t: Dict;
  locale: string;
  fmtCurrency: (value: number, precise?: boolean) => string;
  fmtPercent: (value: number) => string;
  /** Formatta una data ISO "YYYY-MM-DD" secondo il locale corrente. */
  fmtDate: (iso: string) => string;
  /** "YYYY-MM" → etichetta breve del mese ("mar 2020" / "Mar 2020"). */
  formatMonthLabel: (month: string) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  // SSR e primo render client usano la lingua di default per non divergere
  // dall'HTML prerenderizzato; dopo il mount leggiamo la scelta reale.
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(LANG_KEY);
      if (isLang(stored)) {
        setLangState(stored);
        return;
      }
      const attr = document.documentElement.getAttribute("lang");
      if (isLang(attr)) setLangState(attr);
    } catch {
      // storage/DOM non disponibili: si resta sulla lingua di default.
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    document.documentElement.setAttribute("lang", next);
    try {
      window.localStorage.setItem(LANG_KEY, next);
    } catch {
      // storage non disponibile: la lingua resta valida solo per la sessione.
    }
  }, []);

  const value = useMemo<I18nValue>(() => {
    const locale = LOCALE_BY_LANG[lang];
    const currency = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: CURRENCY,
      maximumFractionDigits: 0,
    });
    const currencyPrecise = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: CURRENCY,
      maximumFractionDigits: 2,
    });
    const percent = new Intl.NumberFormat(locale, {
      style: "percent",
      maximumFractionDigits: 1,
    });
    const months = MONTH_LABELS_BY_LANG[lang];

    return {
      lang,
      setLang,
      t: DICTIONARIES[lang],
      locale,
      fmtCurrency: (v, precise = false) =>
        (precise ? currencyPrecise : currency).format(v),
      fmtPercent: (v) => percent.format(v),
      fmtDate: (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString(locale),
      formatMonthLabel: (month) => {
        const [y, m] = month.split("-");
        const idx = Number(m) - 1;
        if (!y || Number.isNaN(idx) || idx < 0 || idx > 11) return month;
        return `${months[idx]} ${y}`;
      },
    };
  }, [lang, setLang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n deve essere usato dentro <I18nProvider>");
  return ctx;
}

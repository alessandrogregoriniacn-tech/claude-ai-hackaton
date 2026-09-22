import { CURRENCY, LOCALE } from "./constants";

const currencyFmt = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: CURRENCY,
  maximumFractionDigits: 0,
});

const currencyFmtPrecise = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: CURRENCY,
  maximumFractionDigits: 2,
});

export function formatCurrency(value: number, precise = false): string {
  return (precise ? currencyFmtPrecise : currencyFmt).format(value);
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat(LOCALE, {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(value);
}

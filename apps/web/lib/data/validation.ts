import type { HistoricalSeries, IndexPoint } from "./types";

/** True se il valore è un numero finito (né NaN né ±Infinity). */
export function isFiniteNumber(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n);
}

/** True se la stringa è una data ISO `yyyy-mm-dd` sintatticamente e calendarialmente valida. */
export function isValidIsoDate(s: unknown): s is string {
  if (typeof s !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime());
}

/**
 * Costruisce una `HistoricalSeries` validata a partire da punti grezzi: guard
 * esplicito richiesto dal `finance-engine` prima di usare un dataset esterno
 * al codice (qui: array letterali generati da CSV), mai un cast non sicuro.
 *
 * Viene chiamata una sola volta, al module-load, sui dataset bundlati e già
 * validati in fase di generazione (`scripts/generate-series.mjs`): un errore
 * qui indica un bug nei dati bundlati, non un input utente, quindi un throw a
 * boot/build time è accettabile — non è mai raggiungibile da un input utente
 * a runtime (nessuna richiesta HTTP passa da questa funzione).
 */
export function buildHistoricalSeries(points: IndexPoint[], label: string): HistoricalSeries {
  if (!Array.isArray(points) || points.length === 0) {
    throw new Error(`[data:${label}] serie vuota o non valida`);
  }
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    if (!isValidIsoDate(p?.date)) {
      throw new Error(`[data:${label}] data non valida all'indice ${i}: ${String(p?.date)}`);
    }
    if (!isFiniteNumber(p.level) || p.level <= 0) {
      throw new Error(`[data:${label}] livello non valido all'indice ${i}: ${String(p.level)}`);
    }
    if (i > 0 && p.date <= points[i - 1].date) {
      throw new Error(`[data:${label}] date non strettamente crescenti all'indice ${i}`);
    }
  }
  return { points, startDate: points[0].date, endDate: points[points.length - 1].date };
}

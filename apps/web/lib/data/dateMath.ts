import type { HistoricalSeries } from "./types";

const MS_PER_DAY = 86_400_000;

/** Millisecondi epoch di una data ISO `yyyy-mm-dd`, sempre a mezzanotte UTC. */
function isoToEpochMs(iso: string): number {
  return new Date(`${iso}T00:00:00Z`).getTime();
}

/** Giorni (con decimali) tra due date ISO, `to - from`. */
export function diffDays(fromIso: string, toIso: string): number {
  return (isoToEpochMs(toIso) - isoToEpochMs(fromIso)) / MS_PER_DAY;
}

/** Clampa una data ISO nell'intervallo `[minIso, maxIso]` (confronto lessicografico, valido per ISO). */
export function clampIso(iso: string, minIso: string, maxIso: string): string {
  if (iso < minIso) return minIso;
  if (iso > maxIso) return maxIso;
  return iso;
}

/**
 * Livello interpolato di una serie storica a una data qualunque, con
 * interpolazione geometrica (log-lineare) tra i due punti che la racchiudono.
 *
 * Decisione di design (granularità miste): equivale ad assumere un tasso di
 * crescita costante nell'intervallo tra due osservazioni consecutive — l'unica
 * ipotesi ragionevole quando la cadenza del dataset sorgente (trimestrale per
 * l'azionario globale, annuale per obbligazionario/60-40/inflazione,
 * quindicinale per il libretto postale) è più larga della cadenza mensile con
 * cui il motore itera. Il Bitcoin, essendo giornaliero, ricade quasi sempre
 * nel ramo "punto esatto o intervallo di 1 giorno" e non ne risente.
 *
 * Richiede una data già clampata a `[series.startDate, series.endDate]`: non
 * clampa internamente, per restare una funzione di sola lettura del dato più
 * vicino disponibile (il clamp esplicito, con relativo avviso, è responsabilità
 * di chi chiama — vedi `growthFactor`).
 */
export function levelAt(series: HistoricalSeries, iso: string): number {
  const points = series.points;
  if (points.length === 1) return points[0].level;

  const idx = points.findIndex((p) => p.date >= iso);
  if (idx === -1) return points[points.length - 1].level;
  if (points[idx].date === iso) return points[idx].level;
  if (idx === 0) return points[0].level;

  const before = points[idx - 1];
  const after = points[idx];
  const totalDays = diffDays(before.date, after.date);
  if (totalDays <= 0) return before.level;
  const elapsedDays = diffDays(before.date, iso);
  const frac = elapsedDays / totalDays;
  return before.level * Math.pow(after.level / before.level, frac);
}

export interface GrowthFactorResult {
  /** Fattore moltiplicativo di crescita tra `effectiveStart` ed `effectiveEnd`. Sempre finito e > 0. */
  factor: number;
  /** True se la data di inizio richiesta era fuori dal range del dataset ed è stata clampata. */
  clampedStart: boolean;
  /** True se la data di fine richiesta era fuori dal range del dataset ed è stata clampata. */
  clampedEnd: boolean;
  effectiveStart: string;
  effectiveEnd: string;
}

/**
 * Fattore di crescita di una serie tra due date, clampando automaticamente
 * al range disponibile (mai un `throw`, mai un dato silenziosamente sbagliato:
 * il chiamante riceve sempre `clampedStart`/`clampedEnd` per generare un
 * avviso esplicito quando il clamp è avvenuto).
 */
export function growthFactor(series: HistoricalSeries, fromIso: string, toIso: string): GrowthFactorResult {
  const effectiveStart = clampIso(fromIso, series.startDate, series.endDate);
  const effectiveEnd = clampIso(toIso, series.startDate, series.endDate);
  const startLevel = levelAt(series, effectiveStart);
  const endLevel = levelAt(series, effectiveEnd);
  const rawFactor = startLevel > 0 ? endLevel / startLevel : 1;
  return {
    factor: Number.isFinite(rawFactor) && rawFactor > 0 ? rawFactor : 1,
    clampedStart: effectiveStart !== fromIso,
    clampedEnd: effectiveEnd !== toIso,
    effectiveStart,
    effectiveEnd,
  };
}

import { INFLATION_RATE, INSTRUMENT_RETURNS } from "./constants";

/** Cadenza della spesa periodica. */
export type Periodicity = "1w" | "2w" | "1m" | "3m" | "6m" | "12m";

/** Strumento su cui si ipotizza l'investimento. */
export type Instrument = "azionaria" | "obbligazionaria" | "bitcoin";

export interface SimulationInput {
  /** Capitale versato all'inizio, una tantum. */
  initialCapital: number;
  /** Importo della singola spesa/versamento ricorrente. */
  periodicAmount: number;
  /** Ogni quanto avviene il versamento. */
  periodicity: Periodicity;
  /** Data di inizio, formato ISO YYYY-MM-DD. */
  startDate: string;
  /** Data di fine, formato ISO YYYY-MM-DD. */
  endDate: string;
  /** Strumento scelto: determina il rendimento annuo nominale. */
  instrument: Instrument;
  /** Se true, i valori sono espressi in termini reali (al netto dell'inflazione). */
  adjustForInflation: boolean;
  /** Aliquota di tassazione finale sui guadagni, in percentuale (es. 26). */
  taxRate: number;
}

export interface MonthlyPoint {
  /** Etichetta del mese, formato YYYY-MM. */
  month: string;
  /** Totale versato fino a questo mese (senza rendimento). */
  contributed: number;
  /** Valore del capitale con rendimento composto (lordo tasse). */
  value: number;
}

export interface SimulationResult {
  /** Serie temporale mensile del capitale. */
  points: MonthlyPoint[];
  /** Totale effettivamente investito (capitale iniziale + versamenti). */
  totalInvested: number;
  /** Valore finale lordo, prima delle tasse. */
  grossFinalValue: number;
  /** Tasse pagate sui guadagni. */
  taxPaid: number;
  /** Valore finale al netto delle tasse. */
  finalValue: number;
  /** Guadagno netto (finalValue - totalInvested). */
  netGain: number;
  /** Numero di mesi coperti dalla simulazione. */
  months: number;
}

/** Quanti versamenti avvengono, in media, in un mese. */
const PAYMENTS_PER_MONTH: Record<Periodicity, number> = {
  "1w": 52 / 12,
  "2w": 26 / 12,
  "1m": 1,
  "3m": 1 / 3,
  "6m": 1 / 6,
  "12m": 1 / 12,
};

/** Converte un tasso annuo nel tasso mensile composto equivalente. */
export function monthlyRateFromAnnual(annualRate: number): number {
  return Math.pow(1 + annualRate, 1 / 12) - 1;
}

/** Numero intero di mesi tra due date (>= 0). */
export function monthsBetween(start: Date, end: Date): number {
  const years = end.getFullYear() - start.getFullYear();
  const months = end.getMonth() - start.getMonth();
  return Math.max(0, years * 12 + months);
}

function formatMonth(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

/**
 * Simula quanto si sarebbe accumulato investendo un capitale iniziale più una
 * spesa ricorrente nella finestra temporale indicata, applicando il rendimento
 * dello strumento scelto (con capitalizzazione mensile), opzionalmente al netto
 * dell'inflazione, e sottraendo la tassazione finale sui guadagni.
 */
export function simulate(input: SimulationInput): SimulationResult {
  const start = new Date(`${input.startDate}T00:00:00`);
  const end = new Date(`${input.endDate}T00:00:00`);
  const months = monthsBetween(start, end);

  // Guard: unknown instrument key (e.g. legacy scenario after a rename) falls
  // back to 0% annual return — no growth, no NaN, no exception to the UI.
  const nominalAnnual: number =
    Object.prototype.hasOwnProperty.call(INSTRUMENT_RETURNS, input.instrument) &&
    typeof (INSTRUMENT_RETURNS as Record<string, unknown>)[input.instrument] === "number"
      ? INSTRUMENT_RETURNS[input.instrument]
      : 0;

  // In termini reali il rendimento è "sgonfiato" dall'inflazione.
  const annualRate = input.adjustForInflation
    ? (1 + nominalAnnual) / (1 + INFLATION_RATE) - 1
    : nominalAnnual;

  const monthlyRate = monthlyRateFromAnnual(annualRate);
  // Negative periodicAmount is clamped to 0: withdrawals are not modelled.
  const monthlyContribution =
    Math.max(0, input.periodicAmount) * PAYMENTS_PER_MONTH[input.periodicity];

  // Negative initialCapital is clamped to 0: capital cannot be negative.
  const safeInitial = Math.max(0, input.initialCapital);

  const points: MonthlyPoint[] = [];
  let value = safeInitial;
  let contributed = safeInitial;

  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);

  // Punto iniziale (mese 0): solo il capitale iniziale.
  points.push({
    month: formatMonth(cursor),
    contributed: round2(contributed),
    value: round2(value),
  });
  cursor.setMonth(cursor.getMonth() + 1);

  for (let i = 1; i <= months; i++) {
    // Crescita del capitale già accumulato, poi il versamento del mese.
    value = value * (1 + monthlyRate) + monthlyContribution;
    contributed += monthlyContribution;

    points.push({
      month: formatMonth(cursor),
      contributed: round2(contributed),
      value: round2(value),
    });

    cursor.setMonth(cursor.getMonth() + 1);
  }

  const grossFinalValue = round2(value);
  const totalInvested = round2(contributed);
  const grossGain = grossFinalValue - totalInvested;
  // taxRate is clamped to [0, 100] so taxPaid never exceeds grossGain.
  const taxRate = Math.min(100, Math.max(0, input.taxRate)) / 100;
  const taxPaid = round2(grossGain > 0 ? grossGain * taxRate : 0);
  const finalValue = round2(grossFinalValue - taxPaid);

  return {
    points,
    totalInvested,
    grossFinalValue,
    taxPaid,
    finalValue,
    netGain: round2(finalValue - totalInvested),
    months,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

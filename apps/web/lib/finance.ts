import { ANNUAL_RETURN_RATE } from "./constants";

export type Frequency = "monthly" | "weekly" | "daily";

export interface SimulationInput {
  /** Importo del singolo versamento/spesa ricorrente. */
  amount: number;
  /** Ogni quanto avviene il versamento. */
  frequency: Frequency;
  /** Data di inizio (nel passato), formato ISO YYYY-MM-DD. */
  startDate: string;
  /** Data di fine (default: oggi), formato ISO YYYY-MM-DD. */
  endDate?: string;
  /** Rendimento annuo, default ANNUAL_RETURN_RATE. */
  annualRate?: number;
}

export interface MonthlyPoint {
  /** Etichetta del mese, formato YYYY-MM. */
  month: string;
  /** Totale versato fino a questo mese (senza rendimento). */
  contributed: number;
  /** Valore del capitale con rendimento composto. */
  value: number;
}

export interface SimulationResult {
  /** Serie temporale mensile del capitale. */
  points: MonthlyPoint[];
  /** Totale effettivamente versato. */
  totalContributed: number;
  /** Valore finale con rendimento. */
  finalValue: number;
  /** Guadagno generato dal rendimento (finalValue - totalContributed). */
  interestEarned: number;
  /** Numero di mesi coperti dalla simulazione. */
  months: number;
}

/** Quanti versamenti avvengono in un mese, in base alla frequenza. */
const PAYMENTS_PER_MONTH: Record<Frequency, number> = {
  monthly: 1,
  weekly: 52 / 12,
  daily: 365 / 12,
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
 * Simula, guardando al passato, quanto si sarebbe accumulato versando
 * `amount` con la cadenza indicata da `startDate` fino a `endDate`,
 * applicando un rendimento composto mensile.
 */
export function simulateRetrospective(input: SimulationInput): SimulationResult {
  const annualRate = input.annualRate ?? ANNUAL_RETURN_RATE;
  const start = new Date(`${input.startDate}T00:00:00`);
  const end = input.endDate ? new Date(`${input.endDate}T00:00:00`) : new Date();

  const months = monthsBetween(start, end);
  const monthlyRate = monthlyRateFromAnnual(annualRate);
  const monthlyContribution = input.amount * PAYMENTS_PER_MONTH[input.frequency];

  const points: MonthlyPoint[] = [];
  let value = 0;
  let contributed = 0;

  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);

  for (let i = 0; i <= months; i++) {
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

  const finalValue = round2(value);
  const totalContributed = round2(contributed);

  return {
    points,
    totalContributed,
    finalValue,
    interestEarned: round2(finalValue - totalContributed),
    months,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

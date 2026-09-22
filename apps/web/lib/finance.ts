import { INSTRUMENT_KEYS, type InstrumentKey } from "./constants";
import { growthFactor } from "./data/dateMath";
import { INFLATION_SERIES, INSTRUMENT_SERIES, resolveInstrument } from "./data/instrumentSeries";

/** Cadenza della spesa periodica. */
export type Periodicity = "1w" | "2w" | "1m" | "3m" | "6m" | "12m";

/** Strumento su cui si ipotizza l'investimento: vedi `constants.ts` per l'unica fonte di verità delle chiavi. */
export type Instrument = InstrumentKey;

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
  /** Strumento scelto: determina la serie storica di rendimento usata. */
  instrument: Instrument;
  /** Se true, i valori sono espressi in termini reali (al netto dell'inflazione storica). */
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

/**
 * Codice macchina di un avviso non bloccante: mai un fallimento silenzioso
 * quando l'input richiede un clamp o un fallback (vincolo `finance-engine`).
 */
export type SimulationWarningCode =
  | "invalidDateInput"
  | "invertedDateRange"
  | "timeWindowCappedForSafety"
  | "instrumentRangeClamped"
  | "inflationRangeClamped"
  | "negativeAmountClamped"
  | "unknownInstrumentFallback"
  | "unknownPeriodicityFallback"
  | "taxRateOutOfRangeClamped"
  | "valueOverflowClamped";

export interface SimulationWarning {
  code: SimulationWarningCode;
  /** Messaggio descrittivo in italiano (coerente con il resto della UI), sempre retrospettivo, mai prescrittivo. */
  message: string;
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
  /** Avvisi strutturati non bloccanti (clamp di date/valori, fallback strumento, ecc.). */
  warnings: SimulationWarning[];
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

const DEFAULT_PERIODICITY: Periodicity = "1m";

/**
 * Tetto di sicurezza sul numero di mesi simulati (100 anni): il motore resta
 * l'ultima rete di sicurezza contro finestre temporali assurde (es. un anno a
 * 4+ cifre fuori scala), non delega la protezione alla sola validazione UI.
 * Oltre il tetto, la finestra viene troncata e segnalata con un avviso.
 */
const MAX_MONTHS = 1200;

/** Ancora deterministica per date input non utilizzabili: mai `Date.now()` in una funzione pura. */
const EPOCH_ANCHOR = new Date(Date.UTC(1970, 0, 1));

/** Converte un tasso annuo nel tasso mensile composto equivalente (helper generico, usato anche nei test). */
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

/** Prima data del mese, in formato ISO `yyyy-mm-01`, per interrogare le serie storiche. */
function toIsoFirstOfMonth(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}-01`;
}

/** Parsa una data ISO in modo sicuro: `null` se non valida, mai un `Date` con tempo `NaN` che si propaga. */
function parseSafeDate(iso: unknown): Date | null {
  if (typeof iso !== "string" || iso.trim() === "") return null;
  const d = new Date(`${iso}T00:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Ultima rete di sicurezza sui numeri esposti all'esterno: mai `NaN`/`Infinity` in output. */
function finiteOr0(n: number): number {
  return Number.isFinite(n) ? n : 0;
}

/** Clampa un numero non negativo, gestendo anche `NaN`/`Infinity` in input, con avviso se ha dovuto correggere. */
function sanitizeNonNegative(value: unknown, warnings: SimulationWarning[], fieldLabel: string): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n < 0) {
    warnings.push({
      code: "negativeAmountClamped",
      message: `${fieldLabel} non valido o negativo: impostato a 0.`,
    });
    return 0;
  }
  return n;
}

/**
 * Simula quanto si sarebbe accumulato investendo un capitale iniziale più una
 * spesa ricorrente nella finestra temporale indicata, applicando il
 * rendimento storico reale dello strumento scelto (capitalizzazione mensile
 * derivata dalla serie storica effettiva, non un tasso ipotetico costante),
 * opzionalmente al netto dell'inflazione storica, e sottraendo la tassazione
 * finale sui guadagni.
 *
 * Funzione pura: nessun accesso a rete/DOM/localStorage/orologio di sistema.
 * Qualunque combinazione di input (anche assurda) produce un risultato
 * strutturato con eventuali avvisi in `warnings`, mai un'eccezione che risale
 * alla UI.
 */
export function simulate(input: SimulationInput): SimulationResult {
  try {
    return runSimulation(input);
  } catch {
    // Ultima rete di sicurezza: un errore interno inatteso non deve mai
    // risalire alla UI come eccezione non gestita.
    return {
      points: [],
      totalInvested: 0,
      grossFinalValue: 0,
      taxPaid: 0,
      finalValue: 0,
      netGain: 0,
      months: 0,
      warnings: [
        {
          code: "invalidDateInput",
          message: "Impossibile calcolare la simulazione con i dati forniti.",
        },
      ],
    };
  }
}

function runSimulation(input: SimulationInput): SimulationResult {
  const warnings: SimulationWarning[] = [];

  const { instrument, wasUnknown } = resolveInstrument(input.instrument);
  if (wasUnknown) {
    warnings.push({
      code: "unknownInstrumentFallback",
      message: "Lo strumento selezionato non è più disponibile: usato uno strumento predefinito al suo posto.",
    });
  }

  const periodicity: Periodicity =
    PAYMENTS_PER_MONTH[input.periodicity as Periodicity] !== undefined
      ? input.periodicity
      : (() => {
          warnings.push({
            code: "unknownPeriodicityFallback",
            message: "Cadenza dei versamenti non riconosciuta: usata la cadenza mensile.",
          });
          return DEFAULT_PERIODICITY;
        })();

  const startParsed = parseSafeDate(input.startDate);
  const endParsed = parseSafeDate(input.endDate);
  let invalidDates = false;
  if (!startParsed || !endParsed) {
    invalidDates = true;
    warnings.push({
      code: "invalidDateInput",
      message: "Data di inizio o fine non valida: nessun periodo simulato.",
    });
  }

  const start = startParsed ?? EPOCH_ANCHOR;
  let end = endParsed ?? EPOCH_ANCHOR;

  if (!invalidDates && end.getTime() < start.getTime()) {
    warnings.push({
      code: "invertedDateRange",
      message: "La data di fine precede quella di inizio: nessun periodo simulato.",
    });
    end = start;
  }

  let months = invalidDates ? 0 : monthsBetween(start, end);
  if (months > MAX_MONTHS) {
    months = MAX_MONTHS;
    warnings.push({
      code: "timeWindowCappedForSafety",
      message: `Finestra temporale troppo ampia: limitata a ${MAX_MONTHS / 12} anni.`,
    });
  }

  const initialCapital = sanitizeNonNegative(input.initialCapital, warnings, "Capitale iniziale");
  const periodicAmount = sanitizeNonNegative(input.periodicAmount, warnings, "Importo periodico");

  const rawTaxRate = typeof input.taxRate === "number" ? input.taxRate : Number(input.taxRate);
  let taxRatePct = Number.isFinite(rawTaxRate) ? rawTaxRate : 0;
  if (taxRatePct < 0 || taxRatePct > 100) {
    taxRatePct = Math.min(100, Math.max(0, taxRatePct));
    warnings.push({
      code: "taxRateOutOfRangeClamped",
      message: "Aliquota di tassazione fuori dall'intervallo 0-100%: corretta al limite più vicino.",
    });
  }

  const series = INSTRUMENT_SERIES[instrument];
  const monthlyContribution = periodicAmount * PAYMENTS_PER_MONTH[periodicity];

  const points: MonthlyPoint[] = [];
  let value = initialCapital;
  let contributed = initialCapital;
  let instrumentClamped = false;
  let inflationClamped = false;
  let overflowClamped = false;

  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);

  points.push({
    month: formatMonth(cursor),
    contributed: round2(finiteOr0(contributed)),
    value: round2(finiteOr0(value)),
  });
  cursor.setMonth(cursor.getMonth() + 1);

  for (let i = 1; i <= months; i++) {
    const monthStartDate = new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1);
    const monthStartIso = toIsoFirstOfMonth(monthStartDate);
    const monthEndIso = toIsoFirstOfMonth(cursor);

    const nominalGrowth = growthFactor(series, monthStartIso, monthEndIso);
    if (nominalGrowth.clampedStart || nominalGrowth.clampedEnd) instrumentClamped = true;

    let periodFactor = nominalGrowth.factor;
    if (input.adjustForInflation) {
      const inflationGrowth = growthFactor(INFLATION_SERIES, monthStartIso, monthEndIso);
      if (inflationGrowth.clampedStart || inflationGrowth.clampedEnd) inflationClamped = true;
      periodFactor = inflationGrowth.factor > 0 ? nominalGrowth.factor / inflationGrowth.factor : nominalGrowth.factor;
    }

    let nextValue = value * periodFactor + monthlyContribution;
    if (!Number.isFinite(nextValue)) {
      overflowClamped = true;
      nextValue = Number.MAX_SAFE_INTEGER;
    }
    value = nextValue;

    let nextContributed = contributed + monthlyContribution;
    if (!Number.isFinite(nextContributed)) {
      overflowClamped = true;
      nextContributed = Number.MAX_SAFE_INTEGER;
    }
    contributed = nextContributed;

    points.push({
      month: formatMonth(cursor),
      contributed: round2(finiteOr0(contributed)),
      value: round2(finiteOr0(value)),
    });

    cursor.setMonth(cursor.getMonth() + 1);
  }

  if (instrumentClamped) {
    warnings.push({
      code: "instrumentRangeClamped",
      message:
        "La finestra richiesta eccede i dati storici disponibili per lo strumento scelto: risultato calcolato sul periodo coperto.",
    });
  }
  if (inflationClamped) {
    warnings.push({
      code: "inflationRangeClamped",
      message:
        "La serie storica dell'inflazione non copre l'intero periodo richiesto: usato l'ultimo dato disponibile per il resto del periodo.",
    });
  }
  if (overflowClamped) {
    warnings.push({
      code: "valueOverflowClamped",
      message: "Alcuni valori intermedi hanno superato i limiti calcolabili e sono stati limitati.",
    });
  }

  const grossFinalValue = round2(finiteOr0(value));
  const totalInvested = round2(finiteOr0(contributed));
  const grossGain = grossFinalValue - totalInvested;
  const taxRate = taxRatePct / 100;
  const taxPaid = round2(finiteOr0(grossGain > 0 ? grossGain * taxRate : 0));
  const finalValue = round2(finiteOr0(grossFinalValue - taxPaid));

  return {
    points,
    totalInvested,
    grossFinalValue,
    taxPaid,
    finalValue,
    netGain: round2(finiteOr0(finalValue - totalInvested)),
    months,
    warnings,
  };
}

/** Elenco delle chiavi strumento valide, riesportato per comodità di chi consuma `finance.ts`. */
export { INSTRUMENT_KEYS };

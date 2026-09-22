import type { InstrumentKey } from "../constants";
import { INSTRUMENT_KEYS } from "../constants";
import { GLOBAL_EQUITY_POINTS } from "./series/globalEquitySeries";
import { GOV_BONDS_10Y_POINTS } from "./series/govBonds10ySeries";
import { BALANCED_60_40_POINTS } from "./series/balanced6040Series";
import { BITCOIN_POINTS } from "./series/bitcoinSeries";
import { POSTAL_SAVINGS_POINTS } from "./series/postalSavingsSeries";
import { INFLATION_INDEX_POINTS } from "./series/inflationSeries";
import { buildHistoricalSeries } from "./validation";
import type { HistoricalSeries } from "./types";

/**
 * Serie storiche per strumento, generate una sola volta al module-load da
 * array letterali bundlati (vedi `scripts/generate-series.mjs` e
 * `raw/README.md` per la provenienza e le trasformazioni applicate a ciascun
 * dataset grezzo). Validate con `buildHistoricalSeries`: un errore qui è un
 * bug nei dati bundlati, non un input utente.
 */
export const INSTRUMENT_SERIES: Record<InstrumentKey, HistoricalSeries> = {
  globalEquity: buildHistoricalSeries(GLOBAL_EQUITY_POINTS, "globalEquity"),
  govBonds10y: buildHistoricalSeries(GOV_BONDS_10Y_POINTS, "govBonds10y"),
  balanced6040: buildHistoricalSeries(BALANCED_60_40_POINTS, "balanced6040"),
  bitcoin: buildHistoricalSeries(BITCOIN_POINTS, "bitcoin"),
  postalSavings: buildHistoricalSeries(POSTAL_SAVINGS_POINTS, "postalSavings"),
};

/** Serie storica dell'indice inflazione (CPI USA), usata per l'aggiustamento reale opzionale. */
export const INFLATION_SERIES: HistoricalSeries = buildHistoricalSeries(INFLATION_INDEX_POINTS, "inflation");

/** True se la chiave è uno strumento realmente presente nel dataset corrente. */
export function isKnownInstrument(value: unknown): value is InstrumentKey {
  return typeof value === "string" && (INSTRUMENT_KEYS as readonly string[]).includes(value);
}

/**
 * Strumento di fallback usato quando uno scenario salvato referenzia una
 * chiave strumento non più presente nel dataset attuale (rinominata o
 * rimossa): mai un'eccezione, mai un caricamento bloccato — vedi checklist
 * `finance-engine` sul punto.
 */
export const FALLBACK_INSTRUMENT: InstrumentKey = "globalEquity";

/** Restituisce sempre una chiave strumento valida, con fallback esplicito se sconosciuta. */
export function resolveInstrument(value: unknown): { instrument: InstrumentKey; wasUnknown: boolean } {
  if (isKnownInstrument(value)) {
    return { instrument: value, wasUnknown: false };
  }
  return { instrument: FALLBACK_INSTRUMENT, wasUnknown: true };
}

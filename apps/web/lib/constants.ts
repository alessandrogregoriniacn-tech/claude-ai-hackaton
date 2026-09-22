/**
 * Configurazione globale del simulatore.
 * Nessuna chiamata API esterna: il rendimento annuo è una costante configurabile.
 */

/**
 * Rendimenti annui nominali ipotetici per tipo di strumento.
 * Valori illustrativi, non consigli di investimento.
 */
export const INSTRUMENT_RETURNS = {
  azionaria: 0.07,
  obbligazionaria: 0.03,
  bitcoin: 0.3,
} as const;

/** Tasso di inflazione annuo ipotetico, usato quando l'opzione è attiva. */
export const INFLATION_RATE = 0.02;

/** Valuta usata per la formattazione. */
export const CURRENCY = "EUR";
export const LOCALE = "it-IT";

/** Chiave usata per la persistenza in localStorage. */
export const STORAGE_KEY = "hagenton:scenarios:v2";

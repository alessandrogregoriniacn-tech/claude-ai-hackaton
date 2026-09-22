/**
 * Configurazione globale del simulatore.
 * Nessuna chiamata API esterna: il rendimento annuo è una costante configurabile.
 */

/** Rendimento annuo fisso usato per tutte le simulazioni (10% di default). */
export const ANNUAL_RETURN_RATE = 0.1;

/** Valuta usata per la formattazione. */
export const CURRENCY = "EUR";
export const LOCALE = "it-IT";

/** Chiave usata per la persistenza in localStorage. */
export const STORAGE_KEY = "hagenton:scenarios:v1";

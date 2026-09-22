/**
 * Configurazione globale del simulatore.
 * Nessuna chiamata API esterna: i rendimenti storici vengono da dataset
 * statici bundlati in `lib/data/` (vedi `lib/data/raw/README.md` per la
 * provenienza), mai da un tasso ipotetico fisso.
 */

/**
 * Unica fonte di verità per le chiavi strumento: condivisa tra i dataset
 * (`lib/data/instrumentSeries.ts`), `finance.ts` e — quando verrà aggiornata —
 * la select in UI. Mai stringhe libere duplicate altrove.
 */
export const INSTRUMENT_KEYS = [
  "globalEquity",
  "govBonds10y",
  "balanced6040",
  "bitcoin",
  "postalSavings",
] as const;

export type InstrumentKey = (typeof INSTRUMENT_KEYS)[number];

/**
 * Etichette italiane pensate per il consumo da parte della UI (select,
 * intestazioni risultati). Non sono ancora referenziate da nessun componente:
 * la UI attuale (`app/simulazione/page.tsx`, `app/storico/page.tsx`,
 * `app/faq/page.tsx`) usa ancora le vecchie chiavi a 3 strumenti e va
 * aggiornata separatamente (fuori ambito per questo agente).
 *
 * NB: "govBonds10y" è rappresentato dal Titolo di Stato USA a 10 anni, non dal
 * Bloomberg Global Aggregate Bond Index (indice proprietario, nessuna fonte
 * gratuita) — l'etichetta riflette questo: mai "Obbligazionario globale".
 */
export const INSTRUMENT_LABELS: Record<InstrumentKey, string> = {
  globalEquity: "Azionario globale",
  govBonds10y: "Titoli di Stato (10 anni)",
  balanced6040: "Bilanciato 60/40",
  bitcoin: "Bitcoin",
  postalSavings: "Libretto postale",
};

/** Valuta usata per la formattazione. */
export const CURRENCY = "EUR";
export const LOCALE = "it-IT";

/** Chiave usata per la persistenza in localStorage. */
export const STORAGE_KEY = "hagenton:scenarios:v2";

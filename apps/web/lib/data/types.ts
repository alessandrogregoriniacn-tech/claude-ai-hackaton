/**
 * Punto di una serie storica: livello di un indice (o prezzo/valore assimilabile
 * a un indice) a una certa data ISO (yyyy-mm-dd). Il valore assoluto non ha
 * significato univoco tra dataset diversi (alcuni partono da base 100, altri
 * sono un prezzo reale): l'unico uso corretto è il rapporto tra due livelli
 * della stessa serie (fattore di crescita), mai un confronto tra livelli di
 * serie diverse.
 */
export interface IndexPoint {
  date: string;
  level: number;
}

/**
 * Serie storica validata: punti ordinati cronologicamente in modo stretto,
 * con `startDate`/`endDate` che ne descrivono la copertura effettiva. Fuori da
 * questo intervallo il dataset non ha osservazioni: qualunque richiesta al di
 * fuori va clampata esplicitamente da chi consuma la serie.
 */
export interface HistoricalSeries {
  points: IndexPoint[];
  startDate: string;
  endDate: string;
}

import Fuse from "fuse.js";

export interface FaqItem {
  id: string;
  q: string;
  a: string;
  /**
   * Sinonimi/varianti che una persona potrebbe digitare al posto del testo
   * esatto della domanda o della risposta (es. "buoni italiani" per la voce
   * sui BOT). Non compaiono in UI: servono solo alla ricerca fuzzy.
   */
  keywords: readonly string[];
}

export interface FaqGroup {
  title: string;
  items: readonly FaqItem[];
}

export interface FilteredFaqGroup {
  title: string;
  items: FaqItem[];
}

export interface FaqSearchResult {
  groups: FilteredFaqGroup[];
  matchCount: number;
}

interface IndexedFaqItem extends FaqItem {
  groupTitle: string;
}

// Tollerante a errori di battitura/formulazioni diverse, senza restituire
// corrispondenze troppo lontane dalla query. Applicata solo a campi brevi e
// curati (parole chiave, domanda): su un campo lungo come la risposta, un
// confronto fuzzy a questa soglia troverebbe corrispondenze spurie quasi
// ovunque (qualunque parola di 5-6 lettere assomiglia a un frammento di un
// testo di centinaia di caratteri). La risposta viene invece cercata per
// contenimento letterale, non fuzzy (vedi `matchesAnswer`).
const FUZZY_KEYS = [
  { name: "keywords", weight: 2 },
  { name: "q", weight: 1 },
];

// Soglia più permissiva per la query intera (una frase più lunga è già di
// per sé più specifica, quindi meno soggetta a corrispondenze casuali) e più
// stretta per la ricerca parola per parola (una singola parola corta, es.
// "dati", trova altrimenti corrispondenze casuali per distanza di edit con
// parole non correlate, es. "risultati").
const FULL_QUERY_OPTIONS = { includeScore: true, ignoreLocation: true, threshold: 0.3, keys: FUZZY_KEYS };
const WORD_QUERY_OPTIONS = { includeScore: true, ignoreLocation: true, threshold: 0.2, keys: FUZZY_KEYS };

function buildIndex(groups: readonly FaqGroup[]): IndexedFaqItem[] {
  return groups.flatMap((group) =>
    group.items.map((item) => ({ ...item, groupTitle: group.title })),
  );
}

function normalize(text: string): string {
  return text.toLowerCase();
}

/** Contenimento letterale (case-insensitive) della query nel testo della risposta. */
function matchesAnswer(item: FaqItem, trimmedQuery: string): boolean {
  return normalize(item.a).includes(normalize(trimmedQuery));
}

/**
 * Filtra e riordina le FAQ in base a una ricerca fuzzy su domanda, risposta e
 * parole chiave di ciascuna voce. 100% locale (nessuna chiamata di rete):
 * gira interamente sui dati già presenti nella pagina.
 *
 * Con query vuota restituisce tutti i gruppi invariati, nell'ordine e con gli
 * elementi originali. Con query non vuota, ogni gruppo mantiene la propria
 * posizione ma conserva solo le voci che hanno trovato una corrispondenza,
 * ordinate dalla più pertinente; i gruppi senza alcuna corrispondenza vengono
 * omessi del tutto (sottotitolo incluso).
 */
export function filterFaqGroups(
  groups: readonly FaqGroup[],
  query: string,
): FaqSearchResult {
  const trimmed = query.trim();

  if (!trimmed) {
    return {
      groups: groups.map((group) => ({ title: group.title, items: [...group.items] })),
      matchCount: groups.reduce((sum, group) => sum + group.items.length, 0),
    };
  }

  const index = buildIndex(groups);
  const fuseFull = new Fuse(index, FULL_QUERY_OPTIONS);
  const fuseWord = new Fuse(index, WORD_QUERY_OPTIONS);

  // Fuzzy su domanda e parole chiave: sia con la query intera (utile quando
  // coincide con una parola chiave composta, es. "buoni italiani"), sia
  // parola per parola (copre una domanda con più termini sparsi che non
  // appaiono mai insieme in una singola parola chiave, es. "dati" + "privacy").
  // Letterale (non fuzzy) sulla risposta, per non introdurre corrispondenze
  // spurie su un campo lungo. Per ogni voce si tiene il punteggio migliore
  // (più basso) trovato tra tutte le ricerche; un match letterale sulla
  // risposta vale come il punteggio fuzzy migliore possibile (0).
  const bestScore = new Map<IndexedFaqItem, number>();
  const record = (results: { item: IndexedFaqItem; score?: number }[]) => {
    for (const { item, score } of results) {
      const current = score ?? 1;
      const previous = bestScore.get(item);
      if (previous === undefined || current < previous) {
        bestScore.set(item, current);
      }
    }
  };

  record(fuseFull.search(trimmed));
  for (const word of trimmed.split(/\s+/).filter((w) => w.length >= 3)) {
    record(fuseWord.search(word));
  }
  for (const item of index) {
    if (matchesAnswer(item, trimmed) && (bestScore.get(item) ?? 1) > 0) {
      bestScore.set(item, 0);
    }
  }

  const rankedItems = [...bestScore.entries()]
    .sort((a, b) => a[1] - b[1])
    .map(([item]) => item);

  const itemsByGroup = new Map<string, FaqItem[]>();
  for (const item of rankedItems) {
    const bucket = itemsByGroup.get(item.groupTitle) ?? [];
    bucket.push(item);
    itemsByGroup.set(item.groupTitle, bucket);
  }

  const filteredGroups = groups
    .map((group) => ({ title: group.title, items: itemsByGroup.get(group.title) ?? [] }))
    .filter((group) => group.items.length > 0);

  return { groups: filteredGroups, matchCount: rankedItems.length };
}

import type { Instrument, Periodicity } from "@/lib/finance";

/** Lingue supportate dall'interfaccia. */
export type Lang = "it" | "en";

export const LANGS: Lang[] = ["it", "en"];
export const DEFAULT_LANG: Lang = "it";

/** Locale BCP-47 per la formattazione di numeri, valuta e date. */
export const LOCALE_BY_LANG: Record<Lang, string> = {
  it: "it-IT",
  en: "en-IE",
};

/** Etichette brevi dei mesi per gli assi/tooltip dei grafici. */
export const MONTH_LABELS_BY_LANG: Record<Lang, string[]> = {
  it: [
    "gen",
    "feb",
    "mar",
    "apr",
    "mag",
    "giu",
    "lug",
    "ago",
    "set",
    "ott",
    "nov",
    "dic",
  ],
  en: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],
};

const it = {
  nav: {
    ariaLabel: "Navigazione principale",
    links: {
      home: "Home",
      simulazione: "Simulazione",
      storico: "Storico",
      confronta: "Confronta",
      faq: "FAQ",
    },
    openMenu: "Apri il menu",
    closeMenu: "Chiudi il menu",
  },
  themeToggle: {
    toLight: "Passa al tema chiaro",
    toDark: "Passa al tema scuro",
  },
  langToggle: {
    label: "Cambia lingua",
    switchTo: (l: string) => `Passa a ${l}`,
    it: "Italiano",
    en: "Inglese",
  },
  instruments: {
    azionaria: "Azionaria",
    obbligazionaria: "Obbligazionaria",
    bitcoin: "Bitcoin",
  } as Record<Instrument, string>,
  /** Etichetta breve per le opzioni della select ("1 settimana"). */
  periodicityShort: {
    "1w": "1 settimana",
    "2w": "2 settimane",
    "1m": "1 mese",
    "3m": "3 mesi",
    "6m": "6 mesi",
    "12m": "12 mesi",
  } as Record<Periodicity, string>,
  /** Etichetta discorsiva per i riepiloghi ("ogni settimana"). */
  periodicityEvery: {
    "1w": "ogni settimana",
    "2w": "ogni 2 settimane",
    "1m": "ogni mese",
    "3m": "ogni 3 mesi",
    "6m": "ogni 6 mesi",
    "12m": "ogni 12 mesi",
  } as Record<Periodicity, string>,
  home: {
    eyebrow: "Hagenton",
    title: "Quanto avresti risparmiato?",
    intro:
      "Hagenton è un simulatore retrospettivo: invece di promettere guadagni futuri, guarda al passato. Mostra quanto si sarebbe accumulato oggi se una piccola somma periodica — un abbonamento, un acquisto ricorrente — fosse stata messa da parte e investita in uno strumento a scelta.",
    heroCta: "Prova una simulazione",
    sectionsTitle: "Le sezioni dell'app",
    sectionsSubtitle:
      "Tre spazi, un unico obiettivo: rendere tangibile il costo delle piccole spese nel tempo.",
    cards: {
      simulazione: {
        title: "Simulazione",
        description:
          "Inserisci un capitale iniziale, una spesa ricorrente e un periodo: scopri quanto avresti accumulato investendo nello strumento scelto.",
        cta: "Avvia una simulazione",
      },
      storico: {
        title: "Storico",
        description:
          "Ritrova gli scenari che hai salvato, confronta i risultati e riaprili nel simulatore per modificarli. Tutto resta salvato solo nel tuo browser.",
        cta: "Vedi lo storico",
      },
      faq: {
        title: "FAQ",
        description:
          "Come funziona il calcolo? Da dove viene il rendimento? I miei dati sono al sicuro? Le risposte alle domande più comuni.",
        cta: "Leggi le FAQ",
      },
    },
    footer:
      "Simulazione a scopo illustrativo. Rendimenti annui ipotetici con capitalizzazione mensile. Nessun dato lascia il tuo browser: gli scenari sono salvati in locale.",
  },
  sim: {
    title: "Quanto avresti risparmiato",
    subtitle:
      "Imposta un capitale iniziale, una spesa ricorrente e un periodo: scopri quanto avresti accumulato investendo nello strumento scelto, con capitalizzazione mensile (i guadagni si sommano al capitale ogni mese).",
    summaryEmpty: "Compila i parametri per vedere la simulazione.",
    summaryNetInflation: "al netto dell'inflazione",
    summary: (
      label: string,
      instrument: string,
      years: string,
      inflation: boolean,
    ) =>
      `${label} · ${instrument} · ${years} anni${inflation ? " · al netto dell'inflazione" : ""}`,
    paramsTitle: "Parametri della simulazione",
    fields: {
      label: "Nome scenario",
      labelPlaceholder: "Es. Piano azionario",
      initialCapital: "Capitale iniziale (€)",
      periodicAmount: "Spesa periodica (€)",
      periodicity: "Periodicità",
      startDate: "Periodo — dal",
      endDate: "Periodo — al",
      instrument: "Strumento",
      taxRate: "Tassazione finale (%)",
      inflation: "Tieni conto dell'inflazione",
      selectPlaceholder: "Seleziona…",
    },
    buttons: {
      calculate: "Calcola simulazione",
      update: "Aggiorna scenario",
      saveAsNew: "Salva come nuovo",
      save: "Salva scenario",
    },
    defaultName: "Scenario",
    defaultNameUnnamed: "Scenario senza nome",
    savedUpdated: "Aggiornato!",
    savedNew: "Salvato!",
    savedBodyUpdated: (name: string) => `Lo scenario «${name}» è aggiornato nel tuo`,
    savedBodyNew: (name: string) => `Lo scenario «${name}» è ora nel tuo`,
    savedHistoryLink: "Storico",
    savedBodyTail: ": puoi riaprirlo e confrontarlo quando vuoi.",
    helperCalc: "«Calcola simulazione» aggiorna i risultati qui sotto.",
    helperLoaded:
      "«Aggiorna scenario» sovrascrive quello aperto; «Salva come nuovo» ne crea una copia.",
    helperNew: "«Salva scenario» lo conserva nello storico (solo nel tuo browser).",
    stat: {
      today: "Avresti oggi",
      invested: "Totale investito",
      netGain: "Guadagno netto",
      taxHint: (tax: string) => `dopo ${tax} di tasse`,
    },
    comparePrompt:
      "Vuoi vedere come si comporta rispetto a un altro scenario salvato?",
    compareCta: "Confronta simulazioni",
    footer:
      "Simulazione a scopo illustrativo. I rendimenti degli strumenti sono ipotesi fisse con capitalizzazione mensile e non costituiscono un consiglio di investimento. Nessun dato lascia il tuo browser: gli scenari sono salvati in locale.",
  },
  storico: {
    title: "Storico simulazioni",
    subtitle:
      "Gli scenari che hai salvato dal simulatore. Sono conservati solo nel tuo browser: nessun dato viene inviato online.",
    clearAll: "Svuota storico",
    exportExcel: "Scarica Excel",
    empty: {
      title: "Nessuno scenario salvato",
      body: "Vai al simulatore, imposta una spesa ricorrente e premi «Salva scenario»: lo ritroverai qui.",
      cta: "Vai al simulatore",
    },
    selectAll: "Seleziona tutti",
    selectRow: (name: string) => `Seleziona lo scenario ${name}`,
    selectedCount: (n: number) =>
      n === 1 ? "1 scenario selezionato" : `${n} scenari selezionati`,
    deleteSelected: "Elimina selezionati",
    row: {
      summary: (
        instrument: string,
        amount: string,
        every: string,
        from: string,
        to: string,
      ) => `${instrument} · ${amount} ${every} · dal ${from} al ${to}`,
      open: "Apri",
      delete: "Elimina",
    },
    pagination: {
      navLabel: "Navigazione pagine",
      status: (page: number, pages: number) => `Pagina ${page} di ${pages}`,
      prev: "Pagina precedente",
      next: "Pagina successiva",
    },
  },
  confronta: {
    title: "Confronta simulazioni",
    subtitle:
      "Metti a confronto due scenari salvati: parametri affiancati e curve sovrapposte, ciascuna con il suo colore, per leggere a colpo d'occhio come sarebbero cresciuti nel tempo.",
    empty: {
      title: "Servono almeno due scenari salvati",
      body: "Salva più simulazioni dal simulatore, poi torna qui per confrontarle.",
      ctaSim: "Vai al simulatore",
      ctaHistory: "Vedi lo storico",
    },
    first: "Prima simulazione",
    second: "Seconda simulazione",
    selectPlaceholder: "Seleziona…",
    card: {
      instrument: "Strumento",
      initialCapital: "Capitale iniziale",
      periodicAmount: "Spesa periodica",
      period: "Periodo",
      inflation: "Inflazione",
      inflationYes: "Considerata",
      inflationNo: "Non considerata",
      taxRate: "Tassazione finale",
    },
    table: {
      result: "Risultato",
      today: "Avresti oggi",
      invested: "Totale investito",
      netGain: "Guadagno netto",
    },
    hintSelectTwo:
      "Seleziona due simulazioni per vedere i parametri affiancati e le curve a confronto.",
    footer:
      "Confronto a scopo illustrativo tra scenari storici ipotetici: i numeri descrivono cosa sarebbe successo con questi dati, non sono un consiglio di investimento né un'indicazione su cosa scegliere.",
  },
  faq: {
    title: "Domande frequenti",
    subtitle:
      "Come funziona Hagenton, da dove viene il rendimento e cosa succede ai tuoi dati.",
    items: (returns: {
      azionaria: string;
      obbligazionaria: string;
      bitcoin: string;
    }) => [
      {
        q: "Che cos'è Hagenton?",
        a: "È un simulatore retrospettivo di risparmio. Prende un capitale iniziale e una spesa ricorrente e ti mostra quanto avresti accumulato oggi se, invece di spenderli, li avessi investiti nello strumento scelto.",
      },
      {
        q: "Come viene calcolato il risultato?",
        a: `Il capitale iniziale e ogni versamento crescono mese per mese con capitalizzazione mensile (ogni mese i guadagni si sommano al capitale e producono a loro volta rendimento nei mesi successivi), secondo il tasso annuo ipotetico dello strumento scelto: Azionaria ${returns.azionaria}, Obbligazionaria ${returns.obbligazionaria}, Bitcoin ${returns.bitcoin}. All'importo finale si sottrae l'eventuale tassazione sui guadagni.`,
      },
      {
        q: "Cosa cambia con inflazione e tassazione?",
        a: "Se attivi «Tieni conto dell'inflazione», i valori vengono espressi in termini reali, cioè a parità di potere d'acquisto con oggi. La «Tassazione finale» applica l'aliquota selezionata (la percentuale di imposta) ai soli guadagni: il risultato mostra il valore al netto delle imposte.",
      },
      {
        q: "Il rendimento è realistico?",
        a: "Sono ipotesi illustrative e costanti, utili per rendere tangibile l'effetto del tempo. I mercati reali non offrono rendimenti fissi e garantiti: i risultati non sono una previsione né un consiglio finanziario.",
      },
      {
        q: "I miei dati sono al sicuro?",
        a: "Sì: Hagenton non fa alcuna chiamata di rete. Gli scenari che salvi restano esclusivamente nella memoria locale del tuo browser (localStorage) e non lasciano mai il tuo dispositivo.",
      },
      {
        q: "Dove ritrovo gli scenari salvati?",
        a: "Nella sezione Storico. Da lì puoi riaprirli nel simulatore per modificarli oppure eliminarli.",
      },
      {
        q: "Perché «retrospettivo» e non una proiezione futura?",
        a: "Guardare al passato rende il costo delle piccole spese più concreto: «quanto avrei già oggi» colpisce più di una promessa sul futuro. È un cambio di prospettiva, non uno strumento di investimento.",
      },
    ],
    ctaTitle: "Inizia una simulazione",
    ctaBody: "Bastano un importo e un periodo per vedere l'effetto del tempo.",
    ctaButton: "Vai al simulatore",
  },
  chart: {
    empty: "Imposta i parametri per vedere la crescita nel tempo.",
    emptyCompare: "Seleziona due simulazioni per vedere le curve a confronto.",
    ariaGrowth: "Crescita del capitale nel tempo",
    ariaCompare: (labels: string) =>
      `Confronto della crescita nel tempo tra ${labels}`,
    compareJoin: " e ",
    panBack: "Scorri indietro nel tempo",
    panForward: "Scorri avanti nel tempo",
    zoomIn: "Ingrandisci il periodo",
    zoomOut: "Riduci lo zoom",
    reset: "Reset",
    fullscreen: "Schermo intero",
    fullscreenClose: "Chiudi",
    fullscreenCloseAria: "Chiudi la vista a schermo intero",
    fullscreenOpenAria: "Apri a schermo intero",
    fullscreenDialogAria: "Grafico della crescita a schermo intero",
    withReturn: "Con rendimento",
    onlyContributed: "Solo versato",
    dragHint: "Trascina per scorrere · rotellina per zoomare",
  },
  excel: {
    fileName: "hagenton-storico",
    sheetName: "Simulazioni",
    title: "Hagenton — Storico simulazioni",
    generatedAt: (date: string) => `Esportato il ${date}`,
    columns: {
      name: "Nome scenario",
      instrument: "Strumento",
      initialCapital: "Capitale iniziale",
      periodicAmount: "Spesa periodica",
      periodicity: "Periodicità",
      startDate: "Data inizio",
      endDate: "Data fine",
      inflation: "Inflazione",
      taxRate: "Tassazione finale",
      invested: "Totale investito",
      finalValue: "Valore finale",
      netGain: "Guadagno netto",
    },
    yes: "Sì",
    no: "No",
  },
};

/** Tipo del dizionario: la versione inglese deve combaciare struttura per struttura. */
export type Dict = typeof it;

const en: Dict = {
  nav: {
    ariaLabel: "Main navigation",
    links: {
      home: "Home",
      simulazione: "Simulation",
      storico: "History",
      confronta: "Compare",
      faq: "FAQ",
    },
    openMenu: "Open menu",
    closeMenu: "Close menu",
  },
  themeToggle: {
    toLight: "Switch to light theme",
    toDark: "Switch to dark theme",
  },
  langToggle: {
    label: "Change language",
    switchTo: (l: string) => `Switch to ${l}`,
    it: "Italian",
    en: "English",
  },
  instruments: {
    azionaria: "Equity",
    obbligazionaria: "Bonds",
    bitcoin: "Bitcoin",
  },
  periodicityShort: {
    "1w": "1 week",
    "2w": "2 weeks",
    "1m": "1 month",
    "3m": "3 months",
    "6m": "6 months",
    "12m": "12 months",
  },
  periodicityEvery: {
    "1w": "every week",
    "2w": "every 2 weeks",
    "1m": "every month",
    "3m": "every 3 months",
    "6m": "every 6 months",
    "12m": "every 12 months",
  },
  home: {
    eyebrow: "Hagenton",
    title: "How much would you have saved?",
    intro:
      "Hagenton is a retrospective simulator: instead of promising future gains, it looks to the past. It shows how much you would have today if a small recurring amount — a subscription, a repeat purchase — had been set aside and invested in an instrument of your choice.",
    heroCta: "Try a simulation",
    sectionsTitle: "The app sections",
    sectionsSubtitle:
      "Three spaces, one goal: making the cost of small expenses over time tangible.",
    cards: {
      simulazione: {
        title: "Simulation",
        description:
          "Enter an initial capital, a recurring expense and a period: discover how much you would have accumulated by investing in the chosen instrument.",
        cta: "Start a simulation",
      },
      storico: {
        title: "History",
        description:
          "Find the scenarios you saved, compare the results and reopen them in the simulator to edit them. Everything stays saved in your browser only.",
        cta: "See the history",
      },
      faq: {
        title: "FAQ",
        description:
          "How is the calculation done? Where does the return come from? Is my data safe? Answers to the most common questions.",
        cta: "Read the FAQ",
      },
    },
    footer:
      "Illustrative simulation. Hypothetical annual returns with monthly compounding. No data leaves your browser: scenarios are saved locally.",
  },
  sim: {
    title: "How much would you have saved",
    subtitle:
      "Set an initial capital, a recurring expense and a period: discover how much you would have accumulated by investing in the chosen instrument, with monthly compounding (gains add to the capital every month).",
    summaryEmpty: "Fill in the parameters to see the simulation.",
    summaryNetInflation: "adjusted for inflation",
    summary: (
      label: string,
      instrument: string,
      years: string,
      inflation: boolean,
    ) =>
      `${label} · ${instrument} · ${years} years${inflation ? " · adjusted for inflation" : ""}`,
    paramsTitle: "Simulation parameters",
    fields: {
      label: "Scenario name",
      labelPlaceholder: "E.g. Equity plan",
      initialCapital: "Initial capital (€)",
      periodicAmount: "Recurring expense (€)",
      periodicity: "Frequency",
      startDate: "Period — from",
      endDate: "Period — to",
      instrument: "Instrument",
      taxRate: "Final taxation (%)",
      inflation: "Account for inflation",
      selectPlaceholder: "Select…",
    },
    buttons: {
      calculate: "Run simulation",
      update: "Update scenario",
      saveAsNew: "Save as new",
      save: "Save scenario",
    },
    defaultName: "Scenario",
    defaultNameUnnamed: "Untitled scenario",
    savedUpdated: "Updated!",
    savedNew: "Saved!",
    savedBodyUpdated: (name: string) => `The scenario “${name}” is updated in your`,
    savedBodyNew: (name: string) => `The scenario “${name}” is now in your`,
    savedHistoryLink: "History",
    savedBodyTail: ": you can reopen and compare it whenever you like.",
    helperCalc: "“Run simulation” updates the results below.",
    helperLoaded:
      "“Update scenario” overwrites the open one; “Save as new” creates a copy.",
    helperNew: "“Save scenario” keeps it in the history (in your browser only).",
    stat: {
      today: "You'd have today",
      invested: "Total invested",
      netGain: "Net gain",
      taxHint: (tax: string) => `after ${tax} in taxes`,
    },
    comparePrompt: "Want to see how it behaves against another saved scenario?",
    compareCta: "Compare simulations",
    footer:
      "Illustrative simulation. Instrument returns are fixed assumptions with monthly compounding and do not constitute investment advice. No data leaves your browser: scenarios are saved locally.",
  },
  storico: {
    title: "Simulation history",
    subtitle:
      "The scenarios you saved from the simulator. They are kept in your browser only: no data is sent online.",
    clearAll: "Clear history",
    exportExcel: "Download Excel",
    empty: {
      title: "No saved scenario",
      body: "Go to the simulator, set a recurring expense and press “Save scenario”: you'll find it here.",
      cta: "Go to the simulator",
    },
    selectAll: "Select all",
    selectRow: (name: string) => `Select scenario ${name}`,
    selectedCount: (n: number) =>
      n === 1 ? "1 scenario selected" : `${n} scenarios selected`,
    deleteSelected: "Delete selected",
    row: {
      summary: (
        instrument: string,
        amount: string,
        every: string,
        from: string,
        to: string,
      ) => `${instrument} · ${amount} ${every} · from ${from} to ${to}`,
      open: "Open",
      delete: "Delete",
    },
    pagination: {
      navLabel: "Page navigation",
      status: (page: number, pages: number) => `Page ${page} of ${pages}`,
      prev: "Previous page",
      next: "Next page",
    },
  },
  confronta: {
    title: "Compare simulations",
    subtitle:
      "Compare two saved scenarios: parameters side by side and overlaid curves, each with its own colour, to read at a glance how they would have grown over time.",
    empty: {
      title: "You need at least two saved scenarios",
      body: "Save more simulations from the simulator, then come back here to compare them.",
      ctaSim: "Go to the simulator",
      ctaHistory: "See the history",
    },
    first: "First simulation",
    second: "Second simulation",
    selectPlaceholder: "Select…",
    card: {
      instrument: "Instrument",
      initialCapital: "Initial capital",
      periodicAmount: "Recurring expense",
      period: "Period",
      inflation: "Inflation",
      inflationYes: "Accounted for",
      inflationNo: "Not accounted for",
      taxRate: "Final taxation",
    },
    table: {
      result: "Result",
      today: "You'd have today",
      invested: "Total invested",
      netGain: "Net gain",
    },
    hintSelectTwo:
      "Select two simulations to see the parameters side by side and the curves compared.",
    footer:
      "Illustrative comparison between hypothetical historical scenarios: the numbers describe what would have happened with this data, they are not investment advice nor an indication of what to choose.",
  },
  faq: {
    title: "Frequently asked questions",
    subtitle:
      "How Hagenton works, where the return comes from and what happens to your data.",
    items: (returns: {
      azionaria: string;
      obbligazionaria: string;
      bitcoin: string;
    }) => [
      {
        q: "What is Hagenton?",
        a: "It's a retrospective savings simulator. It takes an initial capital and a recurring expense and shows how much you would have today if, instead of spending them, you had invested them in the chosen instrument.",
      },
      {
        q: "How is the result calculated?",
        a: `The initial capital and every contribution grow month by month with monthly compounding (each month the gains add to the capital and in turn produce a return in the following months), according to the hypothetical annual rate of the chosen instrument: Equity ${returns.azionaria}, Bonds ${returns.obbligazionaria}, Bitcoin ${returns.bitcoin}. Any taxation on gains is subtracted from the final amount.`,
      },
      {
        q: "What changes with inflation and taxation?",
        a: "If you enable “Account for inflation”, values are expressed in real terms, i.e. at the same purchasing power as today. “Final taxation” applies the selected rate (the tax percentage) to gains only: the result shows the after-tax value.",
      },
      {
        q: "Is the return realistic?",
        a: "They are illustrative, constant assumptions, useful to make the effect of time tangible. Real markets do not offer fixed, guaranteed returns: the results are neither a forecast nor financial advice.",
      },
      {
        q: "Is my data safe?",
        a: "Yes: Hagenton makes no network calls. The scenarios you save stay exclusively in your browser's local storage (localStorage) and never leave your device.",
      },
      {
        q: "Where do I find the saved scenarios?",
        a: "In the History section. From there you can reopen them in the simulator to edit them or delete them.",
      },
      {
        q: "Why “retrospective” and not a future projection?",
        a: "Looking to the past makes the cost of small expenses more concrete: “how much I'd already have today” hits harder than a promise about the future. It's a change of perspective, not an investment tool.",
      },
    ],
    ctaTitle: "Start a simulation",
    ctaBody: "An amount and a period are all it takes to see the effect of time.",
    ctaButton: "Go to the simulator",
  },
  chart: {
    empty: "Set the parameters to see the growth over time.",
    emptyCompare: "Select two simulations to see the curves compared.",
    ariaGrowth: "Capital growth over time",
    ariaCompare: (labels: string) => `Comparison of growth over time between ${labels}`,
    compareJoin: " and ",
    panBack: "Scroll back in time",
    panForward: "Scroll forward in time",
    zoomIn: "Zoom into the period",
    zoomOut: "Zoom out",
    reset: "Reset",
    fullscreen: "Fullscreen",
    fullscreenClose: "Close",
    fullscreenCloseAria: "Close the fullscreen view",
    fullscreenOpenAria: "Open fullscreen",
    fullscreenDialogAria: "Fullscreen growth chart",
    withReturn: "With return",
    onlyContributed: "Contributed only",
    dragHint: "Drag to scroll · scroll wheel to zoom",
  },
  excel: {
    fileName: "hagenton-history",
    sheetName: "Simulations",
    title: "Hagenton — Simulation history",
    generatedAt: (date: string) => `Exported on ${date}`,
    columns: {
      name: "Scenario name",
      instrument: "Instrument",
      initialCapital: "Initial capital",
      periodicAmount: "Recurring expense",
      periodicity: "Frequency",
      startDate: "Start date",
      endDate: "End date",
      inflation: "Inflation",
      taxRate: "Final taxation",
      invested: "Total invested",
      finalValue: "Final value",
      netGain: "Net gain",
    },
    yes: "Yes",
    no: "No",
  },
};

export const DICTIONARIES: Record<Lang, Dict> = { it, en };

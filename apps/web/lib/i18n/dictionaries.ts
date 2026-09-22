import type {
  Instrument,
  Periodicity,
  SimulationWarningCode,
  SimulationWarningParams,
} from "@/lib/finance";
import type { FaqGroup } from "@/lib/faqSearch";

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
    globalEquity: "Azionario globale",
    govBonds10y: "Titoli di Stato (10 anni)",
    balanced6040: "Bilanciato 60/40",
    bitcoin: "Bitcoin",
    postalSavings: "Libretto postale",
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
      taxHint:
        "Aliquota standard in Italia: 26% (12,5% per titoli di Stato come BOT/BTP). Puoi comunque inserire un valore diverso.",
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
      "Simulazione a scopo illustrativo, calcolata sull'andamento storico reale dello strumento scelto: non costituisce un consiglio di investimento. Nessun dato lascia il tuo browser: gli scenari sono salvati in locale.",
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
    instrumentUnavailable: "Strumento non più disponibile",
    row: {
      details: (amount: string, every: string, from: string, to: string) =>
        `${amount} ${every} · dal ${from} al ${to}`,
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
      "Come funziona Hagenton, da dove vengono i dati storici usati per ogni strumento e cosa succede ai dati inseriti.",
    groups: <FaqGroup[]>[
      {
        title: "In generale",
        items: [
          {
            id: "cosa-e-hagenton",
            q: "Che cos'è Hagenton?",
            a: "È un simulatore retrospettivo di risparmio. Prende un capitale iniziale e una spesa ricorrente e mostra quanto si sarebbe accumulato oggi se, invece di spenderli, fossero stati investiti nello strumento scelto.",
            keywords: [
              "hagenton",
              "cos'è hagenton",
              "a cosa serve l'app",
              "simulatore di risparmio",
              "come funziona l'app",
            ],
          },
          {
            id: "come-viene-calcolato",
            q: "Come viene calcolato il risultato?",
            a: "Il capitale iniziale e ogni versamento crescono mese per mese secondo l'andamento storico reale dello strumento scelto (dati di mercato effettivi, non un tasso ipotetico fisso uguale per tutti gli strumenti). Al valore finale si sottrae l'eventuale tassazione sui guadagni.",
            keywords: [
              "come funziona il calcolo",
              "formula",
              "metodo di calcolo",
              "come si calcola il risultato",
              "dati di mercato",
              "andamento storico",
            ],
          },
          {
            id: "inflazione-e-tassazione",
            q: "Cosa cambia con inflazione e tassazione?",
            a: "Attivando «Tieni conto dell'inflazione», i valori vengono espressi in termini reali: a parità di potere d'acquisto con oggi, cioè al netto della perdita di valore della moneta nel tempo. Con inflazione disattivata i valori restano in termini nominali, cioè agli importi effettivi di ogni anno, senza questa correzione. La «Tassazione finale» applica l'aliquota scelta ai soli guadagni, mai al capitale versato: il risultato mostra il valore al netto delle imposte.",
            keywords: [
              "inflazione",
              "tassazione",
              "potere d'acquisto",
              "valori reali",
              "valori nominali",
              "tasse sui guadagni",
            ],
          },
          {
            id: "rendimento-realistico",
            q: "Il rendimento è realistico?",
            a: "I calcoli usano serie storiche reali (indici azionari, titoli di Stato, Bitcoin, tassi di riferimento) per il periodo scelto, non un rendimento medio inventato: per questo il risultato cambia a seconda della finestra temporale selezionata, proprio come sarebbe successo davvero. Restano comunque dati passati: i mercati reali non offrono rendimenti garantiti, e i risultati non sono una previsione né un consiglio finanziario.",
            keywords: [
              "rendimento realistico",
              "dati reali",
              "serie storiche",
              "rendimento medio",
              "previsione",
              "affidabilità dei dati",
            ],
          },
          {
            id: "perche-retrospettivo",
            q: "Perché «retrospettivo» e non una proiezione futura?",
            a: "Guardare al passato rende il costo delle piccole spese più concreto: «quanto si avrebbe già oggi» colpisce più di una promessa sul futuro. È un cambio di prospettiva, non uno strumento di investimento: Hagenton non indica cosa fare in futuro, né quale strumento scegliere.",
            keywords: [
              "retrospettivo",
              "perché guardare al passato",
              "proiezione futura",
              "previsione futura",
              "cambio di prospettiva",
            ],
          },
        ],
      },
      {
        title: "Gli strumenti e i dati storici",
        items: [
          {
            id: "strumenti-disponibili",
            q: "Quali strumenti posso scegliere e cosa rappresentano?",
            a: "Cinque strumenti, ognuno basato su una serie storica reale: «Azionario globale» (indice MSCI World, mercati sviluppati in oltre 20 paesi), «Titoli di Stato (10 anni)» (titoli di Stato statunitensi a 10 anni), «Bilanciato 60/40» (un mix simulato: 60% azionario globale più 40% titoli di Stato a 10 anni), «Bitcoin» (prezzo storico spot) e «Libretto postale» (un tasso di riferimento storico usato come proxy, spiegato nella domanda successiva).",
            keywords: [
              "quali strumenti",
              "azioni",
              "borsa",
              "mercato azionario",
              "MSCI World",
              "titoli di stato",
              "obbligazioni",
              "bilanciato 60/40",
              "bitcoin",
              "cripto",
              "criptovaluta",
              "crypto",
              "libretto postale",
              "libretto di risparmio",
            ],
          },
          {
            id: "libretto-postale-proxy",
            q: "«Libretto postale» è davvero il libretto di risparmio postale?",
            a: "No, ed è importante saperlo: per questo strumento non esiste una serie storica pubblica del rendimento reale del libretto postale. Il dato usato è invece la media storica dei rendimenti dei Buoni Ordinari del Tesoro (BOT), pubblicata da Banca d'Italia, presa come proxy, cioè come approssimazione ragionevole di uno strumento a basso rischio e basso rendimento. La tassazione reale del libretto postale segue regole proprie, diverse da quelle applicate qui: il risultato mostrato è quindi illustrativo, non un calcolo preciso di quanto avrebbe reso un libretto postale reale.",
            keywords: [
              "BOT",
              "buoni ordinari del tesoro",
              "buoni italiani",
              "buoni del tesoro",
              "titoli di stato a breve termine",
              "libretto postale",
              "libretto di risparmio",
            ],
          },
          {
            id: "titoli-stato-usa",
            q: "Perché «Titoli di Stato (10 anni)» usa dati statunitensi?",
            a: "Un indice obbligazionario globale ampiamente diversificato (come quello che replicano molti fondi reali) è un dato proprietario, senza una fonte pubblica gratuita disponibile. Il titolo di Stato USA a 10 anni ha invece una serie storica pubblica e lunga, ed è un riferimento comune per rappresentare l'andamento di questa categoria di strumenti. Per questo l'etichetta indica esplicitamente «Titoli di Stato (10 anni)» e non «obbligazionario globale».",
            keywords: [
              "obbligazioni",
              "titoli di stato",
              "BTP",
              "bond",
              "titoli di stato americani",
              "treasury",
              "obbligazionario globale",
            ],
          },
          {
            id: "bitcoin-volatilita",
            q: "Perché i risultati con Bitcoin possono sembrare estremi?",
            a: "Il prezzo storico di Bitcoin ha attraversato fasi di crescita molto rapida e fasi di calo altrettanto marcato: è lo strumento con le oscillazioni più ampie tra quelli disponibili. Scegliendo periodi diversi, anche di poco, il risultato può cambiare in modo molto vistoso. Questo non indica un errore di calcolo: riflette la reale variabilità storica di questo strumento, e va letto tenendo conto che un periodo passato non garantisce lo stesso comportamento in futuro.",
            keywords: [
              "cripto",
              "criptovaluta",
              "crypto",
              "bitcoin",
              "volatilità",
              "oscillazioni",
              "risultati estremi",
            ],
          },
          {
            id: "periodo-dati-disponibili",
            q: "Che periodo coprono i dati storici?",
            a: "Ogni strumento ha una copertura diversa, perché deriva da una fonte diversa: l'azionario globale parte dal 1985, titoli di Stato e bilanciato 60/40 dal 1928, Bitcoin dal 2010 e il proxy del libretto postale dal 1981. Se si sceglie una data di inizio o fine fuori da questo intervallo, Hagenton non inventa né estrapola un dato: la finestra viene automaticamente riportata (in gergo tecnico, «troncata») al periodo effettivamente disponibile per lo strumento scelto, e compare un avviso («Nota sui dati usati») che lo segnala in modo esplicito.",
            keywords: [
              "copertura dati",
              "periodo storico",
              "date disponibili",
              "range di date",
              "dati mancanti",
              "troncamento",
            ],
          },
          {
            id: "tassazione-aliquote",
            q: "Come funziona la tassazione nella simulazione?",
            a: "L'imposta si applica solo al guadagno, mai al capitale versato: se il risultato è in perdita, non viene calcolata alcuna imposta. Il campo «Tassazione finale» propone come punto di partenza l'aliquota standard italiana sulle rendite finanziarie, il 26%, modificabile liberamente; per i titoli di Stato la normativa italiana prevede un'aliquota ridotta, il 12,5%. Questi valori sono un riferimento informativo per capire l'effetto delle imposte sul risultato, non un'indicazione su quale strumento scegliere per motivi fiscali.",
            keywords: [
              "tasse",
              "imposte",
              "plusvalenza",
              "26%",
              "12,5%",
              "aliquota",
              "tassazione sui guadagni",
            ],
          },
        ],
      },
      {
        title: "Dati e privacy",
        items: [
          {
            id: "dati-al-sicuro",
            q: "I miei dati sono al sicuro?",
            a: "Sì: Hagenton non fa alcuna chiamata di rete verso l'esterno. Gli scenari salvati restano esclusivamente nella memoria locale del browser (localStorage) e non lasciano mai il dispositivo usato.",
            keywords: [
              "dati personali",
              "localStorage",
              "sicurezza",
              "privacy",
              "chiamate di rete",
              "dati al sicuro",
            ],
          },
          {
            id: "scenari-salvati",
            q: "Dove ritrovo gli scenari salvati?",
            a: "Nella sezione Storico. Da lì è possibile riaprirli nel simulatore per modificarli oppure eliminarli.",
            keywords: [
              "scenari salvati",
              "storico",
              "dove trovo i miei scenari",
              "cronologia simulazioni",
            ],
          },
          {
            id: "scenario-strumento-rimosso",
            q: "Cosa succede se riapro uno scenario che usa uno strumento non più disponibile?",
            a: "Se in futuro un aggiornamento di Hagenton modifica gli strumenti disponibili, uno scenario salvato in precedenza continua ad aprirsi correttamente: Hagenton non genera un errore né una pagina vuota, ma segnala la situazione in modo esplicito e propone un'alternativa ragionevole, così da poter comunque consultare o correggere lo scenario.",
            keywords: [
              "strumento rimosso",
              "scenario non funziona più",
              "errore apertura scenario",
              "strumento non disponibile",
            ],
          },
        ],
      },
      {
        title: "Cosa non è Hagenton",
        items: [
          {
            id: "consiglio-investimento",
            q: "Hagenton mi dice cosa conviene fare?",
            a: "No. Hagenton è uno strumento illustrativo che mostra, a partire da dati storici reali, quanto si sarebbe accumulato in un periodo passato con una determinata scelta. Non indica quale strumento scegliere, non consiglia di comprare o vendere nulla e non sostituisce una consulenza finanziaria personalizzata. Ogni risultato va letto come «ecco cosa sarebbe successo con questi dati storici», non come una previsione o un suggerimento su cosa fare.",
            keywords: [
              "consiglio di investimento",
              "consulenza finanziaria",
              "cosa conviene fare",
              "suggerimento di investimento",
              "disclaimer",
            ],
          },
        ],
      },
    ],
    search: {
      label: "Cerca nelle domande frequenti",
      placeholder: "Cerca una domanda, ad esempio «buoni italiani»…",
      resultCount: (n: number) =>
        n === 1 ? "1 risultato trovato." : `${n} risultati trovati.`,
      noResults: "Nessun risultato.",
    },
    noResultsForQuery: (query: string) =>
      `Nessun risultato per «${query}». Prova con altre parole, magari più generiche o un sinonimo.`,
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
  instrumentInfo: {
    triggerSelected: (label: string) =>
      `Cosa rappresenta lo strumento «${label}»`,
    triggerEmpty: "Cosa rappresentano gli strumenti disponibili",
    panelTitleEmpty: "Strumenti disponibili",
    emptyPrompt:
      "Seleziona uno strumento per vedere una spiegazione di cosa rappresenta il dato storico usato.",
    disclaimer:
      "Dati storici a scopo illustrativo: nessun consiglio di investimento, nessuna raccomandazione su cosa scegliere, comprare o vendere.",
    faqLink: "Scopri di più nelle FAQ",
    descriptions: {
      globalEquity:
        "Rappresenta l'andamento storico dell'indice azionario globale MSCI World (mercati sviluppati, migliaia di aziende in oltre 20 paesi). Storicamente il rendimento più alto nel lungo periodo, ma anche le oscillazioni più marcate nel breve.",
      govBonds10y:
        "Rappresenta il rendimento storico dei titoli di Stato USA a 10 anni. Rendimento e rischio più contenuti rispetto all'azionario, meno soggetto a oscillazioni forti.",
      balanced6040:
        "Un mix simulato: 60% indice azionario globale + 40% titoli di Stato a 10 anni. Un compromesso classico tra crescita potenziale e stabilità.",
      bitcoin:
        "Prezzo storico di Bitcoin. Lo strumento più volatile tra quelli disponibili: può generare guadagni molto alti ma anche perdite rapide e marcate.",
      postalSavings:
        "Il rendimento è stimato usando come riferimento il tasso medio storico dei Buoni Ordinari del Tesoro (BOT, 1981–2026): uno strumento di risparmio a rischio pressoché nullo, ma con un rendimento storicamente molto basso, in alcuni periodi inferiore all'inflazione.",
    } as Record<Instrument, string>,
  },
  warning: {
    title: "Nota sui dati usati",
    messages: {
      invalidDateInput: () =>
        "Data di inizio o fine non valida: nessun periodo simulato.",
      invertedDateRange: () =>
        "La data di fine precede quella di inizio: nessun periodo simulato.",
      timeWindowCappedForSafety: (p) =>
        `Finestra temporale troppo ampia: limitata a ${p?.years ?? 100} anni.`,
      instrumentRangeClamped: () =>
        "La finestra richiesta eccede i dati storici disponibili per lo strumento scelto: risultato calcolato sul periodo coperto.",
      inflationRangeClamped: () =>
        "La serie storica dell'inflazione non copre l'intero periodo richiesto: usato l'ultimo dato disponibile per il resto del periodo.",
      negativeAmountClamped: (p) =>
        `${p?.field === "periodicAmount" ? "Importo periodico" : "Capitale iniziale"} non valido o negativo: impostato a 0.`,
      unknownInstrumentFallback: () =>
        "Lo strumento selezionato non è più disponibile: usato uno strumento predefinito al suo posto.",
      unknownPeriodicityFallback: () =>
        "Cadenza dei versamenti non riconosciuta: usata la cadenza mensile.",
      taxRateOutOfRangeClamped: () =>
        "Aliquota di tassazione fuori dall'intervallo 0-100%: corretta al limite più vicino.",
      valueOverflowClamped: () =>
        "Alcuni valori intermedi hanno superato i limiti calcolabili e sono stati limitati.",
    } as Record<SimulationWarningCode, (p?: SimulationWarningParams) => string>,
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
    globalEquity: "Global equity",
    govBonds10y: "Government bonds (10y)",
    balanced6040: "Balanced 60/40",
    bitcoin: "Bitcoin",
    postalSavings: "Postal savings",
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
      taxHint:
        "Standard rate in Italy: 26% (12.5% for government securities such as BOT/BTP). You can still enter a different value.",
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
      "Illustrative simulation, computed on the real historical performance of the chosen instrument: it does not constitute investment advice. No data leaves your browser: scenarios are saved locally.",
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
    instrumentUnavailable: "Instrument no longer available",
    row: {
      details: (amount: string, every: string, from: string, to: string) =>
        `${amount} ${every} · from ${from} to ${to}`,
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
      "How Hagenton works, where the historical data used for each instrument comes from, and what happens to the data you enter.",
    groups: [
      {
        title: "General",
        items: [
          {
            id: "cosa-e-hagenton",
            q: "What is Hagenton?",
            a: "It's a retrospective savings simulator. It takes an initial capital and a recurring expense and shows how much would have been accumulated today if, instead of being spent, it had been invested in the chosen instrument.",
            keywords: [
              "hagenton",
              "what is hagenton",
              "what is this app for",
              "savings simulator",
              "how the app works",
            ],
          },
          {
            id: "come-viene-calcolato",
            q: "How is the result calculated?",
            a: "The initial capital and every contribution grow month by month following the real historical performance of the chosen instrument (actual market data, not a fixed hypothetical rate applied equally to every instrument). Any taxation on gains is subtracted from the final value.",
            keywords: [
              "how the calculation works",
              "formula",
              "calculation method",
              "how the result is calculated",
              "market data",
              "historical performance",
            ],
          },
          {
            id: "inflazione-e-tassazione",
            q: "What changes with inflation and taxation?",
            a: "Turning on “Account for inflation” expresses the values in real terms: at the same purchasing power as today, that is net of the loss of value of money over time. With inflation switched off, values stay in nominal terms, i.e. the actual amounts of each year, without this adjustment. “Final taxation” applies the chosen rate to gains only, never to the capital paid in: the result shows the after-tax value.",
            keywords: [
              "inflation",
              "taxation",
              "purchasing power",
              "real values",
              "nominal values",
              "tax on gains",
            ],
          },
          {
            id: "rendimento-realistico",
            q: "Is the return realistic?",
            a: "The calculations use real historical series (equity indices, government bonds, Bitcoin, reference rates) for the chosen period, not a made-up average return: that's why the result changes depending on the selected time window, exactly as it would have really happened. It is still past data: real markets offer no guaranteed returns, and the results are neither a forecast nor financial advice.",
            keywords: [
              "realistic return",
              "real data",
              "historical series",
              "average return",
              "forecast",
              "data reliability",
            ],
          },
          {
            id: "perche-retrospettivo",
            q: "Why “retrospective” and not a future projection?",
            a: "Looking to the past makes the cost of small expenses more concrete: “how much I'd already have today” hits harder than a promise about the future. It's a change of perspective, not an investment tool: Hagenton does not indicate what to do in future, nor which instrument to choose.",
            keywords: [
              "retrospective",
              "why look at the past",
              "future projection",
              "future forecast",
              "change of perspective",
            ],
          },
        ],
      },
      {
        title: "Instruments and historical data",
        items: [
          {
            id: "strumenti-disponibili",
            q: "Which instruments can I choose and what do they represent?",
            a: "Five instruments, each based on a real historical series: “Global equity” (MSCI World index, developed markets across more than 20 countries), “Government bonds (10y)” (10-year US government bonds), “Balanced 60/40” (a simulated mix: 60% global equity plus 40% 10-year government bonds), “Bitcoin” (historical spot price) and “Postal savings” (a historical reference rate used as a proxy, explained in the next question).",
            keywords: [
              "which instruments",
              "stocks",
              "stock market",
              "equity market",
              "MSCI World",
              "government bonds",
              "bonds",
              "balanced 60/40",
              "bitcoin",
              "crypto",
              "cryptocurrency",
              "postal savings",
              "postal savings book",
            ],
          },
          {
            id: "libretto-postale-proxy",
            q: "Is “Postal savings” really the Italian postal savings book?",
            a: "No, and it's important to know this: no public historical series exists for the real return of the Italian postal savings book. The figure used instead is the historical average return of Italian Treasury bills (BOT), published by the Bank of Italy, taken as a proxy — a reasonable approximation of a low-risk, low-return instrument. The real taxation of postal savings follows its own rules, different from the ones applied here: the result shown is therefore illustrative, not a precise calculation of what a real postal savings book would have earned.",
            keywords: [
              "BOT",
              "Italian Treasury bills",
              "T-bills",
              "Italian government bonds",
              "short-term government bonds",
              "postal savings",
              "postal savings book",
              "postal savings account",
            ],
          },
          {
            id: "titoli-stato-usa",
            q: "Why does “Government bonds (10y)” use US data?",
            a: "A broadly diversified global bond index — the kind many real funds replicate — is proprietary data, with no free public source available. The 10-year US government bond, on the other hand, has a long public historical series and is a common reference for this category of instruments. That is why the label explicitly reads “Government bonds (10y)” rather than “global bonds”.",
            keywords: [
              "bonds",
              "government bonds",
              "BTP",
              "bond",
              "US government bonds",
              "treasury",
              "global bond index",
            ],
          },
          {
            id: "bitcoin-volatilita",
            q: "Why can results with Bitcoin look extreme?",
            a: "Bitcoin's historical price has gone through phases of very rapid growth and equally sharp declines: it is the instrument with the widest swings among those available. Choosing different periods, even by a little, can change the result quite dramatically. This does not indicate a calculation error: it reflects the real historical variability of this instrument, and should be read bearing in mind that a past period does not guarantee the same behaviour in future.",
            keywords: [
              "crypto",
              "cryptocurrency",
              "bitcoin",
              "volatility",
              "swings",
              "extreme results",
            ],
          },
          {
            id: "periodo-dati-disponibili",
            q: "What period does the historical data cover?",
            a: "Each instrument has different coverage, because it comes from a different source: global equity starts in 1985, government bonds and the balanced 60/40 mix in 1928, Bitcoin in 2010, and the postal savings proxy in 1981. If you choose a start or end date outside this range, Hagenton does not invent or extrapolate a figure: the window is automatically brought back (in technical terms, “clamped”) to the period actually available for the chosen instrument, and a notice (“Note on the data used”) appears to flag this explicitly.",
            keywords: [
              "data coverage",
              "historical period",
              "available dates",
              "date range",
              "missing data",
              "clamping",
            ],
          },
          {
            id: "tassazione-aliquote",
            q: "How does taxation work in the simulation?",
            a: "Tax applies only to the gain, never to the capital paid in: if the result is a loss, no tax is calculated. The “Final taxation” field proposes, as a starting point, the standard Italian rate on financial income, 26%, freely editable; for government bonds, Italian law provides for a reduced rate of 12.5%. These figures are an informative reference to understand the effect of taxes on the result, not an indication of which instrument to choose for tax reasons.",
            keywords: [
              "taxes",
              "tax",
              "capital gain",
              "26%",
              "12.5%",
              "tax rate",
              "tax on gains",
            ],
          },
        ],
      },
      {
        title: "Data and privacy",
        items: [
          {
            id: "dati-al-sicuro",
            q: "Is my data safe?",
            a: "Yes: Hagenton makes no network calls of any kind. Saved scenarios stay exclusively in the browser's local storage (localStorage) and never leave the device used.",
            keywords: [
              "personal data",
              "localStorage",
              "security",
              "privacy",
              "network calls",
              "data safety",
            ],
          },
          {
            id: "scenari-salvati",
            q: "Where do I find my saved scenarios?",
            a: "In the History section. From there you can reopen them in the simulator to edit them, or delete them.",
            keywords: [
              "saved scenarios",
              "history",
              "where are my scenarios",
              "simulation history",
            ],
          },
          {
            id: "scenario-strumento-rimosso",
            q: "What happens if I reopen a scenario that uses an instrument no longer available?",
            a: "If a future Hagenton update changes the available instruments, a previously saved scenario still opens correctly: Hagenton does not throw an error or show a blank page, but flags the situation explicitly and proposes a reasonable alternative, so the scenario can still be viewed or corrected.",
            keywords: [
              "instrument removed",
              "scenario no longer works",
              "error opening scenario",
              "instrument unavailable",
            ],
          },
        ],
      },
      {
        title: "What Hagenton is not",
        items: [
          {
            id: "consiglio-investimento",
            q: "Does Hagenton tell me what I should do?",
            a: "No. Hagenton is an illustrative tool that shows, based on real historical data, how much would have been accumulated over a past period with a given choice. It does not indicate which instrument to choose, does not recommend buying or selling anything, and does not replace personalised financial advice. Every result should be read as “here is what would have happened with this historical data”, not as a forecast or a suggestion about what to do.",
            keywords: [
              "investment advice",
              "financial advice",
              "what should I do",
              "investment suggestion",
              "disclaimer",
            ],
          },
        ],
      },
    ],
    search: {
      label: "Search the frequently asked questions",
      placeholder: "Search a question, e.g. “Italian government bonds”…",
      resultCount: (n: number) =>
        n === 1 ? "1 result found." : `${n} results found.`,
      noResults: "No results.",
    },
    noResultsForQuery: (query: string) =>
      `No results for “${query}”. Try other words, perhaps more general or a synonym.`,
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
  instrumentInfo: {
    triggerSelected: (label: string) => `What the “${label}” instrument represents`,
    triggerEmpty: "What the available instruments represent",
    panelTitleEmpty: "Available instruments",
    emptyPrompt:
      "Select an instrument to see an explanation of what the historical data used represents.",
    disclaimer:
      "Historical data for illustrative purposes: no investment advice, no recommendation on what to choose, buy or sell.",
    faqLink: "Learn more in the FAQ",
    descriptions: {
      globalEquity:
        "Represents the historical performance of the MSCI World global equity index (developed markets, thousands of companies across more than 20 countries). Historically the highest return over the long run, but also the sharpest swings in the short term.",
      govBonds10y:
        "Represents the historical yield of 10-year US government bonds. Lower return and risk than equities, less subject to strong swings.",
      balanced6040:
        "A simulated mix: 60% global equity index + 40% 10-year government bonds. A classic compromise between potential growth and stability.",
      bitcoin:
        "Bitcoin's historical price. The most volatile instrument available: it can produce very high gains but also rapid, sharp losses.",
      postalSavings:
        "The return is estimated using the historical average rate of Italian Treasury bills (BOT, 1981–2026) as a reference: an almost risk-free savings instrument, but with a historically very low return, in some periods below inflation.",
    },
  },
  warning: {
    title: "Note on the data used",
    messages: {
      invalidDateInput: () => "Start or end date invalid: no period simulated.",
      invertedDateRange: () =>
        "The end date precedes the start date: no period simulated.",
      timeWindowCappedForSafety: (p) =>
        `Time window too wide: capped to ${p?.years ?? 100} years.`,
      instrumentRangeClamped: () =>
        "The requested window exceeds the historical data available for the chosen instrument: result computed over the covered period.",
      inflationRangeClamped: () =>
        "The historical inflation series does not cover the entire requested period: the last available value was used for the rest of the period.",
      negativeAmountClamped: (p) =>
        `${p?.field === "periodicAmount" ? "Recurring amount" : "Initial capital"} invalid or negative: set to 0.`,
      unknownInstrumentFallback: () =>
        "The selected instrument is no longer available: a default instrument was used instead.",
      unknownPeriodicityFallback: () =>
        "Contribution frequency not recognised: monthly frequency used.",
      taxRateOutOfRangeClamped: () =>
        "Taxation rate outside the 0-100% range: corrected to the nearest limit.",
      valueOverflowClamped: () =>
        "Some intermediate values exceeded the computable limits and were capped.",
    },
  },
};

export const DICTIONARIES: Record<Lang, Dict> = { it, en };

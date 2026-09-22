"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { FaqSearchInput } from "@/components/FaqSearchInput";
import { filterFaqGroups, type FaqGroup } from "@/lib/faqSearch";

const GENERAL_FAQS: FaqGroup["items"] = [
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
];

const INSTRUMENT_FAQS: FaqGroup["items"] = [
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
];

const DATA_FAQS: FaqGroup["items"] = [
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
];

const DISCLAIMER_FAQS: FaqGroup["items"] = [
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
];

const FAQ_GROUPS: readonly FaqGroup[] = [
  { title: "In generale", items: GENERAL_FAQS },
  { title: "Gli strumenti e i dati storici", items: INSTRUMENT_FAQS },
  { title: "Dati e privacy", items: DATA_FAQS },
  { title: "Cosa non è Hagenton", items: DISCLAIMER_FAQS },
];

/**
 * Apre automaticamente la voce collegata da un link tipo `/faq#id-domanda`
 * (es. dal popover informativo di uno strumento nel simulatore): senza questo
 * effetto il browser scrolla comunque all'elemento, ma l'<details> resta
 * chiuso e la risposta non è visibile. Gira solo al primo render, quindi resta
 * valido anche con la ricerca (che parte sempre vuota).
 */
function useOpenFaqFromHash() {
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const target = document.getElementById(hash);
    if (target instanceof HTMLDetailsElement) {
      target.open = true;
      target.scrollIntoView({ block: "start" });
    }
  }, []);
}

export default function FaqPage() {
  useOpenFaqFromHash();

  const [query, setQuery] = useState("");
  const hasQuery = query.trim().length > 0;

  const { groups: visibleGroups, matchCount } = useMemo(
    () => filterFaqGroups(FAQ_GROUPS, query),
    [query],
  );

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Domande frequenti</h1>
        <p className="mt-2 text-muted">
          Come funziona Hagenton, da dove vengono i dati storici usati per ogni
          strumento e cosa succede ai dati inseriti.
        </p>
      </header>

      <FaqSearchInput
        value={query}
        onChange={setQuery}
        resultCount={matchCount}
        hasQuery={hasQuery}
      />

      {hasQuery && matchCount === 0 ? (
        <p className="rounded-card border border-border bg-surface p-6 text-muted">
          Nessun risultato per «{query.trim()}». Prova con altre parole, magari
          più generiche o un sinonimo.
        </p>
      ) : (
        <div className="space-y-8">
          {visibleGroups.map((group) => (
            <section key={group.title} aria-labelledby={`faq-group-${group.title}`}>
              <h2
                id={`faq-group-${group.title}`}
                className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted"
              >
                {group.title}
              </h2>
              <div className="space-y-3">
                {group.items.map((item) => (
                  <details
                    key={item.id}
                    id={item.id}
                    className="group rounded-card border border-border bg-surface p-5 scroll-mt-6"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                      {item.q}
                      <span
                        aria-hidden
                        className="text-muted transition group-open:rotate-45"
                      >
                        +
                      </span>
                    </summary>
                    <p className="mt-3 text-muted">{item.a}</p>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <div className="mt-10 rounded-card bg-accent px-6 py-8 text-accent-foreground">
        <h2 className="text-lg font-semibold">Inizia una simulazione</h2>
        <p className="mt-1 text-sm">
          Bastano un importo e un periodo per vedere l&apos;effetto del tempo.
        </p>
        <Link
          href="/simulazione"
          className="mt-4 inline-flex min-h-11 items-center rounded-pill bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:opacity-90 active:opacity-80"
        >
          Vai al simulatore
        </Link>
      </div>
    </main>
  );
}

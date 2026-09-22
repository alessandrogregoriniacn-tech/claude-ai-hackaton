import Link from "next/link";
import { INSTRUMENT_RETURNS } from "@/lib/constants";
import { formatPercent } from "@/lib/format";

const FAQS = [
  {
    q: "Che cos'è Hagenton?",
    a: "È un simulatore retrospettivo di risparmio. Prende un capitale iniziale e una spesa ricorrente e ti mostra quanto avresti accumulato oggi se, invece di spenderli, li avessi investiti nello strumento scelto.",
  },
  {
    q: "Come viene calcolato il risultato?",
    a: `Il capitale iniziale e ogni versamento vengono fatti crescere mese per mese con capitalizzazione mensile, secondo il rendimento annuo dello strumento scelto: Azionaria ${formatPercent(
      INSTRUMENT_RETURNS.azionaria,
    )}, Obbligazionaria ${formatPercent(
      INSTRUMENT_RETURNS.obbligazionaria,
    )}, Bitcoin ${formatPercent(
      INSTRUMENT_RETURNS.bitcoin,
    )}. Al valore finale si sottrae l'eventuale tassazione sui guadagni.`,
  },
  {
    q: "Cosa cambia con inflazione e tassazione?",
    a: "Se attivi «Tieni conto dell'inflazione», i valori sono espressi in termini reali (potere d'acquisto di oggi). La «Tassazione finale» applica l'aliquota indicata sui soli guadagni, così vedi il netto che ti resterebbe in tasca.",
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
] as const;

export default function FaqPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Domande frequenti</h1>
        <p className="mt-2 text-muted">
          Come funziona Hagenton, da dove viene il rendimento e cosa succede ai
          tuoi dati.
        </p>
      </header>

      <div className="space-y-3">
        {FAQS.map((item) => (
          <details
            key={item.q}
            className="group rounded-card border border-border bg-surface p-5"
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

      <div className="mt-10 rounded-card bg-accent px-6 py-8 text-accent-foreground">
        <h2 className="text-lg font-semibold">Pronto a provare?</h2>
        <p className="mt-1 text-sm">
          Bastano un importo e una data per vedere l&apos;effetto del tempo.
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

import Link from "next/link";
import { ANNUAL_RETURN_RATE } from "@/lib/constants";
import { formatPercent } from "@/lib/format";

const SECTIONS = [
  {
    href: "/simulazione",
    title: "Simulazione",
    description:
      "Inserisci una spesa ricorrente (importo, frequenza e data d'inizio) e scopri quanto avresti oggi se l'avessi investita, con un rendimento annuo fisso.",
    cta: "Avvia una simulazione",
  },
  {
    href: "/storico",
    title: "Storico",
    description:
      "Ritrova gli scenari che hai salvato, confronta i risultati e riaprili nel simulatore per modificarli. Tutto resta salvato solo nel tuo browser.",
    cta: "Vedi lo storico",
  },
  {
    href: "/faq",
    title: "FAQ",
    description:
      "Come funziona il calcolo? Da dove viene il rendimento? I miei dati sono al sicuro? Le risposte alle domande più comuni.",
    cta: "Leggi le FAQ",
  },
] as const;

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <section className="rounded-card bg-accent px-6 py-10 text-accent-foreground sm:px-10 sm:py-14">
        <p className="text-sm font-semibold uppercase tracking-wide">Hagenton</p>
        <h1 className="mt-2 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
          Quanto avresti risparmiato?
        </h1>
        <p className="mt-4 max-w-2xl text-base">
          Hagenton è un simulatore <strong>retrospettivo</strong>: invece di
          promettere guadagni futuri, guarda al passato. Ti mostra quanto avresti
          oggi se una piccola spesa ricorrente — il caffè al bar, un abbonamento,
          lo snack quotidiano — l'avessi messa da parte e investita a un rendimento
          annuo fisso del {formatPercent(ANNUAL_RETURN_RATE)}.
        </p>
        <Link
          href="/simulazione"
          className="mt-6 inline-flex min-h-11 items-center rounded-pill bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:opacity-90 active:opacity-80"
        >
          Prova una simulazione
        </Link>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Le sezioni dell'app</h2>
        <p className="mt-1 text-muted">
          Tre spazi, un unico obiettivo: rendere tangibile il costo delle piccole
          spese nel tempo.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {SECTIONS.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="group flex flex-col rounded-card border border-border bg-surface p-6 transition hover:border-foreground/30"
            >
              <h3 className="text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 flex-1 text-sm text-muted">{s.description}</p>
              <span className="mt-4 text-sm font-semibold text-foreground underline-offset-4 group-hover:underline">
                {s.cta} →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <footer className="mt-12 border-t border-border pt-6 text-xs text-muted">
        Simulazione a scopo illustrativo. Rendimento annuo fisso ipotetico del{" "}
        {formatPercent(ANNUAL_RETURN_RATE)}, capitalizzazione mensile. Nessun dato
        lascia il tuo browser: gli scenari sono salvati in locale.
      </footer>
    </main>
  );
}

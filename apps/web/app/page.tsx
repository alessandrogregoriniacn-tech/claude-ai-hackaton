import Link from "next/link";

const SECTIONS = [
  {
    href: "/simulazione",
    title: "Simulazione",
    description:
      "Inserisci un capitale iniziale, una spesa ricorrente e un periodo: scopri quanto avresti accumulato investendo nello strumento scelto.",
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
          promettere guadagni futuri, guarda al passato. Mostra quanto si
          sarebbe accumulato oggi se una piccola somma periodica — un
          abbonamento, un acquisto ricorrente — fosse stata messa da parte e
          investita in uno strumento a scelta.
        </p>
        <Link
          href="/simulazione"
          className="mt-6 inline-flex min-h-11 items-center rounded-pill bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:opacity-90 active:opacity-80"
        >
          Prova una simulazione
        </Link>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Le sezioni dell&apos;app</h2>
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
        Simulazione a scopo illustrativo. Rendimenti annui ipotetici con
        capitalizzazione mensile. Nessun dato lascia il tuo browser: gli scenari
        sono salvati in locale.
      </footer>
    </main>
  );
}

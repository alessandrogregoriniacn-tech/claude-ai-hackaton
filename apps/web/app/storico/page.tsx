"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { simulate, type Periodicity } from "@/lib/finance";
import { INSTRUMENT_LABELS, type InstrumentKey } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";
import { loadScenarios, saveScenarios, type Scenario } from "@/lib/storage";
import { WarningBanner } from "@/components/WarningBanner";

const PERIODICITY_LABELS: Record<Periodicity, string> = {
  "1w": "ogni settimana",
  "2w": "ogni 2 settimane",
  "1m": "ogni mese",
  "3m": "ogni 3 mesi",
  "6m": "ogni 6 mesi",
  "12m": "ogni 12 mesi",
};

/**
 * Etichetta di uno scenario salvato: la chiave persistita in localStorage può
 * non esistere più (dataset aggiornato dopo il salvataggio) — mai un crash o
 * una label vuota, il motore la gestisce con `unknownInstrumentFallback` ma la
 * UI deve comunque restare onesta su quale strumento non è più disponibile.
 */
function instrumentLabelFor(instrument: InstrumentKey): string | null {
  return INSTRUMENT_LABELS[instrument] ?? null;
}

export default function StoricoPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [ready, setReady] = useState(false);

  // Gli scenari vivono in localStorage: lettura intenzionale dopo il mount
  // (non disponibile lato prerender statico).
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setScenarios(loadScenarios());
    setReady(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  function handleDelete(id: string) {
    const next = scenarios.filter((s) => s.id !== id);
    setScenarios(next);
    saveScenarios(next);
  }

  function handleClear() {
    setScenarios([]);
    saveScenarios([]);
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Storico simulazioni
          </h1>
          <p className="mt-2 max-w-2xl text-muted">
            Gli scenari che hai salvato dal simulatore. Sono conservati solo nel
            tuo browser: nessun dato viene inviato online.
          </p>
        </div>
        {scenarios.length > 0 ? (
          <button
            onClick={handleClear}
            className="min-h-11 rounded-pill border-2 border-negative px-4 text-sm font-semibold text-negative transition hover:bg-negative/10 active:opacity-80"
          >
            Svuota storico
          </button>
        ) : null}
      </header>

      {!ready ? null : scenarios.length === 0 ? (
        <div className="rounded-card border border-border bg-surface p-10 text-center">
          <p className="text-lg font-semibold">Nessuno scenario salvato</p>
          <p className="mx-auto mt-2 max-w-md text-muted">
            Vai al simulatore, imposta una spesa ricorrente e premi «Salva
            scenario»: lo ritroverai qui.
          </p>
          <Link
            href="/simulazione"
            className="mt-6 inline-flex min-h-11 items-center rounded-pill bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:opacity-90 active:opacity-80"
          >
            Vai al simulatore
          </Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {scenarios.map((s) => {
            const r = simulate({
              initialCapital: s.initialCapital,
              periodicAmount: s.periodicAmount,
              periodicity: s.periodicity,
              startDate: s.startDate,
              endDate: s.endDate,
              instrument: s.instrument,
              adjustForInflation: s.adjustForInflation,
              taxRate: s.taxRate,
            });
            const instrumentLabel = instrumentLabelFor(s.instrument);
            return (
              <li
                key={s.id}
                className="rounded-card border border-border bg-surface px-4 py-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{s.label}</p>
                    <p className="text-sm text-muted">
                      {instrumentLabel ?? (
                        <span className="inline-flex items-center gap-1 text-negative">
                          <span aria-hidden="true">⚠</span>
                          Strumento non più disponibile
                        </span>
                      )}{" "}
                      · {formatCurrency(s.periodicAmount, true)}{" "}
                      {PERIODICITY_LABELS[s.periodicity]} · dal{" "}
                      {new Date(`${s.startDate}T00:00:00`).toLocaleDateString(
                        "it-IT",
                      )}{" "}
                      al{" "}
                      {new Date(`${s.endDate}T00:00:00`).toLocaleDateString(
                        "it-IT",
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold tabular-nums text-foreground">
                      {formatCurrency(r.finalValue)}
                    </span>
                    <Link
                      href={`/simulazione?load=${s.id}`}
                      className="inline-flex min-h-11 items-center rounded-pill border-2 border-foreground px-4 text-sm font-semibold text-foreground transition hover:bg-foreground/10 active:opacity-80"
                    >
                      Apri
                    </Link>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="-m-2 inline-flex min-h-11 items-center p-2 text-sm font-medium text-negative underline-offset-2 hover:underline"
                    >
                      Elimina
                    </button>
                  </div>
                </div>

                {r.warnings.length > 0 ? (
                  <div className="mt-3">
                    <WarningBanner warnings={r.warnings} compact />
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}

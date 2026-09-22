"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { simulateRetrospective, type Frequency } from "@/lib/finance";
import { formatCurrency } from "@/lib/format";
import { loadScenarios, saveScenarios, type Scenario } from "@/lib/storage";

const FREQUENCY_LABELS: Record<Frequency, string> = {
  daily: "al giorno",
  weekly: "a settimana",
  monthly: "al mese",
};

export default function StoricoPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setScenarios(loadScenarios());
    setReady(true);
  }, []);

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
            className="min-h-11 rounded-pill border border-border px-4 text-sm font-medium text-muted transition hover:border-negative hover:text-negative"
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
            const r = simulateRetrospective({
              amount: s.amount,
              frequency: s.frequency,
              startDate: s.startDate,
            });
            return (
              <li
                key={s.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-border bg-surface px-4 py-3"
              >
                <div>
                  <p className="font-medium">{s.label}</p>
                  <p className="text-sm text-muted">
                    {formatCurrency(s.amount, true)}{" "}
                    {FREQUENCY_LABELS[s.frequency]} · dal{" "}
                    {new Date(`${s.startDate}T00:00:00`).toLocaleDateString(
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
                    className="-m-2 inline-flex min-h-11 items-center p-2 text-sm text-muted underline-offset-2 hover:text-foreground hover:underline"
                  >
                    Apri
                  </Link>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="-m-2 inline-flex min-h-11 items-center p-2 text-sm text-negative underline-offset-2 hover:underline"
                  >
                    Elimina
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}

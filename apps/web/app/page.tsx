"use client";

import { useEffect, useMemo, useState } from "react";
import { ANNUAL_RETURN_RATE } from "@/lib/constants";
import { simulateRetrospective, type Frequency } from "@/lib/finance";
import { formatCurrency, formatPercent } from "@/lib/format";
import {
  createId,
  loadScenarios,
  saveScenarios,
  type Scenario,
} from "@/lib/storage";
import { StatCard } from "@/components/StatCard";
import { GrowthChart } from "@/components/GrowthChart";

const FREQUENCY_LABELS: Record<Frequency, string> = {
  daily: "al giorno",
  weekly: "a settimana",
  monthly: "al mese",
};

function defaultStartDate(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 10);
  return d.toISOString().slice(0, 10);
}

export default function Home() {
  const [amount, setAmount] = useState(5);
  const [frequency, setFrequency] = useState<Frequency>("daily");
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [label, setLabel] = useState("Caffè quotidiano");
  const [scenarios, setScenarios] = useState<Scenario[]>([]);

  useEffect(() => {
    setScenarios(loadScenarios());
  }, []);

  const result = useMemo(
    () => simulateRetrospective({ amount, frequency, startDate }),
    [amount, frequency, startDate],
  );

  const years = (result.months / 12).toFixed(1);

  function handleSave() {
    const next: Scenario[] = [
      {
        id: createId(),
        label: label.trim() || "Scenario senza nome",
        amount,
        frequency,
        startDate,
        createdAt: new Date().toISOString(),
      },
      ...scenarios,
    ];
    setScenarios(next);
    saveScenarios(next);
  }

  function handleLoad(s: Scenario) {
    setAmount(s.amount);
    setFrequency(s.frequency);
    setStartDate(s.startDate);
    setLabel(s.label);
  }

  function handleDelete(id: string) {
    const next = scenarios.filter((s) => s.id !== id);
    setScenarios(next);
    saveScenarios(next);
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-8">
        <p className="text-sm font-medium text-primary">Hagenton</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          Quanto avresti risparmiato
        </h1>
        <p className="mt-2 max-w-2xl text-muted">
          Invece di guardare ai guadagni futuri, guarda al passato: scopri quanto
          avresti oggi se avessi messo da parte questa spesa, con un rendimento
          annuo fisso del {formatPercent(ANNUAL_RETURN_RATE)}.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        {/* Form */}
        <section className="rounded-card border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold">La tua spesa</h2>

          <label className="mt-4 block text-sm text-muted">
            Nome scenario
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none focus:border-primary"
            />
          </label>

          <label className="mt-4 block text-sm text-muted">
            Importo (€)
            <input
              type="number"
              min={0}
              step={0.5}
              value={amount}
              onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none focus:border-primary"
            />
          </label>

          <label className="mt-4 block text-sm text-muted">
            Frequenza
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as Frequency)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none focus:border-primary"
            >
              <option value="daily">Ogni giorno</option>
              <option value="weekly">Ogni settimana</option>
              <option value="monthly">Ogni mese</option>
            </select>
          </label>

          <label className="mt-4 block text-sm text-muted">
            A partire dal
            <input
              type="date"
              value={startDate}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground outline-none focus:border-primary"
            />
          </label>

          <button
            onClick={handleSave}
            className="mt-6 w-full rounded-lg bg-primary px-4 py-2.5 font-medium text-primary-foreground transition hover:opacity-90"
          >
            Salva scenario
          </button>
        </section>

        {/* Risultati */}
        <section className="space-y-6">
          <p className="text-sm text-muted">
            Mettendo da parte {formatCurrency(amount, true)} {FREQUENCY_LABELS[frequency]} da{" "}
            {new Date(`${startDate}T00:00:00`).toLocaleDateString("it-IT")} ({years} anni)…
          </p>

          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Avresti oggi"
              value={formatCurrency(result.finalValue)}
              tone="primary"
            />
            <StatCard
              label="Totale versato"
              value={formatCurrency(result.totalContributed)}
            />
            <StatCard
              label="Guadagno da rendimento"
              value={formatCurrency(result.interestEarned)}
              tone="positive"
              hint={`al ${formatPercent(ANNUAL_RETURN_RATE)} annuo`}
            />
          </div>

          <GrowthChart points={result.points} />
        </section>
      </div>

      {/* Scenari salvati */}
      {scenarios.length > 0 ? (
        <section className="mt-10">
          <h2 className="mb-3 text-lg font-semibold">Scenari salvati</h2>
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
                      {formatCurrency(s.amount, true)} {FREQUENCY_LABELS[s.frequency]} · dal{" "}
                      {new Date(`${s.startDate}T00:00:00`).toLocaleDateString("it-IT")}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="tabular-nums font-semibold text-primary">
                      {formatCurrency(r.finalValue)}
                    </span>
                    <button
                      onClick={() => handleLoad(s)}
                      className="text-sm text-muted underline-offset-2 hover:text-foreground hover:underline"
                    >
                      Carica
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="text-sm text-negative underline-offset-2 hover:underline"
                    >
                      Elimina
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <footer className="mt-12 border-t border-border pt-6 text-xs text-muted">
        Simulazione a scopo illustrativo. Rendimento annuo fisso ipotetico del{" "}
        {formatPercent(ANNUAL_RETURN_RATE)}, capitalizzazione mensile. Nessun dato
        lascia il tuo browser: gli scenari sono salvati in locale.
      </footer>
    </main>
  );
}

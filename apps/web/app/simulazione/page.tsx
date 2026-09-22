"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
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

function SimulazioneContent() {
  const searchParams = useSearchParams();
  const loadId = searchParams.get("load");

  const [amount, setAmount] = useState(5);
  const [frequency, setFrequency] = useState<Frequency>("daily");
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [label, setLabel] = useState("Caffè quotidiano");
  const [saved, setSaved] = useState(false);

  // Precarica uno scenario dallo storico quando si arriva con ?load=<id>.
  useEffect(() => {
    if (!loadId) return;
    const scenario = loadScenarios().find((s) => s.id === loadId);
    if (scenario) {
      setAmount(scenario.amount);
      setFrequency(scenario.frequency);
      setStartDate(scenario.startDate);
      setLabel(scenario.label);
    }
  }, [loadId]);

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
      ...loadScenarios(),
    ];
    saveScenarios(next);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
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
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-foreground focus-visible:border-primary"
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
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-foreground focus-visible:border-primary"
            />
          </label>

          <label className="mt-4 block text-sm text-muted">
            Frequenza
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as Frequency)}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-foreground focus-visible:border-primary"
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
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-foreground focus-visible:border-primary"
            />
          </label>

          <button
            onClick={handleSave}
            className="mt-6 w-full rounded-pill bg-primary px-4 py-3 font-semibold text-primary-foreground transition hover:opacity-90 active:opacity-80"
          >
            Salva scenario
          </button>

          <p className="mt-3 min-h-5 text-center text-sm text-muted" role="status">
            {saved ? (
              <>
                Salvato nello{" "}
                <Link href="/storico" className="underline underline-offset-2">
                  storico
                </Link>
                .
              </>
            ) : null}
          </p>
        </section>

        {/* Risultati */}
        <section className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-md bg-accent px-5 py-4 text-accent-foreground">
            <p className="text-sm font-medium">
              {label.trim() || "Scenario"} · {formatCurrency(amount, true)}{" "}
              {FREQUENCY_LABELS[frequency]} · da{" "}
              {new Date(`${startDate}T00:00:00`).toLocaleDateString("it-IT")} ({years} anni)
            </p>
            <span className="rounded-md border border-accent-foreground/30 px-3 py-1 text-xs font-semibold">
              +{formatPercent(ANNUAL_RETURN_RATE)} annuo
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Avresti oggi"
              value={formatCurrency(result.finalValue)}
              tone="gold"
            />
            <StatCard
              label="Totale versato"
              value={formatCurrency(result.totalContributed)}
            />
            <StatCard
              label="Guadagno da rendimento"
              value={formatCurrency(result.interestEarned)}
              tone="gold"
              hint={`al ${formatPercent(ANNUAL_RETURN_RATE)} annuo`}
            />
          </div>

          <GrowthChart points={result.points} />
        </section>
      </div>

      <footer className="mt-12 border-t border-border pt-6 text-xs text-muted">
        Simulazione a scopo illustrativo. Rendimento annuo fisso ipotetico del{" "}
        {formatPercent(ANNUAL_RETURN_RATE)}, capitalizzazione mensile. Nessun dato
        lascia il tuo browser: gli scenari sono salvati in locale.
      </footer>
    </main>
  );
}

export default function SimulazionePage() {
  return (
    <Suspense fallback={null}>
      <SimulazioneContent />
    </Suspense>
  );
}

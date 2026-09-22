"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  simulate,
  type Instrument,
  type Periodicity,
  type SimulationInput,
} from "@/lib/finance";
import { INSTRUMENT_KEYS, INSTRUMENT_LABELS } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";
import {
  createId,
  loadScenarios,
  saveScenarios,
  type Scenario,
} from "@/lib/storage";
import { StatCard } from "@/components/StatCard";
import { GrowthChart } from "@/components/GrowthChart";
import { WarningBanner } from "@/components/WarningBanner";
import { InstrumentInfoPopover } from "@/components/InstrumentInfoPopover";

const PERIODICITY_OPTIONS: { value: Periodicity; label: string }[] = [
  { value: "1w", label: "1 settimana" },
  { value: "2w", label: "2 settimane" },
  { value: "1m", label: "1 mese" },
  { value: "3m", label: "3 mesi" },
  { value: "6m", label: "6 mesi" },
  { value: "12m", label: "12 mesi" },
];

/** Fonte di verità unica per chiavi/etichette: `lib/constants.ts`. */
const INSTRUMENT_OPTIONS: { value: Instrument; label: string }[] =
  INSTRUMENT_KEYS.map((key) => ({ value: key, label: INSTRUMENT_LABELS[key] }));

/** Trattino usato quando un valore non è ancora calcolabile. */
const DASH = "—";

/** Data di ieri in formato ISO: è l'ultima data selezionabile (niente oggi/futuro). */
function yesterdayISO(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

/** Converte una stringa di input numerico in numero, o null se vuota/non valida. */
function parseNumber(raw: string): number | null {
  if (raw.trim() === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

/** Snapshot dei risultati "commessi" dall'ultimo calcolo, con i dati per l'intestazione. */
interface Committed {
  result: ReturnType<typeof simulate>;
  label: string;
  instrumentLabel: string;
  adjustForInflation: boolean;
  years: string;
}

const inputClass =
  "mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-foreground focus-visible:border-primary";

function SimulazioneContent() {
  const searchParams = useSearchParams();
  const loadId = searchParams.get("load");

  const maxDate = useMemo(() => yesterdayISO(), []);

  // Tutti i campi partono vuoti: nessun valore precompilato all'atterraggio,
  // eccetto la tassazione, prevalorizzata con l'aliquota standard italiana
  // sulle plusvalenze finanziarie (26%) come punto di partenza modificabile.
  const [label, setLabel] = useState("");
  const [initialCapital, setInitialCapital] = useState("");
  const [periodicAmount, setPeriodicAmount] = useState("");
  const [periodicity, setPeriodicity] = useState<Periodicity | "">("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [instrument, setInstrument] = useState<Instrument | "">("");
  const [adjustForInflation, setAdjustForInflation] = useState(false);
  const [taxRate, setTaxRate] = useState("26");

  // La simulazione mostrata è quella "commessa" con la CTA Calcola, non live.
  const [committed, setCommitted] = useState<Committed | null>(null);
  const [savedName, setSavedName] = useState<string | null>(null);
  // Ancora per portare i risultati in vista dopo "Calcola simulazione", senza
  // interferire con l'annuncio dello screen reader sul warning banner (role="status").
  const resultsRef = useRef<HTMLDivElement>(null);

  // Precarica uno scenario dallo storico quando si arriva con ?load=<id>.
  // Sync intenzionale da storage/URL dopo il mount: i campi non esistono lato
  // prerender statico, quindi vanno popolati qui.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!loadId) return;
    const scenario = loadScenarios().find((s) => s.id === loadId);
    if (scenario) {
      setLabel(scenario.label);
      setInitialCapital(String(scenario.initialCapital));
      setPeriodicAmount(String(scenario.periodicAmount));
      setPeriodicity(scenario.periodicity);
      setStartDate(scenario.startDate);
      setEndDate(scenario.endDate);
      setInstrument(scenario.instrument);
      setAdjustForInflation(scenario.adjustForInflation);
      setTaxRate(String(scenario.taxRate));
    }
  }, [loadId]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const capitalNum = parseNumber(initialCapital);
  const amountNum = parseNumber(periodicAmount);
  const taxNum = parseNumber(taxRate);

  // Input valido = finestra temporale coerente (fine > inizio, non oltre ieri),
  // strumento e periodicità scelti, almeno un importo positivo.
  const input = useMemo<SimulationInput | null>(() => {
    if (!periodicity || !instrument || !startDate || !endDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) return null;
    if (end > new Date(maxDate)) return null;

    const capital = capitalNum ?? 0;
    const amount = amountNum ?? 0;
    if (capital <= 0 && amount <= 0) return null;

    return {
      initialCapital: capital,
      periodicAmount: amount,
      periodicity,
      startDate,
      endDate,
      instrument,
      adjustForInflation,
      taxRate: taxNum ?? 0,
    };
  }, [
    capitalNum,
    amountNum,
    periodicity,
    startDate,
    endDate,
    instrument,
    adjustForInflation,
    taxNum,
    maxDate,
  ]);

  const canSimulate = input !== null;
  const result = committed?.result ?? null;

  function handleCalculate() {
    if (!input) return;
    const computed = simulate(input);
    setCommitted({
      result: computed,
      label: label.trim() || "Scenario",
      instrumentLabel:
        INSTRUMENT_OPTIONS.find((o) => o.value === input.instrument)?.label ??
        "",
      adjustForInflation: input.adjustForInflation,
      years: (computed.months / 12).toFixed(1),
    });

    // Porta i risultati in vista senza che l'utente debba scrollare a mano;
    // istantaneo se l'utente preferisce meno movimento (stesso pattern usato
    // per le transizioni in globals.css).
    requestAnimationFrame(() => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      resultsRef.current?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
    });
  }

  function handleSave() {
    if (!input) return;
    const name = label.trim() || "Scenario senza nome";
    const next: Scenario[] = [
      {
        id: createId(),
        label: name,
        ...input,
        createdAt: new Date().toISOString(),
      },
      ...loadScenarios(),
    ];
    saveScenarios(next);
    setSavedName(name);
    window.setTimeout(() => setSavedName(null), 5000);
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          Quanto avresti risparmiato
        </h1>
        <p className="mt-2 max-w-2xl text-muted">
          Imposta un capitale iniziale, una spesa ricorrente e una finestra
          temporale: scopri quanto avresti oggi investendo nello strumento
          scelto, con capitalizzazione mensile.
        </p>
      </header>

      <div className="space-y-6">
        {/* 1. Riepilogo / invito alla compilazione */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-card bg-accent px-5 py-4 text-accent-foreground">
          <p className="text-sm font-medium">
            {committed
              ? `${committed.label} · ${committed.instrumentLabel} · ${committed.years} anni${committed.adjustForInflation ? " · al netto dell'inflazione" : ""}`
              : "Compila i parametri per vedere la simulazione."}
          </p>
        </div>

        {/* 2. Form parametri: si sviluppa in larghezza */}
        <section className="rounded-card border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold">I tuoi parametri</h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="block text-sm text-muted">
              Nome scenario
              <input
                type="text"
                value={label}
                placeholder="Es. Piano azionario"
                onChange={(e) => setLabel(e.target.value)}
                className={inputClass}
              />
            </label>

            <label className="block text-sm text-muted">
              Capitale iniziale (€)
              <input
                type="number"
                min={0}
                step={100}
                value={initialCapital}
                placeholder="0"
                onChange={(e) => setInitialCapital(e.target.value)}
                className={inputClass}
              />
            </label>

            <label className="block text-sm text-muted">
              Spesa periodica (€)
              <input
                type="number"
                min={0}
                step={10}
                value={periodicAmount}
                placeholder="0"
                onChange={(e) => setPeriodicAmount(e.target.value)}
                className={inputClass}
              />
            </label>

            <label className="block text-sm text-muted">
              Periodicità
              <select
                value={periodicity}
                onChange={(e) => setPeriodicity(e.target.value as Periodicity)}
                className={inputClass}
              >
                <option value="" disabled>
                  Seleziona…
                </option>
                {PERIODICITY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm text-muted">
              Periodo — dal
              <input
                type="date"
                value={startDate}
                max={endDate || maxDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={inputClass}
              />
            </label>

            <label className="block text-sm text-muted">
              Periodo — al
              <input
                type="date"
                value={endDate}
                min={startDate || undefined}
                max={maxDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={inputClass}
              />
            </label>

            <div className="block text-sm text-muted">
              <div className="flex items-center gap-2">
                <label htmlFor="instrument-select">Strumento</label>
                <InstrumentInfoPopover
                  instrument={instrument}
                  instrumentLabel={
                    INSTRUMENT_OPTIONS.find((o) => o.value === instrument)
                      ?.label ?? ""
                  }
                />
              </div>
              <select
                id="instrument-select"
                value={instrument}
                onChange={(e) => setInstrument(e.target.value as Instrument)}
                className={inputClass}
              >
                <option value="" disabled>
                  Seleziona…
                </option>
                {INSTRUMENT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <label className="block text-sm text-muted">
              Tassazione finale (%)
              <input
                type="number"
                min={0}
                max={100}
                step={1}
                value={taxRate}
                placeholder="0"
                onChange={(e) => setTaxRate(e.target.value)}
                className={inputClass}
              />
              <span className="mt-1 block text-xs text-muted">
                Aliquota standard in Italia: 26% (12,5% per titoli di Stato
                come BOT/BTP). Puoi comunque inserire un valore diverso.
              </span>
            </label>

            <label className="flex min-h-[44px] items-center gap-2 self-end text-sm text-foreground sm:col-span-2 lg:col-span-3">
              <input
                type="checkbox"
                checked={adjustForInflation}
                onChange={(e) => setAdjustForInflation(e.target.checked)}
                className="h-4 w-4 accent-primary"
              />
              Tieni conto dell&apos;inflazione
            </label>
          </div>

          {/* CTA separate: calcolo dei risultati e salvataggio scenario. */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleCalculate}
              disabled={!canSimulate}
              className="rounded-pill bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:opacity-90 active:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Calcola simulazione
            </button>
            <button
              onClick={handleSave}
              disabled={!canSimulate}
              className="rounded-pill border border-border px-6 py-3 font-semibold text-foreground transition hover:border-foreground/40 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Salva scenario
            </button>
          </div>

          {savedName ? (
            <div
              role="status"
              className="mt-4 rounded-card border border-border bg-accent px-4 py-3 text-sm text-accent-foreground"
            >
              <strong>Salvato!</strong> Lo scenario «{savedName}» è ora nel tuo{" "}
              <Link
                href="/storico"
                className="font-medium underline underline-offset-2"
              >
                Storico
              </Link>
              : puoi riaprirlo e confrontarlo quando vuoi.
            </div>
          ) : (
            <p className="mt-3 min-h-5 text-sm text-muted">
              «Calcola simulazione» aggiorna i risultati qui sotto. «Salva
              scenario» lo conserva nello storico (solo nel tuo browser).
            </p>
          )}
        </section>

        <div ref={resultsRef} className="space-y-6 scroll-mt-6">
          {result && result.warnings.length > 0 ? (
            <WarningBanner warnings={result.warnings} />
          ) : null}

          {/* 3. I tre box del risultato */}
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Avresti oggi"
              value={result ? formatCurrency(result.finalValue) : DASH}
              tone="gold"
            />
            <StatCard
              label="Totale investito"
              value={result ? formatCurrency(result.totalInvested) : DASH}
            />
            <StatCard
              label="Guadagno netto"
              value={result ? formatCurrency(result.netGain) : DASH}
              tone="gold"
              hint={
                result && result.taxPaid > 0
                  ? `dopo ${formatCurrency(result.taxPaid)} di tasse`
                  : undefined
              }
            />
          </div>

          {/* 4. Grafico */}
          <GrowthChart points={result ? result.points : []} />
        </div>
      </div>

      <footer className="mt-12 border-t border-border pt-6 text-xs text-muted">
        Simulazione a scopo illustrativo, calcolata sull&apos;andamento storico
        reale dello strumento scelto: non costituisce un consiglio di
        investimento. Nessun dato lascia il tuo browser: gli scenari sono
        salvati in locale.
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

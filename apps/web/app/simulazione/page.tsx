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
import { INSTRUMENT_KEYS } from "@/lib/constants";
import {
  createId,
  loadScenarios,
  saveScenarios,
  updateScenario,
  type Scenario,
} from "@/lib/storage";
import { StatCard } from "@/components/StatCard";
import { GrowthChart } from "@/components/GrowthChart";
import { WarningBanner } from "@/components/WarningBanner";
import { InstrumentInfoPopover } from "@/components/InstrumentInfoPopover";
import { useI18n } from "@/components/I18nProvider";

const PERIODICITY_VALUES: Periodicity[] = ["1w", "2w", "1m", "3m", "6m", "12m"];

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
  instrument: Instrument;
  adjustForInflation: boolean;
  years: string;
}

const inputClass =
  "mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-foreground focus-visible:border-primary";

/** Azione secondaria: bordo ink pieno così non sembra un campo disabilitato. */
const secondaryButtonClass =
  "rounded-pill border-2 border-foreground px-6 py-3 font-semibold text-foreground transition hover:bg-foreground/10 active:opacity-80 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent";

function SimulazioneContent() {
  const searchParams = useSearchParams();
  const loadId = searchParams.get("load");
  const { t, fmtCurrency } = useI18n();

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
  // Ancora per portare i risultati in vista dopo "Calcola simulazione", senza
  // interferire con l'annuncio dello screen reader sul warning banner (role="status").
  const resultsRef = useRef<HTMLDivElement>(null);
  // Id dello scenario correlato (aperto dallo storico o appena salvato): abilita
  // l'aggiornamento in-place invece di creare sempre un nuovo scenario.
  const [loadedId, setLoadedId] = useState<string | null>(null);
  // Esito dell'ultimo salvataggio, con l'azione compiuta (nuovo / aggiornato).
  const [saved, setSaved] = useState<{ name: string; updated: boolean } | null>(
    null,
  );

  // Precarica uno scenario dallo storico quando si arriva con ?load=<id>.
  // Sync intenzionale da storage/URL dopo il mount: i campi non esistono lato
  // prerender statico, quindi vanno popolati qui.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!loadId) return;
    const scenario = loadScenarios().find((s) => s.id === loadId);
    if (scenario) {
      setLoadedId(scenario.id);
      setLabel(scenario.label);
      setInitialCapital(String(scenario.initialCapital));
      setPeriodicAmount(String(scenario.periodicAmount));
      setPeriodicity(scenario.periodicity);
      setStartDate(scenario.startDate);
      setEndDate(scenario.endDate);
      setInstrument(scenario.instrument);
      setAdjustForInflation(scenario.adjustForInflation);
      setTaxRate(String(scenario.taxRate));

      // Uno scenario aperto dallo storico è già completo: calcoliamo subito i
      // risultati (box + grafico), senza attendere un click su «Calcola».
      const scenarioInput: SimulationInput = {
        initialCapital: scenario.initialCapital,
        periodicAmount: scenario.periodicAmount,
        periodicity: scenario.periodicity,
        startDate: scenario.startDate,
        endDate: scenario.endDate,
        instrument: scenario.instrument,
        adjustForInflation: scenario.adjustForInflation,
        taxRate: scenario.taxRate,
      };
      const computed = simulate(scenarioInput);
      setCommitted({
        result: computed,
        label: scenario.label.trim() || t.sim.defaultName,
        instrument: scenario.instrument,
        adjustForInflation: scenario.adjustForInflation,
        years: (computed.months / 12).toFixed(1),
      });
    }
    // t.sim.defaultName è stabile per lingua; lo scenario si ricalcola comunque
    // al cambio di ?load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      label: label.trim() || t.sim.defaultName,
      instrument: input.instrument,
      adjustForInflation: input.adjustForInflation,
      years: (computed.months / 12).toFixed(1),
    });

    // Porta i risultati in vista senza che l'utente debba scrollare a mano;
    // istantaneo se l'utente preferisce meno movimento.
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

  function flashSaved(name: string, updated: boolean) {
    setSaved({ name, updated });
    window.setTimeout(() => setSaved(null), 5000);
  }

  // Crea sempre un nuovo scenario. Dopo il salvataggio diventa quello "corrente",
  // così un ulteriore salvataggio può aggiornarlo invece di duplicarlo.
  function handleSaveNew() {
    if (!input) return;
    const name = label.trim() || t.sim.defaultNameUnnamed;
    const id = createId();
    const next: Scenario[] = [
      { id, label: name, ...input, createdAt: new Date().toISOString() },
      ...loadScenarios(),
    ];
    saveScenarios(next);
    setLoadedId(id);
    flashSaved(name, false);
  }

  // Aggiorna in-place lo scenario correlato. Se nel frattempo è stato eliminato
  // altrove, ripieghiamo su un salvataggio come nuovo per non perdere i dati.
  function handleUpdate() {
    if (!input || !loadedId) return;
    const name = label.trim() || t.sim.defaultNameUnnamed;
    const current = loadScenarios();
    if (!current.some((s) => s.id === loadedId)) {
      handleSaveNew();
      return;
    }
    saveScenarios(updateScenario(current, loadedId, { label: name, ...input }));
    flashSaved(name, true);
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">{t.sim.title}</h1>
        <p className="mt-2 max-w-2xl text-muted">{t.sim.subtitle}</p>
      </header>

      <div className="space-y-6">
        {/* 1. Riepilogo / invito alla compilazione */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-card bg-accent px-5 py-4 text-accent-foreground">
          <p className="text-sm font-medium">
            {committed
              ? t.sim.summary(
                  committed.label,
                  t.instruments[committed.instrument] ?? "",
                  committed.years,
                  committed.adjustForInflation,
                )
              : t.sim.summaryEmpty}
          </p>
        </div>

        {/* 2. Form parametri: si sviluppa in larghezza */}
        <section className="rounded-card border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold">{t.sim.paramsTitle}</h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="block text-sm text-muted">
              {t.sim.fields.label}
              <input
                type="text"
                value={label}
                placeholder={t.sim.fields.labelPlaceholder}
                onChange={(e) => setLabel(e.target.value)}
                className={inputClass}
              />
            </label>

            <label className="block text-sm text-muted">
              {t.sim.fields.initialCapital}
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
              {t.sim.fields.periodicAmount}
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
              {t.sim.fields.periodicity}
              <select
                value={periodicity}
                onChange={(e) => setPeriodicity(e.target.value as Periodicity)}
                className={inputClass}
              >
                <option value="" disabled>
                  {t.sim.fields.selectPlaceholder}
                </option>
                {PERIODICITY_VALUES.map((v) => (
                  <option key={v} value={v}>
                    {t.periodicityShort[v]}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm text-muted">
              {t.sim.fields.startDate}
              <input
                type="date"
                value={startDate}
                max={endDate || maxDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={inputClass}
              />
            </label>

            <label className="block text-sm text-muted">
              {t.sim.fields.endDate}
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
                <label htmlFor="instrument-select">{t.sim.fields.instrument}</label>
                <InstrumentInfoPopover instrument={instrument} />
              </div>
              <select
                id="instrument-select"
                value={instrument}
                onChange={(e) => setInstrument(e.target.value as Instrument)}
                className={inputClass}
              >
                <option value="" disabled>
                  {t.sim.fields.selectPlaceholder}
                </option>
                {INSTRUMENT_KEYS.map((v) => (
                  <option key={v} value={v}>
                    {t.instruments[v]}
                  </option>
                ))}
              </select>
            </div>

            <label className="block text-sm text-muted">
              {t.sim.fields.taxRate}
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
                {t.sim.fields.taxHint}
              </span>
            </label>

            <label className="flex min-h-[44px] items-center gap-2 self-end text-sm text-foreground sm:col-span-2 lg:col-span-3">
              <input
                type="checkbox"
                checked={adjustForInflation}
                onChange={(e) => setAdjustForInflation(e.target.checked)}
                className="h-4 w-4 accent-primary"
              />
              {t.sim.fields.inflation}
            </label>
          </div>

          {/* CTA separate: calcolo dei risultati e salvataggio scenario.
              Con uno scenario correlato (aperto dallo storico o già salvato) si
              può aggiornarlo in-place oppure salvarne una copia come nuovo. */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleCalculate}
              disabled={!canSimulate}
              className="rounded-pill bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:opacity-90 active:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t.sim.buttons.calculate}
            </button>
            {loadedId ? (
              <>
                <button
                  onClick={handleUpdate}
                  disabled={!canSimulate}
                  className={secondaryButtonClass}
                >
                  {t.sim.buttons.update}
                </button>
                <button
                  onClick={handleSaveNew}
                  disabled={!canSimulate}
                  className={secondaryButtonClass}
                >
                  {t.sim.buttons.saveAsNew}
                </button>
              </>
            ) : (
              <button
                onClick={handleSaveNew}
                disabled={!canSimulate}
                className={secondaryButtonClass}
              >
                {t.sim.buttons.save}
              </button>
            )}
          </div>

          {saved ? (
            <div
              role="status"
              className="mt-4 rounded-card border border-border bg-accent px-4 py-3 text-sm text-accent-foreground"
            >
              <strong>{saved.updated ? t.sim.savedUpdated : t.sim.savedNew}</strong>{" "}
              {saved.updated
                ? t.sim.savedBodyUpdated(saved.name)
                : t.sim.savedBodyNew(saved.name)}{" "}
              <Link
                href="/storico"
                className="font-medium underline underline-offset-2"
              >
                {t.sim.savedHistoryLink}
              </Link>
              {t.sim.savedBodyTail}
            </div>
          ) : (
            <p className="mt-3 min-h-5 text-sm text-muted">
              {t.sim.helperCalc}{" "}
              {loadedId ? t.sim.helperLoaded : t.sim.helperNew}
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
              label={t.sim.stat.today}
              value={result ? fmtCurrency(result.finalValue) : DASH}
              tone="gold"
            />
            <StatCard
              label={t.sim.stat.invested}
              value={result ? fmtCurrency(result.totalInvested) : DASH}
            />
            <StatCard
              label={t.sim.stat.netGain}
              value={result ? fmtCurrency(result.netGain) : DASH}
              tone="gold"
              hint={
                result && result.taxPaid > 0
                  ? t.sim.stat.taxHint(fmtCurrency(result.taxPaid))
                  : undefined
              }
            />
          </div>

          {/* 4. Grafico */}
          <GrowthChart points={result ? result.points : []} />
        </div>

        {/* 5. Passaggio al confronto con un altro scenario dello storico.
            Con uno scenario correlato (loadedId) lo preselezioniamo come prima
            simulazione; altrimenti si atterra sul confronto a selezione libera. */}
        {committed ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-border bg-surface px-5 py-4">
            <p className="text-sm text-muted">{t.sim.comparePrompt}</p>
            <Link
              href={loadedId ? `/confronta?a=${loadedId}` : "/confronta"}
              className={secondaryButtonClass}
            >
              {t.sim.compareCta}
            </Link>
          </div>
        ) : null}
      </div>

      <footer className="mt-12 border-t border-border pt-6 text-xs text-muted">
        {t.sim.footer}
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

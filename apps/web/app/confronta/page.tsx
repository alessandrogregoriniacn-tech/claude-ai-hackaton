"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { simulate } from "@/lib/finance";
import { loadScenarios, type Scenario } from "@/lib/storage";
import { ComparisonChart, type ComparisonSeries } from "@/components/ComparisonChart";
import { useI18n } from "@/components/I18nProvider";

/** Colori dedicati alle due posizioni di confronto (token, mai hard-coded). */
const COLOR_A = "var(--color-primary)";
const COLOR_B = "var(--color-accent-strong)";

const selectClass =
  "mt-1 min-h-11 w-full rounded-md border border-border bg-background px-3 py-2 text-foreground focus-visible:border-primary";

/** Riga parametro nella scheda di riepilogo. */
function ParamRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border py-2 last:border-b-0">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-medium tabular-nums text-foreground">
        {value}
      </dd>
    </div>
  );
}

/** Scheda con i parametri di una simulazione, marcata dal colore della serie. */
function ScenarioCard({
  scenario,
  color,
  position,
}: {
  scenario: Scenario;
  color: string;
  position: string;
}) {
  const { t, fmtCurrency, fmtDate } = useI18n();
  return (
    <section className="rounded-card border border-border bg-surface p-5">
      <header className="mb-3 flex items-center gap-2">
        <span
          aria-hidden="true"
          className="inline-block h-3 w-3 rounded-pill"
          style={{ backgroundColor: color }}
        />
        <div>
          <p className="text-xs uppercase tracking-wide text-muted">{position}</p>
          <h2 className="text-lg font-semibold leading-tight">
            {scenario.label}
          </h2>
        </div>
      </header>
      <dl className="text-sm">
        <ParamRow
          label={t.confronta.card.instrument}
          value={t.instruments[scenario.instrument]}
        />
        <ParamRow
          label={t.confronta.card.initialCapital}
          value={fmtCurrency(scenario.initialCapital, true)}
        />
        <ParamRow
          label={t.confronta.card.periodicAmount}
          value={`${fmtCurrency(scenario.periodicAmount, true)} ${t.periodicityEvery[scenario.periodicity]}`}
        />
        <ParamRow
          label={t.confronta.card.period}
          value={`${fmtDate(scenario.startDate)} – ${fmtDate(scenario.endDate)}`}
        />
        <ParamRow
          label={t.confronta.card.inflation}
          value={
            scenario.adjustForInflation
              ? t.confronta.card.inflationYes
              : t.confronta.card.inflationNo
          }
        />
        <ParamRow
          label={t.confronta.card.taxRate}
          value={`${scenario.taxRate}%`}
        />
      </dl>
    </section>
  );
}

function ConfrontaContent() {
  const searchParams = useSearchParams();
  const { t, fmtCurrency } = useI18n();

  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [ready, setReady] = useState(false);
  const [idA, setIdA] = useState("");
  const [idB, setIdB] = useState("");

  // Gli scenari vivono in localStorage: lettura dopo il mount. Le selezioni
  // iniziali arrivano dalla URL (?a=&b=), utile per l'atterraggio dalla
  // pagina di simulazione con la prima già scelta.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const stored = loadScenarios();
    setScenarios(stored);
    const has = (id: string | null) =>
      id !== null && stored.some((s) => s.id === id);
    const a = searchParams.get("a");
    const b = searchParams.get("b");
    if (has(a)) setIdA(a as string);
    if (has(b) && b !== a) setIdB(b as string);
    setReady(true);
  }, [searchParams]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const scenarioA = useMemo(
    () => scenarios.find((s) => s.id === idA) ?? null,
    [scenarios, idA],
  );
  const scenarioB = useMemo(
    () => scenarios.find((s) => s.id === idB) ?? null,
    [scenarios, idB],
  );

  const resultA = useMemo(
    () => (scenarioA ? simulate({ ...scenarioA }) : null),
    [scenarioA],
  );
  const resultB = useMemo(
    () => (scenarioB ? simulate({ ...scenarioB }) : null),
    [scenarioB],
  );

  const chartSeries = useMemo<ComparisonSeries[]>(() => {
    const list: ComparisonSeries[] = [];
    if (scenarioA && resultA)
      list.push({
        id: scenarioA.id,
        label: scenarioA.label,
        color: COLOR_A,
        points: resultA.points,
      });
    if (scenarioB && resultB)
      list.push({
        id: scenarioB.id,
        label: scenarioB.label,
        color: COLOR_B,
        points: resultB.points,
      });
    return list;
  }, [scenarioA, scenarioB, resultA, resultB]);

  const bothSelected = scenarioA && scenarioB && resultA && resultB;

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">{t.confronta.title}</h1>
        <p className="mt-2 max-w-2xl text-muted">{t.confronta.subtitle}</p>
      </header>

      {!ready ? null : scenarios.length < 2 ? (
        <div className="rounded-card border border-border bg-surface p-10 text-center">
          <p className="text-lg font-semibold">{t.confronta.empty.title}</p>
          <p className="mx-auto mt-2 max-w-md text-muted">
            {t.confronta.empty.body}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/simulazione"
              className="inline-flex min-h-11 items-center rounded-pill bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:opacity-90 active:opacity-80"
            >
              {t.confronta.empty.ctaSim}
            </Link>
            <Link
              href="/storico"
              className="inline-flex min-h-11 items-center rounded-pill border-2 border-foreground px-6 py-3 font-semibold text-foreground transition hover:bg-foreground/10 active:opacity-80"
            >
              {t.confronta.empty.ctaHistory}
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Selettori delle due simulazioni: una volta scelta la prima,
              non è più disponibile nella seconda select (e viceversa). */}
          <section className="grid gap-4 rounded-card border border-border bg-surface p-6 sm:grid-cols-2">
            <label className="block text-sm text-muted">
              <span className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="inline-block h-2.5 w-2.5 rounded-pill"
                  style={{ backgroundColor: COLOR_A }}
                />
                {t.confronta.first}
              </span>
              <select
                value={idA}
                onChange={(e) => setIdA(e.target.value)}
                className={selectClass}
              >
                <option value="">{t.confronta.selectPlaceholder}</option>
                {scenarios
                  .filter((s) => s.id !== idB)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
              </select>
            </label>

            <label className="block text-sm text-muted">
              <span className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="inline-block h-2.5 w-2.5 rounded-pill"
                  style={{ backgroundColor: COLOR_B }}
                />
                {t.confronta.second}
              </span>
              <select
                value={idB}
                onChange={(e) => setIdB(e.target.value)}
                className={selectClass}
              >
                <option value="">{t.confronta.selectPlaceholder}</option>
                {scenarios
                  .filter((s) => s.id !== idA)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
              </select>
            </label>
          </section>

          {bothSelected ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <ScenarioCard
                  scenario={scenarioA}
                  color={COLOR_A}
                  position={t.confronta.first}
                />
                <ScenarioCard
                  scenario={scenarioB}
                  color={COLOR_B}
                  position={t.confronta.second}
                />
              </div>

              {/* Risultati affiancati: descrizione dei numeri, senza giudizi. */}
              <section className="overflow-hidden rounded-card border border-border bg-surface">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th scope="col" className="px-5 py-3 font-medium text-muted">
                        {t.confronta.table.result}
                      </th>
                      <th scope="col" className="px-5 py-3 text-right font-semibold">
                        <span className="flex items-center justify-end gap-2">
                          <span
                            aria-hidden="true"
                            className="inline-block h-2.5 w-2.5 rounded-pill"
                            style={{ backgroundColor: COLOR_A }}
                          />
                          {scenarioA.label}
                        </span>
                      </th>
                      <th scope="col" className="px-5 py-3 text-right font-semibold">
                        <span className="flex items-center justify-end gap-2">
                          <span
                            aria-hidden="true"
                            className="inline-block h-2.5 w-2.5 rounded-pill"
                            style={{ backgroundColor: COLOR_B }}
                          />
                          {scenarioB.label}
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="tabular-nums">
                    <tr className="border-b border-border">
                      <th scope="row" className="px-5 py-3 text-left font-normal text-muted">
                        {t.confronta.table.today}
                      </th>
                      <td className="px-5 py-3 text-right">
                        {fmtCurrency(resultA.finalValue)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        {fmtCurrency(resultB.finalValue)}
                      </td>
                    </tr>
                    <tr className="border-b border-border">
                      <th scope="row" className="px-5 py-3 text-left font-normal text-muted">
                        {t.confronta.table.invested}
                      </th>
                      <td className="px-5 py-3 text-right">
                        {fmtCurrency(resultA.totalInvested)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        {fmtCurrency(resultB.totalInvested)}
                      </td>
                    </tr>
                    <tr>
                      <th scope="row" className="px-5 py-3 text-left font-normal text-muted">
                        {t.confronta.table.netGain}
                      </th>
                      <td className="px-5 py-3 text-right">
                        {fmtCurrency(resultA.netGain)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        {fmtCurrency(resultB.netGain)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </section>

              <ComparisonChart series={chartSeries} />
            </>
          ) : (
            <p className="rounded-card border border-border bg-surface px-5 py-4 text-sm text-muted">
              {t.confronta.hintSelectTwo}
            </p>
          )}
        </div>
      )}

      <footer className="mt-12 border-t border-border pt-6 text-xs text-muted">
        {t.confronta.footer}
      </footer>
    </main>
  );
}

export default function ConfrontaPage() {
  return (
    <Suspense fallback={null}>
      <ConfrontaContent />
    </Suspense>
  );
}

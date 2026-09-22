"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { simulate } from "@/lib/finance";
import { loadScenarios, saveScenarios, type Scenario } from "@/lib/storage";
import { exportScenariosToExcel } from "@/lib/excelExport";
import { WarningBanner } from "@/components/WarningBanner";
import { useI18n } from "@/components/I18nProvider";

/** Numero di scenari per pagina: oltre questa soglia compare il paginatore. */
const PAGE_SIZE = 10;

export default function StoricoPage() {
  const { t, fmtCurrency, fmtDate, locale } = useI18n();

  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [ready, setReady] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);

  const selectAllRef = useRef<HTMLInputElement>(null);

  // Gli scenari vivono in localStorage: lettura intenzionale dopo il mount
  // (non disponibile lato prerender statico).
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setScenarios(loadScenarios());
    setReady(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const totalPages = Math.max(1, Math.ceil(scenarios.length / PAGE_SIZE));

  // Pagina "clampata" all'intervallo valido: dopo un'eliminazione la pagina
  // corrente potrebbe non esistere più, così evitiamo una lista vuota senza
  // dover sincronizzare lo stato in un effect.
  const safePage = Math.min(Math.max(1, page), totalPages);

  const pageScenarios = useMemo(
    () => scenarios.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [scenarios, safePage],
  );

  const allSelected =
    scenarios.length > 0 && selectedIds.size === scenarios.length;

  // Stato "parziale" della checkbox generale: alcuni selezionati, non tutti.
  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate =
        selectedIds.size > 0 && selectedIds.size < scenarios.length;
    }
  }, [selectedIds, scenarios.length]);

  function persist(next: Scenario[]) {
    setScenarios(next);
    saveScenarios(next);
  }

  function handleDelete(id: string) {
    persist(scenarios.filter((s) => s.id !== id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  function handleDeleteSelected() {
    if (selectedIds.size === 0) return;
    persist(scenarios.filter((s) => !selectedIds.has(s.id)));
    setSelectedIds(new Set());
  }

  function handleClear() {
    persist([]);
    setSelectedIds(new Set());
    setPage(1);
  }

  function toggleAll() {
    setSelectedIds(
      allSelected ? new Set() : new Set(scenarios.map((s) => s.id)),
    );
  }

  function toggleRow(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleExport() {
    if (scenarios.length === 0 || exporting) return;
    setExporting(true);
    try {
      await exportScenariosToExcel(scenarios, t, locale);
    } finally {
      setExporting(false);
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.storico.title}</h1>
          <p className="mt-2 max-w-2xl text-muted">{t.storico.subtitle}</p>
        </div>
        {scenarios.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting}
              className="min-h-11 rounded-pill border-2 border-foreground px-4 text-sm font-semibold text-foreground transition hover:bg-foreground/10 active:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t.storico.exportExcel}
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="min-h-11 rounded-pill border-2 border-negative px-4 text-sm font-semibold text-negative transition hover:bg-negative/10 active:opacity-80"
            >
              {t.storico.clearAll}
            </button>
          </div>
        ) : null}
      </header>

      {!ready ? null : scenarios.length === 0 ? (
        <div className="rounded-card border border-border bg-surface p-10 text-center">
          <p className="text-lg font-semibold">{t.storico.empty.title}</p>
          <p className="mx-auto mt-2 max-w-md text-muted">{t.storico.empty.body}</p>
          <Link
            href="/simulazione"
            className="mt-6 inline-flex min-h-11 items-center rounded-pill bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:opacity-90 active:opacity-80"
          >
            {t.storico.empty.cta}
          </Link>
        </div>
      ) : (
        <>
          {/* Barra di selezione multipla: seleziona tutti + eliminazione massiva. */}
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-card border border-border bg-surface px-4 py-2">
            <label className="-m-2 inline-flex min-h-11 items-center gap-2 p-2 text-sm font-medium text-foreground">
              <input
                ref={selectAllRef}
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                className="h-4 w-4 accent-primary"
              />
              {t.storico.selectAll}
              {selectedIds.size > 0 ? (
                <span className="text-muted">
                  · {t.storico.selectedCount(selectedIds.size)}
                </span>
              ) : null}
            </label>
            <button
              type="button"
              onClick={handleDeleteSelected}
              disabled={selectedIds.size === 0}
              className="min-h-11 rounded-pill border-2 border-negative px-4 text-sm font-semibold text-negative transition hover:bg-negative/10 active:opacity-80 disabled:cursor-not-allowed disabled:border-border disabled:text-muted disabled:hover:bg-transparent"
            >
              {t.storico.deleteSelected}
            </button>
          </div>

          <ul className="space-y-2">
            {pageScenarios.map((s) => {
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
              const checked = selectedIds.has(s.id);
              // La chiave strumento salvata può non esistere più (dataset
              // aggiornato dopo il salvataggio): in tal caso la label è assente
              // e lo segnaliamo, senza crash e senza etichetta vuota.
              const instrumentLabel = t.instruments[s.instrument] as
                | string
                | undefined;
              return (
                <li
                  key={s.id}
                  className={`rounded-card border bg-surface px-4 py-3 transition ${
                    checked ? "border-primary" : "border-border"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <label className="-m-2 inline-flex min-h-11 min-w-11 items-center justify-center p-2">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleRow(s.id)}
                          aria-label={t.storico.selectRow(s.label)}
                          className="h-4 w-4 accent-primary"
                        />
                      </label>
                      <div>
                        <p className="font-medium">{s.label}</p>
                        <p className="text-sm text-muted">
                          {instrumentLabel ?? (
                            <span className="inline-flex items-center gap-1 text-negative">
                              <span aria-hidden="true">⚠</span>
                              {t.storico.instrumentUnavailable}
                            </span>
                          )}{" "}
                          ·{" "}
                          {t.storico.row.details(
                            fmtCurrency(s.periodicAmount, true),
                            t.periodicityEvery[s.periodicity],
                            fmtDate(s.startDate),
                            fmtDate(s.endDate),
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold tabular-nums text-foreground">
                        {fmtCurrency(r.finalValue)}
                      </span>
                      <Link
                        href={`/simulazione?load=${s.id}`}
                        className="inline-flex min-h-11 items-center rounded-pill border-2 border-foreground px-4 text-sm font-semibold text-foreground transition hover:bg-foreground/10 active:opacity-80"
                      >
                        {t.storico.row.open}
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(s.id)}
                        className="-m-2 inline-flex min-h-11 items-center p-2 text-sm font-medium text-negative underline-offset-2 hover:underline"
                      >
                        {t.storico.row.delete}
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

          {/* Paginatore: solo con più di una pagina (oltre PAGE_SIZE scenari). */}
          {totalPages > 1 ? (
            <nav
              className="mt-4 flex items-center justify-center gap-4"
              aria-label={t.storico.pagination.navLabel}
            >
              <button
                type="button"
                onClick={() => setPage(safePage - 1)}
                disabled={safePage <= 1}
                aria-label={t.storico.pagination.prev}
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-pill border border-border text-foreground transition hover:border-foreground/40 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span aria-hidden="true">‹</span>
              </button>
              <span className="text-sm tabular-nums text-muted">
                {t.storico.pagination.status(safePage, totalPages)}
              </span>
              <button
                type="button"
                onClick={() => setPage(safePage + 1)}
                disabled={safePage >= totalPages}
                aria-label={t.storico.pagination.next}
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-pill border border-border text-foreground transition hover:border-foreground/40 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span aria-hidden="true">›</span>
              </button>
            </nav>
          ) : null}
        </>
      )}
    </main>
  );
}

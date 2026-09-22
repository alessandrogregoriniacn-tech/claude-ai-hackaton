"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { MonthlyPoint } from "@/lib/finance";
import { useI18n } from "./I18nProvider";

/** Una simulazione da sovrapporre nel grafico, con il suo colore dedicato. */
export interface ComparisonSeries {
  id: string;
  label: string;
  /** Colore della linea: un token CSS, es. "var(--color-primary)". */
  color: string;
  points: MonthlyPoint[];
}

interface ComparisonChartProps {
  series: ComparisonSeries[];
}

const WIDTH = 720;
const HEIGHT = 280;
const PAD = { top: 16, right: 16, bottom: 44, left: 56 };
const AXIS_LABEL_SIZE = 11;

/**
 * Grafico di confronto: sovrappone la curva "con rendimento" di più simulazioni
 * su un asse temporale comune (unione dei mesi), ognuna con un colore distinto.
 * Le simulazioni possono coprire periodi diversi: ciascuna linea è disegnata solo
 * sui mesi che le appartengono, allineati per data reale ("YYYY-MM").
 */
export function ComparisonChart({ series }: ComparisonChartProps) {
  const { t, fmtCurrency, formatMonthLabel } = useI18n();
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  // Asse temporale condiviso: unione ordinata dei mesi di tutte le serie.
  const months = useMemo(() => {
    const set = new Set<string>();
    for (const s of series) for (const p of s.points) set.add(p.month);
    return Array.from(set).sort();
  }, [series]);

  const chart = useMemo(() => {
    const n = months.length;
    if (n < 2) return null;

    const monthIndex = new Map<string, number>();
    months.forEach((mo, i) => monthIndex.set(mo, i));

    const innerW = WIDTH - PAD.left - PAD.right;
    const innerH = HEIGHT - PAD.top - PAD.bottom;

    let maxValue = 1;
    for (const s of series)
      for (const p of s.points) maxValue = Math.max(maxValue, p.value);

    const x = (i: number) => PAD.left + (i / (n - 1)) * innerW;
    const y = (v: number) => PAD.top + innerH - (v / maxValue) * innerH;

    // Per ogni serie: il tracciato e una mappa mese→valore per il tooltip.
    const lines = series.map((s) => {
      const ordered = [...s.points].sort((a, b) =>
        a.month < b.month ? -1 : a.month > b.month ? 1 : 0,
      );
      const path = ordered
        .map((p, i) => {
          const idx = monthIndex.get(p.month) ?? 0;
          return `${i === 0 ? "M" : "L"} ${x(idx).toFixed(1)} ${y(p.value).toFixed(1)}`;
        })
        .join(" ");
      const valueByMonth = new Map<string, number>();
      for (const p of s.points) valueByMonth.set(p.month, p.value);
      return { ...s, path, valueByMonth };
    });

    const yTicks = 4;
    const gridLines = Array.from({ length: yTicks + 1 }, (_, i) => {
      const v = (maxValue / yTicks) * i;
      return { v, y: y(v) };
    });

    const xTickCount = Math.min(6, n);
    const xTicks = Array.from({ length: xTickCount }, (_, i) => {
      const idx = Math.round((i / (xTickCount - 1)) * (n - 1));
      return { x: x(idx), label: formatMonthLabel(months[idx]) };
    });

    return { n, x, y, lines, gridLines, xTicks, innerH };
  }, [series, months, formatMonthLabel]);

  const indexFromEvent = useCallback(
    (clientX: number): number | null => {
      const svg = svgRef.current;
      if (!svg || !chart) return null;
      const rect = svg.getBoundingClientRect();
      const localX = ((clientX - rect.left) / rect.width) * WIDTH;
      const innerW = WIDTH - PAD.left - PAD.right;
      const frac = (localX - PAD.left) / innerW;
      const i = Math.round(frac * (chart.n - 1));
      return Math.max(0, Math.min(chart.n - 1, i));
    },
    [chart],
  );

  if (!chart) {
    return (
      <div
        style={{ height: HEIGHT }}
        className="flex items-center justify-center rounded-card border border-border bg-surface text-sm text-muted"
      >
        {t.chart.emptyCompare}
      </div>
    );
  }

  const hoverMonth = hover !== null ? months[hover] : null;
  const hoverX = hover !== null ? chart.x(hover) : 0;

  return (
    <div className="flex flex-col rounded-card border border-border bg-surface p-4">
      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="w-full touch-none select-none"
          role="img"
          aria-label={t.chart.ariaCompare(
            series.map((s) => s.label).join(t.chart.compareJoin),
          )}
          onMouseMove={(e) => setHover(indexFromEvent(e.clientX))}
          onMouseLeave={() => setHover(null)}
        >
          {chart.gridLines.map((g, i) => (
            <g key={i}>
              <line
                x1={PAD.left}
                x2={WIDTH - PAD.right}
                y1={g.y}
                y2={g.y}
                stroke="var(--color-border)"
                strokeWidth={1}
              />
              <text
                x={PAD.left - 8}
                y={g.y + 4}
                textAnchor="end"
                fontSize={AXIS_LABEL_SIZE}
                fill="var(--color-muted)"
              >
                {fmtCurrency(g.v)}
              </text>
            </g>
          ))}

          {chart.xTicks.map((t, i) => (
            <text
              key={i}
              x={t.x}
              y={HEIGHT - PAD.bottom + 18}
              textAnchor={
                i === 0
                  ? "start"
                  : i === chart.xTicks.length - 1
                    ? "end"
                    : "middle"
              }
              fontSize={AXIS_LABEL_SIZE}
              fill="var(--color-muted)"
            >
              {t.label}
            </text>
          ))}

          {hover !== null ? (
            <line
              x1={hoverX}
              x2={hoverX}
              y1={PAD.top}
              y2={PAD.top + chart.innerH}
              stroke="var(--color-border)"
              strokeWidth={1}
            />
          ) : null}

          {chart.lines.map((l) => (
            <path
              key={l.id}
              d={l.path}
              fill="none"
              stroke={l.color}
              strokeWidth={2.5}
            />
          ))}

          {hover !== null && hoverMonth
            ? chart.lines.map((l) => {
                const v = l.valueByMonth.get(hoverMonth);
                if (v === undefined) return null;
                return (
                  <circle
                    key={l.id}
                    cx={hoverX}
                    cy={chart.y(v)}
                    r={4}
                    fill={l.color}
                    pointerEvents="none"
                  />
                );
              })
            : null}
        </svg>

        {hover !== null && hoverMonth ? (
          <div
            className="pointer-events-none absolute z-10 -mt-2 -translate-x-1/2 -translate-y-full rounded-md border border-border bg-background px-3 py-2 text-xs shadow-lg"
            style={{
              left: `${(hoverX / WIDTH) * 100}%`,
              top: `${PAD.top}%`,
            }}
          >
            <p className="font-semibold text-foreground">
              {formatMonthLabel(hoverMonth)}
            </p>
            {chart.lines.map((l) => {
              const v = l.valueByMonth.get(hoverMonth);
              return (
                <p key={l.id} className="mt-1 tabular-nums text-foreground">
                  <span
                    aria-hidden="true"
                    className="inline-block h-2 w-2 rounded-full align-middle"
                    style={{ backgroundColor: l.color }}
                  />{" "}
                  {l.label}: {v === undefined ? "—" : fmtCurrency(v)}
                </p>
              );
            })}
          </div>
        ) : null}
      </div>

      <div className="mt-2 flex flex-wrap gap-6 px-2 text-xs text-muted">
        {chart.lines.map((l) => (
          <span key={l.id} className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="inline-block h-0.5 w-4"
              style={{ backgroundColor: l.color }}
            />
            {l.label}
          </span>
        ))}
      </div>
    </div>
  );
}

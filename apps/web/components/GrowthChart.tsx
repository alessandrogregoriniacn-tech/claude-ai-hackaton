"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MonthlyPoint } from "@/lib/finance";
import { useI18n } from "./I18nProvider";

interface GrowthChartProps {
  points: MonthlyPoint[];
}

const WIDTH = 720;
const HEIGHT = 280;
const PAD = { top: 16, right: 16, bottom: 44, left: 56 };

/** Larghezza stimata (px nel viewBox) di un carattere delle etichette asse Y. */
const AXIS_LABEL_CHAR_WIDTH = 6.4;
const AXIS_LABEL_MAX_LEFT_PAD = 108;

/** Numero minimo di punti visibili: sotto questa soglia lo zoom si ferma. */
const MIN_WINDOW = 4;

/** Dimensione delle etichette testuali sugli assi SVG (px nel viewBox). */
const AXIS_LABEL_SIZE = 11;

/** Opacità del riempimento dell'area sotto la curva del valore. */
const AREA_FILL_OPACITY = 0.35;

interface ChartBodyProps {
  points: MonthlyPoint[];
  /** True quando è renderizzato dentro la modale a schermo intero. */
  isModal: boolean;
  /** Apre (inline) o chiude (modale) la vista a schermo intero. */
  onToggle: () => void;
}

/**
 * Corpo del grafico con controlli e interazioni. Ogni istanza mantiene il
 * proprio stato (finestra visibile, hover): inline e modale sono indipendenti.
 */
function ChartBody({ points, isModal, onToggle }: ChartBodyProps) {
  const { t, fmtCurrency, formatMonthLabel } = useI18n();
  const svgRef = useRef<SVGSVGElement>(null);

  // Finestra visibile [start, end] come indici nei punti: è ciò che lo zoom e
  // lo scroll spostano. Si resetta a tutto l'intervallo quando i dati cambiano.
  const [range, setRange] = useState({ start: 0, end: Math.max(0, points.length - 1) });
  const [hover, setHover] = useState<number | null>(null);
  const dragRef = useRef<{ x: number; start: number; end: number } | null>(null);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setRange({ start: 0, end: Math.max(0, points.length - 1) });
    setHover(null);
  }, [points]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const total = points.length;
  const start = Math.min(range.start, Math.max(0, total - 1));
  const end = Math.min(range.end, Math.max(0, total - 1));

  const chart = useMemo(() => {
    if (total < 2) return null;
    const visible = points.slice(start, end + 1);
    if (visible.length < 2) return null;

    const maxValue = Math.max(...visible.map((p) => p.value), 1);

    // Pad sinistro adattivo: le etichette a 6+ cifre ("€1.234.567") sono più
    // larghe del pad fisso e verrebbero tagliate dal clip di default dell'SVG.
    const widestLabelLength = fmtCurrency(maxValue).length;
    const padLeft = Math.min(
      AXIS_LABEL_MAX_LEFT_PAD,
      Math.max(PAD.left, 16 + widestLabelLength * AXIS_LABEL_CHAR_WIDTH),
    );

    const innerW = WIDTH - padLeft - PAD.right;
    const innerH = HEIGHT - PAD.top - PAD.bottom;

    const n = visible.length;
    const x = (i: number) => padLeft + (i / (n - 1)) * innerW;
    const y = (v: number) => PAD.top + innerH - (v / maxValue) * innerH;

    const toPath = (key: "value" | "contributed") =>
      visible
        .map((p, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(p[key]).toFixed(1)}`)
        .join(" ");

    const valuePath = toPath("value");
    const contributedPath = toPath("contributed");
    const areaPath = `${valuePath} L ${x(n - 1).toFixed(1)} ${(PAD.top + innerH).toFixed(
      1,
    )} L ${x(0).toFixed(1)} ${(PAD.top + innerH).toFixed(1)} Z`;

    const yTicks = 4;
    const gridLines = Array.from({ length: yTicks + 1 }, (_, i) => {
      const v = (maxValue / yTicks) * i;
      return { v, y: y(v) };
    });

    // Fino a 6 etichette temporali equidistanti sull'asse X.
    const xTickCount = Math.min(6, n);
    const xTicks = Array.from({ length: xTickCount }, (_, i) => {
      const idx = Math.round((i / (xTickCount - 1)) * (n - 1));
      return { x: x(idx), label: formatMonthLabel(visible[idx].month) };
    });

    return {
      visible,
      x,
      y,
      valuePath,
      contributedPath,
      areaPath,
      gridLines,
      xTicks,
      innerH,
      padLeft,
    };
  }, [points, start, end, total, fmtCurrency, formatMonthLabel]);

  /** Indice (nella finestra visibile) più vicino alla coordinata X del mouse. */
  const indexFromEvent = useCallback(
    (clientX: number): number | null => {
      const svg = svgRef.current;
      if (!svg || !chart) return null;
      const rect = svg.getBoundingClientRect();
      const localX = ((clientX - rect.left) / rect.width) * WIDTH;
      const innerW = WIDTH - chart.padLeft - PAD.right;
      const frac = (localX - chart.padLeft) / innerW;
      const i = Math.round(frac * (chart.visible.length - 1));
      return Math.max(0, Math.min(chart.visible.length - 1, i));
    },
    [chart],
  );

  const clampRange = useCallback(
    (s: number, e: number) => {
      const width = e - s;
      let ns = Math.max(0, Math.min(s, total - 1 - width));
      const ne = ns + width;
      if (ne > total - 1) {
        ns = total - 1 - width;
        return { start: Math.max(0, ns), end: total - 1 };
      }
      return { start: ns, end: ne };
    },
    [total],
  );

  const zoom = useCallback(
    (factor: number, centerIdx?: number) => {
      const width = end - start;
      const newWidth = Math.max(MIN_WINDOW, Math.min(total - 1, Math.round(width * factor)));
      if (newWidth === width) return;
      const center = centerIdx ?? start + width / 2;
      const ratio = width === 0 ? 0.5 : (center - start) / width;
      const ns = Math.round(center - ratio * newWidth);
      setRange(clampRange(ns, ns + newWidth));
    },
    [start, end, total, clampRange],
  );

  const pan = useCallback(
    (steps: number) => {
      setRange(clampRange(start + steps, end + steps));
    },
    [start, end, clampRange],
  );

  // Solo il pinch-to-zoom (che il browser riporta come wheel + ctrlKey) zooma
  // il grafico: la rotellina normale deve continuare a scrollare la pagina.
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (!chart || !e.ctrlKey) return;
      e.preventDefault();
      const center = start + (indexFromEvent(e.clientX) ?? 0);
      zoom(e.deltaY > 0 ? 1.2 : 1 / 1.2, center);
    },
    [chart, start, indexFromEvent, zoom],
  );

  const handleMove = useCallback(
    (e: React.MouseEvent) => {
      if (dragRef.current) {
        const svg = svgRef.current;
        if (!svg || !chart) return;
        const rect = svg.getBoundingClientRect();
        const innerW = WIDTH - chart.padLeft - PAD.right;
        const dxPx = e.clientX - dragRef.current.x;
        const dxIdx = Math.round(
          -(dxPx / rect.width) * WIDTH / (innerW / (chart.visible.length - 1)),
        );
        setRange(clampRange(dragRef.current.start + dxIdx, dragRef.current.end + dxIdx));
        return;
      }
      const i = indexFromEvent(e.clientX);
      setHover(i);
    },
    [chart, indexFromEvent, clampRange],
  );

  const canZoomOut = end - start < total - 1;
  const canZoomIn = end - start > MIN_WINDOW;

  if (total < 2 || !chart) {
    return (
      <div className="flex h-[280px] items-center justify-center rounded-card border border-border bg-surface text-sm text-muted">
        {t.chart.empty}
      </div>
    );
  }

  const hoverPoint = hover !== null ? chart.visible[hover] : null;
  const hoverX = hover !== null ? chart.x(hover) : 0;
  const hoverY = hoverPoint ? chart.y(hoverPoint.value) : 0;

  const controlClass =
    "inline-flex min-h-11 min-w-11 items-center justify-center rounded-pill border border-border px-3 text-sm font-medium text-foreground transition hover:border-foreground/40 disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="flex flex-col rounded-card border border-border bg-surface p-4">
      {/* Controlli: zoom, scroll, reset, schermo intero */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => pan(-Math.max(1, Math.round((end - start) / 4)))}
          disabled={start <= 0}
          className={controlClass}
          aria-label={t.chart.panBack}
        >
          <span aria-hidden="true">‹</span>
        </button>
        <button
          type="button"
          onClick={() => pan(Math.max(1, Math.round((end - start) / 4)))}
          disabled={end >= total - 1}
          className={controlClass}
          aria-label={t.chart.panForward}
        >
          <span aria-hidden="true">›</span>
        </button>
        <button
          type="button"
          onClick={() => zoom(1 / 1.6)}
          disabled={!canZoomIn}
          className={controlClass}
          aria-label={t.chart.zoomIn}
        >
          <span aria-hidden="true">+</span>
        </button>
        <button
          type="button"
          onClick={() => zoom(1.6)}
          disabled={!canZoomOut}
          className={controlClass}
          aria-label={t.chart.zoomOut}
        >
          <span aria-hidden="true">−</span>
        </button>
        <button
          type="button"
          onClick={() => setRange({ start: 0, end: total - 1 })}
          disabled={start <= 0 && end >= total - 1}
          className={controlClass}
        >
          {t.chart.reset}
        </button>
        <button
          type="button"
          onClick={onToggle}
          className={`${controlClass} ml-auto`}
          aria-label={
            isModal ? t.chart.fullscreenCloseAria : t.chart.fullscreenOpenAria
          }
        >
          {isModal ? t.chart.fullscreenClose : t.chart.fullscreen}
        </button>
      </div>

      <div className="relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className={`w-full touch-none select-none cursor-crosshair active:cursor-grabbing ${
            isModal ? "max-h-[72vh]" : ""
          }`}
          role="img"
          aria-label={t.chart.ariaGrowth}
          onMouseMove={handleMove}
          onMouseLeave={() => setHover(null)}
          onMouseDown={(e) => {
            dragRef.current = { x: e.clientX, start, end };
            setHover(null);
          }}
          onMouseUp={() => (dragRef.current = null)}
          onWheel={handleWheel}
        >
          {chart.gridLines.map((g, i) => (
            <g key={i}>
              <line
                x1={chart.padLeft}
                x2={WIDTH - PAD.right}
                y1={g.y}
                y2={g.y}
                stroke="var(--color-border)"
                strokeWidth={1}
              />
              <text
                x={chart.padLeft - 8}
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
              textAnchor={i === 0 ? "start" : i === chart.xTicks.length - 1 ? "end" : "middle"}
              fontSize={AXIS_LABEL_SIZE}
              fill="var(--color-muted)"
            >
              {t.label}
            </text>
          ))}

          <path d={chart.areaPath} fill="var(--color-accent)" opacity={AREA_FILL_OPACITY} />
          <path
            d={chart.contributedPath}
            fill="none"
            stroke="var(--color-muted)"
            strokeWidth={2}
            strokeDasharray="4 4"
          />
          <path d={chart.valuePath} fill="none" stroke="var(--color-primary)" strokeWidth={2.5} />

          {hoverPoint ? (
            <g pointerEvents="none">
              <line
                x1={hoverX}
                x2={hoverX}
                y1={PAD.top}
                y2={PAD.top + chart.innerH}
                stroke="var(--color-border)"
                strokeWidth={1}
              />
              <circle cx={hoverX} cy={hoverY} r={4} fill="var(--color-primary)" />
            </g>
          ) : null}
        </svg>

        {hoverPoint ? (
          <div
            className="pointer-events-none absolute z-10 -mt-2 -translate-x-1/2 -translate-y-full rounded-md border border-border bg-background px-3 py-2 text-xs shadow-lg"
            style={{
              left: `${(hoverX / WIDTH) * 100}%`,
              top: `${(hoverY / HEIGHT) * 100}%`,
            }}
          >
            <p className="font-semibold text-foreground">{formatMonthLabel(hoverPoint.month)}</p>
            <p className="mt-1 tabular-nums text-foreground">
              <span className="inline-block h-2 w-2 rounded-full bg-primary align-middle" />{" "}
              {t.chart.withReturn}: {fmtCurrency(hoverPoint.value)}
            </p>
            <p className="tabular-nums text-muted">
              <span className="inline-block h-2 w-2 rounded-full bg-muted align-middle" />{" "}
              {t.chart.onlyContributed}: {fmtCurrency(hoverPoint.contributed)}
            </p>
          </div>
        ) : null}
      </div>

      <div className="mt-2 flex flex-wrap gap-6 px-2 text-xs text-muted">
        <span className="flex items-center gap-2">
          <span className="inline-block h-0.5 w-4 bg-primary" /> {t.chart.withReturn}
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block h-0.5 w-4 border-t-2 border-dashed border-muted" />{" "}
          {t.chart.onlyContributed}
        </span>
        <span className="ml-auto hidden sm:inline">{t.chart.dragHint}</span>
      </div>
    </div>
  );
}

export function GrowthChart({ points }: GrowthChartProps) {
  const { t } = useI18n();
  const [expanded, setExpanded] = useState(false);

  // Con la modale aperta: Esc per chiudere e blocco dello scroll del body.
  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [expanded]);

  return (
    <>
      <ChartBody points={points} isModal={false} onToggle={() => setExpanded(true)} />

      {expanded ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t.chart.fullscreenDialogAria}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setExpanded(false);
          }}
        >
          <div className="w-[95vw] max-w-6xl">
            <ChartBody points={points} isModal onToggle={() => setExpanded(false)} />
          </div>
        </div>
      ) : null}
    </>
  );
}

"use client";

import { useMemo } from "react";
import type { MonthlyPoint } from "@/lib/finance";
import { formatCurrency } from "@/lib/format";

interface GrowthChartProps {
  points: MonthlyPoint[];
}

const WIDTH = 720;
const HEIGHT = 280;
const PAD = { top: 16, right: 16, bottom: 28, left: 56 };

export function GrowthChart({ points }: GrowthChartProps) {
  const chart = useMemo(() => {
    if (points.length < 2) return null;

    const innerW = WIDTH - PAD.left - PAD.right;
    const innerH = HEIGHT - PAD.top - PAD.bottom;
    const maxValue = Math.max(...points.map((p) => p.value), 1);

    const x = (i: number) => PAD.left + (i / (points.length - 1)) * innerW;
    const y = (v: number) => PAD.top + innerH - (v / maxValue) * innerH;

    const toPath = (key: "value" | "contributed") =>
      points
        .map((p, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(p[key]).toFixed(1)}`)
        .join(" ");

    const valuePath = toPath("value");
    const contributedPath = toPath("contributed");
    const areaPath = `${valuePath} L ${x(points.length - 1).toFixed(1)} ${(
      PAD.top + innerH
    ).toFixed(1)} L ${x(0).toFixed(1)} ${(PAD.top + innerH).toFixed(1)} Z`;

    const ticks = 4;
    const gridLines = Array.from({ length: ticks + 1 }, (_, i) => {
      const v = (maxValue / ticks) * i;
      return { v, y: y(v) };
    });

    return { valuePath, contributedPath, areaPath, gridLines };
  }, [points]);

  if (!chart) {
    return (
      <div className="flex h-[280px] items-center justify-center rounded-card border border-border bg-surface text-sm text-muted">
        Imposta i parametri per vedere la crescita nel tempo.
      </div>
    );
  }

  return (
    <div className="rounded-card border border-border bg-surface p-4">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" role="img" aria-label="Crescita del capitale nel tempo">
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
              fontSize={11}
              fill="var(--color-muted)"
            >
              {formatCurrency(g.v)}
            </text>
          </g>
        ))}

        <path d={chart.areaPath} fill="var(--color-accent)" opacity={0.35} />
        <path d={chart.contributedPath} fill="none" stroke="var(--color-muted)" strokeWidth={2} strokeDasharray="4 4" />
        <path d={chart.valuePath} fill="none" stroke="var(--color-primary)" strokeWidth={2.5} />
      </svg>

      <div className="mt-2 flex gap-6 px-2 text-xs text-muted">
        <span className="flex items-center gap-2">
          <span className="inline-block h-0.5 w-4 bg-primary" /> Con rendimento
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block h-0.5 w-4 border-t-2 border-dashed border-muted" /> Solo versato
        </span>
      </div>
    </div>
  );
}

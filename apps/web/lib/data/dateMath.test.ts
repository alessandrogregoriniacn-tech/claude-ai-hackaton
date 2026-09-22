import { describe, expect, it } from "vitest";
import { clampIso, diffDays, growthFactor, levelAt } from "./dateMath";
import type { HistoricalSeries } from "./types";

const series: HistoricalSeries = {
  points: [
    { date: "2000-01-01", level: 100 },
    { date: "2001-01-01", level: 110 },
    { date: "2002-01-01", level: 121 },
  ],
  startDate: "2000-01-01",
  endDate: "2002-01-01",
};

describe("diffDays", () => {
  it("calcola i giorni tra due date", () => {
    expect(diffDays("2000-01-01", "2000-01-02")).toBe(1);
    expect(diffDays("2000-01-02", "2000-01-01")).toBe(-1);
    expect(diffDays("2000-01-01", "2000-01-01")).toBe(0);
  });
});

describe("clampIso", () => {
  it("clampa dentro il range", () => {
    expect(clampIso("1999-01-01", "2000-01-01", "2002-01-01")).toBe("2000-01-01");
    expect(clampIso("2003-01-01", "2000-01-01", "2002-01-01")).toBe("2002-01-01");
    expect(clampIso("2001-06-01", "2000-01-01", "2002-01-01")).toBe("2001-06-01");
  });
});

describe("levelAt", () => {
  it("restituisce il livello esatto su un punto noto", () => {
    expect(levelAt(series, "2001-01-01")).toBe(110);
  });

  it("interpola geometricamente tra due punti", () => {
    const mid = levelAt(series, "2000-07-02"); // ~metà anno
    expect(mid).toBeGreaterThan(100);
    expect(mid).toBeLessThan(110);
  });

  it("gestisce una serie con un solo punto", () => {
    const single: HistoricalSeries = { points: [{ date: "2000-01-01", level: 42 }], startDate: "2000-01-01", endDate: "2000-01-01" };
    expect(levelAt(single, "2005-01-01")).toBe(42);
  });
});

describe("growthFactor", () => {
  it("calcola il fattore di crescita dentro il range", () => {
    const g = growthFactor(series, "2000-01-01", "2001-01-01");
    expect(g.factor).toBeCloseTo(1.1, 6);
    expect(g.clampedStart).toBe(false);
    expect(g.clampedEnd).toBe(false);
  });

  it("clampa quando la finestra eccede il range disponibile", () => {
    const g = growthFactor(series, "1990-01-01", "2010-01-01");
    expect(g.clampedStart).toBe(true);
    expect(g.clampedEnd).toBe(true);
    expect(g.effectiveStart).toBe("2000-01-01");
    expect(g.effectiveEnd).toBe("2002-01-01");
    expect(Number.isFinite(g.factor)).toBe(true);
  });

  it("non produce mai NaN/Infinity anche con date invertite", () => {
    const g = growthFactor(series, "2002-01-01", "2000-01-01");
    expect(Number.isFinite(g.factor)).toBe(true);
    expect(g.factor).toBeGreaterThan(0);
  });
});

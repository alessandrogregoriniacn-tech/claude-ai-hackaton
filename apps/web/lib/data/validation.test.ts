import { describe, expect, it } from "vitest";
import { buildHistoricalSeries, isFiniteNumber, isValidIsoDate } from "./validation";

describe("isFiniteNumber", () => {
  it("accetta numeri finiti", () => {
    expect(isFiniteNumber(1)).toBe(true);
    expect(isFiniteNumber(0)).toBe(true);
    expect(isFiniteNumber(-3.5)).toBe(true);
  });

  it("rifiuta NaN, Infinity e non numeri", () => {
    expect(isFiniteNumber(NaN)).toBe(false);
    expect(isFiniteNumber(Infinity)).toBe(false);
    expect(isFiniteNumber(-Infinity)).toBe(false);
    expect(isFiniteNumber("1")).toBe(false);
    expect(isFiniteNumber(undefined)).toBe(false);
  });
});

describe("isValidIsoDate", () => {
  it("accetta date ISO valide", () => {
    expect(isValidIsoDate("2024-01-31")).toBe(true);
  });

  it("rifiuta formati o date non valide", () => {
    expect(isValidIsoDate("2024-13-01")).toBe(false);
    expect(isValidIsoDate("2024/01/01")).toBe(false);
    expect(isValidIsoDate("not-a-date")).toBe(false);
    expect(isValidIsoDate(123)).toBe(false);
  });
});

describe("buildHistoricalSeries", () => {
  it("costruisce una serie valida", () => {
    const series = buildHistoricalSeries(
      [
        { date: "2000-01-01", level: 100 },
        { date: "2000-02-01", level: 105 },
      ],
      "test",
    );
    expect(series.startDate).toBe("2000-01-01");
    expect(series.endDate).toBe("2000-02-01");
  });

  it("lancia su serie vuota", () => {
    expect(() => buildHistoricalSeries([], "test")).toThrow();
  });

  it("lancia su livello non positivo o non finito", () => {
    expect(() =>
      buildHistoricalSeries([{ date: "2000-01-01", level: 0 }], "test"),
    ).toThrow();
    expect(() =>
      buildHistoricalSeries([{ date: "2000-01-01", level: NaN }], "test"),
    ).toThrow();
  });

  it("lancia su date non strettamente crescenti", () => {
    expect(() =>
      buildHistoricalSeries(
        [
          { date: "2000-01-01", level: 100 },
          { date: "2000-01-01", level: 101 },
        ],
        "test",
      ),
    ).toThrow();
  });
});

/**
 * Unit tests for lib/finance.ts
 *
 * Covers: monthlyRateFromAnnual, monthsBetween, simulate
 * Also verifies constant coherence in lib/constants.ts
 *
 * Tests marked "BUG EXPOSURE" document expected behavior that the current
 * implementation does not satisfy; they are expected to FAIL and are flagged
 * in the final report.
 */

import { describe, expect, it } from "vitest";
import {
  monthlyRateFromAnnual,
  monthsBetween,
  simulate,
  type Instrument,
  type Periodicity,
  type SimulationInput,
  type SimulationResult,
} from "./finance";
import { INSTRUMENT_RETURNS } from "./constants";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns a valid SimulationInput with caller-provided overrides. */
function base(overrides: Partial<SimulationInput> = {}): SimulationInput {
  return {
    initialCapital: 1_000,
    periodicAmount: 100,
    periodicity: "1m",
    startDate: "2020-01-01",
    endDate: "2021-01-01",
    instrument: "azionaria",
    adjustForInflation: false,
    taxRate: 26,
    ...overrides,
  };
}

/** Asserts that every numeric field in a SimulationResult is a finite number. */
function assertResultSafe(result: SimulationResult): void {
  const numericKeys: (keyof SimulationResult)[] = [
    "totalInvested",
    "grossFinalValue",
    "taxPaid",
    "finalValue",
    "netGain",
    "months",
  ];
  for (const key of numericKeys) {
    const val = result[key] as number;
    expect(Number.isNaN(val), `${key} must not be NaN`).toBe(false);
    expect(Number.isFinite(val), `${key} must be finite`).toBe(true);
  }
  for (let i = 0; i < result.points.length; i++) {
    const pt = result.points[i];
    expect(Number.isNaN(pt.value), `points[${i}].value must not be NaN`).toBe(false);
    expect(Number.isFinite(pt.value), `points[${i}].value must be finite`).toBe(true);
    expect(Number.isNaN(pt.contributed), `points[${i}].contributed must not be NaN`).toBe(false);
    expect(Number.isFinite(pt.contributed), `points[${i}].contributed must be finite`).toBe(true);
  }
}

// ─── monthlyRateFromAnnual ────────────────────────────────────────────────────

describe("monthlyRateFromAnnual", () => {
  it("returns 0 when annual rate is 0", () => {
    expect(monthlyRateFromAnnual(0)).toBe(0);
  });

  it("composes back to the annual rate: (1 + monthly)^12 ≈ 1 + annual", () => {
    const annual = 0.07;
    const monthly = monthlyRateFromAnnual(annual);
    expect(Math.pow(1 + monthly, 12)).toBeCloseTo(1 + annual, 8);
  });

  it("returns a finite positive number for all instrument annual rates", () => {
    for (const rate of Object.values(INSTRUMENT_RETURNS)) {
      const r = monthlyRateFromAnnual(rate);
      expect(Number.isFinite(r)).toBe(true);
      expect(r).toBeGreaterThan(0);
    }
  });

  it("handles negative annual rate: returns finite number, no NaN", () => {
    const r = monthlyRateFromAnnual(-0.5);
    expect(Number.isNaN(r)).toBe(false);
    expect(Number.isFinite(r)).toBe(true);
    expect(r).toBeLessThan(0);
  });

  it("100% annual rate: monthly rate compounds correctly to 2x", () => {
    const r = monthlyRateFromAnnual(1);
    expect(Math.pow(1 + r, 12)).toBeCloseTo(2, 5);
  });
});

// ─── monthsBetween ────────────────────────────────────────────────────────────

describe("monthsBetween", () => {
  it("returns 0 when start equals end (same Date object)", () => {
    const d = new Date("2020-06-15T00:00:00");
    expect(monthsBetween(d, d)).toBe(0);
  });

  it("returns 0 when start equals end (distinct Date objects, same value)", () => {
    expect(
      monthsBetween(
        new Date("2020-06-15T00:00:00"),
        new Date("2020-06-15T00:00:00")
      )
    ).toBe(0);
  });

  it("returns 0 when end is strictly before start (never negative)", () => {
    expect(
      monthsBetween(
        new Date("2021-01-01T00:00:00"),
        new Date("2020-01-01T00:00:00")
      )
    ).toBe(0);
  });

  it("returns 1 for consecutive months within the same year", () => {
    expect(
      monthsBetween(
        new Date("2020-01-01T00:00:00"),
        new Date("2020-02-01T00:00:00")
      )
    ).toBe(1);
  });

  it("returns 12 for exactly one year apart", () => {
    expect(
      monthsBetween(
        new Date("2020-01-01T00:00:00"),
        new Date("2021-01-01T00:00:00")
      )
    ).toBe(12);
  });

  it("counts across year boundaries correctly (Dec → Jan of year+2 = 13 months)", () => {
    expect(
      monthsBetween(
        new Date("2019-12-01T00:00:00"),
        new Date("2021-01-01T00:00:00")
      )
    ).toBe(13);
  });

  it("always returns a non-negative integer for arbitrary inputs", () => {
    const pairs: [Date, Date][] = [
      [new Date("2010-01-01"), new Date("2020-12-01")],
      [new Date("2025-01-01"), new Date("2000-01-01")], // reversed
      [new Date("2000-06-01"), new Date("2000-06-01")], // same
    ];
    for (const [start, end] of pairs) {
      const n = monthsBetween(start, end);
      expect(n).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(n)).toBe(true);
    }
  });
});

// ─── Constants coherence ──────────────────────────────────────────────────────

describe("constants – INSTRUMENT_RETURNS coherence", () => {
  const allInstruments: Instrument[] = ["azionaria", "obbligazionaria", "bitcoin"];

  it("contains every key in the Instrument union type", () => {
    for (const key of allInstruments) {
      expect(INSTRUMENT_RETURNS).toHaveProperty(key);
    }
  });

  it("all values are finite positive numbers (annual rates)", () => {
    for (const [key, value] of Object.entries(INSTRUMENT_RETURNS)) {
      expect(Number.isFinite(value), `INSTRUMENT_RETURNS.${key} must be finite`).toBe(true);
      expect(value, `INSTRUMENT_RETURNS.${key} must be > 0`).toBeGreaterThan(0);
      // Sanity: no instrument should promise > 10 000% annual return
      expect(value, `INSTRUMENT_RETURNS.${key} should be < 100`).toBeLessThan(100);
    }
  });

  it("dataset and union type are in sync (no key missing from either side)", () => {
    const datasetKeys = Object.keys(INSTRUMENT_RETURNS) as Instrument[];
    expect(datasetKeys.sort()).toEqual([...allInstruments].sort());
  });
});

// ─── simulate – structural invariants ────────────────────────────────────────

describe("simulate – structural invariants", () => {
  it("result is safe (no NaN, no Infinity) for a standard input", () => {
    assertResultSafe(simulate(base()));
  });

  it("points is always non-empty", () => {
    expect(simulate(base()).points.length).toBeGreaterThan(0);
  });

  it("first point contains only the initial capital (month 0, before compounding)", () => {
    const input = base({ initialCapital: 5_000, periodicAmount: 200 });
    const { points } = simulate(input);
    expect(points[0].contributed).toBe(5_000);
    expect(points[0].value).toBe(5_000);
  });

  it("first point month label matches startDate year-month in YYYY-MM format", () => {
    const { points } = simulate(base({ startDate: "2022-06-15", endDate: "2023-06-15" }));
    expect(points[0].month).toBe("2022-06");
  });

  it("points.length === months + 1 (initial point + one entry per simulated month)", () => {
    const result = simulate(base({ startDate: "2018-01-01", endDate: "2023-07-01" }));
    expect(result.points.length).toBe(result.months + 1);
  });

  it("months field matches monthsBetween(startDate, endDate)", () => {
    const input = base({ startDate: "2019-03-01", endDate: "2022-11-01" });
    const result = simulate(input);
    const expected = monthsBetween(
      new Date("2019-03-01T00:00:00"),
      new Date("2022-11-01T00:00:00")
    );
    expect(result.months).toBe(expected);
  });

  it("netGain === round2(finalValue - totalInvested)", () => {
    const result = simulate(base({ startDate: "2015-01-01", endDate: "2025-01-01" }));
    // Both sides are already round2 values; difference has at most 2 decimal places.
    expect(result.netGain).toBeCloseTo(result.finalValue - result.totalInvested, 2);
  });

  it("finalValue === grossFinalValue - taxPaid", () => {
    const result = simulate(base());
    expect(result.finalValue).toBeCloseTo(result.grossFinalValue - result.taxPaid, 2);
  });

  it("taxPaid === 0 when grossGain <= 0 (losses are never taxed)", () => {
    // 0-month window guarantees grossFinalValue === totalInvested → no gain.
    const result = simulate(
      base({ startDate: "2020-06-01", endDate: "2020-06-01", taxRate: 50 })
    );
    expect(result.taxPaid).toBe(0);
    expect(result.grossFinalValue).toBe(result.totalInvested);
  });

  it("totalInvested matches contributed in the last point", () => {
    const result = simulate(base({ startDate: "2018-01-01", endDate: "2023-01-01" }));
    const lastPoint = result.points[result.points.length - 1];
    expect(result.totalInvested).toBe(lastPoint.contributed);
  });

  it("grossFinalValue >= totalInvested when rate is positive and months > 0", () => {
    const result = simulate(base({ startDate: "2018-01-01", endDate: "2023-01-01" }));
    expect(result.grossFinalValue).toBeGreaterThanOrEqual(result.totalInvested);
  });
});

// ─── simulate – happy path ────────────────────────────────────────────────────

describe("simulate – happy path", () => {
  it.each<Periodicity>(["1w", "2w", "1m", "3m", "6m", "12m"])(
    "periodicity %s: result is safe and grossFinalValue > 0 over 5 years",
    (periodicity) => {
      const result = simulate(
        base({ periodicity, startDate: "2015-01-01", endDate: "2020-01-01" })
      );
      assertResultSafe(result);
      expect(result.grossFinalValue).toBeGreaterThan(0);
    }
  );

  it.each<Instrument>(["azionaria", "obbligazionaria", "bitcoin"])(
    "instrument %s: result is safe and grossFinalValue > totalInvested over 5 years",
    (instrument) => {
      const result = simulate(
        base({ instrument, startDate: "2015-01-01", endDate: "2020-01-01" })
      );
      assertResultSafe(result);
      expect(result.grossFinalValue).toBeGreaterThan(result.totalInvested);
    }
  );

  it("bitcoin compounds faster than azionaria over the same period", () => {
    const shared = { startDate: "2015-01-01", endDate: "2020-01-01", taxRate: 0 };
    const btc = simulate(base({ ...shared, instrument: "bitcoin" }));
    const eq = simulate(base({ ...shared, instrument: "azionaria" }));
    expect(btc.grossFinalValue).toBeGreaterThan(eq.grossFinalValue);
  });

  it("adjustForInflation=true yields lower grossFinalValue than adjustForInflation=false", () => {
    const noInfl = simulate(base({ adjustForInflation: false }));
    const withInfl = simulate(base({ adjustForInflation: true }));
    expect(withInfl.grossFinalValue).toBeLessThan(noInfl.grossFinalValue);
  });

  it("higher taxRate reduces finalValue (taxPaid is proportional to rate)", () => {
    const low = simulate(base({ taxRate: 10 }));
    const high = simulate(base({ taxRate: 26 }));
    expect(high.finalValue).toBeLessThan(low.finalValue);
    expect(high.taxPaid).toBeGreaterThan(low.taxPaid);
  });

  it("longer window accumulates more than a shorter window (same instrument)", () => {
    const short = simulate(base({ startDate: "2018-01-01", endDate: "2020-01-01" }));
    const long = simulate(base({ startDate: "2015-01-01", endDate: "2020-01-01" }));
    expect(long.grossFinalValue).toBeGreaterThan(short.grossFinalValue);
  });

  it("capital-only scenario (periodicAmount=0): result is safe", () => {
    const result = simulate(
      base({ initialCapital: 10_000, periodicAmount: 0, taxRate: 0 })
    );
    assertResultSafe(result);
    expect(result.totalInvested).toBe(10_000);
    expect(result.grossFinalValue).toBeGreaterThan(10_000);
  });
});

// ─── simulate – edge cases ────────────────────────────────────────────────────

describe("simulate – edge cases", () => {
  it("startDate === endDate: months=0, exactly 1 point, no gain, no tax", () => {
    const result = simulate(
      base({ startDate: "2020-06-01", endDate: "2020-06-01" })
    );
    expect(result.months).toBe(0);
    expect(result.points).toHaveLength(1);
    expect(result.netGain).toBe(0);
    expect(result.taxPaid).toBe(0);
    assertResultSafe(result);
  });

  it("endDate before startDate: treated as 0 months (no negative months)", () => {
    const result = simulate(
      base({ startDate: "2021-06-01", endDate: "2020-01-01" })
    );
    expect(result.months).toBe(0);
    expect(result.points).toHaveLength(1);
    assertResultSafe(result);
  });

  it("initialCapital=0, periodicAmount>0: starts from zero, accumulates from contributions", () => {
    const result = simulate(base({ initialCapital: 0, periodicAmount: 200 }));
    expect(result.points[0].value).toBe(0);
    expect(result.points[0].contributed).toBe(0);
    expect(result.totalInvested).toBeGreaterThan(0);
    assertResultSafe(result);
  });

  it("initialCapital>0, periodicAmount=0: only initial capital compounds", () => {
    const result = simulate(
      base({ initialCapital: 1_000, periodicAmount: 0, taxRate: 0 })
    );
    expect(result.totalInvested).toBe(1_000);
    expect(result.grossFinalValue).toBeGreaterThan(1_000);
    assertResultSafe(result);
  });

  it("initialCapital=0 and periodicAmount=0: all fields are 0", () => {
    const result = simulate(base({ initialCapital: 0, periodicAmount: 0 }));
    expect(result.grossFinalValue).toBe(0);
    expect(result.finalValue).toBe(0);
    expect(result.totalInvested).toBe(0);
    expect(result.taxPaid).toBe(0);
    expect(result.netGain).toBe(0);
    assertResultSafe(result);
  });

  it("taxRate=0: taxPaid=0, finalValue === grossFinalValue", () => {
    const result = simulate(base({ taxRate: 0 }));
    expect(result.taxPaid).toBe(0);
    expect(result.finalValue).toBe(result.grossFinalValue);
  });

  it("taxRate negative: clamped to 0, no tax paid", () => {
    const result = simulate(base({ taxRate: -50 }));
    expect(result.taxPaid).toBe(0);
    expect(result.finalValue).toBe(result.grossFinalValue);
  });

  it("taxRate>100: clamped to 100, taxPaid does not exceed grossGain", () => {
    const result = simulate(
      base({ taxRate: 200, startDate: "2010-01-01", endDate: "2023-01-01" })
    );
    assertResultSafe(result);
    const grossGain = result.grossFinalValue - result.totalInvested;
    // With taxRate clamped to 100%, taxPaid === grossGain at most.
    expect(result.taxPaid).toBeLessThanOrEqual(grossGain + 0.01); // 0.01 for round2
    expect(result.finalValue).toBeGreaterThanOrEqual(result.totalInvested - 0.01);
  });

  it("grossGain negative → taxPaid=0 (losses are not taxed)", () => {
    // Force grossGain <= 0 by using a 0-month window.
    const result = simulate(
      base({ startDate: "2020-01-01", endDate: "2020-01-01", taxRate: 26 })
    );
    expect(result.taxPaid).toBe(0);
  });

  it("extreme initialCapital (Number.MAX_SAFE_INTEGER) over 30 years: no Infinity", () => {
    const result = simulate(
      base({
        initialCapital: Number.MAX_SAFE_INTEGER,
        periodicAmount: 0,
        taxRate: 0,
        instrument: "bitcoin",
        startDate: "1990-01-01",
        endDate: "2020-01-01",
      })
    );
    assertResultSafe(result);
  });

  // ── Negative amounts: clamped, never propagated ──────────────────────────

  it("negative initialCapital: clamped to 0, first point value >= 0", () => {
    const result = simulate(base({ initialCapital: -1_000 }));
    expect(result.points[0].value).toBe(0);
    expect(result.points[0].contributed).toBe(0);
    expect(result.totalInvested).toBeGreaterThanOrEqual(0);
    assertResultSafe(result);
  });

  it("negative periodicAmount: clamped to 0, totalInvested stays at initialCapital", () => {
    const result = simulate(
      base({ initialCapital: 1_000, periodicAmount: -100, taxRate: 0 })
    );
    // Clamped to 0 contributions: capital-only scenario.
    expect(result.totalInvested).toBe(1_000);
    assertResultSafe(result);
  });

  // ── Unknown instrument key (constraint 11) ───────────────────────────────
  // A legacy scenario referencing a renamed/removed instrument must not crash
  // or produce NaN. The engine falls back to 0% annual return.

  it("unknown instrument key: falls back to 0% return, no NaN in output", () => {
    // Simulates loading a saved scenario whose instrument key no longer exists.
    const result = simulate(base({ instrument: "libretto_postale" as Instrument }));
    assertResultSafe(result);
    // With 0% return over 12 months, grossFinalValue equals totalInvested.
    expect(result.grossFinalValue).toBe(result.totalInvested);
    expect(result.taxPaid).toBe(0);
  });
});

// ─── Fuzz test ────────────────────────────────────────────────────────────────

describe("fuzz – no throw / NaN / Infinity across 200 pseudo-random inputs", () => {
  /**
   * Deterministic seeded PRNG (mulberry32).
   * Same seed → same sequence → reproducible results across CI runs.
   */
  function mulberry32(seed: number): () => number {
    return function () {
      let t = (seed += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const rand = mulberry32(0xdeadbeef);
  const instruments: Instrument[] = ["azionaria", "obbligazionaria", "bitcoin"];
  const periodicities: Periodicity[] = ["1w", "2w", "1m", "3m", "6m", "12m"];

  function randInt(min: number, max: number): number {
    return Math.floor(rand() * (max - min + 1)) + min;
  }
  function randFloat(min: number, max: number): number {
    return rand() * (max - min) + min;
  }
  function randDate(yearMin: number, yearMax: number): string {
    const y = randInt(yearMin, yearMax);
    const mo = randInt(1, 12);
    const d = randInt(1, 28);
    return `${y}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }

  const N = 200;
  const numericKeys: (keyof SimulationResult)[] = [
    "totalInvested",
    "grossFinalValue",
    "taxPaid",
    "finalValue",
    "netGain",
    "months",
  ];

  it(`no throw / NaN / Infinity across ${N} pseudo-random inputs (including extreme and inverted values)`, () => {
    for (let i = 0; i < N; i++) {
      const input: SimulationInput = {
        // Intentionally include negative amounts and inverted dates to stress-test safety.
        initialCapital: randFloat(-100_000, 1_000_000),
        periodicAmount: randFloat(-10_000, 10_000),
        periodicity: periodicities[randInt(0, periodicities.length - 1)],
        startDate: randDate(2000, 2023),
        endDate: randDate(2000, 2025),
        instrument: instruments[randInt(0, instruments.length - 1)],
        adjustForInflation: rand() > 0.5,
        taxRate: randFloat(-50, 200),
      };

      let result!: SimulationResult;

      expect(
        () => {
          result = simulate(input);
        },
        `simulate() must not throw for input #${i}: ${JSON.stringify(input)}`
      ).not.toThrow();

      for (const key of numericKeys) {
        const val = result[key] as number;
        expect(
          Number.isNaN(val),
          `NaN in result.${key} for input #${i}`
        ).toBe(false);
        expect(
          Number.isFinite(val),
          `Infinity in result.${key} for input #${i}`
        ).toBe(true);
      }

      for (let p = 0; p < result.points.length; p++) {
        const pt = result.points[p];
        expect(Number.isNaN(pt.value), `NaN in points[${p}].value`).toBe(false);
        expect(Number.isFinite(pt.value), `Infinity in points[${p}].value`).toBe(true);
        expect(Number.isNaN(pt.contributed), `NaN in points[${p}].contributed`).toBe(false);
        expect(Number.isFinite(pt.contributed), `Infinity in points[${p}].contributed`).toBe(true);
      }
    }
  });
});

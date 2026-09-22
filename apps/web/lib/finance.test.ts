import { describe, expect, it } from "vitest";
import { simulate, type SimulationInput } from "./finance";
import { INSTRUMENT_KEYS } from "./constants";

function baseInput(overrides: Partial<SimulationInput> = {}): SimulationInput {
  return {
    initialCapital: 1000,
    periodicAmount: 100,
    periodicity: "1m",
    startDate: "2015-01-01",
    endDate: "2020-01-01",
    instrument: "globalEquity",
    adjustForInflation: false,
    taxRate: 26,
    ...overrides,
  };
}

function expectNoNaNOrInfinity(result: ReturnType<typeof simulate>) {
  const numbers = [
    result.totalInvested,
    result.grossFinalValue,
    result.taxPaid,
    result.finalValue,
    result.netGain,
    result.months,
    ...result.points.flatMap((p) => [p.contributed, p.value]),
  ];
  for (const n of numbers) {
    expect(Number.isFinite(n)).toBe(true);
  }
}

describe("simulate — checklist a prova di utente", () => {
  it("input felice: valori tipici dentro range", () => {
    const result = simulate(baseInput());
    expect(result.months).toBeGreaterThan(0);
    expect(result.points.length).toBe(result.months + 1);
    expect(result.totalInvested).toBeGreaterThan(0);
    expect(result.warnings).toEqual([]);
    expectNoNaNOrInfinity(result);
  });

  it("data di inizio = data di fine (0 mesi)", () => {
    const result = simulate(baseInput({ startDate: "2018-06-01", endDate: "2018-06-01" }));
    expect(result.months).toBe(0);
    expect(result.points.length).toBe(1);
    expectNoNaNOrInfinity(result);
  });

  it("data di inizio > data di fine (invertite)", () => {
    const result = simulate(baseInput({ startDate: "2020-01-01", endDate: "2015-01-01" }));
    expect(result.months).toBe(0);
    expect(result.warnings.some((w) => w.code === "invertedDateRange")).toBe(true);
    expectNoNaNOrInfinity(result);
  });

  it("finestra temporale eccede il range del dataset dello strumento scelto", () => {
    const result = simulate(baseInput({ instrument: "bitcoin", startDate: "1970-01-01", endDate: "2005-01-01" }));
    expect(result.warnings.some((w) => w.code === "instrumentRangeClamped")).toBe(true);
    expectNoNaNOrInfinity(result);
  });

  it("importo/capitale iniziale = 0", () => {
    const result = simulate(baseInput({ initialCapital: 0 }));
    expect(result.points[0].value).toBe(0);
    expectNoNaNOrInfinity(result);
  });

  it("importo negativo in input viene clampato a 0, mai propagato", () => {
    const result = simulate(baseInput({ initialCapital: -500, periodicAmount: -50 }));
    const clamped = result.warnings.filter((w) => w.code === "negativeAmountClamped");
    expect(clamped.length).toBe(2);
    // Il messaggio italiano deve restare invariato
    expect(clamped.find((w) => w.params?.field === "initialCapital")?.message).toBe(
      "Capitale iniziale non valido o negativo: impostato a 0.",
    );
    expect(clamped.find((w) => w.params?.field === "periodicAmount")?.message).toBe(
      "Importo periodico non valido o negativo: impostato a 0.",
    );
    // params strutturati presenti
    const fields = clamped.map((w) => w.params?.field);
    expect(fields).toContain("initialCapital");
    expect(fields).toContain("periodicAmount");
    expect(result.points[0].value).toBe(0);
    expectNoNaNOrInfinity(result);
  });

  it("strumento non più presente nel dataset: fallback esplicito, mai un'eccezione", () => {
    const result = simulate(baseInput({ instrument: "azionaria" as unknown as SimulationInput["instrument"] }));
    expect(result.warnings.some((w) => w.code === "unknownInstrumentFallback")).toBe(true);
    expectNoNaNOrInfinity(result);
  });

  it("flag inflazione ON con serie inflazione che non copre l'intero periodo richiesto", () => {
    const result = simulate(
      baseInput({ adjustForInflation: true, startDate: "1900-01-01", endDate: "1920-01-01" }),
    );
    expect(result.warnings.some((w) => w.code === "inflationRangeClamped")).toBe(true);
    expectNoNaNOrInfinity(result);
  });

  it("tassazione non applicata quando il guadagno è negativo", () => {
    // Finestra brevissima con contributo enorme e strumento a bassa crescita:
    // se il guadagno lordo finisce negativo, taxPaid deve restare 0.
    const result = simulate(
      baseInput({ instrument: "postalSavings", startDate: "2020-01-01", endDate: "2020-02-01", initialCapital: 0, periodicAmount: 0 }),
    );
    const grossGain = result.grossFinalValue - result.totalInvested;
    if (grossGain <= 0) {
      expect(result.taxPaid).toBe(0);
    }
    expectNoNaNOrInfinity(result);
  });

  it("capitale estremo (MAX_SAFE_INTEGER) non produce NaN/Infinity", () => {
    const result = simulate(
      baseInput({ initialCapital: Number.MAX_SAFE_INTEGER, periodicAmount: Number.MAX_SAFE_INTEGER, startDate: "1900-01-01", endDate: "2200-01-01" }),
    );
    expectNoNaNOrInfinity(result);
  });

  it("finestra di decenni oltre il range di ogni dataset viene limitata per sicurezza", () => {
    const result = simulate(baseInput({ startDate: "1000-01-01", endDate: "9999-01-01" }));
    const capWarning = result.warnings.find((w) => w.code === "timeWindowCappedForSafety");
    expect(capWarning).toBeDefined();
    // params.years deve corrispondere al cap in anni (100)
    expect(capWarning?.params?.years).toBe(100);
    // Il messaggio italiano deve restare invariato
    expect(capWarning?.message).toBe("Finestra temporale troppo ampia: limitata a 100 anni.");
    expectNoNaNOrInfinity(result);
  });

  it("scenario caricato con chiave strumento non più presente: fallback, mai un blocco", () => {
    const legacyInstrument = "obbligazionaria" as unknown as SimulationInput["instrument"];
    expect(() => simulate(baseInput({ instrument: legacyInstrument }))).not.toThrow();
  });
});

describe("simulate — altri casi difensivi", () => {
  it("data non valida non propaga un'eccezione", () => {
    const result = simulate(baseInput({ startDate: "not-a-date", endDate: "2020-01-01" }));
    expect(result.warnings.some((w) => w.code === "invalidDateInput")).toBe(true);
    expectNoNaNOrInfinity(result);
  });

  it("periodicità sconosciuta ricade su un default esplicito", () => {
    const result = simulate(baseInput({ periodicity: "yearly" as unknown as SimulationInput["periodicity"] }));
    expect(result.warnings.some((w) => w.code === "unknownPeriodicityFallback")).toBe(true);
    expectNoNaNOrInfinity(result);
  });

  it("aliquota fuori range 0-100 viene clampata", () => {
    const result = simulate(baseInput({ taxRate: 250 }));
    expect(result.warnings.some((w) => w.code === "taxRateOutOfRangeClamped")).toBe(true);
    expectNoNaNOrInfinity(result);
  });

  it("nessuna funzione produce raccomandazioni di investimento nei messaggi", () => {
    const banned = /dovrest|convien|ti consigliam/i;
    for (const instrument of INSTRUMENT_KEYS) {
      const result = simulate(baseInput({ instrument, startDate: "1000-01-01", endDate: "9999-01-01", taxRate: 500 }));
      for (const w of result.warnings) {
        expect(banned.test(w.message)).toBe(false);
      }
    }
  });
});

describe("simulate — fuzz test", () => {
  it("nessun throw/NaN/Infinity su >=200 combinazioni pseudo-casuali", () => {
    let seed = 42;
    function rand() {
      // PRNG lineare deterministico: risultati riproducibili tra run di test.
      seed = (seed * 1103515245 + 12345) % 2147483648;
      return seed / 2147483648;
    }

    const instruments = [...INSTRUMENT_KEYS, "unknownInstrument"];
    const periodicities = ["1w", "2w", "1m", "3m", "6m", "12m", "bogus"];
    const weirdDates = [
      "2015-01-01",
      "2020-01-01",
      "not-a-date",
      "",
      "9999-12-31",
      "0001-01-01",
      "1985-06-15",
      "2026-09-22",
    ];

    for (let i = 0; i < 220; i++) {
      const input = {
        initialCapital: (rand() - 0.3) * 1e12,
        periodicAmount: (rand() - 0.3) * 1e9,
        periodicity: periodicities[Math.floor(rand() * periodicities.length)] as SimulationInput["periodicity"],
        startDate: weirdDates[Math.floor(rand() * weirdDates.length)],
        endDate: weirdDates[Math.floor(rand() * weirdDates.length)],
        instrument: instruments[Math.floor(rand() * instruments.length)] as SimulationInput["instrument"],
        adjustForInflation: rand() > 0.5,
        taxRate: (rand() - 0.2) * 300,
      };

      let result: ReturnType<typeof simulate> | undefined;
      expect(() => {
        result = simulate(input);
      }).not.toThrow();

      expect(result).toBeDefined();
      if (result) {
        expectNoNaNOrInfinity(result);
      }
    }
  });
});

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  loadScenarios,
  saveScenarios,
  createId,
  updateScenario,
  type Scenario,
} from "@/lib/storage";
import { STORAGE_KEY } from "@/lib/constants";

function makeScenario(over: Partial<Scenario> = {}): Scenario {
  return {
    id: "sc_1",
    label: "Test",
    initialCapital: 1000,
    periodicAmount: 100,
    periodicity: "1m",
    startDate: "2010-01-01",
    endDate: "2020-01-01",
    instrument: "globalEquity",
    adjustForInflation: false,
    taxRate: 26,
    createdAt: "2020-01-01T00:00:00.000Z",
    ...over,
  };
}

// Fake localStorage minimale montato su globalThis.window per i test.
function mockWindow() {
  const store = new Map<string, string>();
  (globalThis as unknown as { window: unknown }).window = {
    localStorage: {
      getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
      setItem: (k: string, v: string) => void store.set(k, v),
      removeItem: (k: string) => void store.delete(k),
    },
  };
  return store;
}

describe("storage (con window)", () => {
  let store: Map<string, string>;

  beforeEach(() => {
    store = mockWindow();
  });

  afterEach(() => {
    delete (globalThis as unknown as { window?: unknown }).window;
  });

  it("loadScenarios ritorna [] quando non c'è nulla di salvato", () => {
    expect(loadScenarios()).toEqual([]);
  });

  it("saveScenarios + loadScenarios fanno round-trip", () => {
    const s = [makeScenario()];
    saveScenarios(s);
    expect(store.get(STORAGE_KEY)).toBe(JSON.stringify(s));
    expect(loadScenarios()).toEqual(s);
  });

  it("loadScenarios ritorna [] se il JSON salvato non è un array", () => {
    store.set(STORAGE_KEY, JSON.stringify({ not: "an array" }));
    expect(loadScenarios()).toEqual([]);
  });

  it("loadScenarios ritorna [] su JSON corrotto senza lanciare", () => {
    store.set(STORAGE_KEY, "{ non-json");
    expect(() => loadScenarios()).not.toThrow();
    expect(loadScenarios()).toEqual([]);
  });
});

describe("storage (SSR, senza window)", () => {
  it("loadScenarios ritorna [] e saveScenarios è no-op", () => {
    expect(typeof window).toBe("undefined");
    expect(loadScenarios()).toEqual([]);
    expect(() => saveScenarios([makeScenario()])).not.toThrow();
  });
});

describe("createId", () => {
  it("genera id con prefisso e unici", () => {
    const a = createId();
    const b = createId();
    expect(a.startsWith("sc_")).toBe(true);
    expect(a).not.toBe(b);
  });
});

describe("updateScenario", () => {
  it("aggiorna lo scenario giusto preservando id e createdAt", () => {
    const list = [makeScenario({ id: "a", createdAt: "T0" }), makeScenario({ id: "b", createdAt: "T1" })];
    const patch = {
      label: "Nuovo",
      initialCapital: 5000,
      periodicAmount: 200,
      periodicity: "3m" as const,
      startDate: "2011-01-01",
      endDate: "2021-01-01",
      instrument: "bitcoin" as const,
      adjustForInflation: true,
      taxRate: 0,
    };
    const out = updateScenario(list, "a", patch);
    expect(out[0]).toMatchObject({ id: "a", createdAt: "T0", label: "Nuovo", initialCapital: 5000 });
    expect(out[1]).toEqual(list[1]);
  });

  it("lascia la lista invariata se l'id non esiste", () => {
    const list = [makeScenario({ id: "a" })];
    const patch = {
      label: "X",
      initialCapital: 1,
      periodicAmount: 1,
      periodicity: "1m" as const,
      startDate: "2010-01-01",
      endDate: "2011-01-01",
      instrument: "globalEquity" as const,
      adjustForInflation: false,
      taxRate: 26,
    };
    expect(updateScenario(list, "zzz", patch)).toEqual(list);
  });
});

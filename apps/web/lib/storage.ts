import { STORAGE_KEY } from "./constants";
import type { Instrument, Periodicity } from "./finance";

export interface Scenario {
  id: string;
  label: string;
  initialCapital: number;
  periodicAmount: number;
  periodicity: Periodicity;
  startDate: string;
  endDate: string;
  instrument: Instrument;
  adjustForInflation: boolean;
  taxRate: number;
  createdAt: string;
}

/** Legge gli scenari salvati da localStorage (safe su SSR). */
export function loadScenarios(): Scenario[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Scenario[]) : [];
  } catch {
    return [];
  }
}

/** Persiste gli scenari in localStorage. */
export function saveScenarios(scenarios: Scenario[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios));
  } catch {
    // Storage pieno o non disponibile: ignoriamo silenziosamente.
  }
}

export function createId(): string {
  return `sc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Aggiorna in-place lo scenario con l'id dato, preservando id e createdAt.
 * Se l'id non esiste (es. scenario cancellato in un'altra scheda) la lista
 * resta invariata.
 */
export function updateScenario(
  scenarios: Scenario[],
  id: string,
  patch: Omit<Scenario, "id" | "createdAt">,
): Scenario[] {
  return scenarios.map((s) =>
    s.id === id ? { ...s, ...patch, id: s.id, createdAt: s.createdAt } : s,
  );
}

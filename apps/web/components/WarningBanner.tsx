"use client";

import type { SimulationWarning } from "@/lib/finance";
import { useI18n } from "./I18nProvider";

interface WarningBannerProps {
  warnings: SimulationWarning[];
  /** Variante compatta per l'uso inline dentro liste (es. una riga per scenario). */
  compact?: boolean;
}

/**
 * Elenco non bloccante degli avvisi restituiti da `simulate()` (finestra
 * temporale troncata, strumento non più disponibile, dati mancanti, ecc.).
 * Linguaggio sempre descrittivo/retrospettivo, mai allarmistico: sono
 * correzioni automatiche del motore, non errori dell'utente.
 *
 * NB: il titolo del banner è localizzato; i singoli messaggi (`w.message`)
 * sono generati dal motore in italiano (vedi `finance.ts`) — la loro eventuale
 * localizzazione richiede di esporre parametri strutturati dal motore.
 */
export function WarningBanner({ warnings, compact = false }: WarningBannerProps) {
  const { t } = useI18n();
  if (warnings.length === 0) return null;

  return (
    <div
      role="status"
      className={`rounded-card border border-border border-l-4 border-l-negative bg-surface text-foreground ${
        compact ? "px-3 py-2 text-xs" : "px-4 py-3 text-sm"
      }`}
    >
      <p className="flex items-center gap-2 font-semibold text-negative">
        <span aria-hidden="true">⚠</span>
        {t.warning.title}
      </p>
      <ul className={`${compact ? "mt-1" : "mt-2"} list-inside list-disc space-y-1 text-muted`}>
        {warnings.map((w, i) => (
          <li key={`${w.code}-${i}`}>{w.message}</li>
        ))}
      </ul>
    </div>
  );
}

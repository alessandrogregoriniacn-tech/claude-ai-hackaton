"use client";

import { useId } from "react";

interface FaqSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  resultCount: number;
  hasQuery: boolean;
}

const searchInputClass =
  "min-h-11 w-full rounded-md border border-border bg-background px-4 py-3 text-foreground focus-visible:border-primary";

/**
 * Campo di ricerca della pagina FAQ. La ricerca è fuzzy e gira interamente
 * nel browser (nessuna chiamata di rete): non serve digitare il testo esatto
 * della domanda, bastano parole vicine per significato (es. "buoni italiani"
 * trova la voce sui BOT).
 */
export function FaqSearchInput({
  value,
  onChange,
  resultCount,
  hasQuery,
}: FaqSearchInputProps) {
  const inputId = useId();

  return (
    <div className="mb-8">
      <label htmlFor={inputId} className="sr-only">
        Cerca nelle domande frequenti
      </label>
      <input
        id={inputId}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Cerca una domanda, ad esempio «buoni italiani»…"
        className={searchInputClass}
      />
      <p aria-live="polite" className="mt-2 min-h-5 text-sm text-muted">
        {hasQuery
          ? resultCount > 0
            ? `${resultCount} ${resultCount === 1 ? "risultato trovato" : "risultati trovati"}.`
            : "Nessun risultato."
          : null}
      </p>
    </div>
  );
}

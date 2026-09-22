"use client";

import { useEffect, useRef, useState } from "react";
import type { InstrumentKey } from "@/lib/constants";

/**
 * Testi informativi per strumento: spiegano cosa rappresenta il dato storico
 * usato, in linguaggio semplice e senza numeri/promesse di rendimento — coerente
 * col vincolo "mai consigli di investimento" (vedi CLAUDE.md).
 */
const INSTRUMENT_INFO: Record<InstrumentKey, string> = {
  globalEquity:
    "Rappresenta l'andamento storico dell'indice azionario globale MSCI World (mercati sviluppati, migliaia di aziende in oltre 20 paesi). Storicamente il rendimento più alto nel lungo periodo, ma anche le oscillazioni più marcate nel breve.",
  govBonds10y:
    "Rappresenta il rendimento storico dei titoli di Stato USA a 10 anni. Rendimento e rischio più contenuti rispetto all'azionario, meno soggetto a oscillazioni forti.",
  balanced6040:
    "Un mix simulato: 60% indice azionario globale + 40% titoli di Stato a 10 anni. Un compromesso classico tra crescita potenziale e stabilità.",
  bitcoin:
    "Prezzo storico di Bitcoin. Lo strumento più volatile tra quelli disponibili: può generare guadagni molto alti ma anche perdite rapide e marcate.",
  postalSavings:
    "Il rendimento è stimato usando come riferimento il tasso medio storico dei Buoni Ordinari del Tesoro (BOT, 1981–2026): uno strumento di risparmio a rischio pressoché nullo, ma con un rendimento storicamente molto basso, in alcuni periodi inferiore all'inflazione.",
};

const PANEL_ID = "instrument-info-panel";

interface InstrumentInfoPopoverProps {
  instrument: InstrumentKey | "";
  instrumentLabel: string;
}

/**
 * Disclosure accessibile (popover) che spiega cosa rappresenta lo strumento
 * attualmente selezionato nella select. Pattern: bottone icona con
 * aria-expanded/aria-controls, pannello chiudibile con Escape o click fuori,
 * focus riportato sul trigger alla chiusura.
 */
export function InstrumentInfoPopover({
  instrument,
  instrumentLabel,
}: InstrumentInfoPopoverProps) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(e: MouseEvent) {
      const target = e.target as Node;
      if (panelRef.current?.contains(target) || buttonRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const description = instrument
    ? INSTRUMENT_INFO[instrument]
    : "Seleziona uno strumento per vedere una spiegazione di cosa rappresenta il dato storico usato.";

  const triggerLabel = instrument
    ? `Cosa rappresenta lo strumento «${instrumentLabel}»`
    : "Cosa rappresentano gli strumenti disponibili";

  return (
    <span className="relative inline-flex">
      {/* Icona piccola e leggera: l'area di tocco resta 44px (min-h-11/min-w-11)
          tramite padding invisibile, come richiesto dalle regole di accessibilità
          del design system, ma senza il peso visivo di un bottone cerchiato. */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={PANEL_ID}
        aria-label={triggerLabel}
        title={triggerLabel}
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-pill text-muted transition hover:text-foreground"
      >
        <span aria-hidden="true" className="text-base leading-none">
          ⓘ
        </span>
      </button>

      {open ? (
        <div
          id={PANEL_ID}
          ref={panelRef}
          role="group"
          aria-label={triggerLabel}
          className="absolute left-0 top-full z-10 mt-2 w-72 rounded-card border border-border bg-surface p-4 text-sm shadow-lg"
        >
          <p className="font-semibold text-foreground">
            {instrument ? instrumentLabel : "Strumenti disponibili"}
          </p>
          <p className="mt-2 text-muted">{description}</p>
          <p className="mt-3 border-t border-border pt-2 text-xs text-muted">
            Dati storici a scopo illustrativo: nessun consiglio di investimento,
            nessuna raccomandazione su cosa scegliere, comprare o vendere.
          </p>
        </div>
      ) : null}
    </span>
  );
}

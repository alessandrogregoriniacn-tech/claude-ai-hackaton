"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { InstrumentKey } from "@/lib/constants";
import { useI18n } from "./I18nProvider";

const PANEL_ID = "instrument-info-panel";

/**
 * Per-strumento, la voce delle FAQ (`apps/web/lib/i18n/dictionaries.ts`,
 * `faq.groups`) che approfondisce il dato storico usato. Gli id sono stabili
 * tra le lingue, quindi il link funziona indipendentemente dalla lingua
 * selezionata. Dove non esiste una domanda dedicata (azionario globale,
 * bilanciato 60/40), si rimanda alla domanda generale sugli strumenti
 * disponibili: sempre meglio di un link generico alla pagina.
 */
const INSTRUMENT_FAQ_ANCHOR: Record<InstrumentKey, string> = {
  globalEquity: "strumenti-disponibili",
  govBonds10y: "titoli-stato-usa",
  balanced6040: "strumenti-disponibili",
  bitcoin: "bitcoin-volatilita",
  postalSavings: "libretto-postale-proxy",
};

interface InstrumentInfoPopoverProps {
  instrument: InstrumentKey | "";
}

/**
 * Disclosure accessibile (popover) che spiega cosa rappresenta lo strumento
 * attualmente selezionato nella select. Pattern: bottone icona con
 * aria-expanded/aria-controls, pannello chiudibile con Escape o click fuori,
 * focus riportato sul trigger alla chiusura. I testi sono localizzati e non
 * contengono numeri/promesse di rendimento (vincolo "mai consigli").
 */
export function InstrumentInfoPopover({ instrument }: InstrumentInfoPopoverProps) {
  const { t } = useI18n();
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

  const instrumentLabel = instrument ? t.instruments[instrument] : "";
  const description = instrument
    ? t.instrumentInfo.descriptions[instrument]
    : t.instrumentInfo.emptyPrompt;

  const triggerLabel = instrument
    ? t.instrumentInfo.triggerSelected(instrumentLabel)
    : t.instrumentInfo.triggerEmpty;

  const faqHref = instrument
    ? `/faq#${INSTRUMENT_FAQ_ANCHOR[instrument]}`
    : "/faq#strumenti-disponibili";

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
            {instrument ? instrumentLabel : t.instrumentInfo.panelTitleEmpty}
          </p>
          <p className="mt-2 text-muted">{description}</p>
          <p className="mt-3 border-t border-border pt-2 text-xs text-muted">
            {t.instrumentInfo.disclaimer}
          </p>
          <Link
            href={faqHref}
            className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-foreground underline underline-offset-2 hover:opacity-80"
          >
            {t.instrumentInfo.faqLink}
          </Link>
        </div>
      ) : null}
    </span>
  );
}

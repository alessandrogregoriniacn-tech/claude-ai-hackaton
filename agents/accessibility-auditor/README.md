# Accessibility Auditor

Agente di **audit di accessibilità** dell'app web di Hagenton secondo le **WCAG 2.2**
(baseline livello A + AA).

## Ruolo

Analizza pagine (`apps/web/app/**`) e componenti (`apps/web/components/**`), più i
token di colore in `globals.css`/`tailwind.config.ts` per la verifica del contrasto.
Il flusso è sempre in tre fasi:

1. **Audit** — verifica i criteri di successo WCAG 2.2, inclusi i nuovi criteri della
   2.2 (2.4.11 focus non oscurato, 2.5.7 trascinamento, 2.5.8 dimensione target,
   3.2.6 aiuto coerente, 3.3.7 inserimento ridondante, …).
2. **Report Excel** — produce un file `.xlsx` (fogli `Summary`, `Findings`,
   `Coverage`) salvato nella cartella dedicata [`reports/accessibility/`](../../reports/accessibility/).
3. **Chiede** all'utente se vuole che i problemi vengano corretti. **Non applica fix
   di sua iniziativa**: prima riporta, poi chiede; corregge solo se autorizzato.

## Cosa verifica/garantisce

- Contrasto AA (testo 4.5:1, testo grande/UI 3:1) su tema **light e dark**.
- Struttura semantica: heading, landmark, `label`↔input, liste/tabelle.
- Tastiera e focus: navigabilità, focus visibile, nessuna trappola, ordine coerente.
- ARIA corretto (nome/ruolo/valore, `aria-live` per i messaggi di stato).
- Testi alternativi e gestione di icone/grafici decorativi vs informativi.
- Coerenza con i vincoli già dichiarati in `apps/web/DESIGN_SYSTEM.md`.

Ogni finding riporta `file:riga`, criterio WCAG, severità e un **fix concreto** basato
sui token del design system. I fix (se autorizzati) vanno poi ri-verificati da
`ui-guardian` (visivo) e `code-reviewer` (qualità) prima del push.

## Dove vive

La definizione operativa (subagent invocabile in Claude Code) è in
[`.claude/agents/accessibility-auditor.md`](../../.claude/agents/accessibility-auditor.md).
Questo file è la scheda di governance leggibile del progetto.

## Output

Report Excel in [`reports/accessibility/`](../../reports/accessibility/), nominato
`a11y-report-YYYY-MM-DD.xlsx`.

## Come si invoca

> "Fai un audit di accessibilità WCAG 2.2 e genera il report."

oppure con trigger tipo "controlla l'accessibilità del sito", "verifica contrasto e
focus", "genera il report di accessibilità".

# Finance Engine

Agente **motore di calcolo** del simulatore retrospettivo di SeSolo.

## Ruolo

Ogni modifica alla logica di simulazione (rendimento per strumento, aggiustamento
per inflazione, tassazione sul guadagno) **deve passare da questo agente**. Ambito
esclusivo: `apps/web/lib/finance.ts`, `apps/web/lib/constants.ts`,
`apps/web/lib/data/**` e i relativi test — mai UI, styling o `storage.ts`.

L'agente deve garantire che **qualunque combinazione di input utente** produca un
risultato valido: niente eccezioni non gestite, niente `NaN`/`Infinity`, nessuna
raccomandazione di investimento in nessuna forma (vincolo del tema hackathon,
Inclusione Finanziaria). Scrive codice, a differenza di `ui-guardian` e
`code-reviewer` che revisionano soltanto.

## Cosa verifica su ogni funzione pubblica (checklist obbligatoria)

- Input "felice", date invertite o coincidenti, importi a zero/negativi/estremi
- Finestra temporale oltre il range del dataset dello strumento scelto (clamp +
  avviso esplicito; granularità diverse tra fonti storiche si riconciliano con
  interpolazione geometrica su un formato dati canonico, non con estrapolazione)
- Flag inflazione/tassazione con serie/aliquota incompleta o guadagno negativo
- Scenario salvato che referenzia una chiave strumento (o cadenza) non più nel
  dataset corrente
- Finestra temporale oltre un tetto di sicurezza fisso (secoli, date fuori scala)
- Fuzz test (≥200 combinazioni pseudo-casuali): nessun throw/NaN/Infinity

## Dove vive

La definizione operativa (subagent invocabile in Claude Code) è in
[`.claude/agents/finance-engine.md`](../../.claude/agents/finance-engine.md). Questo
file è la scheda di governance leggibile del progetto — regole complete, vincoli
non negoziabili e Definition of Done nel file operativo.

## Come si invoca

Nel flusso di lavoro con Claude Code, per qualsiasi task su calcolo/dataset finanziari:

> "Implementa questo con il `finance-engine`."

oppure viene invocato automaticamente dall'orchestratore quando il task tocca
`lib/finance.ts`, `lib/constants.ts` o `lib/data/**`.

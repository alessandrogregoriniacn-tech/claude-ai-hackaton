# Finance Engine Agent

Configurato come subagent Claude Code in `.claude/agents/finance-engine.md`
(quella è la fonte di verità operativa: prompt di sistema, tool consentiti,
vincoli). Questo file è la scheda di riepilogo richiesta dalla struttura di
`agents/`.

## Ruolo/obiettivo

Implementare ed estendere il motore di calcolo del simulatore retrospettivo:
rendimento storico per strumento scelto, aggiustamento per inflazione,
tassazione semplificata sul guadagno. Deve produrre sempre un risultato
valido qualunque sia la combinazione di input inserita dall'utente.

## Ambito

Solo `apps/web/lib/finance.ts`, `apps/web/lib/constants.ts`,
`apps/web/lib/data/**` e i relativi test. Non tocca UI, styling, design
system o la shape di persistenza in `storage.ts`.

## Input/Output attesi

- **Input**: capitale iniziale, spesa periodica, periodicità, finestra
  temporale, strumento selezionato, flag inflazione, paese per la
  tassazione.
- **Output**: serie storica del capitale, totale versato, valore finale
  (al netto/lordo di inflazione e tasse a seconda dei flag), eventuali
  avvisi strutturati (es. finestra temporale clampata al range del dataset).

## Vincoli

- Nessuna chiamata di rete a runtime: solo dataset statici bundlati.
- Nessuna raccomandazione di investimento in nessuna forma (testo, label,
  commento) — vincolo del tema hackathon (Inclusione Finanziaria).
- Funzioni pure, senza side effect, senza `any`, senza mutazione degli input.
- Zero eccezioni non gestite raggiungibili da input utente: niente `NaN`,
  `Infinity` o crash, sempre un risultato o un errore strutturato.
- Ogni funzione pubblica nuova/modificata copre esplicitamente gli edge
  case elencati nel file del subagent (date invertite, range dataset
  eccedente, importi a zero/negativi, tassazione su perdita, ecc.), più
  un fuzz test su input pseudo-casuali (nessun throw/NaN/Infinity).
- Chiavi strumento come unica union type condivisa tra dataset, costanti
  e select UI — mai stringhe libere duplicate.
- Scenari salvati che referenziano uno strumento non più nel dataset
  devono degradare con un fallback esplicito, mai rompere il caricamento.

Dettaglio completo delle regole e della checklist: vedi
`.claude/agents/finance-engine.md`.

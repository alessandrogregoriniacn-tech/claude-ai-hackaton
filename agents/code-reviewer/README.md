# Code Reviewer

Agente **revisore della qualità del codice** e **gatekeeper obbligatorio prima di
ogni push** di Hagenton.

## Ruolo

Prima di **qualsiasi `git push`**, questo agente deve:

1. eseguire i **controlli di qualità** del progetto (type-check, lint, build);
2. verificare la presenza di **errori sintattici o semantici**.

Se il codice è pulito (nessun errore bloccante) il push può procedere. Se invece
vengono trovati errori, l'agente **blocca il push**, li segnala e chiede all'utente
come procedere tra tre opzioni:

1. **Ignora e pusha** — ignora gli errori ed esegue comunque il push.
2. **Fixa in autonomia** — corregge gli errori, ri-esegue i controlli e **chiede
   conferma prima di effettuare un nuovo push**.
3. **Solo report** — non tocca nulla e consegna un report che il developer gestirà
   manualmente.

## Controlli eseguiti

Nel pacchetto web (`apps/web`):

- **Errori sintattici + semantici**: `npx tsc --noEmit`
- **Qualità / lint**: `npm run lint`
- **Build**: `npm run build`

I warning non bloccano il push ma vengono segnalati come note migliorative.

## Comportamento decisionale

L'agente non sceglie da solo se ci sono errori: produce un blocco `DECISION NEEDED`
con le tre opzioni e una raccomandazione, che l'orchestratore gira all'utente. In
caso di scelta "fixa in autonomia", dopo le correzioni l'agente si ferma e richiede
conferma esplicita prima di ripushare.

## Dove vive

La definizione operativa (subagent invocabile in Claude Code) è in
[`.claude/agents/code-reviewer.md`](../../.claude/agents/code-reviewer.md). Questo
file è la scheda di governance leggibile del progetto.

## Come si invoca

Prima di pushare:

> "Prima di pushare, fai revisionare il codice dal `code-reviewer`."

oppure viene invocato automaticamente dall'orchestratore ogni volta che si sta per
eseguire un push.

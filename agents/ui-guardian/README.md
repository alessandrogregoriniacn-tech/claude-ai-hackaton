# UI Guardian

Agente **guardiano del design system e della UX** di SeSolo.

## Ruolo

Ogni **modifica o aggiunta** al design system o alla grafica applicativa (nuovi
componenti, cambi di colore/spaziatura/tipografia, nuovi token, restyle, nuove
schermate, icone/illustrazioni) **deve passare da questo agente** prima di essere
considerata definitiva. L'agente verifica:

- **coerenza stilistica** con la palette e i token del design system;
- **UX corretta** (gerarchia delle azioni, stati, feedback, accessibilità WCAG AA).

Revisiona, non scrive: propone correzioni precise che vengono poi applicate.

## Comportamento A/B (solo in caso di dubbio)

L'A/B testing **non è un processo standard**: l'agente chiede all'utente quale scelta
sia più corretta **solo quando è in dubbio reale**, cioè quando più opzioni sono tutte
legittime e nessuna è chiaramente migliore. Negli altri casi decide autonomamente
applicando le regole del design system. Quando chiede, produce un blocco
`DECISION NEEDED` con opzioni concrete (pro/contro) e una raccomandazione, che
l'orchestratore gira all'utente.

## Dove vive

La definizione operativa (subagent invocabile in Claude Code) è in
[`.claude/agents/ui-guardian.md`](../../.claude/agents/ui-guardian.md). Questo file è
la scheda di governance leggibile del progetto.

## Fonte di verità che l'agente controlla

1. `apps/web/DESIGN_SYSTEM.md`
2. `apps/web/app/globals.css` (token come CSS variables)
3. `apps/web/tailwind.config.ts`
4. `apps/web/components/**`

## Come si invoca

Nel flusso di lavoro con Claude Code, prima di finalizzare una modifica UI:

> "Fai revisionare questa modifica alla UI dal `ui-guardian`."

oppure viene invocato automaticamente dall'orchestratore quando la modifica tocca la
grafica.

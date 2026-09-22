# Agents

Questa cartella raccoglie gli **agenti e i subagent** usati durante lo sviluppo del
progetto SeSolo: definizioni, prompt, configurazioni e note operative.

## Organizzazione

```
agents/
├── README.md                 # questo file
└── <nome-agente>/
    └── README.md             # scheda di governance leggibile dell'agente
```

La definizione operativa e invocabile (system prompt, tool consentiti, modello) vive
sempre in `.claude/agents/<nome-agente>.md` — è la fonte di verità per Claude Code.
`agents/<nome-agente>/README.md` è la scheda di governance leggibile del progetto e
rimanda a quel file con un link relativo.

Ogni scheda dovrebbe documentare:

- **Ruolo** — cosa deve ottenere e su quali parti del progetto opera (ambito);
- **Cosa verifica/garantisce** — checklist o vincoli chiave, in forma sintetica
  (il dettaglio completo resta nel file `.claude/agents/*.md`);
- **Dove vive** — link al file operativo in `.claude/agents/`;
- **Come si invoca** — trigger tipici o esempio di richiesta.

Esempi già in repo: `agents/ui-guardian/README.md`, `agents/code-reviewer/README.md`,
`agents/finance-engine/README.md`.

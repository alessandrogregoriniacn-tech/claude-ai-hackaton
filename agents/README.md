# Agents

Questa cartella raccoglie gli **agenti e i subagent** usati durante lo sviluppo del
progetto Hagenton: definizioni, prompt, configurazioni e note operative.

## Organizzazione suggerita

```
agents/
├── README.md                 # questo file
└── <nome-agente>/
    ├── agent.md              # ruolo, obiettivo e istruzioni dell'agente
    └── notes.md              # decisioni, output e apprendimenti
```

Ogni agente dovrebbe documentare:

- **Ruolo/obiettivo** — cosa deve ottenere;
- **Ambito** — su quali parti del progetto opera;
- **Input/Output attesi** — cosa riceve e cosa produce;
- **Vincoli** — regole da rispettare (stack, design system, no backend, ecc.).

_(Placeholder: le definizioni degli agenti verranno aggiunte man mano.)_

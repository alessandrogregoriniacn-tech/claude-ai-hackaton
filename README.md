# Hagenton

**Simulatore retrospettivo di risparmio** — invece di proiettare i guadagni futuri,
mostra *quanto avresti accumulato oggi* se in passato avessi messo da parte una
spesa ricorrente, applicando un rendimento annuo fisso (default **10%**).

## Struttura della repo

```
Hagenton/
├── README.md          # questo file
├── apps/              # le applicazioni del progetto
│   └── web/           # la web app Next.js (App Router)
├── presentation/      # materiale per presentare il progetto
└── agents/            # agenti e subagent usati durante il progetto
```

## Stack tecnico

- **Next.js** (App Router) + **React**
- **TypeScript**
- **Tailwind CSS** per lo styling (token del design system esposti come CSS variables)
- **Persistenza**: `localStorage` — nessun backend, nessun database, nessuna autenticazione
- **Nessuna chiamata API esterna**: il rendimento annuo è una costante configurabile
  (`ANNUAL_RETURN_RATE` in `apps/web/lib/constants.ts`, default `0.10`)

## Come avviare la web app

```bash
cd apps/web
npm install
npm run dev      # http://localhost:3000
```

Altri comandi utili:

```bash
npm run build    # build di produzione
npm run start    # avvia la build di produzione
npm run lint     # lint
```

## Come funziona la simulazione

L'utente indica un importo, una frequenza (giornaliera / settimanale / mensile) e
una data di inizio nel passato. L'app calcola, con **capitalizzazione mensile** del
rendimento annuo fisso, quanto quel capitale varrebbe oggi, distinguendo tra:

- **Totale versato** — la somma effettivamente accantonata;
- **Valore con rendimento** — il capitale cresciuto nel tempo;
- **Guadagno da rendimento** — la differenza tra i due.

Gli scenari possono essere salvati e vengono conservati nel browser via `localStorage`.

La logica di calcolo è isolata in `apps/web/lib/finance.ts` ed è priva di
dipendenze dall'interfaccia.

## Design system

Il design system interno verrà definito in un secondo momento. I componenti usano
esclusivamente token esposti come CSS variables in `apps/web/app/globals.css` e
mappati in `apps/web/tailwind.config.ts`, così il restyle sarà centralizzato senza
toccare i singoli componenti.

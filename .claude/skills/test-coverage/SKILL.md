---
name: test-coverage
description: >-
  Esegue gli unit test dell'app web di Hagenton (apps/web) con Vitest e genera un
  report di code coverage in reports/coverage/. Configura Vitest e le dipendenze
  di coverage se non sono ancora presenti. Da usare quando l'utente vuole lanciare
  i test o misurare la copertura. Esempi di trigger: "fai gli unit test", "lancia
  i test", "genera il report di coverage", "code coverage", "quanto è coperto il
  codice", "controlla la copertura dei test".
---

# Unit test + code coverage — Hagenton

Esegue la suite di unit test di `apps/web` con **Vitest** e produce un **report di
code coverage** in `reports/coverage/`. Tutto client-side, nessuna rete: coerente
col vincolo del repo (`fetch` vietato, dati solo da dataset statici).

Tutti i comandi vanno eseguiti da dentro `apps/web` (`cd apps/web && ...`).

## 1. Verifica del setup (installa solo se manca)

Il repo parte senza test runner. Controlla `apps/web/package.json`:

1. **Dipendenze.** Se mancano, installale come dev-dep:
   ```bash
   cd apps/web && npm i -D vitest @vitest/coverage-v8 jsdom @vitejs/plugin-react
   ```
   `jsdom` + `@vitejs/plugin-react` servono solo se ci sono test su componenti
   React (`.tsx`); per i soli `lib/*` puri bastano `vitest` e `@vitest/coverage-v8`.

2. **Config Vitest.** Se `apps/web/vitest.config.ts` non esiste, crealo (vedi
   sezione "Config di riferimento"). Deve replicare l'alias `@/*` del `tsconfig.json`
   e abilitare la coverage con provider `v8`.

3. **Script npm.** Se assenti, aggiungili a `apps/web/package.json`:
   ```json
   "test": "vitest run",
   "test:watch": "vitest",
   "test:coverage": "vitest run --coverage"
   ```

4. **`.gitignore`.** Assicurati che `reports/coverage/` (o `coverage/`) non venga
   committato per errore se l'utente non lo desidera; chiedi se non è chiaro.

## 2. Copertura minima di test

Se **non esiste ancora nessun test** (`find apps/web -name '*.test.ts' -not -path '*/node_modules/*'`
è vuoto), non lanciare la coverage a vuoto:

- I test del **motore di calcolo** (`lib/finance.ts`, `lib/constants.ts`,
  `lib/data/**`) sono responsabilità dell'agente **`finance-engine`** (vedi
  `.claude/agents/finance-engine.md`, che richiede fuzz test obbligatorio). Se
  servono nuovi test su quei file, **delega a `finance-engine`**, non scriverli qui.
- Per gli altri moduli puri (`lib/format.ts`, `lib/storage.ts`, `lib/theme.ts`)
  puoi proporre test unitari diretti.

Chiedi all'utente se vuole che i test mancanti vengano creati prima di misurare la
copertura, oppure se preferisce eseguire solo ciò che esiste.

## 3. Esecuzione + report

```bash
cd apps/web && npm run test:coverage
```

- Il report HTML/JSON/testuale viene scritto in `reports/coverage/` (vedi config).
- Apri/riassumi `reports/coverage/index.html` o leggi il riepilogo testuale
  stampato a fine run (righe/branch/funzioni/statement %).

## 4. Esito

Riporta all'utente:
- **PASS/FAIL** della suite e numero di test.
- **Percentuali di coverage** (statements, branches, functions, lines).
- Path del report: `apps/web/reports/coverage/index.html`.
- I moduli più scoperti, senza dare per verificato ciò che la CLI non ha
  confermato. Se dei test falliscono, incolla l'output rilevante e proponi come
  procedere — non dichiarare successo senza conferma.

## Config di riferimento (`apps/web/vitest.config.ts`)

```ts
import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: "node", // usa "jsdom" se testi componenti React
    include: ["**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", ".next", "out"],
    coverage: {
      provider: "v8",
      reportsDirectory: "reports/coverage",
      reporter: ["text", "html", "json-summary"],
      // Emette il report anche quando qualche test fallisce.
      reportOnFailure: true,
      include: ["lib/**/*.ts"],
      exclude: ["lib/**/*.d.ts", "**/*.test.ts", "**/*.spec.ts"],
    },
  },
});
```

Nota: `include: ["lib/**/*.ts"]` concentra la coverage sulla logica pura (dove ha
senso misurarla), escludendo pagine/route Next.js. Allarga il glob solo se l'utente
chiede la copertura anche di `components/` o `app/`.

---
name: deploy-firebase
description: >-
  Esegue il deploy dell'app web di Hagenton su Firebase Hosting (progetto
  hagenton-812d8). Builda l'export statico di Next.js e lo pubblica. Da usare
  quando l'utente vuole rilasciare/pubblicare online il sito. Esempi di trigger:
  "deploya su firebase", "pubblica il sito", "manda in produzione", "rilascia su
  hosting", "fai il deploy".
---

# Deploy su Firebase Hosting — Hagenton

Pubblica l'app web (`apps/web`) su **Firebase Hosting**, progetto
**`hagenton-812d8`**. L'app è un export statico di Next.js (100% client-side):
`next build` con `output: "export"` genera la cartella `out/`, che Firebase serve.

Tutti i comandi vanno eseguiti da dentro `apps/web` (`cd apps/web && ...`).
La configurazione è già presente nel repo:
- `apps/web/firebase.json` — Hosting serve `out/`, `cleanUrls: true`.
- `apps/web/.firebaserc` — progetto di default `hagenton-812d8`.
- `apps/web/next.config.mjs` — `output: "export"`.

## Prerequisiti (verifica, non dare per scontato)

1. **Firebase CLI installata:** `firebase --version`. Se manca, ferma e chiedi
   all'utente di installarla (`npm i -g firebase-tools` o `brew install firebase-cli`).
2. **Autenticazione:** `firebase projects:list`. Se fallisce per login mancante,
   NON tentare `firebase login` in autonomia (è interattivo/apre il browser):
   chiedi all'utente di eseguire `! firebase login` nella sessione.

## Procedura di deploy

Eseguila nell'ordine. Fermati e segnala all'utente al primo errore.

1. **Controllo qualità (obbligatorio).** Prima di buildare, invoca l'agente
   `code-reviewer` per lint/type-check/build. Non procedere se ci sono errori non
   gestiti esplicitamente dall'utente.

2. **Build dell'export statico:**
   ```bash
   cd apps/web && npm run build
   ```
   Verifica che la cartella `out/` sia stata generata (con `index.html` e le
   sotto-pagine `simulazione`, `storico`, `faq`). Se `out/` non esiste, il deploy
   fallirà: controlla che `output: "export"` sia in `next.config.mjs`.

3. **Deploy (solo Hosting), sul progetto esplicito:**
   ```bash
   cd apps/web && firebase deploy --only hosting --project hagenton-812d8
   ```
   Specifica sempre `--project hagenton-812d8` per evitare di pubblicare sul
   progetto sbagliato.

4. **Riporta l'esito** all'utente includendo l'**Hosting URL** stampato dalla CLI
   (es. `https://hagenton-812d8.web.app`). Se il deploy fallisce, incolla l'output
   di errore rilevante e proponi come procedere — non dichiarare successo se la CLI
   non l'ha confermato.

## Note

- **Anteprima locale** (facoltativa, prima del deploy): `firebase hosting:channel:deploy preview`
  crea un canale di preview con URL temporaneo, senza toccare la produzione.
- Il deploy è **verso l'esterno e visibile pubblicamente**: se l'utente non ha
  chiesto esplicitamente di andare in produzione, conferma prima di eseguire lo
  step 3.
- Non committare la cartella `out/` (è già ignorata da `.gitignore`).

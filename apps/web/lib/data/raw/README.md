# Dataset grezzi — provenienza e limiti

Questi CSV sono dati grezzi scaricati da fonti pubbliche. Nessuna chiamata di rete a
runtime: qui restano bundlati e versionati nel repo, come sorgente di verità
immutabile — non vengono letti a runtime né parsati con un CSV parser nell'app.

**Sono stati integrati** nella logica di `lib/finance.ts` tramite dataset TypeScript
derivati in `lib/data/` (non in questa cartella `raw/`): vedi la sezione
"Dataset derivati" più sotto per la mappa file-per-file e le trasformazioni
applicate a ciascuna fonte grezza.

| File | Colonne | Copertura | Fonte |
|---|---|---|---|
| `msci_world.csv` | `date,close` | 1985 – oggi, cadenza **trimestrale** (non mensile: densità storica limitata su questo ticker) | Indice MSCI World USD Gross Total Return, via [Yahoo Finance](https://finance.yahoo.com/quote/%5E990100-USD-STRD/history/) |
| `sp500_tbond_annual_1928.csv` | `year,sp500_total_return,us_tbond_10y_return` | 1928 – 2025, **annuale** | [Damodaran — Historical Returns on Stocks, Bonds and Bills](https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/histretSP.html) |
| `us_inflation_annual_1914.csv` | `year,inflation_rate` | 1914 – 2025, **annuale** | Stesso file Damodaran (foglio "Inflation Rate", fonte FRED CPI USA) |
| `bitcoin.csv` | `Date,Price` | 2010-07-18 – oggi, **giornaliero** | [GitHub Habrador/Bitcoin-price-visualization](https://github.com/Habrador/Bitcoin-price-visualization) (fonte originale CoinGecko) |
| `bot_weighted_avg_1981_2026.csv` | `date,gross_compound_yield_pct` | **1981 – 2026**, quindicinale, **quasi nessun buco** (1074 osservazioni) | Banca d'Italia — Base Dati Statistica, cubo `BOT0100`, serie "rendimento medio ponderato lordo composto" (tutte le scadenze aggregate). **Consigliata come proxy di default per "Libretto postale"**: è la serie più continua delle quattro. |
| `bot_3m_1981_2026.csv` | `date,gross_compound_yield_pct` | 1983 – 2026, con buchi (452 osservazioni: non tutte le aste da 3 mesi sono state bandite in ogni periodo) | Come sopra, scadenza 3 mesi |
| `bot_6m_1981_2026.csv` | `date,gross_compound_yield_pct` | 1984 – 2026, con buchi (658 osservazioni) | Come sopra, scadenza 6 mesi |
| `bot_12m_1981_2026.csv` | `date,gross_compound_yield_pct` | 1988 – 2026, con buchi (599 osservazioni) | Come sopra, scadenza 12 mesi |

## Limiti noti (da tenere presente in fase di integrazione)

- **BOT**: il portale Banca d'Italia blocca lo scraping automatico, ma l'export
  manuale (Base Dati Statistica → cubo `BOT0100` → filtro periodo → Esporta) copre
  **1981–2026 senza buchi rilevanti** sulla serie aggregata (`bot_weighted_avg`).
  Usa quella come proxy per "Libretto postale"; le serie per singola scadenza
  (3/6/12 mesi) hanno buchi reali perché non tutte le scadenze sono state bandite
  in ogni periodo — non sono errori di parsing, vanno gestite come dati mancanti
  legittimi (vedi checklist "a prova di utente" del `finance-engine`: finestra
  temporale con dato mancante → clamp esplicito o fallback alla serie aggregata,
  mai un buco silenzioso nel grafico).
- **MSCI World**: cadenza trimestrale, non mensile — se il motore di calcolo itera
  mese per mese va gestita l'interpolazione o un rate composto sul periodo
  disponibile, non un semplice "valore mancante = 0".
- **Obbligazionario**: qui rappresentato dal T.Bond USA 10 anni (Damodaran), **non**
  dal Bloomberg Global Aggregate Bond Index che l'ETF reale (AGGH) replica — quello
  è un indice proprietario, nessuna fonte gratuita disponibile. Va rietichettato in
  UI come "Titoli di Stato (10 anni)", non "obbligazionario globale".
- **60/40**: nessun file dedicato. Va calcolato come blend sintetico 60%
  `sp500_total_return` + 40% `us_tbond_10y_return` dallo stesso file annuale, non
  serve un dataset a parte.
- Tutte le date/anni sono in formato semplice (`YYYY-MM-DD` o `YYYY`); nessuna
  validazione di schema è stata applicata qui — va fatta nel codice che li importa
  (vincolo del `finance-engine`: mai `any` sui dataset, guard esplicito a runtime).

## Dataset derivati (`lib/data/*`, non in questa cartella)

Ogni file grezzo qui sopra viene convertito in una `IndexPoint[]` bundlata
(`{ date: "yyyy-mm-dd", level: number }`, un unico formato canonico per tutti gli
strumenti), tramite `lib/data/scripts/generate-series.mjs`. Lo script non è
importato dall'app: si lancia una tantum con
`node apps/web/lib/data/scripts/generate-series.mjs` ogni volta che un CSV grezzo
cambia, e valida i dati generati (range di sanità, date strettamente crescenti,
nessun `NaN`) prima di scrivere l'output — un CSV corrotto o fuori scala fa
fallire la generazione invece di produrre un dataset bundlato silenziosamente
sbagliato.

| Raw CSV | Modulo generato | `level` rappresenta | Trasformazione |
|---|---|---|---|
| `msci_world.csv` | `series/globalEquitySeries.ts` (`GLOBAL_EQUITY_POINTS`) | il valore `close` | nessuna: è già un indice total-return, un punto = una riga |
| `sp500_tbond_annual_1928.csv` (colonna `us_tbond_10y_return`) | `series/govBonds10ySeries.ts` (`GOV_BONDS_10Y_POINTS`) | indice sintetico composto | punto base 100 al 1° gennaio del primo anno; un punto al 1° gennaio di ogni anno successivo, ottenuto componendo il rendimento annuo di quell'anno (`level[y+1] = level[y] * (1 + return[y])`) |
| `sp500_tbond_annual_1928.csv` (entrambe le colonne) | `series/balanced6040Series.ts` (`BALANCED_60_40_POINTS`) | indice sintetico composto | stessa costruzione del T-Bond, ma sul rendimento annuo blended `0.6 * sp500_total_return + 0.4 * us_tbond_10y_return` — nessun dataset a parte per il 60/40 |
| `us_inflation_annual_1914.csv` | `series/inflationSeries.ts` (`INFLATION_INDEX_POINTS`) | indice CPI sintetico composto | stessa costruzione annuale, sul tasso di inflazione anno per anno |
| `bitcoin.csv` | `series/bitcoinSeries.ts` (`BITCOIN_POINTS`) | il prezzo spot giornaliero | nessuna: un punto = una riga |
| `bot_weighted_avg_1981_2026.csv` | `series/postalSavingsSeries.ts` (`POSTAL_SAVINGS_POINTS`) | indice sintetico composto | base 100 al primo dato disponibile; tra un'osservazione e la successiva si compone il rendimento annualizzato dichiarato nell'osservazione precedente sui giorni effettivamente trascorsi (act/365.25) — tratta la curva di rendimento come "a scalino", l'ipotesi standard per trasformare una serie di yield in un indice di livello continuo |

**Allineamento tra granularità diverse**: il motore (`lib/finance.ts` +
`lib/data/dateMath.ts`) itera mese per mese e ricava il fattore di crescita tra due
date qualunque con un'**interpolazione geometrica (log-lineare)** tra i due punti
della serie che le racchiudono (`levelAt`/`growthFactor` in `dateMath.ts`).
Equivale ad assumere un tasso di crescita costante nell'intervallo tra due
osservazioni consecutive: è l'unica ipotesi ragionevole quando la cadenza
sorgente (trimestrale per l'azionario globale, annuale per
obbligazionario/60-40/inflazione, quindicinale per il libretto postale) è più
larga del passo mensile del motore. Il Bitcoin, essendo giornaliero, ricade quasi
sempre nel caso "punto esatto o intervallo di un giorno" e non ne risente. Una
finestra richiesta fuori dal range `[startDate, endDate]` di una serie viene
clampata al range disponibile, mai estrapolata: il motore restituisce un
`SimulationWarning` esplicito (`instrumentRangeClamped` / `inflationRangeClamped`)
invece di un troncamento silenzioso.

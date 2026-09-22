# Dataset grezzi — provenienza e limiti

Questi CSV sono dati grezzi scaricati da fonti pubbliche, non ancora integrati nella
logica di `lib/finance.ts` (che oggi usa tassi fissi ipotetici in `constants.ts`).
Nessuna chiamata di rete a runtime: qui restano bundlati e versionati nel repo.

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

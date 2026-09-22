#!/usr/bin/env node
// AUTO-GENERATED TOOL — one-off converter, not imported at runtime by the app.
// Reads the raw CSVs in lib/data/raw/ and writes bundled TypeScript literal
// arrays (IndexPoint[]) under lib/data/series/. Run with:
//   node apps/web/lib/data/scripts/generate-series.mjs
// Regenerate whenever a raw CSV changes. No CSV parser dependency is added to
// the app: this script does its own trivial comma-split parsing and never
// runs at request time.

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RAW_DIR = path.join(__dirname, "..", "raw");
const OUT_DIR = path.join(__dirname, "..", "series");
const MS_PER_DAY = 86_400_000;

function readCsv(fileName) {
  const text = readFileSync(path.join(RAW_DIR, fileName), "utf8").trim();
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const header = lines[0].split(",");
  return lines.slice(1).map((line) => {
    const cells = line.split(",");
    const row = {};
    header.forEach((key, i) => {
      row[key.trim()] = cells[i];
    });
    return row;
  });
}

function assertFinitePositive(value, label) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw new Error(`[generate-series] valore non valido per ${label}: ${value}`);
  }
}

function assertAscendingDates(points, label) {
  for (let i = 1; i < points.length; i++) {
    if (points[i].date <= points[i - 1].date) {
      throw new Error(
        `[generate-series] date non strettamente crescenti in ${label} all'indice ${i}: ${points[i - 1].date} -> ${points[i].date}`
      );
    }
  }
}

function toIso(dateLike) {
  // Accetta sia "YYYY-MM-DD" (già ISO) sia "YYYY-MM-DDTHH..." troncando l'ora.
  return String(dateLike).slice(0, 10);
}

function diffDays(fromIso, toIsoStr) {
  const a = new Date(`${fromIso}T00:00:00Z`).getTime();
  const b = new Date(`${toIsoStr}T00:00:00Z`).getTime();
  return (b - a) / MS_PER_DAY;
}

// --- MSCI World: date,close -> livello = close direttamente (già un indice total return) ---
function buildMsciWorld() {
  const rows = readCsv("msci_world.csv");
  const points = rows
    .map((r) => ({ date: toIso(r.date), level: Number(r.close) }))
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  points.forEach((p) => assertFinitePositive(p.level, `msci_world.close @ ${p.date}`));
  assertAscendingDates(points, "msci_world");
  // Range di sanità nota per un indice total-return USD dal 1985 a oggi.
  points.forEach((p) => {
    if (p.level < 20 || p.level > 20000) {
      throw new Error(`[generate-series] msci_world fuori range plausibile @ ${p.date}: ${p.level}`);
    }
  });
  return points;
}

// --- Bitcoin: Date,Price -> livello = prezzo direttamente ---
function buildBitcoin() {
  const rows = readCsv("bitcoin.csv");
  const points = rows
    .map((r) => ({ date: toIso(r.Date), level: Number(r.Price) }))
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  points.forEach((p) => assertFinitePositive(p.level, `bitcoin.price @ ${p.date}`));
  assertAscendingDates(points, "bitcoin");
  points.forEach((p) => {
    if (p.level < 0.001 || p.level > 5_000_000) {
      throw new Error(`[generate-series] bitcoin fuori range plausibile @ ${p.date}: ${p.level}`);
    }
  });
  return points;
}

// --- Indice sintetico da rendimenti annuali (S&P500/T-Bond, inflazione) ---
// Costruisce un punto al 1° gennaio di ogni anno, base 100 al primo anno, e un
// punto finale al 1° gennaio dell'anno successivo all'ultimo dato disponibile
// (dopo aver applicato il rendimento dell'ultimo anno). L'interpolazione tra
// due 1° gennaio consecutivi (a runtime) assume un tasso costante nell'anno:
// è l'unica ipotesi ragionevole quando il dato sorgente è annuale.
function buildAnnualIndex(years, annualReturns, label) {
  if (years.length !== annualReturns.length || years.length === 0) {
    throw new Error(`[generate-series] serie annuale vuota o disallineata: ${label}`);
  }
  const points = [{ date: `${years[0]}-01-01`, level: 100 }];
  for (let i = 0; i < years.length; i++) {
    const prev = points[points.length - 1];
    const nextLevel = prev.level * (1 + annualReturns[i]);
    assertFinitePositive(nextLevel, `${label} @ anno ${years[i]}`);
    points.push({ date: `${years[i] + 1}-01-01`, level: nextLevel });
  }
  assertAscendingDates(points, label);
  return points;
}

function readSp500TBond() {
  const rows = readCsv("sp500_tbond_annual_1928.csv");
  return rows
    .map((r) => ({
      year: Number(r.year),
      sp500: Number(r.sp500_total_return),
      tbond: Number(r.us_tbond_10y_return),
    }))
    .sort((a, b) => a.year - b.year);
}

function buildGovBonds10y(sp500TBondRows) {
  const years = sp500TBondRows.map((r) => r.year);
  const returns = sp500TBondRows.map((r) => r.tbond);
  return buildAnnualIndex(years, returns, "govBonds10y (US T-Bond 10y)");
}

function buildBalanced6040(sp500TBondRows) {
  const years = sp500TBondRows.map((r) => r.year);
  const returns = sp500TBondRows.map((r) => 0.6 * r.sp500 + 0.4 * r.tbond);
  return buildAnnualIndex(years, returns, "balanced6040 (60% S&P500 + 40% US T-Bond 10y)");
}

function buildInflationIndex() {
  const rows = readCsv("us_inflation_annual_1914.csv")
    .map((r) => ({ year: Number(r.year), rate: Number(r.inflation_rate) }))
    .sort((a, b) => a.year - b.year);
  const years = rows.map((r) => r.year);
  const returns = rows.map((r) => r.rate);
  return buildAnnualIndex(years, returns, "inflationIndex (US CPI)");
}

// --- Libretto postale: rendimento medio ponderato lordo composto BOT (%) ---
// La serie non è un livello ma un rendimento annualizzato "a scalino": tra
// un'osservazione e la successiva applichiamo il rendimento annunciato
// all'inizio dell'intervallo, composto sui giorni effettivamente trascorsi
// (act/365.25). È l'ipotesi standard per trasformare una curva di rendimenti
// quindicinali in un indice di livello continuo.
function buildPostalSavings() {
  const rows = readCsv("bot_weighted_avg_1981_2026.csv")
    .map((r) => ({ date: toIso(r.date), yieldPct: Number(r.gross_compound_yield_pct) }))
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  rows.forEach((r) => {
    if (!Number.isFinite(r.yieldPct) || r.yieldPct < -5 || r.yieldPct > 40) {
      throw new Error(`[generate-series] bot yield fuori range plausibile @ ${r.date}: ${r.yieldPct}`);
    }
  });
  const points = [{ date: rows[0].date, level: 100 }];
  for (let i = 1; i < rows.length; i++) {
    const prev = points[points.length - 1];
    const elapsedYears = diffDays(rows[i - 1].date, rows[i].date) / 365.25;
    const annualGrowth = 1 + rows[i - 1].yieldPct / 100;
    const nextLevel = prev.level * Math.pow(annualGrowth, elapsedYears);
    assertFinitePositive(nextLevel, `postalSavings @ ${rows[i].date}`);
    points.push({ date: rows[i].date, level: nextLevel });
  }
  assertAscendingDates(points, "postalSavings");
  return points;
}

function round(level) {
  return Math.round(level * 1_000_000) / 1_000_000;
}

function writeSeriesFile(fileBaseName, exportName, points, comment) {
  const body = points.map((p) => `  { date: "${p.date}", level: ${round(p.level)} },`).join("\n");
  const content = `${comment}
// AUTO-GENERATED — do not edit by hand.
// Regenerate with: node apps/web/lib/data/scripts/generate-series.mjs
import type { IndexPoint } from "../types";

export const ${exportName}: IndexPoint[] = [
${body}
];
`;
  writeFileSync(path.join(OUT_DIR, `${fileBaseName}.ts`), content, "utf8");
  console.log(`wrote ${fileBaseName}.ts (${points.length} points)`);
}

function main() {
  const sp500TBondRows = readSp500TBond();

  writeSeriesFile(
    "globalEquitySeries",
    "GLOBAL_EQUITY_POINTS",
    buildMsciWorld(),
    "// Azionario globale — MSCI World USD Gross Total Return (Yahoo Finance, ^990100-USD-STRD)."
  );
  writeSeriesFile(
    "govBonds10ySeries",
    "GOV_BONDS_10Y_POINTS",
    buildGovBonds10y(sp500TBondRows),
    "// Obbligazionario — Titoli di Stato USA a 10 anni (Damodaran, us_tbond_10y_return).\n// NB: NON è il Bloomberg Global Aggregate Bond Index (indice proprietario, nessuna\n// fonte gratuita); in UI va etichettato \"Titoli di Stato (10 anni)\", non \"obbligazionario globale\"."
  );
  writeSeriesFile(
    "balanced6040Series",
    "BALANCED_60_40_POINTS",
    buildBalanced6040(sp500TBondRows),
    "// 60/40 — blend sintetico 60% S&P500 total return + 40% US T-Bond 10y (Damodaran)."
  );
  writeSeriesFile(
    "bitcoinSeries",
    "BITCOIN_POINTS",
    buildBitcoin(),
    "// Bitcoin — prezzo spot giornaliero USD (Habrador/Bitcoin-price-visualization, fonte CoinGecko)."
  );
  writeSeriesFile(
    "postalSavingsSeries",
    "POSTAL_SAVINGS_POINTS",
    buildPostalSavings(),
    "// Libretto postale (proxy) — rendimento medio ponderato lordo composto BOT,\n// tutte le scadenze aggregate (Banca d'Italia, cubo BOT0100)."
  );
  writeSeriesFile(
    "inflationSeries",
    "INFLATION_INDEX_POINTS",
    buildInflationIndex(),
    "// Indice inflazione USA (CPI, Damodaran/FRED) — usato per l'aggiustamento reale opzionale."
  );

  console.log("Generazione completata senza errori.");
}

main();

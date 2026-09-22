import { simulate } from "@/lib/finance";
import type { Scenario } from "@/lib/storage";
import type { Dict } from "@/lib/i18n/dictionaries";

/** Colori della cartella Excel (esadecimali ARGB, non token CSS: file esterno). */
const COLOR = {
  titleFill: "FFF4E7B6", // crema/oro tenue in linea col brand
  headerFill: "FF1F2430", // inchiostro scuro
  headerText: "FFFFFFFF",
  stripeFill: "FFF7F7F4", // riga alternata
  border: "FFD9D9D9",
};

const CURRENCY_FMT = '#,##0 "€"';

interface ColumnDef {
  header: string;
  width: number;
  /** Allineamento orizzontale della colonna dati. */
  align: "left" | "center" | "right";
  /** Formato numerico Excel per le celle dati (opzionale). */
  numFmt?: string;
}

/**
 * Genera e scarica un file .xlsx con l'elenco delle simulazioni salvate e i
 * rispettivi risultati calcolati. Il file è leggibile e leggermente stilizzato:
 * intestazioni in grassetto con sfondo, righe alternate, bordi solo sulla
 * tabella e nessuna griglia sulle celle vuote. Solo lato client (usa Blob).
 */
export async function exportScenariosToExcel(
  scenarios: Scenario[],
  t: Dict,
  locale: string,
): Promise<void> {
  const { Workbook } = await import("exceljs");
  const workbook = new Workbook();
  workbook.creator = "SeSolo";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(t.excel.sheetName, {
    // Nessuna griglia: le celle senza dati restano pulite; i bordi li mettiamo
    // solo sulla tabella.
    views: [{ showGridLines: false, state: "frozen", ySplit: 3 }],
  });

  const cols = t.excel.columns;
  const columns: ColumnDef[] = [
    { header: cols.name, width: 26, align: "left" },
    { header: cols.instrument, width: 16, align: "left" },
    { header: cols.initialCapital, width: 16, align: "right", numFmt: CURRENCY_FMT },
    { header: cols.periodicAmount, width: 16, align: "right", numFmt: CURRENCY_FMT },
    { header: cols.periodicity, width: 16, align: "left" },
    { header: cols.startDate, width: 14, align: "center" },
    { header: cols.endDate, width: 14, align: "center" },
    { header: cols.inflation, width: 12, align: "center" },
    { header: cols.taxRate, width: 14, align: "right", numFmt: '0"%"' },
    { header: cols.invested, width: 16, align: "right", numFmt: CURRENCY_FMT },
    { header: cols.finalValue, width: 16, align: "right", numFmt: CURRENCY_FMT },
    { header: cols.netGain, width: 16, align: "right", numFmt: CURRENCY_FMT },
  ];
  const lastColLetter = String.fromCharCode(64 + columns.length); // es. "L"

  sheet.columns = columns.map((c) => ({ width: c.width }));

  // Riga 1: titolo su tutta la larghezza.
  sheet.mergeCells(`A1:${lastColLetter}1`);
  const titleCell = sheet.getCell("A1");
  titleCell.value = t.excel.title;
  titleCell.font = { bold: true, size: 14, color: { argb: COLOR.headerFill } };
  titleCell.alignment = { vertical: "middle", horizontal: "left" };
  titleCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: COLOR.titleFill },
  };
  sheet.getRow(1).height = 26;

  // Riga 2: data di esportazione.
  sheet.mergeCells(`A2:${lastColLetter}2`);
  const subCell = sheet.getCell("A2");
  subCell.value = t.excel.generatedAt(new Date().toLocaleDateString(locale));
  subCell.font = { italic: true, size: 10, color: { argb: "FF6B6B6B" } };
  subCell.alignment = { vertical: "middle", horizontal: "left" };

  // Riga 3: intestazioni di colonna.
  const headerRow = sheet.getRow(3);
  columns.forEach((c, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = c.header;
    cell.font = { bold: true, color: { argb: COLOR.headerText } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: COLOR.headerFill },
    };
    cell.alignment = { vertical: "middle", horizontal: c.align, wrapText: true };
  });
  headerRow.height = 28;

  const fmtDate = (iso: string) =>
    new Date(`${iso}T00:00:00`).toLocaleDateString(locale);

  // Righe dati.
  scenarios.forEach((s, index) => {
    const r = simulate({
      initialCapital: s.initialCapital,
      periodicAmount: s.periodicAmount,
      periodicity: s.periodicity,
      startDate: s.startDate,
      endDate: s.endDate,
      instrument: s.instrument,
      adjustForInflation: s.adjustForInflation,
      taxRate: s.taxRate,
    });

    const values = [
      s.label || t.excel.columns.name,
      t.instruments[s.instrument] ?? s.instrument,
      s.initialCapital,
      s.periodicAmount,
      t.periodicityEvery[s.periodicity] ?? s.periodicity,
      fmtDate(s.startDate),
      fmtDate(s.endDate),
      s.adjustForInflation ? t.excel.yes : t.excel.no,
      s.taxRate,
      r.totalInvested,
      r.finalValue,
      r.netGain,
    ];

    const row = sheet.getRow(4 + index);
    const stripe = index % 2 === 1;
    columns.forEach((c, i) => {
      const cell = row.getCell(i + 1);
      cell.value = values[i];
      cell.alignment = { vertical: "middle", horizontal: c.align };
      if (c.numFmt) cell.numFmt = c.numFmt;
      cell.border = {
        top: { style: "thin", color: { argb: COLOR.border } },
        bottom: { style: "thin", color: { argb: COLOR.border } },
        left: { style: "thin", color: { argb: COLOR.border } },
        right: { style: "thin", color: { argb: COLOR.border } },
      };
      if (stripe) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: COLOR.stripeFill },
        };
      }
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const today = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `${t.excel.fileName}-${today}.xlsx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

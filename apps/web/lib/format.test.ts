import { describe, it, expect } from "vitest";
import { formatCurrency, formatPercent } from "@/lib/format";

// Normalizza gli spazi (Intl usa NBSP / narrow-NBSP a seconda del runtime).
const norm = (s: string) => s.replace(/\s+/g, " ").trim();
// Solo le cifre, per essere robusti al separatore delle migliaia che dipende
// dai dati ICU disponibili nel runtime (assente in alcuni Node).
const digits = (s: string) => s.replace(/\D/g, "");

describe("formatCurrency", () => {
  it("formatta in EUR senza decimali di default", () => {
    const out = norm(formatCurrency(1234));
    expect(out).toContain("€");
    expect(digits(out)).toBe("1234");
    // niente parte decimale quando non preciso
    expect(out).not.toMatch(/[.,]\d{2}(?!\d)/);
  });

  it("con precise=true mostra due decimali", () => {
    const out = norm(formatCurrency(1234.56, true));
    expect(out).toContain("€");
    expect(digits(out)).toBe("123456");
    // separatore decimale (virgola in it-IT) seguito da due cifre
    expect(out).toMatch(/[.,]56/);
  });

  it("arrotonda a intero quando non preciso", () => {
    expect(digits(formatCurrency(0))).toBe("0");
    expect(digits(formatCurrency(999.9))).toBe("1000");
  });

  it("gestisce valori negativi", () => {
    const out = norm(formatCurrency(-500));
    expect(digits(out)).toBe("500");
    expect(out).toContain("-");
  });
});

describe("formatPercent", () => {
  it("converte una frazione in percentuale", () => {
    expect(norm(formatPercent(0.1))).toBe("10%");
    expect(norm(formatPercent(0.265))).toMatch(/26[.,]5\s*%/);
  });

  it("gestisce 0 e valori > 1", () => {
    expect(norm(formatPercent(0))).toBe("0%");
    expect(digits(formatPercent(1.5))).toBe("150");
  });
});

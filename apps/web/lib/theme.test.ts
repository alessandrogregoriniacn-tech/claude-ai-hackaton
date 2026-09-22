import { describe, it, expect } from "vitest";
import { THEME_KEY, THEME_INIT_SCRIPT } from "@/lib/theme";

describe("theme", () => {
  it("usa la chiave localStorage versionata da convenzione", () => {
    expect(THEME_KEY).toBe("hagenton:theme:v1");
  });

  it("lo script di init referenzia la chiave e imposta data-theme", () => {
    expect(THEME_INIT_SCRIPT).toContain(JSON.stringify(THEME_KEY));
    expect(THEME_INIT_SCRIPT).toContain("data-theme");
    expect(THEME_INIT_SCRIPT).toContain("prefers-color-scheme");
  });

  it("lo script è un IIFE protetto da try/catch (nessun crash pre-idratazione)", () => {
    expect(THEME_INIT_SCRIPT.trim().startsWith("(function()")).toBe(true);
    expect(THEME_INIT_SCRIPT).toContain("try");
    expect(THEME_INIT_SCRIPT).toContain("catch");
  });
});

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
    environment: "node",
    include: ["**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", ".next", "out"],
    coverage: {
      provider: "v8",
      reportsDirectory: "reports/coverage",
      reporter: ["text", "html", "json-summary"],
      // Emette il report anche quando qualche test fallisce (utile per la skill).
      reportOnFailure: true,
      include: ["lib/**/*.ts"],
      exclude: ["lib/**/*.d.ts", "**/*.test.ts", "**/*.spec.ts"],
    },
  },
});

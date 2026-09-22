import type { Config } from "tailwindcss";

/**
 * Il design system interno verrà mappato qui.
 * I colori sono esposti come CSS variables (definite in app/globals.css)
 * così da poter innestare i token del design system senza toccare i componenti.
 */
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        surface: "var(--color-surface)",
        border: "var(--color-border)",
        muted: "var(--color-muted)",
        primary: {
          DEFAULT: "var(--color-primary)",
          foreground: "var(--color-primary-foreground)",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          foreground: "var(--color-accent-foreground)",
        },
        positive: "var(--color-positive)",
        negative: "var(--color-negative)",
      },
      borderRadius: {
        card: "var(--radius-card)",
      },
      fontFamily: {
        sans: "var(--font-sans)",
      },
    },
  },
  plugins: [],
};

export default config;

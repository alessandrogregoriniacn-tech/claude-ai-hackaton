import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

// Flat config per ESLint 9 (sostituisce il vecchio .eslintrc.json).
// Riproduce gli extends "next/core-web-vitals" + "next/typescript".
// Gli ignore globali (.next, out, build, next-env.d.ts) arrivano da "next/typescript".
const eslintConfig = [
  ...coreWebVitals,
  ...typescript,
];

export default eslintConfig;

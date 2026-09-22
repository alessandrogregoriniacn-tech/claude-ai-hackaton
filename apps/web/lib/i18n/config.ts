import { DEFAULT_LANG, LANGS, type Lang } from "./dictionaries";

/** Chiave localStorage per la lingua scelta (vedi convenzione in CLAUDE.md). */
export const LANG_KEY = "hagenton:lang:v1";

/** Type guard su una stringa arbitraria letta da storage/DOM. */
export function isLang(value: unknown): value is Lang {
  return typeof value === "string" && (LANGS as string[]).includes(value);
}

/**
 * Script inline eseguito prima dell'idratazione: imposta l'attributo `lang` su
 * <html> in base alla lingua salvata (o alla preferenza del browser) così che
 * il documento dichiari subito la lingua corretta. Il testo dell'interfaccia
 * viene comunque tradotto lato client dopo il mount (vedi I18nProvider).
 * Deve restare una stringa: viene iniettato in <head>.
 */
export const LANG_INIT_SCRIPT = `(function(){try{var k=${JSON.stringify(
  LANG_KEY,
)};var s=localStorage.getItem(k);var n=(navigator.language||"").slice(0,2).toLowerCase();var t=s==="it"||s==="en"?s:(n==="en"?"en":${JSON.stringify(
  DEFAULT_LANG,
)});document.documentElement.setAttribute("lang",t);}catch(e){}})();`;

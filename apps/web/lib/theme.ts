export type Theme = "light" | "dark";

export const THEME_KEY = "hagenton:theme:v1";

/**
 * Script inline eseguito prima dell'idratazione per applicare il tema salvato
 * (o la preferenza di sistema) ed evitare il "flash" di tema errato.
 * Deve restare in stringa: viene iniettato in <head> come primo elemento.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var k=${JSON.stringify(
  THEME_KEY,
)};var s=localStorage.getItem(k);var d=window.matchMedia("(prefers-color-scheme: dark)").matches;var t=s==="light"||s==="dark"?s:(d?"dark":"light");document.documentElement.setAttribute("data-theme",t);}catch(e){}})();`;

import { describe, expect, it } from "vitest";

import { filterFaqGroups, type FaqGroup } from "./faqSearch";

const IT_GROUPS: FaqGroup[] = [
  {
    title: "Gli strumenti e i dati storici",
    items: [
      {
        id: "libretto-postale-proxy",
        q: "«Libretto postale» è davvero il libretto di risparmio postale?",
        a: "Il dato usato è invece la media storica dei rendimenti dei Buoni Ordinari del Tesoro (BOT), pubblicata da Banca d'Italia.",
        keywords: [
          "BOT",
          "buoni ordinari del tesoro",
          "buoni italiani",
          "buoni del tesoro",
          "titoli di stato a breve termine",
          "libretto postale",
          "libretto di risparmio",
        ],
      },
      {
        id: "bitcoin-volatilita",
        q: "Perché i risultati con Bitcoin possono sembrare estremi?",
        a: "Il prezzo storico di Bitcoin ha attraversato fasi di crescita molto rapida.",
        keywords: ["cripto", "criptovaluta", "crypto"],
      },
    ],
  },
  {
    title: "Dati e privacy",
    items: [
      {
        id: "dati-al-sicuro",
        q: "I miei dati sono al sicuro?",
        a: "SeSolo non fa alcuna chiamata di rete verso l'esterno.",
        keywords: ["dati personali", "localStorage", "sicurezza", "privacy"],
      },
    ],
  },
];

const EN_GROUPS: FaqGroup[] = [
  {
    title: "Instruments and historical data",
    items: [
      {
        id: "libretto-postale-proxy",
        q: "Is “Postal savings” really the Italian postal savings book?",
        a: "The figure used instead is the historical average return of Italian Treasury bills (BOT), published by the Bank of Italy.",
        keywords: [
          "BOT",
          "Italian Treasury bills",
          "T-bills",
          "Italian government bonds",
          "short-term government bonds",
          "postal savings",
          "postal savings book",
        ],
      },
      {
        id: "bitcoin-volatilita",
        q: "Why can results with Bitcoin look extreme?",
        a: "Bitcoin's historical price has gone through phases of very rapid growth.",
        keywords: ["crypto", "cryptocurrency", "bitcoin"],
      },
    ],
  },
  {
    title: "Data and privacy",
    items: [
      {
        id: "dati-al-sicuro",
        q: "Is my data safe?",
        a: "SeSolo makes no network calls of any kind.",
        keywords: ["personal data", "localStorage", "security", "privacy"],
      },
    ],
  },
];

describe("filterFaqGroups", () => {
  it("con query vuota restituisce tutti i gruppi invariati, nell'ordine originale", () => {
    const { groups, matchCount } = filterFaqGroups(IT_GROUPS, "");

    expect(groups).toEqual(
      IT_GROUPS.map((group) => ({ title: group.title, items: [...group.items] })),
    );
    expect(matchCount).toBe(3);
  });

  it("trova la voce BOT cercando 'buoni italiani' pur senza corrispondenza testuale diretta", () => {
    const { groups, matchCount } = filterFaqGroups(IT_GROUPS, "buoni italiani");

    expect(matchCount).toBe(1);
    expect(groups).toHaveLength(1);
    expect(groups[0].items[0].id).toBe("libretto-postale-proxy");
  });

  it("omette i gruppi senza corrispondenze, mantenendo l'ordine dei gruppi con match", () => {
    const { groups } = filterFaqGroups(IT_GROUPS, "sicurezza");

    expect(groups).toHaveLength(1);
    expect(groups[0].title).toBe("Dati e privacy");
    expect(groups[0].items[0].id).toBe("dati-al-sicuro");
  });

  it("restituisce nessun gruppo per una query priva di corrispondenze", () => {
    const { groups, matchCount } = filterFaqGroups(IT_GROUPS, "xyzxyznonesiste");

    expect(groups).toHaveLength(0);
    expect(matchCount).toBe(0);
  });

  it("finds the BOT entry searching the English keyword 'Italian government bonds'", () => {
    const { groups, matchCount } = filterFaqGroups(EN_GROUPS, "Italian government bonds");

    expect(matchCount).toBe(1);
    expect(groups).toHaveLength(1);
    expect(groups[0].items[0].id).toBe("libretto-postale-proxy");
  });

  it("keeps the same stable ids across the IT and EN datasets for the same conceptual entry", () => {
    const itIds = IT_GROUPS.flatMap((g) => g.items.map((i) => i.id)).sort();
    const enIds = EN_GROUPS.flatMap((g) => g.items.map((i) => i.id)).sort();

    expect(enIds).toEqual(itIds);
  });
});

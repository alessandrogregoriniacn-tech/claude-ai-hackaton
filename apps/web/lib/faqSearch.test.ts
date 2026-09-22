import { describe, expect, it } from "vitest";

import { filterFaqGroups, type FaqGroup } from "./faqSearch";

const GROUPS: FaqGroup[] = [
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
        a: "Hagenton non fa alcuna chiamata di rete verso l'esterno.",
        keywords: ["dati personali", "localStorage", "sicurezza", "privacy"],
      },
    ],
  },
];

describe("filterFaqGroups", () => {
  it("con query vuota restituisce tutti i gruppi invariati, nell'ordine originale", () => {
    const { groups, matchCount } = filterFaqGroups(GROUPS, "");

    expect(groups).toEqual(
      GROUPS.map((group) => ({ title: group.title, items: [...group.items] })),
    );
    expect(matchCount).toBe(3);
  });

  it("trova la voce BOT cercando 'buoni italiani' pur senza corrispondenza testuale diretta", () => {
    const { groups, matchCount } = filterFaqGroups(GROUPS, "buoni italiani");

    expect(matchCount).toBe(1);
    expect(groups).toHaveLength(1);
    expect(groups[0].items[0].id).toBe("libretto-postale-proxy");
  });

  it("omette i gruppi senza corrispondenze, mantenendo l'ordine dei gruppi con match", () => {
    const { groups } = filterFaqGroups(GROUPS, "sicurezza");

    expect(groups).toHaveLength(1);
    expect(groups[0].title).toBe("Dati e privacy");
    expect(groups[0].items[0].id).toBe("dati-al-sicuro");
  });

  it("restituisce nessun gruppo per una query priva di corrispondenze", () => {
    const { groups, matchCount } = filterFaqGroups(GROUPS, "xyzxyznonesiste");

    expect(groups).toHaveLength(0);
    expect(matchCount).toBe(0);
  });
});

# SeSolo — Design System (v1)

Ispirato alla palette **"FastPay"**: fintech chiaro e caldo, costruito su
**crema + bianco + nero + giallo oro**. Direzione scelta: **"Nero azione, giallo
accento" (Opzione A)** — le azioni primarie sono nere ad alto contrasto, il giallo
è riservato a hero/enfasi.

I token vivono in [`app/globals.css`](./app/globals.css) come CSS variables e sono
mappati sulle utility Tailwind in [`tailwind.config.ts`](./tailwind.config.ts). I
componenti usano **solo** questi token: nessun colore/raggio/spaziatura hard-coded.

## Palette

| Token | Valore | Uso |
| --- | --- | --- |
| `--color-background` / `bg-background` | `#F5F1E7` | sfondo pagina (crema) |
| `--color-surface` / `bg-surface` | `#FFFFFF` | card e superfici |
| `--color-foreground` / `text-foreground` | `#14130F` | testo principale (ink) |
| `--color-muted` / `text-muted` | `#726D5D` | testo secondario (AA: 4.58:1 su crema, 5.17:1 su bianco) |
| `--color-border` / `border-border` | `#E7E0CE` | bordi caldi |
| `--color-primary` / `bg-primary` | `#14130F` | **azione primaria** (nero) |
| `--color-primary-foreground` | `#FFFFFF` | testo sulle azioni primarie |
| `--color-accent` / `bg-accent` | `#F5CE3E` | **brand/enfasi**, solo riempimenti (hero, chip) |
| `--color-accent-strong` / `text-accent-strong` | `#9A7400` | testo oro di enfasi (numeri) |
| `--color-positive` | `#9A7400` | guadagno |
| `--color-negative` | `#B3261E` | valori negativi/errori |

## Tema scuro

Il tema scuro vive in `:root[data-theme="dark"]` (in `globals.css`) e ribalta la
direzione mantenendo le stesse regole: **l'ink diventa lo sfondo, la crema il
testo, il giallo resta l'accento (solo fill)**. L'azione primaria si inverte in
chiara su fondo scuro. Il tema è scelto dal toggle in navigazione (persistito in
`localStorage`, con fallback alla preferenza di sistema); uno script inline in
`<head>` lo applica prima dell'idratazione per evitare il flash.

| Token | Light | Dark |
| --- | --- | --- |
| `--color-background` | `#F5F1E7` | `#14130F` |
| `--color-surface` | `#FFFFFF` | `#1F1D17` |
| `--color-foreground` | `#14130F` | `#F3EFE4` |
| `--color-muted` | `#726D5D` | `#A79F8C` |
| `--color-border` | `#E7E0CE` | `#787060` (≥ 3:1 sulle superfici scure, WCAG 1.4.11) |
| `--color-primary` | `#14130F` | `#F3EFE4` |
| `--color-accent` | `#F5CE3E` | `#F5CE3E` |
| `--color-accent-strong` | `#9A7400` | `#FFD84D` (oro più brillante, distinto dal fill) |
| `--color-negative` | `#B3261E` | `#F2645B` |

Le regole cromatiche qui sotto valgono in **entrambi** i temi.

## Regole cromatiche (fondamentali)

1. **Il giallo è solo fill, mai testo.** `#F5CE3E` su crema/bianco non raggiunge il
   contrasto AA per il testo: usalo come sfondo (hero, chip) con testo `foreground`.
2. **Le azioni primarie sono nere** (`bg-primary` + `text-primary-foreground`), a
   forma di pill (`rounded-pill`). Una sola azione primaria per vista.
3. **L'oro (`accent-strong`) è per testo solo grande/bold** (≥ 18.66px bold): i
   numeri di enfasi (es. "Avresti oggi") sì; il testo piccolo no → usa `foreground`.
4. **Gerarchia:** crema (sfondo) → bianco (card) → ink (testo/azioni) → giallo (accento).

## Scale

**Raggi:** `rounded-sm` 12px · `rounded-md` 16px · `rounded-card` 24px · `rounded-pill` 999px.

**Tipografia:** `--font-sans` = `system-ui` (nessun font esterno, coerente con "nessuna
chiamata di rete"). Numeri finanziari sempre `tabular-nums`.

## Accessibilità

- Contrasto testo ≥ **WCAG AA** (4.5:1 normale, 3:1 grande/UI).
- Focus sempre visibile (`:focus-visible` globale con outline ink).
- Target interattivi ≥ 44px, `aria-label` su grafici e icone.

## Governance

Ogni modifica o aggiunta al design system o alla grafica **deve passare dall'agente
[`ui-guardian`](../../agents/ui-guardian/README.md)**, che verifica coerenza
stilistica e UX e — solo in caso di dubbio reale — propone un A/B all'utente.

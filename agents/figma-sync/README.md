# Figma Sync

Agente **ponte bidirezionale** tra il codice del design system di SeSolo e il file
Figma di progetto.

## Ruolo

Gestisce la connessione all'MCP di Figma e mantiene allineati token e componenti nelle
due direzioni:

- **READ — design → sviluppato**: legge il file Figma e genera/aggiorna i token in
  `globals.css` e `tailwind.config.ts` e, se serve, i componenti React. Si parte dal
  design per produrre lo sviluppato.
- **WRITE — sviluppato → design**: legge il design system dal codice e popola Figma con
  variabili, stili e frame/component. Si parte dallo sviluppato per popolare Figma.

## File Figma

- URL: <https://www.figma.com/design/jtJSHOqdYVLfEOwRshkyRM/Untitled?node-id=0-1>
- File key: `jtJSHOqdYVLfEOwRshkyRM`

## Prerequisito

L'MCP "claude.ai Figma" (`mcp.figma.com`) deve essere autenticato dall'utente via
`/mcp` → "claude.ai Figma". Senza connessione l'agente si ferma e lo segnala.

La direzione **WRITE** dipende dagli strumenti che l'MCP espone: molte configurazioni
sono **sola lettura**. In quel caso l'agente non fallisce, ma produce un artefatto di
importazione (tabella/JSON di token e specifiche componenti) da importare in Figma con
un plugin, dichiarandolo nel report.

## Dove vive

La definizione operativa (subagent invocabile in Claude Code) è in
[`.claude/agents/figma-sync.md`](../../.claude/agents/figma-sync.md). Questo file è la
scheda di governance leggibile del progetto.

## Relazione con gli altri agenti

Ogni output **visivo** prodotto in direzione READ deve passare dalla revisione
dell'agente [`ui-guardian`](../ui-guardian/README.md), che resta il guardiano del
design system.

## Come si invoca

- "Importa i token da Figma e aggiorna il codice." (READ)
- "Porta il design system del codice su Figma." (WRITE)
- "Sincronizza il design system con Figma."

# AGENTS.md

## Project boundary

This repository is the source authority for the public DFT Research Workflow
learning website. The site is an English, operation-led, static-first framework
for how researchers carry out a DFT study.

## Content authority

- The 35 entries in `src/content/operations/` are the public directory,
  learning order, stable route authority, and future chapter boundary.
- Operation numbers, titles, parts, and slugs must pass the deterministic
  validators before they change.
- Detailed chapters are written and reviewed one operation at a time. Do not
  bulk-generate tutorial prose, commands, parameters, formulae, examples,
  results, references, or automation advice.
- Keep the public information architecture limited to Home and Operations until
  a later explicit decision.
- Public pages, metadata, navigation, aria labels, and the 404 page use English.

## Design and implementation

- Use the current Electronic Structure Atlas `/theory/` page only as a visual
  reference: narrow serif reading column, white background, simple text links,
  restrained headings, and light rules.
- Do not copy its content, data, taxonomy, or project identity.
- Keep the site fully readable without client-side JavaScript.
- Do not add cards, dashboards, filters, badges, status chips, decorative
  graphics, workflow rails, or automation-maturity interfaces.
- Preserve the GitHub Pages project base and exact-SHA deployment manifest.

## Safety and delivery

Do not commit credentials, licensed potential contents, private host details,
unpublished calculation data, or production DFT inputs and outputs. Use one
short-lived branch and pull request. Build and browser success establish
software behavior only; they do not establish numerical or scientific validity.

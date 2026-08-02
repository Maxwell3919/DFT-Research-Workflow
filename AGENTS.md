# AGENTS.md

## Project boundary

This repository is the source authority for the DFT Research Workflow learning
website. It teaches research reasoning and evidence gates; it is not a workflow
engine and does not authorize or run production calculations.

## Content and evidence

- Use original explanations and synthetic examples.
- Do not commit textbook/manual bodies, restricted figures, licensed potential
  contents, credentials, private host details, or unpublished raw calculation
  data.
- Keep program exit, electronic convergence, ionic convergence, observable
  convergence, physical validity, and scientific acceptance as separate gates.
- External theory and software documentation should be linked, not copied.

## Implementation

- Keep the site static-first and TypeScript strict.
- Interactions must add explanatory value and retain an understandable no-JS
  representation.
- Machine-readable operation records are the structural authority for workflow
  coverage and must pass repository validators.
- Public visibility and public GitHub Pages deployment require separate explicit
  user approval.

## Delivery

Use single-purpose short-lived branches and pull requests. Before claiming
completion, run the project checks and distinguish software validation from
scientific validation.

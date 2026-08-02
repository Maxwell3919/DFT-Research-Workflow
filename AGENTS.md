# AGENTS.md

## Project boundary

This repository is the source authority for the public DFT Research Workflow
learning website. It is a static teaching project, not a workflow engine and not
an authority for production calculations.

## Current information architecture

- `docs/architecture.md` defines the reader-facing A–E workflow.
- The public framework uses researcher-scale tasks, concrete target
  calculations, and complete research workflows.
- The site does not claim that DFT research contains a fixed total number of
  operations.
- O01–O24 and former Operation 00–34 files and routes are migration material
  only. They must not return as the primary directory, chapter count, or
  scientific taxonomy.
- Existing recipe, relation, tag, and legacy files may support migration, but
  they do not override the current architecture.

## Content rules

- Follow `docs/content-contract.md` and
  `docs/content-population-plan.md`.
- Organize every page according to its topic.
- Do not impose a fixed visible sequence of Inputs, Outputs, Requirement,
  Repeatability, Dependencies, Alternatives, Exclusions, or similar headings.
- Machine-readable metadata may support routing and migration but must not
  dictate the article outline.
- Keep implementation-level actions inside the researcher-scale task that gives
  them scientific meaning.
- Each concrete calculation in part D may receive an independent page.
- Group headings under D are navigation categories, not additional operations.
- Research-workflow pages may branch, repeat, or revisit tasks and must not be
  presented as universal linear sequences.
- Detailed content is written and reviewed one coherent topic or research
  workflow at a time.
- Public content remains English and software-neutral at the conceptual level.

## Migration rules

- Preserve old URLs until reviewed destination pages exist.
- Do not show old O identifiers or 00–34 numbers as the current reading order.
- Remove previous/next adjacency that implies the old numbered routes remain the
  scientific sequence.
- Move useful material into the appropriate A–E topic or research workflow.
- Redirect or retire a legacy route only through a reviewed migration.

## Design and implementation

- Keep the site static-first and understandable without client-side JavaScript.
- Preserve the GitHub Pages project base and exact-SHA deployment manifest.
- Use the Electronic Structure Atlas `/theory/` page only as a restrained visual
  reference; do not copy its content, data, taxonomy, or identity.
- Avoid dashboards, progress meters, status chips, and contract-heavy layouts
  that interrupt continuous reading.
- Update deterministic validators when routes, migration boundaries, or public
  information architecture change.
- Build and browser success establish software behaviour only.

## Safety and delivery

Do not commit credentials, licensed potential contents, private host details,
unpublished calculation data, or production DFT inputs and outputs.

Use a single-purpose short-lived branch and pull request. Re-read the current
`main` and target blobs before writing or merging. Changes to the A–E task
inventory, migration policy, stable routes, public visibility, or deployment
architecture require explicit user authorization. Do not force-push.

# AGENTS.md

## Project boundary

This repository is the source authority for the public DFT Research Workflow
learning website. It is a static teaching and ontology project, not a workflow
engine and not an authority for production calculations.

## Scientific authority

- `ontology/operations.json` defines the 24 core operations O01–O24.
- `ontology/relations.json` defines semantic relations.
- `ontology/tags.json` defines system, target, method, and implementation tags.
- `recipes/index.json` defines composite workflow scaffolds.
- `ontology/legacy-operations.json` maps the former 00–34 routes.
- `src/content/operations/*.md` is legacy route metadata only.
- Public pages are projections and must not redefine taxonomy.

Do not restore the claim that the former 35 pages are a complete,
non-overlapping, minimal operation set.

## Content rules

- Follow `docs/content-population-plan.md` for content layers, placeholder scope,
  writing order, and review gates.
- Keep operations, recipes, scientific targets, system types, methods,
  implementations, validation states, and provenance roles at separate levels.
- A new core operation requires a distinct typed input–action–output contract
  and a deletion-test witness.
- Recipes reuse operation IDs rather than copying operation definitions.
- Detailed content is written and reviewed one operation or recipe at a time.
- Placeholder work must remain neutral and must not pre-empt scientific review.
- Public content remains English and software-neutral.
- Preserve the former 35 slugs until a separately approved migration removes
  them.

## Design and implementation

- Keep the site static-first and understandable without client-side JavaScript.
- Preserve the GitHub Pages project base and exact-SHA deployment manifest.
- Use the Electronic Structure Atlas `/theory/` page only as a restrained visual
  reference; do not copy its content, data, taxonomy, or identity.
- Update deterministic validators whenever authority fields, route projections,
  or compatibility rules change.
- Build and browser success establish software behavior only.

## Safety and delivery

Do not commit credentials, licensed potential contents, private host details,
unpublished calculation data, or production DFT inputs and outputs.

Use a single-purpose short-lived branch and pull request. Re-read the current
`main` and target blobs before writing or merging. Architecture, ontology, and
stable-route changes require explicit user authorization. Do not force-push.
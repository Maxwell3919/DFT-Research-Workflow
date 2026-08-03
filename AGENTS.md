# AGENTS.md

## Project boundary

This repository is the source authority for the public DFT Research Workflow
learning website. It is a static teaching project, not a workflow engine and not
an authority for production calculations.

## Current information architecture

- `docs/architecture.md` defines the reader-facing A–E workflow,
  researcher-scale task granularity, and subordinate practical-page boundary.
- `workflow/topics.json` defines stable A–E section, group, topic title, and
  route identity.
- `src/content/topics/*.md` supplies optional natural-language topic narratives.
- `src/content/practical-guides/*.md` supplies implementation guides, worked
  examples, and visual notes bound to an existing parent topic.
- The site does not claim that DFT research contains a fixed total number of
  operations.
- O01–O24 and former Operation 00–34 files and routes are migration material
  only. They must not return as the primary directory, chapter count, or
  scientific taxonomy.
- Existing recipe, relation, tag, and legacy files may support migration, but
  they do not override the current architecture or topic registry.

## Topic registry rules

- Keep section IDs A–E and D navigation groups D1–D5 unless the user explicitly
  approves an architecture change.
- Topic slugs and titles must be unique and must not collide with transitional
  routes.
- A registry record identifies a topic and route; it does not define article
  headings, scientific conclusions, universal parameters, or one execution
  order.
- Migration references are internal editorial aids and must not be rendered as a
  second public taxonomy.
- The registry length may be used by tests to detect missing routes but must not
  be presented as the number of DFT operations.
- Add substantive topic prose under `src/content/topics/` using only
  `topic_slug` and editorial `status` in frontmatter.

## Practical-guide rules

- Every practical page must bind to one existing `workflow/topics.json` topic.
  It is a subordinate implementation or evidence view, not another operation.
- Use one of `implementation`, `worked-example`, or `visual-note`; do not create
  new kinds merely to mirror software menus.
- A guide should answer one bounded practical question. A worked example should
  preserve explicit model, software, source, execution, and claim boundaries.
- Pin the software version or tested range. A homepage being reachable is not
  proof that the documented capability works in the tested version.
- Bind every reviewed page to a companion execution script when the page makes
  executable claims. The script should assert only what the page claims.
- Software execution, numerical convergence, and scientific validation are
  separate evidence classes.
- Do not convert demonstration lattice constants, strain, vacuum, supercells,
  adsorption heights, or other example values into universal recommendations.
- Parent topic pages use restrained static cards. Do not add JavaScript tabs,
  progress dashboards, software rankings, or empty pages generated from the
  tool seed inventory.

## Practical sources and media

- Declare practical-guide sources in `sources/practical-guide-links.json` and
  require exact agreement with the page's `source_ids` and rendered links.
- Declare every displayed practical-guide asset in
  `workflow/practical-guide-media.json`.
- Prefer original diagrams and original screenshots. External media require a
  source URL, access date, reuse basis, bounded crop, caption, and alt text.
- Inputs, commands, and output fragments remain selectable text. A code
  screenshot is not a substitute for a code block.
- A screenshot proves only what was displayed. It does not establish successful
  execution, numerical convergence, or scientific validity.

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
- Detailed content is written and reviewed one coherent topic, practical page,
  or research workflow at a time.
- Public content remains English and software-neutral at the conceptual level.

## Source review and link verification

- Semantic source review, external-link reachability, and rendered-link presence
  are separate evidence classes. Never describe one as proof of another.
- Every external source used by a reviewed topic must appear in both the article
  and its scientific review and must be declared in
  `sources/reviewed-links.json`.
- `npm run validate:reviewed-sources` checks exact manifest coverage without
  network access. `npm run audit:reviewed-links` performs the time-bounded
  external HTTP audit and writes machine-readable evidence when configured.
- `npm run validate:practical-guides` checks parent binding, source identity,
  execution scripts, media provenance, and review boundaries.
- `npm run audit:practical-links` checks time-bounded reachability of the
  official practical-guide sources.
- A normal documentation URL must return a successful non-404 document. A DOI
  check establishes resolver recognition only; it does not establish publisher
  access after the redirect.
- Link reachability is time-dependent. A passing audit does not guarantee future
  availability, regional access, semantic correctness, or scientific validity.
- Browser smoke may verify that links are rendered, but it must not be described
  as an external link check.

## Migration rules

- Preserve old URLs until reviewed destination pages exist.
- Do not show old O identifiers or 00–34 numbers as the current reading order.
- Remove previous/next adjacency that implies the old numbered routes remain the
  scientific sequence.
- Move useful material into the appropriate A–E topic, practical page, or
  research workflow.
- Redirect or retire a legacy route only through a reviewed migration.

## Design and implementation

- Keep the site static-first and understandable without client-side JavaScript.
- Preserve the GitHub Pages project base and exact-SHA deployment manifest.
- Use the Electronic Structure Atlas `/theory/` page only as a restrained visual
  reference; do not copy its content, data, taxonomy, or identity.
- Avoid dashboards, progress meters, status chips, and contract-heavy layouts
  that interrupt continuous reading.
- Update deterministic validators when routes, registry relationships,
  practical collections, media rules, migration boundaries, or public
  information architecture change.
- Build and browser success establish software behaviour only.

## Safety and delivery

Do not commit credentials, licensed potential contents, private host details,
unpublished calculation data, or production DFT inputs and outputs.

Use a single-purpose short-lived branch and pull request. Re-read the current
`main` and target blobs before writing or merging. Changes to the A–E task
inventory, migration policy, stable routes, public visibility, or deployment
architecture require explicit user authorization. Do not force-push.

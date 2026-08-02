# Content scaffold framework audit

## Scope and evidence

This audit examined `Maxwell3919/DFT-Research-Workflow@fb698fc6f1ab3567d86df32d00301ccc1b0ad7b2` before the content-scaffold implementation. The read-only baseline check ran `npm ci --no-audit --no-fund`, `npm run check`, and the local browser smoke. These checks established the recorded software behavior only; they did not establish scientific, numerical, physical, or pedagogical validity.

## Authority consistency

- `ontology/operations.json` is the single identity-and-contract source for O01–O24. Rendering code read its names, slugs, lifecycle groups, contracts, and adjacency rather than copying them into legacy Markdown.
- `ontology/relations.json`, `ontology/tags.json`, `recipes/index.json`, and `ontology/legacy-operations.json` had distinct declared roles. Legacy Markdown carried route metadata only.
- The baseline site did not yet have core narrative, recipe narrative, or framework narrative collections. It also exposed only Home and Operations, although the approved content plan requires distinct recipes and framework layers. This was an implementation gap, not an ontology conflict.

## Ontology integrity

- The baseline validator and direct inspection found continuous unique O01–O24 IDs and slugs, non-empty input/output arrays, resolvable dependencies, 39 typed relations, 16 recipe records, and 35 continuous legacy mappings.
- Recipe operation arrays were documented as coverage projections rather than complete topological execution orders. Lifecycle remained a teaching projection, not a universal linear workflow.
- Tags were structured in system, target, method, and implementation families. Recipe references resolved against the applicable tag families. No operation, recipe, tag, or relation semantic change was required.

## Public information architecture and compatibility

- The approved target separates Core Operations, Workflow Recipes, Framework, and legacy compatibility. The baseline already kept legacy pages out of core adjacency and core count, but lacked public recipe/framework routes.
- All 35 legacy routes existed at the baseline and mapped to valid core IDs. They stated their compatibility role and had no previous/next navigation.

## Technical findings and disposition

1. **Missing one-to-one narrative bindings and public projections** — repaired in this branch with three content collections, 24/16/5 neutral scaffold records, and static recipe/framework routes.
2. **Navigation validator still encoded the former two-entry transition** — repaired to validate the approved four-entry structure.
3. **Ontology validation did not require non-empty typed inputs/outputs or validate the implementation tag family and relation endpoint shape** — repaired without changing any authority data.
4. **Generated-site and browser validation did not cover the planned recipe/framework routes** — repaired with deterministic route, no-JavaScript, keyboard, mobile, and navigation checks.

## Decision boundary

No finding required changing O01–O24 identity, order, semantics, granularity, inputs, outputs, recipe coverage, tag meaning, relation types, legacy routes, public visibility, or deployment architecture. The implementation may therefore proceed within the approved placeholder-only scope. Detailed scientific content remains outside this audit and this branch.

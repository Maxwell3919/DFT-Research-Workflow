# Content contract

## Authority

`ontology/operations.json` is the scientific operation authority.

The following sources are subordinate projections:

- `ontology/relations.json`: typed semantic relationships;
- `ontology/tags.json`: system, target, method, and implementation vocabularies;
- `recipes/index.json`: composite workflow scaffolds;
- `ontology/legacy-operations.json`: former 00–34 compatibility mapping;
- `src/content/operations/*.md`: legacy route metadata;
- Astro pages: public rendering.

A page cannot redefine an operation by changing prose, order, or navigation.

## Core operation record

Every O01–O24 record contains exactly:

- `id`: stable identifier `O01` through `O24`;
- `order`: integer `1` through `24`;
- `slug`: explicit `oNN-...` route slug;
- `name`: action-oriented English name;
- `lifecycle`: one declared lifecycle projection;
- `definition`: one primary action semantic;
- `inputs`: typed input-object names;
- `outputs`: typed output-object names;
- `requirement`: universal or conditional applicability;
- `repeatability`: when or how the operation is repeated;
- `dependencies`: direct core-operation prerequisites;
- `alternatives`: implementation subtypes with the same primary semantic;
- `exclusions`: neighboring concepts that do not belong to the operation.

Core records are schema-like metadata, not executable production contracts.
They do not authorize a calculation or supply code-specific parameters.

## Operation admission rule

A proposed operation is accepted only when it:

1. has a distinct input–action–output contract;
2. can be executed or evaluated independently;
3. is not merely a system type, scientific target, software name, or method
   family;
4. cannot be represented by parameterizing or composing existing operations;
5. has a deletion-test witness showing what becomes inexpressible without it.

Changing O01–O24 identity, semantics, or granularity is an architecture change
and requires explicit review.

## Workflow recipe record

Every recipe contains:

- stable `slug`;
- English `title`;
- ordered or dependency-relevant `operations`;
- `system_types`;
- `scientific_targets`;
- `methods`;
- `status`.

A recipe may repeat an operation. Its operation array is a coverage projection,
not necessarily a complete topological execution order. Detailed recipes may
later add explicit edges, branches, loops, references, validation axes, and
failure returns.

Recipes must reference O01–O24 rather than copying operation definitions.

## Tag record

Tags classify context and are orthogonal to operations.

New tags must be added to the appropriate family:

- `system_types`;
- `scientific_targets`;
- `methods`;
- `implementations`.

A tag does not prove that associated preparation, convergence, boundary, or
validation operations were performed.

## Relation record

Every relation contains:

- `source`;
- `relation`;
- `target`.

Relation types are declared in `ontology/relations.json`. Operation references
must resolve to O01–O24. Artifact or control-state targets may use descriptive
identifiers when they are not operation nodes.

## Legacy record

Every former route contains:

- `number` and two-digit `display_number`;
- former `title` and exact `slug`;
- non-empty `maps_to` operation IDs;
- `entry_kind`;
- `disposition`.

Legacy metadata exists only for compatibility and migration. Legacy records are
excluded from core counts and core previous/next navigation.

## Public chapter requirements

### Core operation page

A core page must show:

- ID and action name;
- lifecycle projection;
- definition;
- inputs and outputs;
- requirement and repeatability;
- dependencies;
- alternatives;
- exclusions;
- core-operation adjacency.

Detailed future prose may add rationale, examples, implementation notes,
failure modes, convergence concerns, and references. It must preserve the
machine-readable contract.

### Legacy page

A legacy page must:

- state that the route is retained for compatibility;
- state that it is not one atomic operation;
- show its `entry_kind` and disposition;
- link to every mapped core operation;
- avoid core-operation adjacency and counts.

### Workflow recipe page

A future recipe page must show the composed operation graph, target and system
tags, required references, convergence axes, failure returns, and evidence
boundaries. It must not present the recipe as one atomic operation.

## Evidence language

Content must keep these distinctions explicit:

- recorded output;
- parsed or derived quantity;
- numerical completion;
- observable convergence;
- physical consistency;
- method robustness;
- claim support;
- provenance completeness;
- preservation;
- independent reproduction.

Build, schema, route, and browser checks establish software behavior only.

## Writing and source boundaries

- Public content is English.
- Use original explanations and synthetic examples.
- Link to official documentation and primary sources rather than copying them.
- Do not commit licensed potential bodies, credentials, private host details,
  unpublished raw calculation trees, or restricted source material.
- Do not provide universal numerical parameters where the correct value depends
  on the material, observable, method, implementation, or software version.
- Detailed content is written and reviewed one operation or recipe at a time;
  the machine-readable framework may be updated as one coherent architecture
  change.

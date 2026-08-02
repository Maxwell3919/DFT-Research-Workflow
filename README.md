# DFT Research Workflow

DFT Research Workflow is an English, software-neutral learning framework for
how density-functional-theory studies are assembled from reusable research
operations.

The project starts with acquiring or constructing material structures and ends
with explicit numerical evidence, physical validation, scientific-claim
assessment, provenance, and a reproducibility-ready research bundle.

## Current framework

The scientific authority is a scope-bounded ontology of 24 typed core
operations, O01–O24. It is not presented as a unique global mathematical
minimum. Real studies compose these operations as dependency graphs with
branching, nesting, parallel candidates, and feedback loops.

Scientific targets such as magnetism, phonons, defects, topology,
superconductivity, and GW/BSE are represented as workflow recipes or tags, not
as mutually exclusive atomic operations.

The former 35 Operation 00–34 routes are retained as a compatibility layer and
map to the new ontology. They are not included in the core-operation count.

Public site: <https://maxwell3919.github.io/DFT-Research-Workflow/>

## Repository structure

```text
ontology/
├── operations.json
├── relations.json
├── tags.json
└── legacy-operations.json

recipes/
└── index.json

src/content/operations/
└── legacy route metadata

docs/
├── architecture.md
└── content-contract.md
```

The public `/operations/` directory renders O01–O24 by lifecycle. Existing
legacy URLs remain available and explain their mapping.

See [docs/architecture.md](docs/architecture.md) for the authority model,
workflow graph, migration boundaries, and Talos handoff. See
[docs/content-contract.md](docs/content-contract.md) for record schemas and
writing requirements.

## Local development and validation

Node.js 22.12 or newer is required.

```bash
npm ci --no-audit --no-fund
npm run dev
npm run check
```

For browser validation:

```bash
npm run preview -- --host 127.0.0.1 --port 4322
npm run smoke:browser
```

Repository, build, and browser checks validate software structure and public
behavior. They do not validate any real DFT protocol, numerical result,
physical interpretation, or scientific claim.

# DFT Research Workflow

DFT Research Workflow is an English, software-neutral learning framework for
how researchers carry out a density-functional-theory study.

The site starts with obtaining or building a material structure, continues
through calculation preparation and reference-state calculations, branches into
specific target calculations, and ends with analysis, validation, documentation,
and preservation.

## Current framework

The reader-facing structure is:

```text
A · Structures
B · Calculation Preparation
C · Reference-State Calculations
D · Target Calculations
E · Research Completion
```

A, B, C, and E provide the common research backbone. D is a branching library
in which band structures, density of states, phonons, defect energetics,
electron–phonon coupling, superconductivity, transport, optical calculations,
and other concrete calculations may each have an independent page.

The framework does not claim that DFT research has a fixed total number of
operations. Earlier O01–O24 and Operation 00–34 records remain temporarily as
migration and URL-compatibility data, not as competing public taxonomies.

Every scientific page is organized naturally according to its subject. The site
does not require a repeated Inputs/Outputs/Requirement-style contract or a
uniform visible heading sequence.

Public site: <https://maxwell3919.github.io/DFT-Research-Workflow/>

## Current repository structure

```text
docs/
├── architecture.md
├── content-contract.md
└── content-population-plan.md

ontology/
├── operations.json              # transitional O01–O24 source
├── relations.json               # transitional relation source
├── tags.json                    # contextual vocabulary
└── legacy-operations.json       # former 00–34 route mapping

recipes/
└── index.json                   # transitional workflow source

src/content/
├── core-operations/             # transitional narrative bindings
├── recipes/                     # transitional workflow bindings
├── framework/                   # framework narrative pages
└── operations/                  # former route metadata
```

See [docs/architecture.md](docs/architecture.md) for the current A–E information
architecture and migration policy. See
[docs/content-contract.md](docs/content-contract.md) for natural writing,
review, source, and migration rules. See
[docs/content-population-plan.md](docs/content-population-plan.md) for the topic
inventory and content-development order.

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
behaviour. They do not validate any real DFT protocol, numerical result,
physical interpretation, or scientific claim.

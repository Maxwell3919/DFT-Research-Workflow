# DFT Research Workflow

DFT Research Workflow is an English, software-neutral, human-first research
manual for carrying out a density-functional-theory study.

The site starts with obtaining or building a material structure, continues
through calculation preparation and reference-state calculations, branches into
specific target calculations, and ends with analysis, validation, documentation,
and preservation.

## Current research workflow

The reader-facing structure is:

```text
A · Structure & Model
B · Method & Numerical Setup
C · Reference State
D · Target Calculations
E · Validation, Interpretation & Reproducibility
```

A, B, C, and E provide the common research backbone. D is a branching library
in which band structures, density of states, phonons, defect energetics,
electron–phonon coupling, superconductivity, transport, optical calculations,
and other concrete calculations may each have an independent page.

`workflow/topics.json` defines stable A–E sections, D1–D5 groups, public topic
slugs and titles, and internal migration references. The home page, Research
Workflow directory, and topic routes are generated from this registry. The
registry length is not presented as the number of DFT operations.

Earlier O01–O24 and Operation 00–34 records remain temporarily as migration and
URL-compatibility data, not as competing public taxonomies.

Every scientific page is organized naturally according to its subject. The site
does not require a repeated Inputs/Outputs/Requirement-style contract or a
uniform visible heading sequence.

The public navigation is **Home**, **Research Workflow**, **Worked Workflows**,
and **Tools**. Cross-cutting Framework material now lives in the A–E topics it
supports; the old `/framework/*` routes are migration surfaces. Likewise,
`/recipes/*` preserves old links while `/workflows/` publishes only workflows
with a continuous, file-backed execution chain.

Public site: <https://maxwell3919.github.io/DFT-Research-Workflow/>

## Current repository structure

```text
workflow/
├── topics.json                   # current A–E topic and route authority
└── practical-evidence.json       # guide evidence class and case binding

examples/cases/
└── <case-id>/                    # reproducible inputs, outputs and evidence gates

docs/
├── architecture.md
├── content-contract.md
└── content-population-plan.md

src/content/
├── topics/                      # optional natural topic narratives
├── recipes/                     # transitional workflow bindings
├── framework/                   # sources for framework migration surfaces
├── core-operations/             # transitional O01–O24 bindings
└── operations/                  # former 00–34 route metadata

ontology/
├── operations.json              # transitional O01–O24 source
├── relations.json               # transitional relation source
├── tags.json                    # contextual vocabulary
└── legacy-operations.json       # former 00–34 route mapping

recipes/
└── index.json                   # transitional workflow source
```

See [docs/architecture.md](docs/architecture.md) for the current A–E information
architecture and migration policy. See
[docs/content-contract.md](docs/content-contract.md) for natural writing,
review, source, registry-binding, and migration rules. See
[docs/content-population-plan.md](docs/content-population-plan.md) for the active
writing and migration sequence.

## Local development and validation

Node.js 22.12 or newer is required.

```bash
npm ci --no-audit --no-fund
npm run dev
npm run check
```

`npm run check` validates the current topic registry, transitional migration
sources, project-base-safe links, content policy, case schemas and
hashes, Astro types, the static build, and generated routes. To re-run every
committed case extractor, parser, and gate checker (including verifying that a
declared `FAIL` returns nonzero), use:

```bash
CASE_PYTHON="$(pwd)/.venv/bin/python" node scripts/validate-cases.mjs --execute
```

For browser validation:

```bash
npm run preview -- --host 127.0.0.1 --port 4322
npm run smoke:browser
```

Repository, build, and browser checks validate software structure and public
behaviour. They do not validate any real DFT protocol, numerical result,
physical interpretation, or scientific claim.

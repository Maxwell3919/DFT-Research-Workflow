# DFT Research Workflow content development plan

## Purpose

Content is developed around researcher-scale workflow tasks, concrete target
calculations, and complete research workflows. The project does not advertise a
fixed total number of DFT operations.

Every article uses natural topic organization. This plan defines scope, order,
and migration boundaries; it does not define a mandatory visible template.

## Current implementation state

The architecture migration and first terminal-first release slice are complete
at the repository level:

1. **A–E architecture and presentation** — the public directory uses A–E,
   numbered counts and adjacency are removed, and old URLs remain only as
   migration surfaces.
2. **Topic registry and stable destinations** — `workflow/topics.json` defines
   A–E sections, D1–D5 groups, stable topic slugs and titles, and internal
   migration references. The home page, workflow directory, and topic routes are
   generated from that registry.
3. **Navigation migration** — Framework content has moved into the relevant A–E
   narratives, `/framework/*` and `/recipes/*` are continuity surfaces, and the
   primary route for complete examples is `/workflows/`.
4. **Terminal-first evidence** — practical pages marked `real-execution` bind
   to hash-checked case directories. Silicon and aluminium are the initial
   public continuous Worked Workflows.

Stable routes and passing software checks are not scientific acceptance. Topic
and case expansion continues one coherent scientific unit at a time.

## Current authority

- `docs/architecture.md` defines task granularity and the A–E structure.
- `workflow/topics.json` defines stable topic identity, grouping, and routes.
- `docs/content-contract.md` defines writing and review rules.
- `src/content/topics/*.md` holds optional topic narratives.
- O01–O24, former 00–34 routes, Framework sources, and recipe coverage arrays
  are migration sources only.

The registry is an address book, not a claim about how many operations exist.

## Reader-facing architecture

```text
A · Structures
B · Calculation Preparation
C · Reference-State Calculations
D · Target Calculations
E · Research Completion
```

A, B, C, and E provide the common backbone. D is a branching library selected
according to the scientific question. The complete topic inventory is stored in
`workflow/topics.json` and rendered at `/operations/`.

## Content families

### A · Structures

- Obtain a Material Structure
- Build or Modify a Computational Model

### B · Calculation Preparation

- Choose the DFT Method and Computational Setup
- Test Numerical Convergence

### C · Reference-State Calculations

- Optimize the Structure
- Calculate the Reference Ground State

### D · Target Calculations

Each registered D topic is eligible for an independent article. D1–D5 are
navigation groups only:

- D1 · Energetics and Stability
- D2 · Electronic and Magnetic Properties
- D3 · Mechanical, Electric, and Lattice Response
- D4 · Kinetics and Finite Temperature
- D5 · Optical, Excited-State, Topological, and Transport Calculations

The registry keeps band structure, DOS, Fermi surfaces, harmonic phonons,
anharmonic phonons, lattice thermal transport, electron–phonon coupling,
superconductivity, topology, and transport as separate topics where their
setup, output, convergence, or interpretation differs.

### E · Research Completion

- Analyze and Compare Results
- Validate Results and Scientific Conclusions
- Document and Preserve the Study

## Natural page organization

No page has a required public outline.

Authors choose the explanatory sequence that suits the subject. Inputs,
Outputs, Requirement, Repeatability, Dependencies, Alternatives, and Exclusions
may be discussed where useful, but they are not compulsory headings or contract
rows.

The following are planning questions, not a template:

- What scientific question does the topic address?
- What structure, model, or reference state is required?
- Which physical and numerical decisions control the result?
- How is convergence established for the intended observable?
- What failures, ambiguities, or false interpretations are common?
- What can the result support, and what remains unsupported?
- How does the topic connect to a complete research workflow?
- Which official or primary sources support version-sensitive statements?

Only applicable questions should appear in the final article.

## Topic narrative files

A reviewed topic article is added under `src/content/topics/` with minimal
frontmatter:

```yaml
topic_slug: obtain-material-structure
status: draft
```

The title, section, group, and route come from `workflow/topics.json`. Markdown
frontmatter must not duplicate those fields or predetermine article headings.

A topic moves to `reviewed` only after scientific, editorial, source, route,
responsive-layout, and no-JavaScript checks pass.

## Worked Workflow pages

Worked Workflow pages show how A–E topics combine around a continuous real
execution lineage. The initial public set is Silicon Ground-State and
Electronic-Structure Workflow and Aluminium Metallic Electronic-Structure
Workflow. Former recipe pages are migration sources, not publishable
placeholders; a candidate is added to `/workflows/` only when its case directory
has the actual commands, outputs, checks, parsers, hashes, gates, and claim
boundary needed by the page.

Their old O01–O24 coverage arrays are not the final reader-facing workflow
model. A mature workflow should show relevant dependencies, branches, repeated
calculations, failure returns, comparisons, validation boundaries, and the
strongest conclusion it can support.

## Migration stages

### Stage 1 · Architecture and presentation — complete

- A–E is the public framework.
- Public 24/35 counts and numbered adjacency are removed.
- Fixed Inputs/Outputs-style rendering is removed.
- Old URLs remain as short migration pages.

### Stage 2 · Topic registry and destination routes — complete

- Stable slugs and category relationships are stored in
  `workflow/topics.json`.
- The home page and workflow directory are registry-driven.
- Every registered topic has a stable route.
- Optional narrative binding exists under `src/content/topics/`.
- Deterministic validators check uniqueness, route coverage, reference
  resolution, collisions, and migration continuity.

### Stage 3 · Scientific writing and content migration — active next stage

For each bounded batch:

1. choose one registry topic or one complete research workflow;
2. review relevant migration sources and authoritative external sources;
3. write a naturally organized article;
4. validate scientific scope, numerical and physical boundaries, citations, and
   readability;
5. merge only after software checks and explicit scientific review;
6. keep old routes unchanged until destination coverage is sufficient.

### Stage 4 · Route redirection or retirement — later

- verify reviewed destination coverage;
- decide whether each old route redirects, remains a short migration page, or is
  retired;
- ensure old identifiers and mappings never reappear as a second taxonomy;
- update link and Pages validation.

## Recommended writing order

The initial content sequence is:

1. Obtain a Material Structure
2. Build or Modify a Computational Model
3. Choose the DFT Method and Computational Setup
4. Test Numerical Convergence
5. Optimize the Structure
6. Calculate the Reference Ground State
7. Band Structure
8. Density of States and Projected Density of States
9. Charge Density and Charge Redistribution
10. Electrostatic Potential and Band Alignment
11. Harmonic Phonons
12. Relative Energies and Formation Energies
13. Analyze and Compare Results
14. Validate Results and Scientific Conclusions
15. Document and Preserve the Study
16. remaining D topics in dependency-aware groups
17. complete research-workflow pages

This is a writing strategy, not a universal scientific ranking or execution
sequence.

## Sources and examples

- Prefer official documentation, standards, and primary method papers for
  version-sensitive claims.
- Use original explanation rather than copied manual or textbook prose.
- Use synthetic or clearly licensed examples during early development.
- Preserve structure source, software version, method, numerical settings, raw
  evidence, derived data, and validation limits for reproducible examples.
- Do not present one material's parameters as universal defaults.
- Do not imply that a named code, successful build, or completed job proves
  scientific validity.

## Review boundary

A page is reviewed for scientific accuracy, topic coverage, evidence limits,
source quality, and readability. It is not reviewed by checking compliance with
a uniform heading sequence.

Repository build, links, responsive layout, and no-JavaScript rendering are
software checks. They do not establish numerical or physical validity.

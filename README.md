# DFT Research Workflow

An original, teaching-oriented map of how a reliable density-functional-theory
research project moves from a scientific question to validated, reproducible
results.

This learning website is not a workflow engine. Its software checks do not
establish numerical validity or scientific acceptance.

This repository is public and is intentionally separate from:

- `Electronic-Structure-Learning`, which remains the authority for electronic-
  structure theory and reference content;
- `Vibe-DFT-Skills`, whose broad automation expansion remains frozen; and
- real calculation workspaces, schedulers, raw outputs, restart data, licensed
  potentials, and unpublished research data.

Website build success is software evidence only. It does not validate a DFT
protocol, numerical result, physical interpretation, or scientific claim.

## Information architecture

The first implementation organizes the subject as:

- eight teaching stages along the common research trunk;
- thirty-five machine-readable operations beneath those stages;
- five property branches with distinct parent calculations, convergence axes,
  and claim traps; and
- seven evidence gates separating identity, completion, numerical convergence,
  physical validity, independent validation, and scientific claims.

See [docs/architecture.md](docs/architecture.md) and the source registry at
[src/data/operations.json](src/data/operations.json).

## Local development

Requires Node.js 22 or newer.

```bash
npm ci
npm run dev
```

Run all deterministic repository checks and the production build with:

```bash
npm run check
```

With a local preview running on port `4322`, exercise key routes, the workflow
filter, the 390 px layout, and the no-JavaScript fallback with:

```bash
npm run preview -- --host 127.0.0.1 --port 4322
npm run smoke:browser
```

The generated site is static. It has no scheduler integration, calculation
backend, or production data connection. GitHub Pages deployment is bound to the
exact `main` SHA through `deployment-manifest.json` and a post-deploy browser
smoke.

Public site: <https://maxwell3919.github.io/DFT-Research-Workflow/>

## Delivery model

The initial `main` commit is a minimal recoverable project marker. Website
architecture and content are developed through short-lived branches and pull
requests. The public repository and GitHub Pages deployment were explicitly
approved on 2026-08-02; future visibility or deployment-architecture changes
remain separate decisions.

# DFT Research Workflow

DFT Research Workflow is an English, operation-led learning framework for the
practical process of density-functional-theory research. It is organized around
35 operations that researchers carry out from defining a scientific question
through calculation, property analysis, result checking, archiving, and reuse.

The framework is software-neutral: it does not teach one code, utility, or
scheduler. Its visual treatment is informed by the public Electronic Structure
Atlas, while its content, operation taxonomy, and repository authority remain
independent.

The current release establishes the complete directory, stable routes, content
schema, and chapter containers. Detailed chapter content has not been written.
Future work proceeds by discussing, writing, and reviewing one operation at a
time rather than filling all chapters automatically.

Public site: <https://maxwell3919.github.io/DFT-Research-Workflow/>

## Information architecture

```text
Home
Operations
├── Part I · Common DFT Workflow (Operations 00–17)
├── Part II · Property Workflows (Operations 18–33)
└── Part III · Closing the Loop (Operation 34)
```

The operation entries in `src/content/operations/` are the structural
authority. See [docs/architecture.md](docs/architecture.md) and
[docs/content-contract.md](docs/content-contract.md).

## Local development and validation

Node.js 22.12 or newer is required.

```bash
npm ci --no-audit --no-fund
npm run dev
npm run check
```

For browser validation, start a production preview and run the smoke suite:

```bash
npm run preview -- --host 127.0.0.1 --port 4322
npm run smoke:browser
```

The GitHub Pages workflow builds the same static site, writes an exact-SHA
`deployment-manifest.json`, deploys it, and runs the browser suite against the
public URL.

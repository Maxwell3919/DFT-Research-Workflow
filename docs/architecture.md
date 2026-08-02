# Website architecture

DFT Research Workflow is a small, static-first, English learning website. Its
public information architecture has two entries:

```text
Home
Operations
```

## Operations

Operations is the single learning directory. It contains exactly 35 stable
chapters in a fixed sequence:

```text
Part I · Common DFT Workflow
└── Operations 00–17

Part II · Property Workflows
└── Operations 18–33

Part III · Closing the Loop
└── Operation 34
```

Each operation has one explicit, number-bound slug under `/operations/`.
Changing a title does not cause Astro to guess or replace the route. The
previous and next links follow the numeric order across Part boundaries.

## Content collection

`src/content/operations/` is the content authority. Astro loads the Markdown
entries through `src/content.config.ts`, whose schema requires `number`,
`title`, `part`, `slug`, and `status: scaffold`. The current entries are
empty chapter containers; detailed content is added later through individual
review.

The Home page, Operations directory, operation template, shared layout, and
global stylesheet contain no client-side components. The complete site remains
readable when JavaScript is disabled.

## Visual boundary

The narrow serif column, white background, simple navigation, ordinary blue
links, restrained headings, and light rules are informed by the public
Electronic Structure Atlas `/theory/` page. DFT Research Workflow does not
copy that site's content, data, taxonomy, or identity.

## GitHub Pages

Astro builds beneath `/DFT-Research-Workflow/`. Internal links use
`import.meta.env.BASE_URL`. GitHub Actions validates the collection and
generated HTML, deploys the static output, writes an exact-SHA
`deployment-manifest.json`, and runs desktop, 390 px, keyboard, and
JavaScript-disabled browser checks against the public site.

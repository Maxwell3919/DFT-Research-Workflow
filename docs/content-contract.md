# Content and writing policy

## Purpose

This document defines how DFT Research Workflow pages are written, reviewed,
and migrated under the researcher-scale A–E architecture.

The public site teaches recognizable research tasks and target calculations. It
does not expose a workflow-engine schema as the visible structure of every
article.

## Current information authority

- `docs/architecture.md` defines the reader-facing A–E structure and task
  granularity.
- `workflow/topics.json` defines stable A–E section, group, topic title, and
  route identity for the public Research Workflow directory.
- Public narrative pages explain individual researcher-scale tasks, target
  calculations, or complete research workflows.
- Machine-readable records may support routes, search, relationships, and
  migration, but they do not determine the visible article outline.
- Existing O01–O24 and Operation 00–34 records are migration sources, not the
  current public taxonomy.

The topic registry is an address book and navigation source. Its length is not
presented as the number of DFT operations, and adding a scientifically justified
page does not require redefining a claimed minimal set.

No page, route, JSON file, or validator may silently restore a numbered 24- or
35-operation framework as the current scientific structure.

## Natural organization rule

Every scientific page is organized according to its subject.

There is no mandatory heading set and no fixed visible order. In particular, a
page is not required to display separate sections or contract rows named:

- Inputs;
- Outputs;
- Requirement;
- Repeatability;
- Dependencies;
- Alternatives;
- Exclusions.

Writers may address any of those ideas when they help explain the topic, but
they should appear where the scientific narrative naturally needs them. They
must not be rendered automatically as a uniform form at the top of every page.

A page on obtaining structures may begin with source quality and crystallographic
ambiguity. A band-structure page may begin with what a band path can and cannot
show. A defect page may be organized around reference states, chemical
potentials, charge corrections, and interpretation. A phonon page may be
organized around dynamical matrices, sampling, interpolation, stability, and
failure modes. These pages should not be forced into identical outlines.

## Researcher-scale page types

### Workflow task page

A workflow task page explains a recognizable unit of research work in parts A,
B, C, or E, such as obtaining a structure, choosing a setup, optimizing a
structure, or validating a conclusion.

Technical actions that are meaningful only as parts of that task remain inside
the page. File parsing, coordinate conversion, symmetry detection, scheduler
submission, individual solver calls, and plotting commands do not automatically
receive separate top-level pages.

### Target-calculation page

Each concrete calculation under part D may have an independent page when it has
its own scientific output, setup, convergence problem, or interpretation. Group
headings such as Energetics and Stability or Electronic and Magnetic Properties
are navigation categories, not extra operations.

### Research-workflow page

A research-workflow page combines tasks for a scientific goal such as defect
thermodynamics, adsorption, heterostructure band alignment, electron–phonon
superconductivity, topology, or GW/BSE. It may branch, repeat, omit, or revisit
tasks and must not claim that one example is a universal execution order.

### Framework page

A framework page explains cross-cutting concepts such as workflow branching,
convergence, evidence levels, provenance, or the distinction between numerical
completion and scientific validity. It is not a new research task.

### Migration page

A migration page exists only to preserve an old URL temporarily. It should state
that the route belongs to a superseded classification and direct readers toward
the current workflow. It must not present an old identifier as a current chapter
number, participate in numbered adjacency, or require readers to understand the
relationship between 24 and 35.

## Editorial considerations

The following questions are useful during planning and review, but they are not
a public template and need not appear as named headings:

- What scientific question does the task answer?
- What object, model, or reference state is required?
- What does the researcher actually calculate or decide?
- Which assumptions and method choices control the result?
- Which numerical variables matter for the intended observable?
- What failures, ambiguities, or false interpretations are common?
- What evidence shows that the result is usable?
- Which claims can and cannot be supported?
- How does the task connect to preceding and following work?
- Which official documentation or primary sources support version-sensitive
  statements?

A mature page should answer the applicable questions in a coherent explanatory
sequence. It need not answer irrelevant questions merely to fill a form.

## Topic registry and narrative binding

`workflow/topics.json` stores only the information needed to identify and place
public workflow topics:

- A–E section identity and label;
- D1–D5 navigation groups;
- stable topic slugs and titles;
- optional references to superseded records used during migration.

The registry must not store article prose, scientific conclusions, universal
parameters, or a global execution order. Migration references are internal
editorial aids and are not displayed as a second public taxonomy.

Reviewed topic prose belongs under `src/content/topics/`. A topic Markdown file
uses minimal frontmatter:

```yaml
topic_slug: harmonic-phonons
status: draft
```

Allowed topic statuses are `draft` and `reviewed`. A registry route may exist
before its narrative file; in that state the public page contains only a neutral
content-development notice. Frontmatter must not duplicate the title, section,
group, method choices, inputs, outputs, or proposed article headings.

## Metadata

Frontmatter and machine-readable data should be minimal. They may identify a
page, route, category, status, or migration source. Metadata should not duplicate
large blocks of prose or force visible contract sections.

Internal status values may support editorial workflow, but the public site must
not become a dashboard of scaffold, draft, reviewed, completion percentages, or
status badges unless a separate design decision requires it.

## Scientific and numerical boundaries

Pages must distinguish, when relevant:

- program exit;
- solver convergence;
- structural or path convergence;
- target-observable convergence;
- physical consistency;
- robustness to method or model choices;
- support for a stated scientific conclusion;
- provenance completeness;
- preservation of a reconstruction package;
- independent reproduction.

These distinctions should be explained naturally in the relevant discussion,
not repeated mechanically as a standard block on every page.

## Sources

- Public content is English.
- Use original explanation and synthesis.
- Prefer official software documentation, formal standards, and primary method
  papers for version-sensitive claims.
- Do not copy manuals, textbooks, figures, or long passages.
- Do not commit credentials, licensed potential bodies, private host details,
  unpublished calculation trees, or restricted source material.
- Do not turn a parameter converged for one material and observable into a
  universal recommendation.
- Label code-specific instructions as implementations, not definitions of the
  scientific task.

## Examples

Worked examples should be added only when they genuinely clarify the topic.
They may use different structures from page to page. There is no requirement
that every page contain an example, the same material, the same code, the same
formula sequence, or the same visual component.

A reproducible example should identify its structure source, method and
numerical settings, software version, relevant raw-output references, derived
data, and validation boundary. An illustrative example that is not a validated
research result must say so.

## Review

A page may be considered reviewed when:

1. it fits the current A–E architecture at researcher-task granularity;
2. its scientific statements are accurate within an explicit scope;
3. its organization suits the topic and reads as an explanation rather than a
   serialized schema;
4. numerical convergence and physical validity are not conflated;
5. interpretation and claim boundaries are clear where needed;
6. code-specific details are labelled appropriately;
7. citations support method- or version-sensitive claims;
8. examples preserve their stated provenance and limitations;
9. links, build, no-JavaScript rendering, and responsive layout pass.

Review does not require identical section names, identical ordering, or visible
Inputs/Outputs-style tables.

## Migration rules

During migration from the O01–O24 and Operation 00–34 structures:

- useful material is reassigned to an A–E task, a D target calculation, a
  research workflow, or a framework page;
- `workflow/topics.json` records the intended stable destination when known;
- old routes remain only as temporary compatibility surfaces;
- old IDs are not used as the primary public navigation or reading sequence;
- previous/next links between old numbered pages are removed;
- redirects or route retirement occur only after the destination content exists
  and has been reviewed;
- validators should test current information architecture and route continuity,
  not preserve historical item counts as scientific requirements.

## Delivery

Detailed content proceeds in small, reviewable batches. A batch should normally
cover one coherent workflow task, one target calculation, or one research
workflow. Closely coupled pages may share a pull request when their scientific
and review boundaries are explicit.

Bulk generation of mechanically uniform pages is not an acceptable substitute
for topic-specific writing and review.

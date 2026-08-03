# Reviewed source links — corrective audit

## Why this audit exists

The first three reviewed topic batches checked that cited URLs were present in the
rendered pages and that the cited sources supported the surrounding scientific
statements. Their browser smoke tests did **not** request the external
destinations. Describing those checks as if they established source-link
availability was therefore too broad.

A later manual check found that all four ASE links in the model-construction
article used the retired `wiki.fysik.dtu.dk` documentation host and returned 404.
The current official ASE documentation is hosted at `docs.ase-lib.org`.

This corrective audit separates three questions that must not be conflated:

1. **Semantic source review** — whether a source supports the statement for which
   it is cited.
2. **External-link reachability** — whether the cited destination responds under
   declared HTTP audit rules at a stated time.
3. **Rendered-link presence** — whether the public page contains the intended
   hyperlink.

## Scope

The audit covers every external URL in the three currently reviewed article and
review pairs:

- Obtain a Material Structure;
- Build or Modify a Computational Model;
- Choose the DFT Method and Computational Setup.

The machine-readable authority for this bounded inventory is
`sources/reviewed-links.json`. It contains 33 unique HTTPS URLs. Every URL must be
present in both its public article and its corresponding scientific review. Any
undeclared URL, missing URL, duplicate cross-topic URL, non-HTTPS URL, or retired
ASE host fails deterministic validation.

## Corrective changes

The following four links were replaced in both the model-construction article and
its review:

- ASE Building things → `https://docs.ase-lib.org/ase/build/build.html`;
- ASE Surfaces, vacuum, and adsorbates →
  `https://docs.ase-lib.org/ase/build/surface.html`;
- ASE Atoms and periodic boundary conditions →
  `https://docs.ase-lib.org/ase/atoms.html`;
- ASE Constraints → `https://docs.ase-lib.org/ase/constraints.html`.

The source meaning did not change: these are the current official locations for
the same ASE documentation subjects. The retired host is now prohibited in all
reviewed article/review pairs.

## Full semantic re-review

All three article/review pairs were read again against their declared sources.
The bounded re-review found no additional source-to-statement contradiction that
required changing the scientific prose. This result is limited to the statements
and sources currently declared by these three articles; it is not a universal
literature review and does not validate any material, model, method, or result.

The reviewed source classes remain:

- IUCr standards and validation documentation, Materials Project, COD, and
  spglib for structure acquisition and crystallographic interpretation;
- ASE, pymatgen, Zur–McGill lattice matching, SQS, and the point-defect review
  for model construction;
- Quantum ESPRESSO documentation and primary method papers for the DFT method
  and setup article.

## Automated reachability semantics

`scripts/audit-reviewed-links.mjs` performs two separate modes.

### Deterministic manifest mode

`--manifest-only` runs without network access. It verifies:

- exact agreement between each article, its review, and the source manifest;
- 33 unique HTTPS URLs across the three reviewed topics;
- valid source kinds;
- absence of the retired ASE documentation host;
- presence of this audit record.

This mode is part of the ordinary repository check.

### Network audit mode

The dedicated CI job requests every declared URL and stores a JSON evidence
artifact.

- A normal documentation page must return HTTP 2xx after redirects and must not
  expose a 404/not-found title or first-level heading.
- A DOI is checked at `doi.org`. HTTP 2xx or a valid redirect to a publisher is
  accepted. This proves that the DOI resolver recognizes the identifier; it does
  not assert publisher access after the redirect.
- Transient network failures and selected 429/5xx responses are retried within a
  bounded policy.
- Any remaining failed destination fails the job.

The network job is independent of the static build. A source outage therefore
cannot be disguised as a successful browser-rendering check, and an external
outage is not misreported as an Astro build failure.

## Time boundary

External reachability is an observation at the audit run time, not a permanent
property. A passing run does not guarantee future availability, regional access,
publisher access, or semantic correctness. A failing future scheduled run means
the link requires review; it does not automatically invalidate every scientific
statement previously supported by that source.

The accepted project PR and Research-Ops handoff record the exact successful CI
run, final project commit, and Pages deployment associated with this audit.

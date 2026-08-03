# Reviewed source links — corrective and continuing audit

## Why this audit exists

The initial reviewed-topic batches checked that cited URLs were present in rendered pages and that the sources supported the surrounding scientific statements. Browser smoke did not request the external destinations. A later manual check also found that four ASE links used a retired documentation host and returned 404.

This audit therefore keeps three questions separate:

1. **Semantic source review** — whether a source supports the statement for which it is cited.
2. **External-link reachability** — whether the cited destination responds under declared audit rules at a stated time.
3. **Rendered-link presence** — whether the public page contains the intended hyperlink.

None of these checks validates a material, model, method, numerical result, or scientific conclusion.

## Current scope

The machine-readable authority is `sources/reviewed-links.json`. The current inventory covers eight reviewed article/review pairs:

- Obtain a Material Structure;
- Build or Modify a Computational Model;
- Choose the DFT Method and Computational Setup;
- Test Numerical Convergence;
- Optimize the Structure;
- Calculate the Reference Ground State;
- Relative Energies and Formation Energies;
- Equation of State and Structural Phase Stability.

The manifest declares 76 unique HTTPS destinations. Some sources legitimately support more than one topic. Each article/review pair must contain exactly its declared source set, while the network layer requests each unique URL once and records every topic that reuses it.

Any undeclared URL, missing URL, duplicate URL inside one topic, inconsistent source kind, non-HTTPS URL, unexpected unique-URL count, or retired ASE host fails deterministic validation.

## Historical ASE correction

The original corrective batch replaced four retired `wiki.fysik.dtu.dk` links in both the model-construction article and its review:

- ASE Building things → `https://docs.ase-lib.org/ase/build/build.html`;
- ASE Surfaces, vacuum, and adsorbates → `https://docs.ase-lib.org/ase/build/surface.html`;
- ASE Atoms and periodic boundary conditions → `https://docs.ase-lib.org/ase/atoms.html`;
- ASE Constraints → `https://docs.ase-lib.org/ase/constraints.html`.

The first accepted network audit covered 33 unique URLs across the first three topics. It returned 31 ordinary HTTP or DOI successes and used a controlled browser fallback for two IUCr pages that returned HTTP 403 to the ordinary client. All 33 were reachable under the declared semantics, and no 404 or soft-404 remained.

That result is historical evidence. Every expanded manifest requires a fresh network audit before its content batch can be merged. A later accepted seven-topic run covered 68/68 unique destinations; the eight-topic Equation of State and Structural Phase Stability batch expands that inventory to 76 and therefore requires its own Hosted CI result.

## Semantic review boundary

All eight article/review pairs are required to use exact bounded source inventories. The current source classes include:

- crystallographic standards, databases, and symmetry documentation;
- ASE and pymatgen implementation documentation plus primary model-construction methods;
- Quantum ESPRESSO documentation and primary DFT method papers;
- primary Brillouin-zone integration, pseudopotential verification, finite-size, reproducibility, and density-functional perturbation theory sources for numerical convergence;
- official optimization, electronic-state, thermodynamic, and phase-diagram documentation;
- primary optimization, reference-state, finite-temperature DFT, formation-energy correction, decomposition-reaction, finite-strain EOS, compression, and elastic-stability methods.

A source reused by two topics is not duplicated into two network requests. Reuse does not broaden the source beyond the statements reviewed in each topic.

## Deterministic manifest mode

`scripts/audit-reviewed-links.mjs --manifest-only` runs without network access and verifies:

- exact agreement between every reviewed article, its review, and its topic source set;
- the manifest-declared unique URL count;
- valid `page` and `doi` source kinds;
- consistent kinds when a URL supports multiple topics;
- HTTPS-only sources;
- absence of the retired ASE documentation host;
- presence of this audit record.

This mode is part of the ordinary repository check.

## Network audit mode

The dedicated CI job requests every unique destination and stores a JSON evidence artifact.

- A normal documentation page must return HTTP 2xx after redirects and must not expose a 404/not-found title or first-level heading.
- A page that returns HTTP 401 or 403 to the ordinary client is retried once in controlled headless Chrome. The access method and result are recorded.
- A DOI is checked at `doi.org`. HTTP 2xx or a valid publisher redirect is accepted. This establishes resolver recognition, not publisher access after the redirect.
- Transient network failures and selected 429/5xx responses receive bounded retries.
- Any remaining failed destination fails the job.

The report stores the topic slugs associated with every unique source, so cross-topic reuse remains auditable without repeated network requests.

## Evidence boundary

The network job is independent of the static build. A source outage cannot be disguised as successful page rendering, and an external outage is not misreported as an Astro build failure.

External reachability is time-bound. A passing run does not guarantee future availability, regional access, publisher access, semantic correctness, or scientific validity. A failing future run requires link review; it does not automatically invalidate every scientific statement previously supported by that source.

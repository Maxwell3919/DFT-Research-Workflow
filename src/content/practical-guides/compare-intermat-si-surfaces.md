---
topic_slug: surface-energy-and-work-function
guide_slug: compare-intermat-si-surfaces
title: Compare Published Si Surface Energies and Work Functions
kind: worked-example
tools:
  - python
status: reviewed
summary: Replot published OptB88vdW and experimental values for three silicon facets from a frozen, attributed InterMat Table 1 snapshot.
tested_versions:
  - Python 3.12
execution_script: examples/practical-guides/intermat_si_surfaces.py
source_ids:
  - intermat-paper
  - intermat-nist-pdf
  - cc-by-3
media_ids:
  - intermat-si-surfaces
review: docs/reviews/2026-08-04-surface-energy-and-work-function.md
reviewed_at: "2026-08-04"
---

Rebuild the attributed comparison directly:

```bash
python3 examples/practical-guides/intermat_si_surfaces.py \
  --svg public/media/practical-guides/surface-energy-and-work-function/compare-intermat-si-surfaces/intermat-si-surfaces.svg
```

The command reads the committed Table 1 snapshot, hashes its exact bytes, checks the DOI, licence, orientation order, and published calculation values, and writes the SVG. It does not run an electronic-structure code.

## Inspect what the snapshot represents

The JSON identifies `JVASP-1002`, the source method label `OptB88vdW (OPT)`, unreconstructed non-polar slab scope, Miller indices, units, table number, access date, DOI, and [CC BY 3.0 licence](https://creativecommons.org/licenses/by/3.0/). No coordinates, pseudopotentials, wavefunctions, or licensed inputs are redistributed.

For Si(111), Si(110), and Si(001), the stored calculated work functions are `5.00`, `5.30`, and `5.64 eV`; the stored calculated surface energies are `1.60`, `1.66`, and `2.22 J m^-2`. The plot places each beside the corresponding experimental value listed by InterMat. Inspect orientation and quantity separately; a work function and a surface energy do not share a physical denominator or convergence test.

The script reports mean absolute differences only as descriptive arithmetic for these three pairs. Before using any comparison, check whether the computational termination and reconstruction correspond to the experimental preparation. Three facets from one paper are not an error distribution or an accuracy benchmark.

## Claim boundary

The [NIST-hosted article PDF](https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=957179) supplies the dataset and Table 1 context. A successful command establishes snapshot identity, selected-value transcription, arithmetic, and deterministic rendering. It does not establish DFT convergence, experimental comparability, surface reconstruction, termination stability, method accuracy, or a new conclusion about silicon.

## Official sources

- [Choudhary and Garrity, InterMat](https://doi.org/10.1039/D4DD00031E)
- [NIST-hosted article PDF](https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=957179)
- [Creative Commons Attribution 3.0 Unported](https://creativecommons.org/licenses/by/3.0/)

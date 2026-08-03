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

This example adds a real-material illustration without presenting someone else's figure as this project's calculation. It transcribes the six Si pairs in Table 1 of the open-access [InterMat paper](https://doi.org/10.1039/D4DD00031E), freezes them with source metadata, and produces a new paired-dot plot.

## Inspect the snapshot before the chart

The JSON identifies `JVASP-1002`, the source's `OptB88vdW (OPT)` method label, unreconstructed non-polar slab scope, Miller indices, units, table number, access date, article URL, DOI, and [CC BY 3.0 licence](https://creativecommons.org/licenses/by/3.0/). No coordinates, pseudopotentials, wavefunctions, or licensed inputs are redistributed.

The [NIST-hosted article PDF](https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=957179) contains the dataset description and Table 1 comparison. Its values are real published calculation and experimental records. The experimental numbers remain attributed to the source article rather than silently treated as a uniform benchmark produced under one preparation protocol.

## Compare orientation and quantity separately

For Si(111), Si(110), and Si(001), the stored OptB88vdW work functions are `5.00`, `5.30`, and `5.64 eV`; the stored surface energies are `1.60`, `1.66`, and `2.22 J m⁻²`. The chart places each beside the corresponding experimental value listed by InterMat.

The script reports mean absolute differences only as a descriptive summary of these three pairs. Three orientations from one paper are not an accuracy distribution, and the unreconstructed computational state may not reproduce the reconstruction, contamination, temperature, or preparation of every experiment.

## Rebuild the original rendering

```text
python3 examples/practical-guides/intermat_si_surfaces.py \
  --svg public/media/practical-guides/surface-energy-and-work-function/compare-intermat-si-surfaces/intermat-si-surfaces.svg
```

The script hashes the exact JSON bytes, asserts the DOI, licence, orientation order, and published calculation values, and draws the committed SVG. Reuse copies numerical facts with attribution under the source licence; it does not copy the publisher's table layout or figures.

## What this example does not establish

This repository did not rerun the InterMat electronic-structure calculations or the experiments. The script validates transcription, hashing, summary arithmetic, and rendering only. It does not independently establish DFT convergence, experimental comparability, surface reconstruction, termination stability, method accuracy, or a new conclusion about silicon.

## Official sources

- [Choudhary and Garrity, InterMat](https://doi.org/10.1039/D4DD00031E)
- [NIST-hosted article PDF](https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=957179)
- [Creative Commons Attribution 3.0 Unported](https://creativecommons.org/licenses/by/3.0/)

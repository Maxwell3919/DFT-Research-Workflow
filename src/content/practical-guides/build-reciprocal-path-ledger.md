---
topic_slug: band-structure
guide_slug: build-reciprocal-path-ledger
title: Build a Reciprocal-Path Ledger Before Plotting Bands
kind: implementation
tools:
  - python
status: reviewed
summary: Preserve special-point fractional coordinates, segment distances, cell convention, and energy reference in a deterministic teaching path.
tested_versions:
  - Python 3.12
execution_script: examples/practical-guides/band_path_ledger.py
source_ids:
  - seekpath-paper
  - seekpath-docs
  - qe-bands-docs
media_ids:
  - band-path-ledger
review: docs/reviews/2026-08-04-band-structure.md
reviewed_at: "2026-08-04"
---

A band plot cannot be reconstructed from a list of labels alone. The path needs an explicit reciprocal basis, fractional coordinates, segment order, endpoint treatment, and energy reference. This fixture makes that metadata visible with invented cubic reciprocal vectors and invented eigenvalues.

## Keep coordinates separate from labels

The script converts `Γ–X–M–Γ` fractional coordinates into a cumulative distance axis and preserves the duplicate junction only once. In a real workflow, the same labels can mean different coordinates after a cell transformation. [SeeK-path](https://seekpath.readthedocs.io/en/latest/) and its [crystallographic path paper](https://doi.org/10.1016/j.commatsci.2016.01.017) provide a reproducible way to obtain a path, but the exported structure, standardization choice, and reciprocal convention still belong in the record.

## Run the deterministic fixture

```text
python3 examples/practical-guides/band_path_ledger.py \
  --svg public/media/practical-guides/band-structure/build-reciprocal-path-ledger/band-path-ledger.svg
```

The JSON output includes each special point, cumulative coordinate, an invented Fermi-reference shift, and two invented bands. It is a format and arithmetic test, not a command for any electronic-structure package. [Quantum ESPRESSO's `bands.x` documentation](https://www.quantum-espresso.org/Doc/INPUT_BANDS.html) is included only to support the distinction between raw eigenvalue output and post-processing/reordering.

## What this guide verifies

Execution verifies reciprocal-coordinate conversion, ordered segment joining, a declared energy shift, and deterministic SVG rendering. It does not calculate eigenvalues, validate a crystallographic path, establish symmetry labels, converge a k mesh, determine a gap, or identify a material band structure.

## Official sources

- [Hinuma and co-workers, SeeK-path](https://doi.org/10.1016/j.commatsci.2016.01.017)
- [SeeK-path documentation](https://seekpath.readthedocs.io/en/latest/)
- [Quantum ESPRESSO `bands.x` documentation](https://www.quantum-espresso.org/Doc/INPUT_BANDS.html)

---
topic_slug: band-structure
guide_slug: compare-band-path-and-full-zone-extrema
title: Compare a Band Path with a Full-Zone Extremum Search
kind: implementation
tools:
  - python
status: reviewed
summary: Use an invented two-dimensional eigenvalue field to show why a visually direct path gap need not be the fundamental full-zone gap.
tested_versions:
  - Python 3.12
execution_script: examples/practical-guides/band_extrema_fixture.py
source_ids:
  - bloch-paper
  - kohn-sham
  - setyawan-curtarolo
media_ids:
  - band-path-full-zone-extrema
review: docs/reviews/2026-08-04-band-structure.md
reviewed_at: "2026-08-04"
---

This fixture samples invented valence and conduction surfaces on a square reciprocal grid. Its selected high-symmetry path shows a direct-looking gap at `Γ`, while the full grid contains a lower conduction minimum away from that path. The construction is intentional: it tests the logic of an extremum search rather than describing a material.

## Read a path as a cut through reciprocal space

Bloch labels states over the Brillouin zone, not only at labelled points. The [standardized path work of Setyawan and Curtarolo](https://doi.org/10.1016/j.commatsci.2010.05.010) makes path figures comparable, but it does not demonstrate that all extrema lie on the selected lines. The fixture therefore reports two separate answers: the smallest valence-to-conduction separation on the path, and the full-grid minimum-minus-maximum value.

## Run the deterministic fixture

```text
python3 examples/practical-guides/band_extrema_fixture.py \
  --svg public/media/practical-guides/band-structure/compare-band-path-and-full-zone-extrema/band-path-full-zone-extrema.svg
```

The printed JSON names the invented grid, path extrema, full-grid extrema, and the off-path conduction location. Replace it with a real calculation only after recording structure, Hamiltonian, occupations, reciprocal cell, mesh, interpolation status, and convergence evidence.

## What this guide verifies

Execution verifies a deterministic comparison between a declared reciprocal-space path and a declared full-grid search. It does not solve the Kohn--Sham equations, converge a Brillouin-zone mesh, identify a real indirect gap, determine a carrier valley, or validate a quasiparticle or optical gap.

## Official sources

- [Bloch, periodic-potential wave functions](https://doi.org/10.1007/BF01341914)
- [Kohn and Sham, self-consistent equations](https://doi.org/10.1103/PhysRev.140.A1133)
- [Setyawan and Curtarolo, standardized band paths](https://doi.org/10.1016/j.commatsci.2010.05.010)

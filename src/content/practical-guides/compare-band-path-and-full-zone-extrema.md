---
topic_slug: band-structure
guide_slug: compare-band-path-and-full-zone-extrema
title: Compare a Band Path with a Full-Zone Extremum Search
kind: implementation
tools:
  - python
  - quantum-espresso
status: reviewed
summary: Compare one actual Silicon QE band path with one symmetry-expanded mesh, then keep both sampled separations distinct from a converged fundamental gap.
tested_versions:
  - Python 3.12
  - Quantum ESPRESSO 7.5
execution_script: examples/practical-guides/silicon_qe_full_zone.py
source_ids:
  - bloch-paper
  - kohn-sham
  - setyawan-curtarolo
  - cod-9013102
media_ids:
  - silicon-qe-path-full-zone
  - band-path-full-zone-extrema
review: docs/reviews/2026-08-04-band-structure.md
reviewed_at: "2026-08-04"
---

This page uses one actual, hash-bound Silicon calculation rather than an invented
eigenvalue field. The structure is the two-site CC0 [COD 9013102
Silicon record](https://www.crystallography.net/cod/9013102.html). Its 141-point
SeeK-path-derived line calculation is compared with a separate QE 7.5
`nosym=.true.` 8×8×8 `bands` calculation that emits 260 time-reversal-equivalent
k points and eight Kohn--Sham bands. The selected mesh is deliberately modest:
the comparison teaches what must be checked, not Silicon's band gap.

## Read a path as a cut through reciprocal space

Bloch labels states over the Brillouin zone, not only at labelled points. The
[standardized path work of Setyawan and Curtarolo](https://doi.org/10.1016/j.commatsci.2010.05.010)
makes path figures comparable, but it does not demonstrate that all extrema lie
on selected lines. QE 7.5 records a `0.574 eV` separation between the sampled
fourth and fifth bands on the line path, and `0.617 eV` for the separate mesh
sample. Their difference is the lesson: neither a path nor one mesh is a
full-zone convergence study, and unlike a synthetic construction this real case
does not force the mesh result to be lower.

![A real Silicon QE comparison of a 141-point path and a 260-point mesh, explicitly marked as unconverged samples.](/DFT-Research-Workflow/media/practical-guides/band-structure/compare-band-path-and-full-zone-extrema/silicon-qe-path-full-zone.svg)

The committed `full-zone-extrema.json` preserves structure identity, program
versions, input/output SHA-256 values, coordinates as written by `bands.x`, and
the two derived extrema. The output excerpt preserves the decisive completion
markers; large save directories, wavefunctions, and temporary host directories
are not public artifacts.

The retained conceptual drawing below is deliberately secondary. It isolates the
logical possibility of an off-path extremum; it is not data from Silicon or any
other material.

![Conceptual reciprocal grid showing an invented off-path conduction minimum.](/DFT-Research-Workflow/media/practical-guides/band-structure/compare-band-path-and-full-zone-extrema/band-path-full-zone-extrema.svg)

## Reconstruct the actual-output comparison

```text
python3 examples/practical-guides/silicon_qe_full_zone.py
```

The companion verifies the existing path-output SHA-256, the frozen real-output
ledger, k-point and band counts, derived extrema, and redraws the SVG. It does
not launch QE locally. The recorded SCF → `pw.x bands` → `bands.x` chain had
completion markers and empty captured stderr, but execution completion remains
separate from numerical support.

## What this guide verifies

Execution verifies reconstruction of two declared real-output samples. It does
not converge the Brillouin-zone mesh, establish a full-zone or indirect gap,
determine a carrier valley, or validate a quasiparticle, optical, experimental,
or material conclusion. The former invented field is retained only as a
conceptual test asset; it is not the case presented here.

## Official sources

- [Bloch, periodic-potential wave functions](https://doi.org/10.1007/BF01341914)
- [Kohn and Sham, self-consistent equations](https://doi.org/10.1103/PhysRev.140.A1133)
- [Setyawan and Curtarolo, standardized band paths](https://doi.org/10.1016/j.commatsci.2010.05.010)
- [COD 9013102 Silicon structure](https://www.crystallography.net/cod/9013102.html)

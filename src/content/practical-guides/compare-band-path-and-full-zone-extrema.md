---
topic_slug: band-structure
guide_slug: compare-band-path-and-full-zone-extrema
title: Compare a Band Path with a Full-Zone Extremum Search
kind: implementation
tools:
  - python
  - quantum-espresso
status: reviewed
summary: Compare one actual Silicon QE band path with one 260-point time-reversal-reduced sample from the nominal 8 x 8 x 8 mesh, then keep both sampled separations distinct from a converged fundamental gap.
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

Use this real, hash-bound Silicon comparison when a band-path extremum appears to support a gap or valley statement. It shows the next required operation: calculate a separate full-zone sample from the same accepted state and keep the two datasets distinct. Neither dataset in this teaching example is an observable-convergence study.

## Purpose

First establish the compatible SCF parent:

```bash
pw.x -in scf.in > scf.out
grep -F "convergence has been achieved" scf.out
grep -F "JOB DONE." scf.out
```

The first check asks whether QE reported electronic convergence; the second checks program termination only.

Run the SeeK-path line input and its `bands.x` post-processing as described in the reciprocal-path guide. Then run the separate declared mesh input from the compatible parent state:

```bash
pw.x -in bands.in > full-zone.out
grep -F "JOB DONE." full-zone.out
bands.x -in bands.x.in > full-zone-bandsx.out
grep -F "JOB DONE." full-zone-bandsx.out
```

In the stored full-zone case, `bands.in` uses `nosym=.true.` on an 8 x 8 x 8 grid and writes 260 time-reversal-reduced k points with eight bands. `bands.x` exposes those eigenvalues for parsing. The completion markers confirm the recorded programs ended normally; they do not make this grid dense enough for a fundamental-gap claim.

## Inspect the sampled extrema

The two-site structure comes from the CC0 [COD 9013102 Silicon record](https://www.crystallography.net/cod/9013102.html). The 141-point SeeK-path line sample has a `0.574 eV` separation between its sampled fourth- and fifth-band extrema. The separate mesh sample gives `0.617 eV`. The mesh value need not be lower because both are finite, different samples; neither result is a converged full-zone gap.

![A real Silicon QE comparison of a 141-point path and a 260-point mesh, explicitly marked as unconverged samples.](/DFT-Research-Workflow/media/practical-guides/band-structure/compare-band-path-and-full-zone-extrema/silicon-qe-path-full-zone.svg)

The stored `full-zone-extrema.json` binds structure identity, program versions, input/output SHA-256 values, coordinates written by `bands.x`, and the two derived extrema. The conceptual drawing below demonstrates only the possibility of an off-path extremum; it is not Silicon data.

![Conceptual reciprocal grid showing an invented off-path conduction minimum.](/DFT-Research-Workflow/media/practical-guides/band-structure/compare-band-path-and-full-zone-extrema/band-path-full-zone-extrema.svg)

## Reconstruct the actual-output comparison

```bash
python3 examples/practical-guides/silicon_qe_full_zone.py
```

The companion does not launch QE. Execution verifies reconstruction of two declared real-output samples: it checks the path-output hash and frozen real-output ledger, k-point and band counts, derived extrema, and SVG. This is not a continuous rerun from a fresh public scratch directory.

## Decide what remains untested

Before assigning a fundamental gap, refine a compatible full-zone search and test cutoffs, parent sampling, number of bands, occupations, structural and magnetic state, SOC treatment, and extremum-search resolution. A high-symmetry path cannot prove full-zone metallicity, gap directness, or the absence of an off-path pocket. This example does not establish a converged gap, carrier valley, quasiparticle or optical gap, experimental agreement, or Silicon material conclusion.

## Official sources

- [Bloch, periodic-potential wave functions](https://doi.org/10.1007/BF01341914)
- [Kohn and Sham, self-consistent equations](https://doi.org/10.1103/PhysRev.140.A1133)
- [Setyawan and Curtarolo, standardized band paths](https://doi.org/10.1016/j.commatsci.2010.05.010)
- [COD 9013102 Silicon structure](https://www.crystallography.net/cod/9013102.html)

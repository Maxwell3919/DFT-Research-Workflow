---
topic_slug: fermi-surface-and-full-brillouin-zone-analysis
guide_slug: compare-full-zone-isovalue-and-band-path
title: Compare a Full-Zone Isovalue with a Band-Path Crossing
kind: implementation
tools:
  - python
  - quantum-espresso
status: reviewed
summary: Reconstruct a real Quantum ESPRESSO aluminium mesh and band path, then keep sampled crossings separate from a converged Fermi-surface claim.
tested_versions:
  - Python 3.12
  - Quantum ESPRESSO 7.5
execution_script: examples/practical-guides/al_qe_full_zone.py
source_ids:
  - wannier90-fermi-parameters
  - wannier90-copper-tutorial
  - qe-fermi-postprocessing
  - qe-pw-75
media_ids:
  - al-qe-full-zone
  - fermi-surface-isovalue-fixture
review: docs/reviews/2026-08-04-fermi-surface-and-full-brillouin-zone-analysis.md
reviewed_at: "2026-08-05"
---

This page now leads with a small, real aluminium calculation. The fcc primitive-cell input is intentionally explicit rather than a Materials Project identity: one Al atom, `celldm(1) = 7.653` bohr, PBE ultrasoft pseudopotential, `30 Ry` wavefunction cutoff, `240 Ry` charge cutoff, Marzari–Vanderbilt smearing of `0.02 Ry`, and a declared `8 × 8 × 8` mesh. The calculation was run with Quantum ESPRESSO `pw.x` 7.5; the open pseudopotential is identified by filename and SHA-256 in `examples/practical-guides/data/al-qe/full-zone/al-full-zone.json`, while the restricted potential body is not redistributed here.

## Run a mesh and a path from the same state

The SCF run reports a Fermi energy of `7.8018 eV` and exits with `JOB DONE`. A subsequent `nscf` calculation uses the same density and disables symmetry reduction (`nosym = .true.`, `noinv = .true.`) so the stored ledger contains all `512` mesh points. A separate `bands` run samples `145` points on the explicit `Γ–X–W–K–Γ–L–U–W–L–K` path with sixteen intervals per segment. The compact derived files are `al-mesh.csv`, `al-path.csv`, `al-full-zone.json`, and `output-excerpt.txt` under `examples/practical-guides/data/al-qe/full-zone/`.

The reconstruction command is:

```text
python3 examples/practical-guides/al_qe_full_zone.py \
  --scf-output /path/to/scf.out \
  --mesh-output /path/to/nscf.out \
  --path-output /path/to/bands.out \
  --json examples/practical-guides/data/al-qe/full-zone/al-full-zone.json \
  --mesh-csv examples/practical-guides/data/al-qe/full-zone/al-mesh.csv \
  --path-csv examples/practical-guides/data/al-qe/full-zone/al-path.csv \
  --svg public/media/practical-guides/fermi-surface-and-full-brillouin-zone-analysis/compare-full-zone-isovalue-and-band-path/al-qe-full-zone.svg
```

The parser checks the expected `512` mesh rows, `145` path rows, four eigenvalues per row, the Fermi marker, and the source-output hashes before writing the JSON, CSV, and original SVG. The selected QE band 2 has `237` mesh values below `μ`, `275` at or above it, and `48` points within the declared `±0.25 eV` teaching window. Along the ordered path it crosses the same `μ` on three sampled intervals. These are observations from this run, not a pocket count or a converged isosurface.

## Keep the scalar field and isovalue together

An isovalue rendering needs the reciprocal mesh, eigenvalues, band/state identifier, and `μ` from the same calculation. [Wannier90 documents Fermi-surface output on a regular interpolated grid](https://wannier90.readthedocs.io/en/latest/user_guide/wannier90/parameters/), and its [copper tutorial](https://wannier90.readthedocs.io/en/latest/tutorials/tutorial_6/) demonstrates the distinction between interpolation and direct bands. [Quantum ESPRESSO's post-processing guide](https://quantum-espresso.org/Doc/pp_user_guide/node8.html) describes the software boundary between band/Fermi-surface post-processing and the underlying electronic state. The present Al plot uses direct `pw.x` eigenvalues, not a Wannier interpolation.

The former invented SVG remains in the media manifest as an auxiliary explanation of why a line can miss an equal-energy contour. It is not the Al result and is not the main evidence for this page.

## What this guide verifies

Execution verifies that Quantum ESPRESSO 7.5 completed the declared SCF, full-zone `nscf`, and band-path commands; that the expected point counts and Fermi marker are present; that the stored CSV/JSON rows are reconstructed from those outputs; and that the original SVG renders from the stored data. It does not establish mesh convergence, a converged Fermi-surface topology, carrier density, velocity, transport coefficient, interpolation validity, an electronic instability, agreement with experiment, or a material conclusion.

## Official sources

- [Quantum ESPRESSO PW input documentation](https://www.quantum-espresso.org/Doc/INPUT_PW.html)
- [Wannier90 Fermi-surface parameters](https://wannier90.readthedocs.io/en/latest/user_guide/wannier90/parameters/)
- [Wannier90 copper Fermi-surface tutorial](https://wannier90.readthedocs.io/en/latest/tutorials/tutorial_6/)
- [Quantum ESPRESSO band/Fermi-surface post-processing guide](https://quantum-espresso.org/Doc/pp_user_guide/node8.html)

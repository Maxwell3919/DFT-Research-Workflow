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
review: docs/reviews/2026-08-04-fermi-surface-and-full-brillouin-zone-analysis.md
reviewed_at: "2026-08-05"
---

## For a Fermi-surface claim, inspect a three-dimensional isosurface

Load the dense aluminium mesh into FermiSurfer, XCrySDen, PyProcar, or another suitable viewer, display the Brillouin-zone boundary, and rotate the surface to look for sheets, necks, and pockets. Compare that object with the labelled band path, then change mesh or interpolation settings to see whether features persist. Use [electronic-property tools](/DFT-Research-Workflow/operations/resource-landscape/#electronic-properties), [visual tools](/DFT-Research-Workflow/operations/resource-landscape/#visual-symmetry), and [specialist post-processing tools](/DFT-Research-Workflow/operations/resource-landscape/#specialist-tools).

**Inspect the stored mesh and path evidence:** this page contains a two-dimensional projection of unconnected near-Fermi samples and a separate band path. It contains no three-dimensional isosurface object, exporter output, sheet connectivity, or pocket topology.

Use this real aluminium example when a band-path crossing suggests metallicity or a Fermi-surface feature. It compares an explicit uniform full-zone eigenvalue sample with a separate path from the same accepted state. The stored point counts and crossings are execution evidence, not a converged isosurface or pocket count.

## Purpose

First inspect the committed mesh, path, and receipt without claiming a surface:

```bash
head -n 5 examples/practical-guides/data/al-qe/full-zone/al-mesh.csv
head -n 5 examples/practical-guides/data/al-qe/full-zone/al-path.csv
sed -n '1,120p' examples/practical-guides/data/al-qe/full-zone/al-full-zone.json
```

Judge whether the coordinates, band identity, Fermi marker, point counts, and hashes match the intended state. These tables support sampled crossings only. To make a Fermi-surface claim, export a version-matched regular-grid field to a documented viewer, inspect the three-dimensional object, and test mesh and interpolation sensitivity; until then, stop at the sampled-data description.

The recorded QE 7.5 sequence used the explicit fcc primitive-cell state and these program stages in a prepared work directory:

```bash
pw.x -in scf.in > scf.out
grep -F "convergence has been achieved" scf.out
grep -F "JOB DONE." scf.out
```

This creates the parent density. The two `grep` commands check the reported SCF solver condition and normal termination separately.

```bash
pw.x -in nscf.in > nscf.out
grep -F "JOB DONE." nscf.out
pw.x -in bands.in > bands.out
grep -F "JOB DONE." bands.out
```

The compatible `nscf` input samples the uniform full-zone state. In this case `nosym=.true.` and `noinv=.true.` retain all 512 points for the downstream ledger; that choice is case-specific, not a universal convergence rule. The separate `bands` input samples 145 points on `Gamma-X-W-K-Gamma-L-U-W-L-K`. Its crossings describe only those line segments.

The explicit teaching setup uses one Al atom, `celldm(1)=7.653` bohr, a PBE ultrasoft pseudopotential, 30 Ry wavefunction cutoff, 240 Ry charge cutoff, Marzari-Vanderbilt smearing of 0.02 Ry, and an 8 x 8 x 8 mesh. These are recorded case values, not transferable recommendations. The pseudopotential filename and SHA-256 are preserved in `examples/practical-guides/data/al-qe/full-zone/al-full-zone.json`; the potential body is not redistributed.

## Reconstruct only when source outputs are available

```bash
python3 examples/practical-guides/al_qe_full_zone.py \
  --scf-output /path/to/scf.out \
  --mesh-output /path/to/nscf.out \
  --path-output /path/to/bands.out \
  --json examples/practical-guides/data/al-qe/full-zone/al-full-zone.json \
  --mesh-csv examples/practical-guides/data/al-qe/full-zone/al-mesh.csv \
  --path-csv examples/practical-guides/data/al-qe/full-zone/al-path.csv \
  --svg public/media/practical-guides/fermi-surface-and-full-brillouin-zone-analysis/compare-full-zone-isovalue-and-band-path/al-qe-full-zone.svg
```

The `/path/to/...` arguments are placeholders for retained source outputs, so this is not the quick inspection command. When those outputs are available, the parser verifies their hashes, the Fermi marker, 512 mesh rows, 145 path rows, and four eigenvalues per row before writing the compact JSON, CSV, and plot. These checks establish dataset identity and shape; they do not establish mesh or isovalue convergence.

The SCF reports a Fermi energy of `7.8018 eV`. For selected QE band 2, this run has 237 mesh values below that chemical potential, 275 at or above it, and 48 within the declared +/-0.25 eV teaching window. The ordered path crosses the same value on three sampled intervals. These are observations from this run, not an isosurface, carrier count, or pocket topology.

## Keep the scalar field and isovalue together

An equal-energy rendering needs reciprocal coordinates, eigenvalues, band/state identity, and the isovalue from one compatible calculation. [Wannier90 documents Fermi-surface output on a regular interpolated grid](https://wannier90.readthedocs.io/en/latest/user_guide/wannier90/parameters/), and its [copper tutorial](https://wannier90.readthedocs.io/en/latest/tutorials/tutorial_6/) distinguishes interpolation from direct bands. The present result uses direct `pw.x` eigenvalues, not Wannier interpolation.

Refine the mesh and perturb the isovalue before naming a pocket, neck, touching, or topology. If interpolation is introduced, compare it with direct eigenvalues near every feature used in the claim. The displayed unconnected scatter preserves the sampled-data boundary; it does not substitute for an isosurface viewer.

## Decide what the example supports

Execution verifies that Quantum ESPRESSO 7.5 completed the recorded SCF, full-zone NSCF, and path commands, and that the compact artifacts reconstruct from their source hashes. This supports the declared sampled mesh/path comparison. It does not establish full-zone convergence, a Fermi-surface topology, carrier density, velocity, transport coefficient, interpolation validity, instability, experiment, or an aluminium material conclusion. A high-symmetry path cannot prove full-zone metallicity or the absence of off-path features.

## Official sources

- [Quantum ESPRESSO PW input documentation](https://www.quantum-espresso.org/Doc/INPUT_PW.html)
- [Wannier90 Fermi-surface parameters](https://wannier90.readthedocs.io/en/latest/user_guide/wannier90/parameters/)
- [Wannier90 copper Fermi-surface tutorial](https://wannier90.readthedocs.io/en/latest/tutorials/tutorial_6/)
- [Quantum ESPRESSO band/Fermi-surface post-processing guide](https://quantum-espresso.org/Doc/pp_user_guide/node8.html)

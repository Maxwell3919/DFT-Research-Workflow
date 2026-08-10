---
topic_slug: density-of-states-and-projected-density-of-states
guide_slug: check-dos-normalization-and-projection-closure
title: Reconstruct a Stored Total DOS and Define Closure Tests
kind: implementation
tools:
  - python
  - quantum-espresso
status: reviewed
summary: Reconstruct a bounded Silicon total-DOS plot from stored Quantum ESPRESSO 7.5 SCF, uniform-NSCF, and dos.x output, then define the electron-count and projected-weight closure tests that remain unperformed.
tested_versions:
  - Python 3.12
execution_script: examples/practical-guides/dos_projection_closure.py
source_ids:
  - qe-dos-docs
  - qe-projwfc-docs
  - vasp-doscar
  - vasp-lorbit
  - cod-9013102
media_ids: []
review: docs/reviews/2026-08-04-density-of-states-and-projected-density-of-states.md
reviewed_at: "2026-08-04"
---

## Read the real DOS as a quantitative spectrum

Open the stored silicon total-DOS data in a plotting program and show the energy reference, ordinate scale, broadening, and sampling used. Inspect the occupied and unoccupied spectrum, integrate where the method permits, and compare total and projected weights only after verifying compatible projections. Repeat the visual comparison for denser meshes or different broadening before accepting fine features. Use [electronic-property tools](/DFT-Research-Workflow/operations/resource-landscape/#electronic-properties) and [specialist projection tools](/DFT-Research-Workflow/operations/resource-landscape/#specialist-tools).

**Inspect the committed total-DOS output:** the companion script redraws stored Quantum ESPRESSO 7.5 SCF, uniform-NSCF, and `dos.x` evidence. The presence of an integrated-DOS column is not an electron-count PASS, and this example contains no projected-DOS output.

This bounded real-execution example reconstructs a total DOS for the two-site primitive Silicon cell derived from CC0 COD entry 9013102. Quantum ESPRESSO 7.5 completed SCF, a 12 x 12 x 12 uniform NSCF calculation, and `dos.x`; the stored `si.dos.dat` contains 481 energy rows. The example does not contain projected-DOS output and does not claim an electron-count or projection-closure PASS.

## Purpose

The recorded calculation used this program sequence in a prepared QE work directory. Do not paste these filenames at the repository root. The inputs must share the accepted structure, pseudopotential, basis, charge, spin/SOC treatment, `prefix`, and accessible `outdir`; the NSCF step must be a compatible uniform-zone calculation, not a band path.

```bash
pw.x -in scf.in > scf.out
grep -F "convergence has been achieved" scf.out
grep -F "JOB DONE." scf.out
```

This creates the parent density. The first check asks whether QE reported SCF convergence; the second checks termination only.

```bash
pw.x -in dos-nscf.in > dos-nscf.out
grep -F "JOB DONE." dos-nscf.out
dos.x -in dos.x.in > dosx.out
grep -F "JOB DONE." dosx.out
```

The NSCF command produces the uniform-zone eigenvalue parent. `dos.x` integrates that state and writes `si.dos.dat` through its `fildos` setting. These checks show program completion, not cutoff, mesh, broadening, energy-grid, band-count, or total-DOS convergence. Return to the repository root for the stored-output check:

```bash
head -n 5 examples/practical-guides/data/silicon-qe/si.dos.dat
wc -l examples/practical-guides/data/silicon-qe/si.dos.dat
```

`head` exposes the header and first energy rows for a format/reference check. `wc -l` checks file shape only; neither validates normalization or electron count.

The committed output begins:

```text
#  E (eV)   dos(E)     Int dos(E) EFermi =    6.655 eV
 -12.000  0.0000E+00  0.0000E+00
 -11.950  0.0000E+00  0.0000E+00
 -11.900  0.0000E+00  0.0000E+00
```

This is a literal format excerpt from the stored file. `Int dos(E)` merely names the cumulative column written by `dos.x`; this guide has not compared its occupied-window value with an expected electron count.

## Reconstruct the committed output

```bash
python3 examples/practical-guides/dos_projection_closure.py \
  --svg public/media/practical-guides/density-of-states-and-projected-density-of-states/check-dos-normalization-and-projection-closure/silicon-qe-dos.svg
```

The companion does not rerun QE. After it finishes, open the redrawn DOS and compare its Fermi marker and curve with the stored `si.dos.dat`; confirm that the report reads 481 rows. This checks that the retained output was read consistently. It does not validate electron count, projection closure, or DOS convergence.

## Treat normalization and projection closure as tests to perform

For a new total-DOS result, integrate the curve under the declared per-cell/per-spin normalization and compare it with the expected occupation over a sufficiently complete energy window. Record the numerical rule and residual. This public script does not perform or pass that electron-count validation.

If projected weights are needed, run a separate compatible calculation:

```bash
projwfc.x -in projwfc.in > projwfc.out
grep -F "JOB DONE." projwfc.out
```

That command produces QE projector-resolved files; it was not part of the stored Silicon route. Compare their sum with the total DOS on the same grid and report missing interstitial or unrepresented weight. Exact closure is not guaranteed for an incomplete or nonorthogonal projector set, and forcing closure by renormalization can conceal the diagnostic. [Quantum ESPRESSO `projwfc.x`](https://www.quantum-espresso.org/Doc/INPUT_PROJWFC.html) documents this separate route; [VASP `LORBIT`](https://vasp.at/wiki/LORBIT) defines a different decomposition.

## Decide what the example supports

The stored SCF reports convergence in ten iterations; the NSCF and `dos.x` stages report `JOB DONE.`. The reconstruction checks the committed total-DOS file and plot. It does not validate electron count, projected-weight closure, a projector definition, observable convergence, orbital occupation, bonding, charge transfer, magnetism, experiment, or any Silicon material conclusion. [Quantum ESPRESSO `dos.x`](https://www.quantum-espresso.org/Doc/INPUT_DOS.html) describes the output route; [VASP `DOSCAR`](https://vasp.at/wiki/DOSCAR) is not used here.

## Official sources

- [Quantum ESPRESSO `dos.x` documentation](https://www.quantum-espresso.org/Doc/INPUT_DOS.html)
- [Quantum ESPRESSO `projwfc.x` documentation](https://www.quantum-espresso.org/Doc/INPUT_PROJWFC.html)
- [VASP `DOSCAR` documentation](https://vasp.at/wiki/DOSCAR)
- [VASP `LORBIT` documentation](https://vasp.at/wiki/LORBIT)
- [COD entry 9013102](https://www.crystallography.net/cod/9013102.html)

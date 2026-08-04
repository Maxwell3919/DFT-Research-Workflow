---
topic_slug: density-of-states-and-projected-density-of-states
guide_slug: check-dos-normalization-and-projection-closure
title: Check a DOS Integral and Projected-Weight Closure
kind: implementation
tools:
  - python
  - quantum-espresso
status: reviewed
summary: Reconstruct a bounded Silicon total-DOS plot from actual Quantum ESPRESSO 7.5 SCF, NSCF, and dos.x output.
tested_versions:
  - Python 3.12
execution_script: examples/practical-guides/dos_projection_closure.py
source_ids:
  - qe-dos-docs
  - qe-projwfc-docs
  - vasp-doscar
  - vasp-lorbit
  - cod-9013102
media_ids:
  - silicon-qe-dos
review: docs/reviews/2026-08-04-density-of-states-and-projected-density-of-states.md
reviewed_at: "2026-08-04"
---

This is a bounded real-execution example. A CC0 Silicon CIF from COD entry 9013102 supplied the two-site primitive cell. Quantum ESPRESSO 7.5 completed SCF, a 12×12×12 NSCF calculation, and `dos.x`; the committed 481-row total-DOS output is used unchanged to regenerate the original SVG below.

## Keep total DOS distinct from a projected decomposition

This page plots only the total `dos.x` output. It deliberately does not attach orbital or site labels. A real projected DOS can omit interstitial density or use non-complete local projectors; [Quantum ESPRESSO `projwfc.x`](https://www.quantum-espresso.org/Doc/INPUT_PROJWFC.html) documents a separate projection route, while [VASP `LORBIT`](https://vasp.at/wiki/LORBIT) describes a different qualitative local decomposition. Neither makes an atom-orbital label basis independent.

## Reconstruct the committed output

```text
python3 examples/practical-guides/dos_projection_closure.py \
  --svg public/media/practical-guides/density-of-states-and-projected-density-of-states/check-dos-normalization-and-projection-closure/silicon-qe-dos.svg
```

The companion checks the SHA-256 of `si.dos.dat`, reads its Fermi reference and 481 energy rows, and regenerates the SVG. The committed `dos-nscf.in`, `dos.x.in`, compact outputs, and pseudopotential identity preserve the run lineage. [Quantum ESPRESSO `dos.x`](https://www.quantum-espresso.org/Doc/INPUT_DOS.html) documents the output route; [VASP `DOSCAR`](https://vasp.at/wiki/DOSCAR) is a different file format and is not used here.

## What this guide verifies

Execution verifies the stored-output hash, parsing, Fermi reference, and SVG reconstruction. The SCF output reports convergence in ten iterations and both the NSCF and `dos.x` outputs report `JOB DONE.`. This teaching setup does not test cutoff or k-mesh convergence, validate an electron count or projector, establish an orbital occupation, or support bonding, charge-transfer, magnetism, experimental, or other Silicon material conclusions.

## Official sources

- [Quantum ESPRESSO `dos.x` documentation](https://www.quantum-espresso.org/Doc/INPUT_DOS.html)
- [Quantum ESPRESSO `projwfc.x` documentation](https://www.quantum-espresso.org/Doc/INPUT_PROJWFC.html)
- [VASP `DOSCAR` documentation](https://vasp.at/wiki/DOSCAR)
- [VASP `LORBIT` documentation](https://vasp.at/wiki/LORBIT)
- [COD entry 9013102](https://www.crystallography.net/cod/9013102.html)

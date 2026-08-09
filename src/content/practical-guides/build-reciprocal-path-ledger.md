---
topic_slug: band-structure
guide_slug: build-reciprocal-path-ledger
title: Build a Reciprocal-Path Ledger Before Plotting Bands
kind: implementation
tools:
  - python
  - quantum-espresso
  - seekpath
status: reviewed
summary: Reconstruct a Silicon reciprocal-path ledger and band plot from a COD structure, SeeK-path standardization, and actual Quantum ESPRESSO 7.5 output.
tested_versions:
  - Python 3.12
  - SeeK-path 2.2.1
  - spglib 2.7.0
  - Quantum ESPRESSO 7.5
execution_script: examples/practical-guides/silicon_qe_bands.py
source_ids:
  - seekpath-paper
  - seekpath-docs
  - qe-bands-docs
  - cod-9013102
media_ids:
  - silicon-qe-bands
review: docs/reviews/2026-08-04-band-structure.md
reviewed_at: "2026-08-04"
---

This bounded real-execution example starts from the two-site primitive cell derived from CC0 COD entry 9013102. SeeK-path 2.2.1 supplies the ordered `cF` line path, Quantum ESPRESSO 7.5 runs the SCF and compatible path calculation, and `bands.x` writes the stored 141-k-point, eight-band dataset. Use it when you need to see exactly which structure, path coordinates, commands, output, and checks sit behind a band plot.

## Purpose

The recorded run used the following program sequence in a prepared QE work directory. The identified pseudopotential must be present at the input's `pseudo_dir`, and the SCF and path steps must share the declared `prefix` and accessible `outdir`.

```bash
pw.x -in scf.in > scf.out
grep -F "convergence has been achieved" scf.out
grep -F "JOB DONE." scf.out
```

`pw.x` creates the parent charge density. The first `grep` checks the electronic solver condition reported by this SCF run; the second checks termination only.

```bash
pw.x -in bands.in > bands.out
grep -F "JOB DONE." bands.out
bands.x -in bands.x.in > bandsx.out
grep -F "JOB DONE." bandsx.out
```

The first command diagonalizes the accepted state at the ordered points under `K_POINTS crystal_b`. `bands.x` then writes the file named by `filband`. These markers do not show that the 40 Ry cutoff, 8 x 8 x 8 parent mesh, path density, band count, structure, or target observable is converged.

The committed ledger in `examples/practical-guides/data/silicon-qe/seekpath.json` binds the conventional CIF hash, `symprec=1e-5`, primitive and reciprocal bases, labels, and segments `Gamma-X`, `X-U`, `K-Gamma`, `Gamma-L`, `L-W`, and `W-X`. The QE path uses those same labelled fractional coordinates; the labels are not inferred later from the plotted image.

## Reconstruct and inspect the public evidence

```bash
python3 examples/practical-guides/silicon_qe_bands.py
```

This command does not rerun QE. Execution verifies the stored-output hash, parses all 141 k points and eight eigenvalues, writes the CSV, and regenerates the SVG. That checks artifact identity, parsing, cumulative path coordinate, and rendering against the committed output.

<img src="/DFT-Research-Workflow/media/practical-guides/band-structure/build-reciprocal-path-ledger/silicon-qe-bands.svg" alt="Eight blue Silicon band branches across a cumulative high-symmetry path coordinate, with a dashed zero-energy reference line." />

Inspect the path coordinate order, special-point labels, number of k points and bands, units, energy reference, warnings, and raw versus reordered eigenvalues before interpreting a crossing or extremum. Preserve the input and output hashes, CIF identity, pseudopotential filename and SHA-256, QE version, and ledger with the figure. The pseudopotential body is not redistributed.

## Decide what the example supports

The stored SCF reports electronic convergence in nine iterations and `JOB DONE.`; the path and `bands.x` stages also completed. This establishes the recorded software route and reconstruction checks. No cutoff series, k-mesh series, structural relaxation, spin-orbit test, full-zone extremum convergence, quasiparticle correction, or experimental validation is part of this example. The figure therefore supports a traceable path dataset, not a converged Silicon band gap, full-zone metallicity claim, or material conclusion.

## Official sources

- [Hinuma and co-workers, SeeK-path](https://doi.org/10.1016/j.commatsci.2016.01.017)
- [SeeK-path documentation](https://seekpath.readthedocs.io/en/latest/)
- [Quantum ESPRESSO `bands.x` documentation](https://www.quantum-espresso.org/Doc/INPUT_BANDS.html)
- [COD entry 9013102](https://www.crystallography.net/cod/9013102.html)

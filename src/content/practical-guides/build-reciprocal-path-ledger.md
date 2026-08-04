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

This is a bounded real-execution example. A CC0 Silicon CIF from COD entry 9013102 is standardized with spglib and sent to SeeK-path 2.2.1; the resulting `cF` path is used unchanged in the committed Quantum ESPRESSO 7.5 `bands` input. QE `pw.x` completed an SCF and band-path run, and `bands.x` produced the committed 141-k-point, eight-band text output. The original SVG below is regenerated from that output, not from invented eigenvalues.

<img src="/DFT-Research-Workflow/media/practical-guides/band-structure/build-reciprocal-path-ledger/silicon-qe-bands.svg" alt="Eight blue Silicon band branches across a cumulative high-symmetry path coordinate, with a dashed zero-energy reference line." />

The figure is a teaching artifact: it establishes a traceable software/data lineage, not a converged band gap, an experimental comparison, or a Silicon material conclusion.

## Keep coordinates separate from labels and cells

COD 9013102 supplies a conventional eight-site diamond-Si cell at 298.15 K. `spglib.standardize_cell(..., to_primitive=True)` creates the two-site primitive cell used by both SeeK-path and QE. The ledger in `examples/practical-guides/data/silicon-qe/seekpath.json` records the conventional input hash, `symprec=1e-5`, primitive and reciprocal bases, labels, and segments: `Γ–X`, `X–U`, `K–Γ`, `Γ–L`, `L–W`, `W–X`. The QE input uses the same labeled fractional coordinates under `K_POINTS crystal_b`.

## Reconstruct the committed output

```text
python3 examples/practical-guides/silicon_qe_bands.py
```

The companion checks the SHA-256 of the stored `bands.x` output, parses all 141 k points and eight eigenvalues, writes a CSV, and regenerates the SVG. The selectable QE inputs, output excerpts, pseudopotential identity, input/output audits, and source structure remain alongside it. The SSSP PBE Precision pseudopotential is identified by file name and SHA-256; its body is not redistributed.

## What this guide verifies

Execution verifies the stored-output hash, parsing, cumulative plot coordinate, and SVG reconstruction. The SCF run passed the input and execution-completion gates; the output reports electronic convergence in nine iterations and `JOB DONE.`. A teaching-only 40 Ry / 8×8×8 setup was used. No cutoff series, k-mesh series, structural relaxation, spin-orbit test, quasiparticle correction, or experimental validation is claimed, so numerical convergence and scientific validity remain unassessed.

## Official sources

- [Hinuma and co-workers, SeeK-path](https://doi.org/10.1016/j.commatsci.2016.01.017)
- [SeeK-path documentation](https://seekpath.readthedocs.io/en/latest/)
- [Quantum ESPRESSO `bands.x` documentation](https://www.quantum-espresso.org/Doc/INPUT_BANDS.html)
- [COD entry 9013102](https://www.crystallography.net/cod/9013102.html)

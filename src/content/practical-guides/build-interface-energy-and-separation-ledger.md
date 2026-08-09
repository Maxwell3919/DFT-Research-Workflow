---
topic_slug: interface-and-heterostructure-energetics
guide_slug: build-interface-energy-and-separation-ledger
title: Build an Interface-Energy and Separation Ledger
kind: implementation
tools:
  - python
status: reviewed
summary: Reconstruct published Al/TiN contact and separation quantities while keeping their per-cell definitions distinct from an area-normalized interface ledger.
tested_versions:
  - Python 3.12
execution_script: examples/practical-guides/interface_ledger_al_tin.py
source_ids:
  - feldbauer-al-tin
  - feldbauer-al-tin-arxiv
media_ids:
  - al-tin-interface-ledger
review: docs/reviews/2026-08-04-interface-and-heterostructure-energetics.md
reviewed_at: "2026-08-04"
---

Reconstruct the published seven-row ledger:

```bash
python3 examples/practical-guides/interface_ledger_al_tin.py \
  --svg public/media/practical-guides/interface-and-heterostructure-energetics/build-interface-energy-and-separation-ledger/al-tin-interface-ledger.svg
```

The command checks the source DOI and preprint identity, snapshot hash, Table 2 identity, units, seven selected rows, and deterministic SVG rendering. Its printed JSON is an audit of declared public data. It does not execute DFT or reconstruct missing structural objects.

![Published Al/TiN interface ledger comparing adhesion or interaction magnitude with Al-layer removal energy.](/DFT-Research-Workflow/media/practical-guides/interface-and-heterostructure-energetics/build-interface-energy-and-separation-ledger/al-tin-interface-ledger.svg)

## Read each source quantity literally

The [published article](https://doi.org/10.1103/PhysRevB.91.165413) and [open preprint](https://arxiv.org/abs/1504.06192) report negative adhesion or interaction energy and Al-layer removal energy in eV per interface cell. The ledger keeps those quantities, their signs, row labels, and reported transfer labels separate.

They are not an area-normalized interface excess or work of separation. The snapshot does not provide authority to infer a missing area, reservoir, cleavage surface, strain state, or relaxed-fragment energy and then convert the values.

For a new calculation, create the ledger before deriving a scalar. Record parent structures, orientations, terminations, registry, imposed strain, area, interface count, atom counts, reservoirs or separated-fragment files, relaxation policy, total energies, units, signs, and hashes. Use

$$
\gamma_{\mathrm{int}}
=\frac{E_{\mathrm{cell}}-\sum_iN_i\mu_i}{n_{\mathrm{int}}A}
$$

only for the declared reservoir cycle, and

$$
W_{\mathrm{sep}}
=\frac{E_A^{\mathrm{sep}}+E_B^{\mathrm{sep}}-E_{AB}}{A}
$$

only after defining the separated fragments and their constraints. Do not compare either quantity directly with the source's per-cell columns unless the conversion and reference equivalence are demonstrated.

## What this guide verifies

A successful command verifies frozen source identity, selected values, units, sign conventions, and rendering. It does not establish interface geometry, area normalization, strain convergence, DFT completion, interface stability, fracture energy, separation kinetics, or a material conclusion.

## Official sources

- [Feldbauer and co-workers, Al/TiN contacts](https://doi.org/10.1103/PhysRevB.91.165413)
- [Open preprint of the Al/TiN study](https://arxiv.org/abs/1504.06192)

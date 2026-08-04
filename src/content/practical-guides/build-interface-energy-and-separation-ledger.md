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

An interface result is easy to mislabel when the fragments and reservoirs are hidden. This worked reconstruction uses the seven published Al/TiN Table 2 rows as a traceable public-data ledger. It keeps the paper's negative adhesion or interaction energy and Al-layer removal energy distinct; it does not invent a common denominator or convert either quantity into a work of separation.

![Published Al/TiN interface ledger comparing adhesion or interaction magnitude with Al-layer removal energy.](/DFT-Research-Workflow/media/practical-guides/interface-and-heterostructure-energetics/build-interface-energy-and-separation-ledger/al-tin-interface-ledger.svg)

## Keep the denominators and reference states visible

The public rows are reported in eV per interface cell. Their adhesion or interaction values and layer-removal values are not interchangeable with an area-normalized interface excess, constrained binding energy, or fracture work. The source's geometry, definitions, and transfer labels remain authoritative.

Those labels cannot be interchanged merely because all values are reported in an energy unit. The source's table definitions and interface matching choices remain part of the evidence; the reconstruction does not infer missing reservoirs, areas, or structural details.

## Reconstruct the published ledger

```text
python3 examples/practical-guides/interface_ledger_al_tin.py \
  --svg public/media/practical-guides/interface-and-heterostructure-energetics/build-interface-energy-and-separation-ledger/al-tin-interface-ledger.svg
```

The printed JSON records the source DOI/preprint, snapshot hash, table identity, units, and all seven selected rows. It is a public-data reconstruction; it does not rerun the source calculations.

## What this guide verifies

Execution checks source identity, table identity, selected values, units, and deterministic SVG rendering. It does not establish interface geometry, DFT execution, area normalization, convergence, a stable interface, a fracture energy, or a material conclusion.

## Official sources

- [Feldbauer and co-workers, Al/TiN contacts](https://doi.org/10.1103/PhysRevB.91.165413)
- [Open preprint of the Al/TiN study](https://arxiv.org/abs/1504.06192)

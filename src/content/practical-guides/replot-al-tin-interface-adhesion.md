---
topic_slug: interface-and-heterostructure-energetics
guide_slug: replot-al-tin-interface-adhesion
title: Replot Published Al/TiN Contact and Separation Data
kind: worked-example
tools:
  - python
status: reviewed
summary: Redraw seven published Al/TiN PBE table rows to distinguish negative per-cell adhesion or interaction energy from the stated layer-removal comparison.
tested_versions:
  - Python 3.12
execution_script: examples/practical-guides/al_tin_interface_adhesion.py
source_ids:
  - feldbauer-al-tin
  - feldbauer-al-tin-arxiv
media_ids:
  - al-tin-interface-adhesion
review: docs/reviews/2026-08-04-interface-and-heterostructure-energetics.md
reviewed_at: "2026-08-04"
---

## Return each plotted point to its interface definition

Read the attributed table and Methods section, identify termination, registry, layer count, cell area, separation, and sign convention for every Al/TiN row, and inspect an atomistic structure when the source provides one. Plot the values only after distinguishing per-cell adhesion or interaction energy from area-normalized interface quantities and from the stated layer-removal comparison. See [visual tools](/DFT-Research-Workflow/operations/resource-landscape/#visual-symmetry), [specialist interface tools](/DFT-Research-Workflow/operations/resource-landscape/#specialist-tools), and [literature sources](/DFT-Research-Workflow/operations/resource-landscape/#literature-learning).

**Reproduce this site's figure:** the companion script redraws seven frozen published rows. The scatter plot is a public-data view, not an interface geometry, relaxation, or independent reproduction of the calculations.

Rebuild the traceable redraw:

```bash
python3 examples/practical-guides/al_tin_interface_adhesion.py \
  --input examples/practical-guides/data/al-tin-interface-adhesion-2015.json \
  --svg public/media/practical-guides/interface-and-heterostructure-energetics/replot-al-tin-interface-adhesion/al-tin-interface-adhesion.svg
```

The command checks the snapshot schema, exact selected Table 2 values, published sign convention, reported transfer labels, and deterministic rendering. It does not rerun the source calculations or copy the source figure.

## Inspect the axes and references

The horizontal coordinate is the magnitude of the paper's negative adhesion or interaction energy in eV per interface cell. The vertical coordinate is its Al-layer removal energy, also in eV per interface cell. Colour records the authors' reported number of transferred Al layers after their simulated separation.

The [published article](https://doi.org/10.1103/PhysRevB.91.165413) and [open preprint](https://arxiv.org/abs/1504.06192) remain authoritative for geometry, orientation, termination, registry, calculation method, table definitions, and interpretation. The JSON preserves the selected row labels, units, values, access date, and no-rerun boundary.

Do not reinterpret either axis as an area-normalized work of separation, interface excess, fracture energy, or universal threshold. Such a conversion would require the exact interface area and a compatible definition of reservoirs or separated fragments. The reported transfer label is an outcome of the source's contact-separation construction, not a kinetic barrier or general classifier.

## Claim boundary

A successful command establishes transcription and rendering for seven bounded public rows. It does not establish PBE accuracy, interface convergence, cleavage kinetics, fracture toughness, an experimental contact morphology, a universal material-transfer threshold, or a prediction for another orientation, termination, registry, temperature, or material.

## Sources

- [Feldbauer and co-workers, Al/TiN contacts](https://doi.org/10.1103/PhysRevB.91.165413)
- [Open preprint of the Al/TiN study](https://arxiv.org/abs/1504.06192)

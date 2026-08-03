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

Feldbauer and co-workers reported DFT contact-separation simulations for atomically flat Al/TiN interfaces. This guide freezes the seven PBE rows of their Table 2 and creates an original scatter plot; it does not rerun their calculations or copy their figure.

## Read the paper's quantities literally

The horizontal coordinate is the magnitude of the paper's negative adhesion or interaction energy, in eV per interface cell. The vertical coordinate is its Al-layer removal energy, also in eV per interface cell. The colour records the authors' reported number of transferred Al layers after their simulated separation. These are not area-normalized works of separation, fracture energies, or universal thresholds.

The [published article](https://doi.org/10.1103/PhysRevB.91.165413) and its [open preprint](https://arxiv.org/abs/1504.06192) are the authoritative source for the geometry, method, table definitions, and the authors' interpretation. The plot only checks that the committed table snapshot is transcribed and rendered deterministically.

## Run the reproducible redraw

```text
python3 examples/practical-guides/al_tin_interface_adhesion.py \
  --input examples/practical-guides/data/al-tin-interface-adhesion-2015.json \
  --svg public/media/practical-guides/interface-and-heterostructure-energetics/replot-al-tin-interface-adhesion/al-tin-interface-adhesion.svg
```

The JSON snapshot preserves source identity, access date, table units, row labels, values, and the no-rerun boundary. It should not be extended with values inferred from a plot or used as a generic material-transfer classifier.

## What execution means

Execution verifies snapshot schema, exact selected table values, the published sign convention, reported transfer labels, and deterministic rendering. It does not establish the accuracy of PBE, interface convergence, a cleavage barrier, transfer kinetics, an experimental contact morphology, or a prediction for a new Al/TiN interface.

## What this example does not establish

The seven published rows do not establish a universal material-transfer threshold, a fracture energy, a kinetic mechanism, or a result for a different orientation, termination, registry, temperature, or material. The plot is a traceable redraw, not a replacement for the article's structural and methodological evidence.

## Sources

- [Feldbauer and co-workers, Al/TiN contacts](https://doi.org/10.1103/PhysRevB.91.165413)
- [Open preprint of the Al/TiN study](https://arxiv.org/abs/1504.06192)

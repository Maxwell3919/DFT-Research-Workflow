---
topic_slug: adsorption-energies
guide_slug: compare-adsorption-sites-and-coverage
title: Compare Adsorption Sites, Coverage, and Periodic Cells
kind: implementation
tools:
  - python
status: reviewed
summary: Group only matched adsorption states, relabel migrated structures, and separate physical coverage changes from periodic-cell sensitivity.
tested_versions:
  - Python 3.12
execution_script: examples/practical-guides/adsorption_state_grid.py
source_ids:
  - neugebauer-scheffler-adlayers
  - ase-surface
  - pymatgen-adsorption-api
  - cmr-adsorption-paper
media_ids:
  - adsorption-state-grid
review: docs/reviews/2026-08-04-adsorption-energies.md
reviewed_at: "2026-08-04"
---

Site searches and coverage studies fail when unlike states share one table. This guide uses a synthetic grid to demonstrate the grouping logic needed before any energy ranking is scientifically meaningful.

## Generate starts without promoting them to results

The [ASE surface builder](https://docs.ase-lib.org/ase/build/surface.html) can place adsorbates at named sites, and the [pymatgen adsorption API](https://pymatgen.org/pymatgen.core.html#pymatgen.core.adsorption.AdsorbateSiteFinder) can enumerate surface-site candidates. These tools create structures. They do not establish the lowest-energy final site, the correct coverage, or a converged slab.

For a molecular adsorbate, vary the anchoring atom, orientation, conformer, dissociation state, and initial height when those choices can lead to distinct basins. Deduplicate after relaxation and preserve the mapping from each start to its final geometry.

## Relabel the final state

One synthetic row begins at a top site and relaxes to a bridge site. The script reports the transition explicitly instead of retaining the starting label. A production workflow should determine final site identity from saved geometry and a declared geometric analysis, with manual inspection when reconstruction makes simple labels ambiguous.

Ranking several starting labels that all collapse into one final structure counts the same minimum repeatedly. Conversely, discarding a higher-energy final state erases evidence about metastability and candidate completeness.

## Separate coverage from cell sensitivity

The plotted curves compare top, bridge, and hollow starts only within the same invented cell family and coverage definition. A second bridge entry uses a different commensurate cell at the same declared coverage, producing a `0.04 eV` fixture difference. That is a finite-cell diagnostic, not a universal acceptance threshold.

[Neugebauer and Scheffler](https://doi.org/10.1103/PhysRevB.46.16067) analyse adsorbate–substrate and adsorbate–adsorbate interactions in alkali adlayers. The [CMR benchmark paper](https://doi.org/10.1021/acs.jpcc.7b12258) likewise shows that high-coverage periodic states can differ from lower-coverage adsorption. A larger cell with one adsorbate simultaneously changes image separation and coverage; design matched comparisons to isolate the effect of interest.

## Run the synthetic analysis

```text
python3 examples/practical-guides/adsorption_state_grid.py \
  --svg public/media/practical-guides/adsorption-energies/compare-adsorption-sites-and-coverage/adsorption-state-grid.svg
```

The output retains all invented rows, reports minima only inside matched groups, identifies the changed final-site label, and measures the fixed-coverage cell difference. For real calculations, extend each row with structure and output hashes, surface identity, area, site-density definition, constraints, charge and spin, method identity, and convergence metadata.

## What this guide verifies

Execution verifies deterministic grouping, matched-state ranking, final-site relabelling, fixed-coverage cell comparison, and SVG rendering for invented values. Execution success is not a real adsorption-site search, coverage convergence, slab convergence, physical lateral interaction, or proof of a global minimum.

## Official sources

- [Neugebauer and Scheffler, adsorbate interactions on Al(111)](https://doi.org/10.1103/PhysRevB.46.16067)
- [ASE surface and adsorbate construction](https://docs.ase-lib.org/ase/build/surface.html)
- [pymatgen adsorption-site API](https://pymatgen.org/pymatgen.core.html#pymatgen.core.adsorption.AdsorbateSiteFinder)
- [Schmidt and Thygesen, coverage and method benchmark](https://doi.org/10.1021/acs.jpcc.7b12258)

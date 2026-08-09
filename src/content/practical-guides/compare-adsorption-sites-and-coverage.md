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

Run the bounded synthetic grouping fixture:

```bash
python3 examples/practical-guides/adsorption_state_grid.py \
  --svg public/media/practical-guides/adsorption-energies/compare-adsorption-sites-and-coverage/adsorption-state-grid.svg
```

The command retains every invented row, ranks states only inside matched groups, records a start-to-final site change, compares two cells at one declared coverage, and writes the SVG. It does not read DFT outputs or perform an adsorption search.

## Purpose

Generate starting structures with the [ASE surface builder](https://docs.ase-lib.org/ase/build/surface.html), the [pymatgen adsorption API](https://pymatgen.org/pymatgen.core.html#pymatgen.core.adsorption.AdsorbateSiteFinder), or another documented builder. For molecules, vary anchoring atom, orientation, conformer, dissociation state, and initial height when they can reach different basins. These tools create candidates; they do not identify the final minimum.

After relaxation, inspect the saved geometry and assign a final-state label. One fixture row starts at a top site and ends at a bridge site; keeping the starting label would corrupt the ranking. Deduplicate equivalent final structures but retain distinct metastable states and the path from each start.

For each real row, record structure and output hashes, surface identity, final site, cell transformation, one-face area, coverage definition, constraints, charge and spin, method identity, energy ledger, and convergence decision. Compare energies only when reaction, normalization, surface state, coverage, and numerical protocol match.

## Separate coverage from periodic-cell sensitivity

The fixture's top, bridge, and hollow curves share one invented cell family and coverage definition. A second bridge row changes the commensurate cell at the same declared coverage and produces a `0.04 eV` fixture difference. That value is a deterministic diagnostic, not a universal tolerance.

One adsorbate in a larger cell changes both coverage and image separation. To test finite-cell sensitivity at fixed coverage, preserve adsorbate density and ordering in commensurate cells. To test physical coverage dependence, vary the occupied-site pattern while keeping the surface and reaction ledger controlled. [Neugebauer and Scheffler](https://doi.org/10.1103/PhysRevB.46.16067) and the [CMR benchmark](https://doi.org/10.1021/acs.jpcc.7b12258) show why these are different comparisons.

Successful execution verifies invented grouping, relabelling, arithmetic, and rendering only. It does not establish a real site search, coverage convergence, slab convergence, lateral interaction, or global adsorption minimum.

## Official sources

- [Neugebauer and Scheffler, adsorbate interactions on Al(111)](https://doi.org/10.1103/PhysRevB.46.16067)
- [ASE surface and adsorbate construction](https://docs.ase-lib.org/ase/build/surface.html)
- [pymatgen adsorption-site API](https://pymatgen.org/pymatgen.core.html#pymatgen.core.adsorption.AdsorbateSiteFinder)
- [Schmidt and Thygesen, coverage and method benchmark](https://doi.org/10.1021/acs.jpcc.7b12258)

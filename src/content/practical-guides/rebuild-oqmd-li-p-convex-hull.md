---
topic_slug: compositional-phase-stability-and-convex-hulls
guide_slug: rebuild-oqmd-li-p-convex-hull
title: Rebuild a Li–P Convex Hull from an OQMD Snapshot
kind: worked-example
tools:
  - python
status: reviewed
summary: Rebuild a binary lower convex envelope from a frozen 46-row public OQMD Li–P DFT-data snapshot while preserving entry identity and attribution.
tested_versions:
  - Python 3.12
execution_script: examples/practical-guides/li_p_convex_hull.py
source_ids:
  - oqmd-api
  - oqmd-download-license
  - oqmd-paper
  - pymatgen-phase-diagram-api
media_ids:
  - oqmd-li-p-convex-hull
review: docs/reviews/2026-08-04-compositional-phase-stability-and-convex-hulls.md
reviewed_at: "2026-08-04"
---

Use this worked example to reconstruct a binary hull from a frozen public-data table. It reads 46 OQMD Li-P rows representing 19 compositions and writes a JSON report plus a locally generated SVG. It does not rerun the source DFT calculations.

From the repository root, run:

```bash
python3 examples/practical-guides/li_p_convex_hull.py \
  --svg public/media/practical-guides/compositional-phase-stability-and-convex-hulls/rebuild-oqmd-li-p-convex-hull/oqmd-li-p-convex-hull.svg
```

Inspect the JSON report for row count, hull vertices, decomposition endpoints and weights, and reconstructed-versus-stored stability differences. Inspect the SVG only after those machine-readable checks.

## Confirm the input receipt

The frozen snapshot records query URL, retrieval time, API version, source timestamp, field order, and reuse terms. Every row retains `entry_id`, `calculation_label`, formula, structure metadata, formation energy, and database stability. Do not replace these identifiers with plot labels.

The OQMD [REST API documentation](https://static.oqmd.org/static/docs/restful.html) defines the interface, its [download page](https://www.oqmd.org/download/) states current dataset licence terms, and the [OQMD paper](https://doi.org/10.1007/s11837-013-0755-4) describes the database. The committed snapshot, not the mutable live response, is the input to this fixture.

## Check composition and normalization

For each integer binary formula, the script computes

$$
x_{\mathrm P}
=
\frac{n_{\mathrm P}}{n_{\mathrm{Li}}+n_{\mathrm P}}.
$$

The source `delta_e` field is already in eV per atom. The script adds elemental Li and P endpoints at zero under that convention. For partial occupancy, disorder, vacancies, or more than two components, use full composition vectors rather than this restricted parser.

Multiple rows can share a composition. The script selects the lowest row at each exact $x_{\mathrm P}$ for hull construction, breaks exact ties by entry identity, and keeps every other polymorph visible. Selection for geometry is not deletion of evidence.

## Inspect the returned hull and decomposition

For this frozen phase set, the reconstructed vertices are Li, Li3P, LiP, Li3P7, Li3P11, LiP7, and P. Treat the list as output of this snapshot and algorithm, not as an exhaustive Li-P phase diagram.

OQMD entry 2053605, Li2P, decomposes between Li3P and LiP. The fixture reconstructs a distance of about $0.0192508\ \mathrm{eV/atom}$ with endpoint atomic fractions $2/3$ and $1/3$. Verify both the composition balance and interpolated energy; a scalar distance without products is incomplete.

The largest absolute difference between the reconstructed distance and the stored `stability` field is about $2.55\times10^{-9}\ \mathrm{eV/atom}$. This is rounding-level consistency between fields in the frozen response. It is not the precision or accuracy of the underlying calculations.

## Claim boundary

Accept the post-processing result only when the source receipt, normalization, endpoint set, polymorph policy, hull vertices, decomposition balance, and tolerance all match the report. Use the [pymatgen phase-diagram API](https://pymatgen.org/pymatgen.analysis.html#module-pymatgen.analysis.phase_diagram) as a production-oriented implementation reference.

This guide verifies frozen-data parsing, attribution, normalization, and binary convex geometry. It does not validate OQMD energies, prove candidate completeness or mutual convergence for a new claim, establish finite-temperature or pressure stability, or predict synthesis.

## Official sources

- [OQMD RESTful API documentation](https://static.oqmd.org/static/docs/restful.html)
- [OQMD download page and current dataset licence terms](https://www.oqmd.org/download/)
- [Kirklin and co-workers, the OQMD](https://doi.org/10.1007/s11837-013-0755-4)
- [pymatgen phase-diagram analysis API](https://pymatgen.org/pymatgen.analysis.html#module-pymatgen.analysis.phase_diagram)

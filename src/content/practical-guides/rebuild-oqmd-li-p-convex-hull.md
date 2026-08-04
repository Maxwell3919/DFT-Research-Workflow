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

This worked example reconstructs a binary lower convex envelope from a frozen response of the public OQMD REST API. The snapshot contains 46 Li–P calculation rows spanning 19 represented compositions. It is retained in the repository so the result does not drift when the live database changes.

## Read provenance before reading geometry

The snapshot records the exact query URL, retrieval time, API version, source timestamp, returned field order, and OQMD's CC BY 4.0 reuse terms. Each row retains `entry_id`, `calculation_label`, formula, structure metadata, formation energy, and the database stability value. The OQMD [REST API documentation](https://static.oqmd.org/static/docs/restful.html) defines the query interface; its [download page](https://www.oqmd.org/download/) states the current dataset licence terms, and the [original OQMD paper](https://doi.org/10.1007/s11837-013-0755-4) describes the database. The frozen snapshot retains its own access date because the live licence page may change.

The image is an original local rendering of those data, not a publisher figure or screenshot. Its attribution and evidence boundary appear in the figure itself as well as the media manifest.

## Convert formulas into one composition coordinate

For this binary snapshot the script parses each integer Li–P formula and computes

```text
x(P) = n(P) / [n(Li) + n(P)]
```

The returned `delta_e` field is already normalized in eV/atom. Elemental Li and P endpoints are then added at zero formation energy under that convention. A general workflow should use explicit composition objects rather than a restricted formula parser, especially for partial occupancies, disorder, vacancies, or more than two components.

## Select a representative without erasing polymorphs

The 46 rows include multiple structures or calculation labels at some compositions. The script groups them by exact `x(P)` and selects the lowest formation-energy row for hull construction, breaking exact ties deterministically by entry ID and calculation label. All rows remain visible in the plot and snapshot; selection for geometry is not deletion of higher polymorph evidence.

```python
from li_p_convex_hull import load_snapshot, analyze

snapshot, entries = load_snapshot()
result = analyze(entries)
print([point["name"] for point in result["hull"]])
```

The reconstructed vertices are Li, Li₃P, LiP, Li₃P₇, Li₃P₁₁, LiP₇, and P for this frozen candidate set. That list is a reproducible property of the snapshot and algorithm, not an assertion that no unrepresented Li–P phase exists.

## Recover a decomposition rather than only a distance

OQMD entry 2053605, Li₂P, lies between Li₃P and LiP in composition. Linear interpolation of that tie line gives a reconstructed distance of about `0.0192508 eV/atom`; the endpoint atomic fractions are `2/3` Li₃P and `1/3` LiP. The script asserts both endpoint identity and composition weights.

Across all returned rows, the largest absolute difference between the reconstructed distance and OQMD's stored `stability` field is about `2.55 × 10⁻9 eV/atom`. This is rounding-level agreement between fields in the frozen API response. It does not imply nanovolt-scale accuracy of the underlying calculations.

## Rebuild the artifact

From the repository root, run:

```text
python3 examples/practical-guides/li_p_convex_hull.py \
  --svg public/media/practical-guides/compositional-phase-stability-and-convex-hulls/rebuild-oqmd-li-p-convex-hull/oqmd-li-p-convex-hull.svg
```

The standard-library script emits a JSON report and rewrites the SVG from the committed snapshot. The project execution harness calls the same `run()` function and checks row count, hull vertices, decomposition endpoints, and agreement at the precision justified by the stored decimals. The [pymatgen phase-diagram API](https://pymatgen.org/pymatgen.analysis.html#module-pymatgen.analysis.phase_diagram) is linked as an official production-oriented implementation reference; this compact binary implementation remains deliberately inspectable.

## What this example does not establish

The example does not rerun or independently validate any OQMD DFT calculation. It does not prove that the 46 returned rows exhaust Li–P structures, that every record is mutually converged for a new scientific claim, that the static 0 K hull persists at finite temperature or pressure, or that a hull phase can be synthesized. It verifies a frozen-data parsing, normalization, attribution, and convex-geometry path.

## Official sources

- [OQMD RESTful API documentation](https://static.oqmd.org/static/docs/restful.html)
- [OQMD download page and current dataset licence terms](https://www.oqmd.org/download/)
- [Kirklin and co-workers, the OQMD](https://doi.org/10.1007/s11837-013-0755-4)
- [pymatgen phase-diagram analysis API](https://pymatgen.org/pymatgen.analysis.html#module-pymatgen.analysis.phase_diagram)

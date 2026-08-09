---
topic_slug: compositional-phase-stability-and-convex-hulls
guide_slug: stress-test-hull-phase-set
title: Stress-Test a Hull Against a Missing Competitor
kind: worked-example
tools:
  - python
status: reviewed
summary: Withhold one stable LiP database entry and measure how the same OQMD Li–P snapshot changes hull membership, decomposition geometry, and the resulting claim.
tested_versions:
  - Python 3.12
execution_script: examples/practical-guides/li_p_convex_hull.py
source_ids:
  - oqmd-api
  - oqmd-paper
  - materials-project-phase-diagrams
  - bartel-decomposition-reactions
media_ids:
  - oqmd-li-p-phase-set-sensitivity
review: docs/reviews/2026-08-04-compositional-phase-stability-and-convex-hulls.md
reviewed_at: "2026-08-04"
---

Use this example after rebuilding the full frozen Li-P hull. It removes one represented competitor without changing any energy, then shows which hull membership and decomposition claims change.

From the companion-script directory, run the comparison:

```bash
cd examples/practical-guides
python3 - <<'PY'
from li_p_convex_hull import load_snapshot, analyze

_, entries = load_snapshot()
complete = analyze(entries)
reduced = analyze(entries, excluded_entry_id=17007)
print([point["name"] for point in complete["hull"]])
print([point["name"] for point in reduced["hull"]])
PY
```

The two printed vertex lists are the first output to compare. Keep the exclusion ID with the reduced result.

## Follow the changed facet

With all 46 rows, OQMD entry 2053607, Li4P3, is $0.00452626\ \mathrm{eV/atom}$ above the LiP-Li3P7 tie line. Withholding OQMD entry 17007, the lowest LiP row, makes the same Li4P3 row a vertex of the reduced-set hull. Its composition and energy did not change; only the feasible competitor set changed.

Confirm that the complete and reduced reports use the same input energies, normalization, tolerance, and algorithm. Then identify every vertex, facet, decomposition product, and membership label that changes.

## Record absence rather than editing data

A phase can be excluded for a wrong component set, charge, thermodynamic state, method, correction scheme, or failed calculation status. A bounded database query or structure search can also leave a phase absent. Record the exact entry and reason, and write a new derived result. Do not delete the source row or silently substitute the reduced hull for the baseline.

Repeat this type of test by withholding each vertex in turn, adding plausible candidates, perturbing near-hull values within a documented uncertainty model, or changing a correction scheme coherently. These are claim-sensitivity tests, not permission to omit an inconvenient competitor.

## Claim boundary

The reduced result is not arithmetically wrong; it solves a different optimization problem. It cannot support an unqualified statement that Li4P3 is stable. The conclusion must identify the phase set and why entry 17007 is absent.

This fixture executes no DFT and supplies no uncertainty model for the stored energies. It does not show that LiP should be excluded, that Li4P3 is a physical ground state, or that the full frozen OQMD phase set is exhaustive.

## Official sources

- [OQMD RESTful API documentation](https://static.oqmd.org/static/docs/restful.html)
- [Kirklin and co-workers, the OQMD](https://doi.org/10.1007/s11837-013-0755-4)
- [Materials Project phase-diagram methodology](https://docs.materialsproject.org/methodology/materials-methodology/thermodynamic-stability/phase-diagrams-pds)
- [Bartel and co-workers, decomposition reactions and stability](https://doi.org/10.1038/s41524-018-0143-2)

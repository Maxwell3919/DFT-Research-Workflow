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

This worked example changes no energy. It removes one represented competitor—OQMD entry 17007, the lowest LiP row—from the frozen Li–P candidate set and rebuilds the lower envelope. The comparison isolates a central property of convex-hull evidence: stability is conditional on which phases were allowed to compete.

## Follow the affected facet

With all 46 rows present, OQMD entry 2053607, Li₄P₃, lies `0.00452626 eV/atom` above the LiP–Li₃P₇ tie line. When LiP entry 17007 is withheld, Li₄P₃ becomes a vertex of the reduced-set hull. The second panel highlights the same database row at the same energy; only the competing set has changed.

```python
from li_p_convex_hull import load_snapshot, analyze

_, entries = load_snapshot()
complete = analyze(entries)
reduced = analyze(entries, excluded_entry_id=17007)
print([point["name"] for point in complete["hull"]])
print([point["name"] for point in reduced["hull"]])
```

The reduced hull contains Li₄P₃ where the complete frozen set contains LiP. That does not make the reduced result numerically wrong: it answers a different optimization problem. It makes any unqualified claim such as “Li₄P₃ is stable” incomplete unless the candidate inventory accompanies it.

## Use exclusion tests as claim sensitivity, not data editing

A useful audit can rebuild a hull after removing each vertex in turn, adding plausible candidates, perturbing near-hull energies within documented uncertainty, or changing a correction scheme coherently. The output should identify which facets, decomposition products, and membership labels change. This is a sensitivity analysis; it is not permission to omit an inconvenient lower phase from the final scientific comparison.

The [Materials Project phase-diagram methodology](https://docs.materialsproject.org/methodology/materials-methodology/thermodynamic-stability/phase-diagrams-pds) explains the lower-hull and decomposition construction. Bartel and co-workers discuss why [decomposition reactions and their signs](https://doi.org/10.1038/s41524-018-0143-2) need explicit interpretation rather than a bare stability label.

## Preserve why a phase was absent

An exclusion may be scientifically justified when an entry has the wrong components, charge, thermodynamic state, method, correction scheme, or failed calculation status. It may also reflect a bounded search or database query. Record the exact entry, reason, and resulting hull rather than editing the source table or silently replacing the baseline.

The frozen rows came from the documented [OQMD REST API](https://static.oqmd.org/static/docs/restful.html), whose database construction is described in the [OQMD paper](https://doi.org/10.1007/s11837-013-0755-4). The local script tests only the geometry and declared exclusion; it does not judge the physical validity of entry 17007.

## What this example does not establish

The example does not show that LiP should be excluded, that Li₄P₃ is a real ground state, or that the complete frozen OQMD result is exhaustive. It executes no DFT and introduces no uncertainty model for the stored energies. It demonstrates exactly how one missing represented competitor changes a bounded static hull claim.

## Official sources

- [OQMD RESTful API documentation](https://static.oqmd.org/static/docs/restful.html)
- [Kirklin and co-workers, the OQMD](https://doi.org/10.1007/s11837-013-0755-4)
- [Materials Project phase-diagram methodology](https://docs.materialsproject.org/methodology/materials-methodology/thermodynamic-stability/phase-diagrams-pds)
- [Bartel and co-workers, decomposition reactions and stability](https://doi.org/10.1038/s41524-018-0143-2)

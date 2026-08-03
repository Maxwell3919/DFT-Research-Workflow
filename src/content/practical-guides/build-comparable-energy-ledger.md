---
topic_slug: relative-and-formation-energies
guide_slug: build-comparable-energy-ledger
title: Build a Comparable Energy Ledger
kind: implementation
tools:
  - python
status: reviewed
summary: Filter raw calculation records by composition, charge, evaluator, energy convention, completion, and state identity before constructing a normalized relative-energy table.
tested_versions:
  - Python 3.12
execution_script: examples/practical-guides/formation_energy_ledger.py
source_ids:
  - materials-project-phase-diagrams
  - materials-project-energy-corrections
  - hohenberg-kohn
  - kohn-sham
media_ids:
  - comparable-energy-ledger
review: docs/reviews/2026-08-03-relative-and-formation-energies.md
reviewed_at: "2026-08-03"
---

An energy table becomes scientifically useful only after every row has passed the comparison rules for the question being asked. This guide builds a small ledger for two abstract `A2B3` candidates and records why three other calculations are excluded.

## Define the comparison key

For a same-composition relative-energy table, the fixture requires:

```text
composition: A2B3
total charge: 0
evaluator: fixture-method-v1
energy field: electronic_energy
calculation complete: true
final state verified: true
```

The key is intentionally stricter than file readability or a common unit. A charged calculation, a different method branch, or an unfinished state answers a different question even if it reports a lower number in eV.

## Preserve cell contents before normalization

The accepted `alpha` fixture contains two formula units in its computational cell; the accepted `beta` fixture contains one. Comparing their cell totals directly would create a meaningless ordering. The script first converts each entry to eV per `A2B3` formula unit, then chooses the lowest accepted row as the table reference.

```python
from formation_energy_ledger import run

report = run()
print(report["accepted_entries"])
print(report["excluded_entries"])
print(report["comparison"])
```

The output reports both eV per formula unit and eV per atom. The conversion is exact because the formula-unit count and five atoms per formula unit are explicit fixture metadata.

## Keep exclusions in the evidence

The ledger rejects:

- `charged-a2b3` because its total charge differs;
- `mixed-method-a2b3` because its evaluator differs;
- `unfinished-a2b3` because completion and state identity are not verified.

These rows are not deleted. Their identifiers and exclusion reasons remain in the report, making the candidate search and its limits auditable.

## Interpret the bounded result

Within the two accepted fixture rows, `alpha-a2b3` defines zero and `beta-a2b3` is higher by `0.12 eV` per formula unit, or `0.024 eV` per atom. Those invented values test arithmetic and filtering only. The table does not show that `alpha` is a real phase, a global minimum, or stable against another composition.

For production use, extend each ledger row with structure, method, potential, correction, integration, geometry, state, convergence, software, and artifact-lineage identifiers. The exact fields depend on the comparison, but their meaning must be fixed before subtraction.

## What this guide verifies

The companion script verifies deterministic schema filtering, formula-unit normalization, reference selection, relative-energy subtraction, and preservation of excluded rows.

It does not run a DFT code, test numerical convergence, validate an energy method, establish physical ordering, find a global minimum, calculate a formation energy, or prove stability.

## Official sources

- [Materials Project phase-diagram methodology](https://docs.materialsproject.org/methodology/materials-methodology/thermodynamic-stability/phase-diagrams-pds)
- [Materials Project energy-correction methodology](https://docs.materialsproject.org/methodology/materials-methodology/thermodynamic-stability/thermodynamic-stability)
- [Hohenberg and Kohn, inhomogeneous electron gas](https://doi.org/10.1103/PhysRev.136.B864)
- [Kohn and Sham, self-consistent equations](https://doi.org/10.1103/PhysRev.140.A1133)

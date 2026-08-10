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
media_ids: []
review: docs/reviews/2026-08-03-relative-and-formation-energies.md
reviewed_at: "2026-08-03"
---

## Inspect calculation records before sorting energies

Open the input, output, accepted structure, and state record for every candidate. In a spreadsheet, mark composition, cell size, charge, magnetic identity, evaluator, energy convention, completion, and relevant convergence evidence; reject incomparable rows before ranking anything. Open structural outliers in a viewer and return to the original paper or Methods section when state identity is unclear. See [visual tools](/DFT-Research-Workflow/operations/resource-landscape/#visual-symmetry) and [literature sources](/DFT-Research-Workflow/operations/resource-landscape/#literature-learning) for common inspection routes.

**Optional arithmetic check:** the abstract A2B3 ledger is a synthetic teaching object. Use it only after inspecting the real calculation records above; it demonstrates a comparability gate and supplies no material ranking.

Use this guide before subtracting total energies from different calculation records. The fixture contains two accepted abstract `A2B3` candidates and three deliberately incompatible rows.

From the repository root, print the complete report:

```bash
python3 examples/practical-guides/formation_energy_ledger.py
```

The report is the output to inspect. It records accepted rows, rejected rows and reasons, normalized energies, and the bounded comparison. It does not run an electronic-structure program.

## What this guide verifies

Filter the rows before ranking. In this exercise, accept only neutral `A2B3` rows evaluated with `fixture-method-v1`, carrying `electronic_energy`, and marked both complete and final-state verified. A row that fails any one of those comparisons stays visible with its exclusion reason.

For production data, add structure and state identifiers, method and potential identity, numerical settings, geometry status, correction scheme, software version, artifact hashes, and target-convergence evidence. A common unit is not enough to make two rows comparable.

## Normalize before ranking

The accepted `alpha` cell contains two formula units and the accepted `beta` cell contains one. The script converts both totals to eV per A2B3 formula unit before selecting a reference. It also reports eV per atom from the explicit five-atom formula unit.

Inspect that cell contents and denominators are present in every accepted row. Never rank raw cell totals from different cell sizes.

## Read exclusions as evidence

The report rejects:

- `charged-a2b3` for a different total charge;
- `mixed-method-a2b3` for a different evaluator;
- `unfinished-a2b3` because completion and final-state identity are unverified.

Do not delete these rows. Their exclusion reasons define the boundary of the candidate comparison and expose whether a lower-looking number was omitted for a scientific reason.

Within the accepted fixture, `alpha-a2b3` defines zero and `beta-a2b3` is higher by $0.12$ eV per formula unit, or $0.024$ eV per atom. These invented values validate filtering and arithmetic only.

## Decide whether the ledger can continue

Continue to a reaction, formation energy, EOS, or hull only when every accepted row shares the required composition or balance, charge, evaluator, energy field, state identity, correction convention, and numerical adequacy. Retain the raw value and normalized value together.

This guide does not test DFT execution, numerical convergence, method accuracy, global structural search, formation energy, or phase stability. A deterministic ledger result is software evidence, not a material conclusion.

## Official sources

- [Materials Project phase-diagram methodology](https://docs.materialsproject.org/methodology/materials-methodology/thermodynamic-stability/phase-diagrams-pds)
- [Materials Project energy-correction methodology](https://docs.materialsproject.org/methodology/materials-methodology/thermodynamic-stability/thermodynamic-stability)
- [Hohenberg and Kohn, inhomogeneous electron gas](https://doi.org/10.1103/PhysRev.136.B864)
- [Kohn and Sham, self-consistent equations](https://doi.org/10.1103/PhysRev.140.A1133)

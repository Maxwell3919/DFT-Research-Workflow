---
topic_slug: equation-of-state-and-structural-phase-stability
guide_slug: design-traceable-energy-volume-series
title: Design a Traceable Energy–Volume Series
kind: implementation
tools:
  - python
status: reviewed
summary: Keep volume, deformation policy, relaxed degrees of freedom, method identity, electronic state, and convergence evidence attached to every point before fitting a curve.
tested_versions:
  - Python 3.12
execution_script: examples/practical-guides/eos_sampling_protocol.py
source_ids:
  - birch-eos
  - murnaghan-eos
  - vasp-volume-relaxation
  - ase-equation-of-state
media_ids:
  - traceable-energy-volume-series
review: docs/reviews/2026-08-03-equation-of-state-and-structural-phase-stability.md
reviewed_at: "2026-08-03"
---

An EOS fit should begin only after its energy–volume points form one comparable structural and electronic branch. This guide validates an abstract A2B2 ledger and keeps two rejected records as evidence.

## Define the branch identity

The fixture accepts records only when they share:

```text
composition: A2B2
atom count: 4
charge: 0
evaluator: fixture-method-v1
relaxation policy: fixed-volume shape and internal relaxation
electronic state: state-A
```

In a production series, the relaxation policy must specify whether cell shape and internal coordinates are fixed or relaxed. Two cells with the same scalar volume but different shape constraints do not represent interchangeable points.

## Keep the point ledger ordered but independent

Each accepted record carries its own volume and energy. The script sorts records by volume only after compatibility filtering:

```python
from eos_sampling_protocol import run

report = run()
print(report["accepted_ids"])
print(report["accepted_volumes_angstrom3_per_cell"])
```

Seven accepted volumes bracket the invented sampled minimum at `40 Å³` per A2B2 cell. Bracketing means that the nearest accepted points on both sides have higher fixture energy. It does not establish the continuous fitted minimum.

## Retain branch breaks and incomplete points

The `v32-state-switch` record is excluded because it ended in `state-B`; it is not silently relabelled as a compressed state-A point. The `v48-unfinished` record is excluded because completion and state identity are not established. Both identifiers and reasons remain in the report.

For a real calculation, add structure and parent hashes, the full cell metric and strain mapping, relaxed coordinates, forces, stress, symmetry and state diagnostics, method and potential identity, numerical settings, software version, and artifact locations. A smooth sequence of filenames is not lineage evidence.

## What this guide verifies

The companion script verifies exact metadata filtering, ordered unique volumes, exclusion provenance, and sampled-minimum bracketing for one deterministic ledger.

It does not run a DFT code, generate structures, relax a cell, test pressure or energy convergence, fit an EOS, calculate an equilibrium volume or bulk modulus, identify a phase transition, or establish stability.

## Official sources

- [Birch, finite elastic strain of cubic crystals](https://doi.org/10.1103/PhysRev.71.809)
- [Murnaghan, compressibility under extreme pressures](https://doi.org/10.1073/pnas.30.9.244)
- [VASP volume-relaxation and EOS guidance](https://vasp.at/wiki/Volume_relaxation)
- [ASE equation-of-state documentation](https://docs.ase-lib.org/ase/eos.html)

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

Use this guide before fitting an EOS. It filters an abstract A2B2 point ledger so only one structural and electronic branch reaches the fit.

Inspect the accepted points and their order from the companion-script directory:

```bash
cd examples/practical-guides
python3 - <<'PY'
from eos_sampling_protocol import run

report = run()
print(report["accepted_ids"])
print(report["accepted_volumes_angstrom3_per_cell"])
PY
```

The output is a filtered, ordered ledger. It is not an EOS fit or a DFT result.

## Purpose

The fixture accepts only:

```text
composition: A2B2
atom count: 4
charge: 0
evaluator: fixture-method-v1
relaxation policy: fixed-volume shape and internal relaxation
electronic state: state-A
```

For a production series, also record the source structure, full cell and strain mapping, allowed degrees of freedom, final coordinates, forces and stress, method and potential identity, numerical settings, software version, state diagnostics, and input/output hashes.

A scalar volume is not a complete structure. Fixed-shape scaling, fixed-volume shape relaxation, internal relaxation, and full hydrostatic relaxation trace different branches.

## Inspect the series before fitting

The fixture filters for compatibility, then sorts by volume. Its seven accepted points bracket the sampled minimum at $40\ \text{\AA}^3$ per A2B2 cell. Confirm that lower and higher accepted volumes have higher energies; this brackets the sampled minimum but does not establish the fitted continuous minimum.

The report retains `v32-state-switch` because it ended in `state-B`, and `v48-unfinished` because completion and state identity are missing. Both are excluded from the fit rather than relabelled or deleted.

For real points, inspect symmetry, lattice metrics, atom mapping, magnetic state, charge, occupations, forces, stress, and numerical settings across the ordered series. A discontinuity can be a branch change or numerical artifact. It is not repaired by deleting the point.

## Decide whether fitting may begin

Proceed only when:

- accepted volumes are unique and bracket the intended minimum or pressure interval;
- every point uses the same declared deformation and relaxation policy;
- the structural and electronic branch remains identifiable;
- energy differences and stress are converged across the changing cells;
- rejected and failed points remain recorded with reasons.

The companion script verifies metadata filtering, ordering, exclusions, and sampled-minimum bracketing. It does not generate structures, run or relax DFT, test pressure convergence, fit an EOS, or establish structural stability.

## Official sources

- [Birch, finite elastic strain of cubic crystals](https://doi.org/10.1103/PhysRev.71.809)
- [Murnaghan, compressibility under extreme pressures](https://doi.org/10.1073/pnas.30.9.244)
- [VASP volume-relaxation and EOS guidance](https://vasp.at/wiki/Volume_relaxation)
- [ASE equation-of-state documentation](https://docs.ase-lib.org/ase/eos.html)

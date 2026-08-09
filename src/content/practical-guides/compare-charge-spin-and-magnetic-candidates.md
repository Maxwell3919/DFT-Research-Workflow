---
topic_slug: calculate-reference-ground-state
guide_slug: compare-charge-spin-and-magnetic-candidates
title: Compare Charge, Spin, and Magnetic Candidates
kind: implementation
tools:
  - python
status: reviewed
summary: Filter and rank explicitly enumerated electronic-state candidates under one common evaluator while retaining failed and incomparable cases.
tested_versions:
  - Python 3.12
execution_script: examples/practical-guides/reference_state_candidate_comparison.py
source_ids:
  - vasp-magmom
  - vasp-electronic-minimization
  - cp2k-dft
  - hohenberg-kohn
  - kohn-sham
  - mermin-dft
  - woods-scf-review
media_ids:
  - candidate-state-comparison
review: docs/reviews/2026-08-03-calculate-reference-ground-state.md
reviewed_at: "2026-08-03"
---

A ground-state statement is bounded by the electronic states that were prepared and made comparable. Build a candidate table before selecting the reference.

## Define candidate identity

Each row should preserve the candidate identifier, charge and electron count, spin treatment, magnetic initialization, final moments, occupation or localization signature, symmetry, relativistic branch, completion diagnostics, energy convention, normalization, and method identity.

Initial magnetic moments are search controls. Final outputs determine which state was reached.

## Filter before ranking

The companion fixture contains two completed and comparable magnetic states, one completed state with a different total charge, and one incomplete state.

```python
from reference_state_candidate_comparison import run

report = run()
print(report["accepted_candidates"])
print(report["excluded_candidates"])
print(report["selected_reference"])
```

Only records with the common charge, evaluator, normalization, completion evidence, and stable state identity enter the fixture ranking. The charged case is retained for a different thermodynamic comparison. The incomplete case remains excluded with its reason.

## State the ranking boundary precisely

The selected fixture is the lowest verified candidate among the accepted enumerated set. The statement does not cover untested magnetic supercells, charge-localized patterns, noncollinear states, spin directions, constrained states, or another Hamiltonian.

The script does not encode or verify geometry. In a real calculation, ranking
electronic basins at one fixed geometry is a vertical comparison. Ranking
magnetostructural states requires a separate, traceable relaxation for each state
followed by comparable evaluations at the state-specific accepted geometries.

Where energy differences are comparable to numerical or method uncertainty, retain a near-degenerate set rather than forcing a unique state label.

## Keep different charges and Hamiltonians separate

Raw total energies for different electron numbers, electrostatic backgrounds, functionals, Hubbard parameters, or relativistic treatments do not form one direct ranking table. Later defect, redox, or field-dependent workflows introduce reservoirs, chemical potentials, alignments, and correction terms.

A candidate can remain scientifically relevant without being eligible for the current fixed-charge reference comparison.

The fixture's different-charge exclusion is only a guard. It does not construct
a chemical-potential, reservoir, alignment, or correction framework and therefore
cannot decide stability across electron numbers.

## What this guide verifies

The companion script applies deterministic eligibility rules and ranks the remaining fixture candidates by one declared energy quantity. It retains exclusion reasons and reports the selection as bounded by the tested candidate set. It does not encode geometry or a charged-state thermodynamic potential.

It does not run a DFT code, establish candidate completeness, validate an energy tolerance, or prove the global electronic ground state of a real system.

## Common mistakes

**Ranking incomplete candidates.** Completion and state identity are prerequisites for comparison.

**Mixing different charges in one raw-energy table.** Use the appropriate thermodynamic framework later.

**Using the input seed as the final label.** Inspect final moments, occupations, charge, and symmetry.

**Reporting a ground state without the candidate set.** Preserve what was tested and what remains outside scope.

## Official sources

- [VASP `MAGMOM`](https://vasp.at/wiki/MAGMOM)
- [VASP electronic minimization](https://vasp.at/wiki/Electronic_minimization)
- [CP2K DFT section](https://manual.cp2k.org/trunk/CP2K_INPUT/FORCE_EVAL/DFT.html)
- [Hohenberg and Kohn](https://doi.org/10.1103/PhysRev.136.B864)
- [Kohn and Sham](https://doi.org/10.1103/PhysRev.140.A1133)
- [Mermin finite-temperature DFT](https://doi.org/10.1103/PhysRev.137.A1441)
- [Woods, Payne, and Hasnip on SCF methods](https://doi.org/10.1088/1361-648X/ab31c0)

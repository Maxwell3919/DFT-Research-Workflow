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
media_ids: []
review: docs/reviews/2026-08-03-calculate-reference-ground-state.md
reviewed_at: "2026-08-03"
---

A ground-state statement is bounded by the electronic states that were prepared and made comparable. Build a candidate table before selecting the reference.

## Build candidate states as physical objects

Begin with the original paper, supporting information, or a specialist review when it defines the magnetic cell, oxidation or charge convention, ordering vector, constrained state, or experimentally relevant competitors. Draw or visualize each candidate in the correct cell; label sublattices, moment directions, net charge, compensating background assumptions, and any geometry restrictions. Use the [visualization and symmetry resource index](/DFT-Research-Workflow/operations/resource-landscape/#visual-symmetry) to inspect whether the chosen cell can represent the intended order.

Create one directory and one human-readable state sheet per candidate. Keep geometry, pseudopotentials, functional, basis, k sampling, smearing, and thresholds comparable unless the physical branch explicitly requires a change. Run genuinely fresh initializations where state trapping is at issue, then compare them with declared restart routes rather than silently inheriting a density.

Read the full SCF history and inspect the final total and local moments where the code reports them, occupations, charge and spin-density outputs, symmetry, warnings, forces, stress, and any state switching. Use tables and aligned density or moment views to compare accepted candidates. Exclude unconverged or incomparable rows before ranking energy, and record metastable states rather than forcing every branch into one label.

Before using the synthetic ledger, inspect the real candidate directories and outputs with ordinary read-only commands:

```bash
: "${CANDIDATE_ROOT:?Set CANDIDATE_ROOT to the directory containing candidate states}"
find "$CANDIDATE_ROOT" -mindepth 1 -maxdepth 2 -type f \
  -printf '%12s %p\n' | sort
find "$CANDIDATE_ROOT" -mindepth 1 -maxdepth 2 -type f -size 0 -print
find "$CANDIDATE_ROOT" -mindepth 2 -maxdepth 2 -type f -name '*.out' -print0 |
  while IFS= read -r -d '' output; do
    printf '\n%s\n' "$output"
    head -n 20 -- "$output"
    tail -n 40 -- "$output"
    grep -niE 'converg|energy|fermi|magnet|occupation|charge|warning|error|stopping' \
      -- "$output" || true
  done
```

Use the displayed histories to fill the candidate table, then open the final structures and state-resolved outputs needed by the model. Generic text matching does not establish completion, SCF convergence, state identity, or comparability; interpret the exact implementation records using its versioned manual. The ledger script below is a synthetic bookkeeping fixture. It is optional automation and provides no real magnetic-state evidence. Use the [electronic-structure code manuals](/DFT-Research-Workflow/operations/resource-landscape/#electronic-structure-codes) for code-specific spin and charge controls and the [learning index](/DFT-Research-Workflow/operations/resource-landscape/#literature-learning) for hands-on state-construction routes.

## Run the bounded candidate ledger

```bash
python3 examples/practical-guides/reference_state_candidate_comparison.py
```

The deterministic report separates completed comparable candidates from an incomplete candidate and a different-charge candidate, then ranks only the eligible fixture rows. It does not run DFT, inspect geometry, or establish a real magnetic state.

For each real candidate, provide the fixed geometry, charge/electron count, state initialization, final occupations and moments, symmetry, method identity, completion and SCF evidence, comparable energy quantity, and normalization. Exclude incomplete or state-ambiguous rows without deleting them. Select only the lowest verified candidate within that explicit comparable set, then ask whether that state is scientifically appropriate for the target calculation.

## Define candidate identity

Each row should preserve the candidate identifier, charge and electron count, spin treatment, magnetic initialization, final moments, occupation or localization signature, symmetry, relativistic branch, completion diagnostics, energy convention, normalization, and method identity.

Initial magnetic moments are search controls. Final outputs determine which state was reached.

## Filter before ranking

The companion fixture contains two completed and comparable magnetic states, one completed state with a different total charge, and one incomplete state.

```python
import sys

sys.path.insert(0, "examples/practical-guides")
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

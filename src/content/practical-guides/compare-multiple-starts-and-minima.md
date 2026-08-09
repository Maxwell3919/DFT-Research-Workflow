---
topic_slug: optimize-structure
guide_slug: compare-multiple-starts-and-minima
title: Compare Multiple Starts and Metastable Minima
kind: implementation
tools:
  - python
status: reviewed
summary: Use multiple physically motivated starting structures to expose distinct local minima, preserve every basin, and avoid calling one local relaxation a global search.
tested_versions:
  - Python 3.12
execution_script: examples/practical-guides/optimization_multiple_starts.py
source_ids:
  - ase-optimize
  - vasp-structure-optimization
  - fire-paper
  - basin-hopping-paper
media_ids:
  - optimization-multiple-basin-map
review: docs/reviews/2026-08-03-optimize-structure.md
reviewed_at: "2026-08-03"
---

A local optimizer answers a basin-dependent question: which stationary structure is reached from this starting point under this state evaluator and active subspace? It does not generally search the full configurational landscape.

## Run the bounded basin exercise

```bash
python3 examples/practical-guides/optimization_multiple_starts.py
```

The script starts the same deterministic local minimizer from four coordinates, reports which of two synthetic basins each start reaches, and retains both minima. It does not run DFT or prove that the lower fixture basin is globally lowest.

For a material study, prepare one directory and stable candidate ID per physically motivated start. Preserve each input, trajectory, final geometry, final state, termination evidence, and fresh final energy-and-gradient check. Deduplicate only after structure, cell, atom mapping, state identity, and numerical tolerances agree. Send every distinct verified minimum to the same fixed-geometry reference-state protocol; do not rank raw last-step relaxation energies.

## Identify why multiple minima are plausible

Multiple starts are especially important when the model admits alternatives such as:

- crystal polymorphs or symmetry-lowered distortions;
- layer stackings and interface registries;
- adsorption sites and molecular orientations;
- defect reconstructions or charge-localization patterns;
- magnetic orders or spin directions;
- molecular conformers;
- ferroelectric orientations;
- disordered or compositionally ordered arrangements.

Generate candidates from scientific hypotheses, symmetry, enumeration, perturbations, prior data, or a declared global-search method. Random displacement alone is not a substitute for covering known configurational alternatives.

## Keep each start and state lineage independent

Assign every initial candidate a stable identity and preserve:

```text
parent model and transformation
initial geometry and cell checksum
initial electronic or magnetic state
constraints and symmetry treatment
optimizer and evaluator identity
complete trajectory
final structure and state
termination and verification result
```

Do not reuse one candidate's wavefunction or optimizer Hessian in another branch unless the scientific intent and compatibility are explicit. Such reuse can bias nominally independent starts toward the same metastable state.

## Demonstrate basin dependence with a synthetic landscape

The companion script minimizes a one-dimensional tilted double-well from four initial coordinates:

```python
from optimization_multiple_starts import run

report = run()
for result in report["starts"]:
    print(result["start"], result["minimum_label"], result["final_energy"])
```

The potential and numerical settings are deterministic teaching fixtures. Two starts reach the left basin and two reach the right basin. The analysis retains both stationary families and identifies the lower fixture energy without claiming that a local optimizer proved the global solution.

## Compare final objects before deduplication

Two relaxed files may represent the same basin under translation, atom permutation, cell choice, symmetry operation, or small numerical noise. Conversely, similar total energies do not make two geometries equivalent.

A deduplication record may use:

- composition and atom mapping;
- periodic cell equivalence;
- symmetry and Wyckoff or local-environment information;
- displacement or distance metrics after optimal mapping;
- magnetic or charge-state identity;
- declared numerical tolerances;
- a method-compatible final energy-and-gradient check.

Preserve the mapping and tolerance used. Do not delete the original branches after clustering them.

## Treat distinct minima as results

When multiple verified minima remain, compare them with a consistent reference-state protocol. The lowest computed energy under one method may be the leading zero-temperature candidate, but higher minima can remain scientifically relevant as metastable phases, reconstructed defects, stackings, conformers, or kinetic intermediates.

Do not relabel all non-leading minima as “unconverged.” Distinguish:

- optimization failure;
- a stopped but unverified path;
- a verified local minimum candidate;
- a candidate that is higher in a declared energy comparison;
- a candidate rejected by a separate physical or experimental criterion.

## Use global-search methods as separate workflows

Basin hopping, minima hopping, evolutionary searches, random structure search, and related methods alternate candidate generation with local minimization. They can explore more basins, but their stopping rules and completeness claims require separate evidence.

A global-search algorithm returning one lowest candidate does not prove that no lower basin exists unless the search protocol provides a defensible coverage or probability argument. Keep global-search configuration, random seeds, accepted and rejected candidates, and local-minimization settings.

## Perturb high-symmetry candidates deliberately

A high-symmetry start can remain trapped because imposed symmetry excludes an unstable direction or because exact coordinates produce zero first-order force along a symmetry-breaking mode. Use small physically motivated perturbations, lower-symmetry supercells, alternative magnetic starts, or known soft-mode directions where justified.

Turning off all symmetry without constructing relevant candidates may increase cost without improving coverage. The perturbation family and its scientific rationale should be recorded.

## Rank only after comparable final verification

Before comparing energies of different minima, ensure that each candidate uses a compatible model, method, numerical setup, state definition, and final verification. Cell sizes, formula units, charge states, magnetic branches, and constraints may require normalization or separate reference terms.

Energy ranking is a later reference-state or target-calculation task. This guide establishes candidate and basin lineage; it does not define formation energies, phase stability, or finite-temperature populations.

## What this guide verifies

The companion script confirms that a deterministic local minimizer reaches two distinct basins from different starts, groups converged fixture coordinates, and retains both minima before reporting their relative fixture energies.

It does not run DFT, validate any material, prove global optimality, prescribe a number of starting structures, or establish thermodynamic or dynamic stability.

## Common mistakes

**Optimizing one start and calling it the ground state.** Local minimization is basin dependent.

**Using only random noise around one structure.** Cover known polymorph, registry, magnetic, and reconstruction hypotheses.

**Deleting higher local minima.** Preserve metastable candidates and rejection reasons.

**Deduplicating by energy alone.** Compare structure, cell, mapping, and state identity.

**Calling a global-search best-so-far candidate proven.** Search completeness needs its own evidence.

## Official sources

- [ASE local and global structure optimization](https://docs.ase-lib.org/ase/optimize.html)
- [VASP structure optimization and local-minimum boundary](https://vasp.at/wiki/Structure_optimization)
- [Bitzek et al., FIRE structural relaxation](https://doi.org/10.1103/PhysRevLett.97.170201)
- [Wales and Doye, basin-hopping and multiple minima](https://doi.org/10.1021/jp970984n)

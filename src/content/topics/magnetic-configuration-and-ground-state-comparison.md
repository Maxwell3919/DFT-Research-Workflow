---
topic_slug: magnetic-configuration-and-ground-state-comparison
status: reviewed
---

Magnetic ground-state comparison asks which explicitly enumerated spin, charge, structural, and Hamiltonian candidates has the lowest compatible energy at the stated conditions. It is a competition among calculation objects, not a label inferred from one self-consistent field (SCF) run. A converged ferromagnetic, antiferromagnetic, ferrimagnetic, or nominally nonmagnetic solution is evidence for one stationary state; it does not establish that state as the magnetic ground state.

## Magnetic order belongs to the calculation object

Specify the magnetic cell and each candidate’s site-resolved moments, relative orientation, collinear or noncollinear representation, spin axis, spin--orbit coupling (SOC), total charge, occupations, structural degrees of freedom, and symmetry treatment. A primitive structural cell may be unable to represent a proposed antiferromagnetic pattern; changing to a magnetic supercell changes the reciprocal sampling and must be compared on a compatible numerical basis.

The net moment is not a magnetic-order label. A compensated antiferromagnet can have zero total magnetization while retaining finite, oppositely aligned local moments. Conversely, a cell with a tiny net moment can arise from incomplete cancellation, inequivalent sites, canting, a constrained state, or numerical noise. Preserve the real-space moment pattern, not only a single total value.

## Initial moments generate candidates; they are not final evidence

Spin-density functionals can contain multiple local minima. An initial moment pattern is a way to explore them, and a restart can retain or symmetrize a previous state depending on the code and symmetry settings. Run multiple physically motivated seeds for every candidate family and classify the final state from its converged spin density, local moments, charge/spin state, symmetry, and energy—not from the input label.

For a collinear comparison, the relevant energy difference is schematically

```text
ΔE(A,B) = [E_A − E_B] / N,
```

where `E_A` and `E_B` are total energies of compatible final states and `N` is a declared normalization, such as magnetic ion, formula unit, or common supercell. `ΔE` answers only the defined zero-temperature electronic comparison. It is not a Curie or Néel temperature, an exchange constant, an experimental magnetic phase diagram, or a proof that unenumerated configurations lie higher.

## A fair comparison requires the same physical model

Keep exchange--correlation functional, pseudopotential/PAW data set, Hubbard treatment and double-counting convention, SOC/noncollinearity setting, charge, cell boundary conditions, occupation model, and correction scheme coherent across the compared candidates. A Hubbard `U` is part of the Hamiltonian, not a post-processing display choice; a magnetic ordering can change when it changes. If one candidate requires SOC, the comparison question has changed unless SOC is included consistently for all relevant candidates.

Decide deliberately whether each candidate uses a common fixed structure or receives the same allowed relaxation protocol. Fixed-geometry energies isolate an electronic competition at that geometry. Independently relaxed energies compare different coupled magnetostructural states. Mixing the two can create an apparent magnetic preference that actually comes from unequal structural freedom.

## Candidate completeness controls the strength of a ground-state claim

Build a candidate set from crystallographic sublattices, valence and spin-state possibilities, known or symmetry-distinct ordering vectors, likely ferrimagnetic arrangements, and—where relevant—noncollinear or disordered local-moment models. Enumerate the magnetic cell relation and the mapping from input sites to final moments. Symmetry reduction may remove duplicates, but it must not silently restore a symmetry incompatible with the intended spin pattern.

The lowest energy in an enumerated set is an **identified lowest candidate**, not necessarily the thermodynamic magnetic ground state. Long-period orders, spin spirals, frustrated states, disorder, quantum fluctuations, finite-temperature entropy, defects, strain, surfaces, and external fields may lie outside the model. State candidate-set coverage next to every conclusion.

## Convergence is observable-specific and magnetic-state-specific

Converge energy differences and final moment patterns with respect to the numerical representation used by each magnetic cell. k-point sampling, smearing, basis/grid, supercell size, occupation handling, mixing, starting seeds, force/stress thresholds where relaxed, SOC settings, and projection method for reported local moments can alter a small ordering difference. Total-energy convergence alone does not show that `ΔE` or the final spin texture has converged.

For each final state retain initial and final moment maps; charge/spin/SOC/constraint inputs; symmetry operations retained or broken; electronic convergence traces; total energies and normalization; structural relaxation status; k-point and basis lineage; local-moment definition; and all seeds that collapsed to the same or a different final state. This lineage lets a downstream anisotropy, exchange, phonon, or transport calculation consume the selected state without confusing it with an arbitrary initial guess.

## What this topic establishes

This topic establishes a bounded comparison of explicitly prepared magnetic candidates and identifies the lowest state in that declared set. It does not establish a complete magnetic ground state, finite-temperature ordering temperature, exchange parameter, magnetic anisotropy, spin-wave spectrum, experimental magnetic structure, or material application from one SCF solution or one energy difference alone.

## Sources and methods

- [Hohenberg and Kohn, density-functional foundation](https://doi.org/10.1103/PhysRev.136.B864)
- [Kohn and Sham, self-consistent equations](https://doi.org/10.1103/PhysRev.140.A1133)
- [Dudarev et al., rotationally invariant DFT+U form](https://doi.org/10.1103/PhysRevB.57.1505)
- [Hobbs, Kresse, and Hafner, noncollinear PAW magnetism](https://doi.org/10.1103/PhysRevB.62.11556)
- [Quantum ESPRESSO `pw.x` magnetic inputs](https://www.quantum-espresso.org/Doc/INPUT_PW.html)
- [VASP `MAGMOM` documentation](https://vasp.at/wiki/MAGMOM)

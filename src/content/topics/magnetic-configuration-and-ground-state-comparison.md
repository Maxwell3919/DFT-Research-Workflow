---
topic_slug: magnetic-configuration-and-ground-state-comparison
status: reviewed
---

## Inspect the initialized and final magnetic states

Use symmetry, chemical knowledge, and prior literature to enumerate plausible collinear or noncollinear arrangements. Open the structure with moment arrows or spin-density isosurfaces when available, preserve the initialized pattern, and compare it with the final site-resolved moments and total magnetization. A converged run that collapsed to another state must be relabelled rather than kept under its starting name.

Place those state identities beside a comparable-energy ledger and inspect structural changes as well as magnetic observables. A bar chart of invented energies is not magnetic-state evidence. Use [visual tools](/DFT-Research-Workflow/operations/resource-landscape/#visual-symmetry), [specialist magnetic post-processing](/DFT-Research-Workflow/operations/resource-landscape/#specialist-tools), and [literature sources](/DFT-Research-Workflow/operations/resource-landscape/#literature-learning) to build and audit the candidate set.

Perform a magnetic-candidate comparison before a downstream calculation needs a magnetic reference state. The parent object is a declared structure and numerical method; the output is a ledger of compatible final spin states, total energies, moment maps, and normalization. One converged ferromagnetic, antiferromagnetic, ferrimagnetic, or nominally nonmagnetic SCF solution is only one candidate.

No executed practical guide currently accompanies this topic. The bounded route is to enumerate representable candidates, prepare one calculation object per candidate with the selected code, run them under compatible conditions, extract final energies and moment maps, and compare them in an auditable ledger. Quantum ESPRESSO documents the relevant `pw.x` magnetic inputs, and VASP documents `MAGMOM`; exact initialization and noncollinear syntax depend on the code and version.

## Magnetic order belongs to the calculation object

For each row, record the magnetic cell, site-to-sublattice mapping, initial moment vectors or collinear signs, charge and nominal spin state, collinear or noncollinear representation, spin axis, SOC setting, symmetry treatment, structural freedom, and intended normalization. A primitive structural cell may be unable to represent an antiferromagnetic pattern. If cells differ, make their k-point density, basis, and energy normalization comparable.

## Initial moments generate candidates; they are not final evidence

Use multiple physically motivated seeds where metastability is plausible. Preserve every seed and identify whether it converges to the intended state, collapses to another recorded state, or fails electronically.

## A fair comparison requires the same physical model

Keep the exchange-correlation functional, pseudopotential or PAW data set, Hubbard treatment and double-counting convention, charge, occupations, correction scheme, boundary conditions, and numerical thresholds coherent. Decide whether all candidates share one fixed geometry or receive the same relaxation protocol.

Fixed-geometry energies compare electronic states at one structure. Independently relaxed energies compare coupled magnetostructural states. Do not mix those two questions in one ranking.

If SOC or noncollinearity is physically required, use a compatible spinor/SOC Hamiltonian for every energy entering that comparison. Do not subtract a scalar-relativistic collinear energy from an SOC energy and interpret the result as a magnetic-order difference. Noncollinear candidates require final vector moment maps, not only a total magnetization.

## Convergence is observable-specific and magnetic-state-specific

First confirm normal program termination and the reported electronic-solver condition. These checks do not establish that the intended magnetic state survived.

Inspect the final site-resolved moments or spin density, total magnetization, symmetry, charge/spin state, constraints, structure, and energy. A compensated antiferromagnet may have zero net moment while retaining opposing local moments. A small net moment can instead reflect incomplete cancellation, canting, inequivalent sites, a constraint, or numerical noise.

For compatible final states $A$ and $B$, report

$$
\Delta E(A,B) = \frac{E_A-E_B}{N},
$$

where $N$ is explicitly the magnetic ion, formula unit, area, or common cell. Retain enough printed precision that the reported difference can be reconstructed from the underlying energies. If the ordering changes with k-point sampling, smearing, basis/grid, seed, moment projection, structure threshold, or SOC/symmetry choice, the ranking is not yet resolved.

## Candidate completeness controls the strength of a ground-state claim

Build the candidate set from crystallographic sublattices, plausible valence and spin states, symmetry-distinct ordering vectors, ferrimagnetic arrangements, and relevant noncollinear states. Symmetry reduction can remove duplicates only after it is shown not to restore a symmetry incompatible with the intended pattern.

The lowest compatible energy identifies the lowest candidate in the declared set. Report the candidate coverage and every unresolved near-degeneracy next to that result. $\Delta E$ is not a Curie or Neel temperature, an exchange parameter, a proof that unenumerated states lie higher, or an experimental magnetic structure.

## What this topic establishes

The accepted ledger can become the parent for anisotropy, exchange, phonon, or transport work. Preserve its structure, final moment map, Hamiltonian, SOC/noncollinear mode, numerical lineage, energy normalization, and all collapsed seeds so that a downstream calculation does not restart from an arbitrary input label. It does not establish a complete magnetic ground state, finite-temperature ordering temperature, exchange model, experimental magnetic structure, or proof that unenumerated configurations lie higher.

## Sources and methods

- [Hohenberg and Kohn, density-functional foundation](https://doi.org/10.1103/PhysRev.136.B864)
- [Kohn and Sham, self-consistent equations](https://doi.org/10.1103/PhysRev.140.A1133)
- [Dudarev et al., rotationally invariant DFT+U form](https://doi.org/10.1103/PhysRevB.57.1505)
- [Hobbs, Kresse, and Hafner, noncollinear PAW magnetism](https://doi.org/10.1103/PhysRevB.62.11556)
- [Quantum ESPRESSO `pw.x` magnetic inputs](https://www.quantum-espresso.org/Doc/INPUT_PW.html)
- [VASP `MAGMOM` documentation](https://vasp.at/wiki/MAGMOM)

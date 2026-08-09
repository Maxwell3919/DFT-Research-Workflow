---
topic_slug: calculate-reference-ground-state
status: reviewed
---

A reference ground-state calculation establishes the fixed-geometry electronic state, energy reference, and reusable parent data used by later calculations. The phrase “ground state” must be used with care. A self-consistent calculation normally finds one stationary electronic solution compatible with the chosen model, method, boundary conditions, occupations, and initialization. The durable result is therefore a verified reference-state candidate and a record of the competing states that were actually tested.

## Define the reference state operationally

For fixed nuclei and a declared electronic Hamiltonian, the task is to obtain a reproducible self-consistent state that can serve as the common parent for later energies and properties. Define its identity before execution:

- exact structure and atom ordering;
- charge, spin, magnetization, and relativistic treatment;
- exchange–correlation method and any corrective parameters;
- potentials, basis or grids, Brillouin-zone sampling, and occupations;
- boundary conditions and external fields;
- software version and restart policy;
- normalization and reference-energy convention.

A successful SCF solution is not automatically the global electronic ground state. Distinct magnetic orders, charge-localized solutions, occupations, broken symmetries, or spin directions may all satisfy the internal equations. Within this workflow, “reference ground state” means the lowest verified comparable candidate among the explicitly prepared and tested states, with the search boundary retained.

## Freeze geometry and method identity

Begin from the exact accepted geometry produced by **Optimize the Structure** or another declared source. Preserve its checksum, cell, atom order, constraints that remain physically relevant, and the optimization lineage. The reference calculation is fixed-geometry: it may report forces and stress, but it does not silently continue moving atoms or changing the cell.

`optimization → fixed-geometry reference` is a common lineage edge, not a universal workflow law. An experimental, constrained, high-symmetry, or deliberately scanned geometry may enter this task directly when the question is explicitly fixed-geometry. Conversely, geometry–state coupling cannot be hidden inside one electronic ranking.

Carry forward the scientific method identity. Functional, dispersion treatment, Hubbard parameters, pseudopotential or all-electron setup, relativistic treatment, charge state, electrostatic boundary, and other Hamiltonian-defining choices should not drift between optimization and reference preparation without a new, explicit method branch.

Numerical settings may be refined for the final calculation. Record each refinement and verify that it does not change the intended electronic branch or invalidate comparisons with other candidates.

## Perform a final fixed-geometry state calculation

The reference calculation should evaluate the final structure independently of optimizer-internal extrapolation or a loosely converged last ionic step. Request the outputs needed to verify and reuse the state: total energy or free-energy quantity, occupations, Fermi level where applicable, charge and magnetization diagnostics, forces, stress, charge density, wavefunctions when justified, and relevant warnings.

This calculation is not simply “the last SCF in the relaxation.” It has a stable calculation identity, declared final numerical settings, and its own completion evidence. Downstream calculations should point to this object or to an explicitly derived replacement.

## Enumerate candidate electronic states

Prepare candidate states when the system can support more than one self-consistent solution. Relevant branches may include:

- nonmagnetic, ferromagnetic, ferrimagnetic, and antiferromagnetic initializations;
- alternative local-moment patterns or spin directions;
- different charge-localization or orbital-occupation seeds;
- symmetry-preserving and symmetry-broken starts;
- distinct total charges or constrained electronic states, when they answer different declared questions;
- scalar-relativistic and spin–orbit branches when both are scientifically compared.

The candidate inventory should be motivated by chemistry, symmetry, prior evidence, or the research question. One arbitrary initialization is not a search strategy.

## Separate a fresh start from a continuation

A charge density or wavefunction from optimization can accelerate a final calculation and help preserve state continuity. It also carries memory of the preceding path. Label a run as a continuation when it reuses electronic objects, and record the exact parent and compatibility conditions.

A fresh start initializes the same declared state without using the previous electronic solution. It is valuable for detecting path dependence, unintended metastability, and corrupted or incompatible restart data. Fresh and restarted calculations are comparable only when their structure, Hamiltonian, boundary conditions, numerical representation, and state target are aligned.

Restart success means that a compatible stored state was accepted and the calculation completed. It does not prove that the reused state is the lowest candidate.

## Choose occupations and electronic temperature deliberately

Occupations are part of the reference-state definition. Insulators, metals, small-gap systems, and finite-temperature electronic calculations may require different integration or occupation treatments. Record the occupation method, smearing or electronic temperature, number of bands, and the energy quantity being compared.

For smeared calculations, distinguish the reported band-energy, entropy, free-energy, and extrapolated energy conventions used by the implementation. Candidate-state comparisons must use one consistent quantity and one consistent occupation protocol unless the difference itself is the subject of study.

A smearing width chosen for Brillouin-zone integration is not automatically a physical temperature. Changing it can alter magnetic moments, charge localization, Fermi-surface sampling, and energy ordering.

## Preserve charge and electrostatic boundary conditions

Total charge, compensating backgrounds, Coulomb truncation, dipole corrections, dielectric environments, gates, external fields, and electrostatic reference choices belong to the model identity. A charged periodic cell and a neutral cell are different physical calculations even when the nuclear geometry is identical.

Record electron count and charge convention explicitly. Verify that the final electronic number matches the intended state and that any correction or background treatment is compatible with the geometry and periodic dimensionality.

Energy values from different charges or electrostatic references are not directly ranked without the appropriate thermodynamic and alignment framework. Those comparisons belong to later target calculations such as defect formation energies.

At fixed electron number, candidate ranking is restricted to one charge branch. Across charges, stability depends on a declared reservoir or chemical potential, electrostatic corrections, and reference alignment; no raw total-energy minimum defines one absolute charged ground state.

## Control spin, magnetization, and relativistic branches

Initial moments guide the solver toward candidate magnetic states; they do not define the final state by themselves. After convergence, inspect total and local moments, spin density, symmetry, occupation pattern, and—where relevant—spin direction and orbital moment.

For noncollinear or spin–orbit calculations, record the quantization convention, magnetization direction, symmetry treatment, and relativistic potential compatibility. Rotating the magnetization or enabling spin–orbit coupling changes the Hamiltonian branch and can require new convergence and candidate comparisons.

Do not label a state “nonmagnetic” merely because a spin-polarized run collapsed to a small net moment. Compensated local moments and antiferromagnetic order require local diagnostics.

## Distinguish internal SCF convergence from state verification

SCF convergence means that the implemented residual or energy criterion was satisfied for one iterative solve. Reference-state verification additionally asks whether:

- electron count and occupations are correct;
- energy and residual histories are stable;
- the intended charge, magnetic, symmetry, and relativistic branch survived;
- warnings and numerical pathologies are absent or understood;
- independent starts reproduce the same state where required;
- the result is comparable to the other candidate states.

A small final residual does not identify which self-consistent basin was reached. A stable state label with an unconverged residual is also insufficient.

## Diagnose oscillation, charge sloshing, and false convergence

SCF histories can oscillate, alternate between occupation patterns, stagnate above the target, or terminate because an iteration limit was reached. Metals, large cells, vacuum regions, charge inhomogeneity, and competing magnetic states can make mixing difficult.

Inspect residual, energy, electron count, Fermi level, occupations, magnetic diagnostics, and any preconditioner or mixing changes. When a recovery changes the solver, mixing, smearing, number of bands, or initialization, preserve a new traceable segment.

Increasing the iteration limit does not repair an unstable state evaluator. A solver that reports completion after switching to a different state has solved a different branch.

## Compare candidate energies under one common evaluator

Rank candidate electronic states only after they are evaluated at the same fixed geometry with compatible Hamiltonian and numerical settings. Use the same energy or free-energy convention, normalization, k-point sampling logic, occupation treatment, potentials, and correction terms.

Exclude incomplete, internally unconverged, or state-ambiguous candidates from a definitive ranking. Retain them in the evidence package with their failure reason.

The lowest accepted candidate among the tested inventory is the current reference. This statement remains bounded by the candidate set, method, geometry, and numerical accuracy. It is not proof that no untested electronic state lies lower.

This same-geometry ranking answers a fixed-nuclei, or vertical, electronic question. It does not rank magnetostructural states after each state changes the geometry.

For magnetostructural ordering, give each electronic or magnetic candidate its own traceable relaxation with compatible method identity and force/stress convergence, then compare fixed-geometry evaluations at the state-specific accepted geometries. Preserve any state switch as workflow feedback. A common-geometry ranking may seed that search; it cannot replace it.

## Re-evaluate forces and stress on the fixed structure

Although atoms and cell are fixed, final forces and stress remain useful diagnostics. They reveal whether stricter electronic and numerical settings materially change the stationary character established during optimization, whether a state switch changed the gradient, and whether residual stress is relevant to the declared boundary condition.

Do not resume optimization automatically because one component changed. First determine whether the difference comes from tighter numerics, a changed Hamiltonian, a different electronic state, or an inconsistent force/stress convention. A new relaxation is a separate workflow branch with its own lineage.

Force and stress verification does not establish vibrational, dynamical, thermal, or thermodynamic stability.

## Verify state identity after convergence

State identity should be checked from outputs, not inferred from input labels. Preserve the quantities needed to distinguish candidates: local and total moments, symmetry, charge localization, occupation signatures, band or density features, spin direction, and any constrained variable.

Where a state is delicate, repeat the same fixed geometry from independent initializations. Compare final diagnostics and electronic-object hashes or summaries. Equivalent energies with different state identities should not be silently merged.

A reproducible state label is part of the reference object. Downstream calculations must declare whether they preserve it.

## Define the reference energy and normalization

Store the exact quantity called the reference energy and its units. Record whether it is per cell, per formula unit, per atom, per area, or another normalization. Preserve the cell, composition, electron count, occupation convention, and any entropy or correction term associated with it.

Absolute total energies from different codes, potentials, basis families, charges, compositions, or Hamiltonians are generally not interchangeable. Later formation, adsorption, interface, and defect energies must construct compatible thermodynamic differences rather than treating one raw total energy as universal.

The reference energy is a provenance anchor for one state, not a standalone physical observable.

## Repeat critical states from independent initializations

For conclusions sensitive to electronic-state ordering, repeat leading candidates from controlled fresh densities, alternative magnetic seeds, or other scientifically justified initializations. Reproduction provides evidence that the same basin is reachable without dependence on one restart path.

A repeated calculation should preserve method identity while varying only the declared initialization. Report whether it reaches the same state, a different state, or fails. Repeated convergence to one state strengthens operational robustness but still does not prove exhaustive global minimality.

The number and diversity of starts are research-design choices. This workflow does not prescribe one universal count.

## Package charge density and wavefunction lineage

Later NSCF, band, DOS, phonon, response, Wannier, and electron–phonon calculations may reuse charge density, potential, wavefunctions, or other state files. Treat each as a versioned artifact linked to:

- the exact structure checksum;
- method, potentials, charge, and state identity;
- numerical settings and software build;
- parent calculation and completion record;
- file hashes and retention policy;
- known compatible downstream uses.

A file being readable is not evidence that it is scientifically compatible. If a downstream calculation changes the Hamiltonian, charge, relativistic treatment, basis identity, or another state-defining choice, prepare a new parent state.

## Hand the reference state to target calculations

The reference state closes the common C-stage backbone and opens the D-stage branching library. Each target calculation should state which reference artifacts it consumes and which settings it changes.

A bands path, denser DOS mesh, phonon perturbation, dielectric response, Wannier construction, or EPC calculation may require additional states, bands, grids, or interpolation objects. Those are derived calculations, not silent mutations of the reference record.

Preserve the reference calculation as immutable evidence. Corrections create a new version and an explicit supersession link.

## Preserve a reference-state evidence package

A durable package should contain:

- optimized or otherwise selected fixed structure and checksum;
- model and method identity;
- candidate-state inventory and initialization rules;
- fresh and restart lineage;
- final inputs, software version, potentials or basis identity, and environment record;
- SCF histories, warnings, occupations, charge, and magnetic diagnostics;
- comparable energy table with exclusions and normalization;
- final forces and stress;
- charge-density and wavefunction hashes or retention references;
- repeated-start results;
- downstream compatibility declarations;
- unresolved alternatives and the exact claim boundary.

Retain enough raw output or provenance links to reconstruct every accepted state and every ranking decision. A single “SCF converged” line is not a reference-state record.

## What this task does not establish

This task establishes a reproducible fixed-geometry electronic reference among a declared set of candidate states. It does not establish exhaustive global electronic minimality, the lowest structural phase, dynamical or thermodynamic stability, experimental realizability, finite-temperature equilibrium, excited-state accuracy, method accuracy, or support for a scientific conclusion.

It also does not perform the later D-section target calculations. Band structures, DOS, Fermi surfaces, phonons, dielectric response, EPC, defects, transport, and other observables require their own settings, convergence evidence, and interpretation.

## Sources and methods

- [Quantum ESPRESSO `pw.x` input description](https://www.quantum-espresso.org/Doc/INPUT_PW.html)
- [VASP electronic minimization](https://vasp.at/wiki/Electronic_minimization)
- [VASP electronic ground-state properties](https://vasp.at/wiki/Electronic_ground-state_properties)
- [VASP `ISTART`](https://vasp.at/wiki/ISTART)
- [VASP `ICHARG`](https://vasp.at/wiki/ICHARG)
- [VASP `MAGMOM`](https://vasp.at/wiki/MAGMOM)
- [VASP `LCHARG`](https://vasp.at/wiki/LCHARG)
- [VASP `LWAVE`](https://vasp.at/wiki/LWAVE)
- [CP2K SCF section](https://manual.cp2k.org/trunk/CP2K_INPUT/FORCE_EVAL/DFT/SCF.html)
- [CP2K DFT section](https://manual.cp2k.org/trunk/CP2K_INPUT/FORCE_EVAL/DFT.html)
- [ABINIT basic ground-state tutorial](https://docs.abinit.org/tutorial/base1/)
- [Hohenberg and Kohn, inhomogeneous electron gas](https://doi.org/10.1103/PhysRev.136.B864)
- [Kohn and Sham, self-consistent equations](https://doi.org/10.1103/PhysRev.140.A1133)
- [Mermin, finite-temperature density-functional theory](https://doi.org/10.1103/PhysRev.137.A1441)
- [Woods, Payne, and Hasnip, SCF methods and implementation](https://doi.org/10.1088/1361-648X/ab31c0)

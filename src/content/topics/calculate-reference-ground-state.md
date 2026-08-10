---
topic_slug: calculate-reference-ground-state
status: reviewed
---

A reference-state calculation establishes the fixed-geometry electronic state, energy anchor, and reusable parent data for later work. The durable result is a verified candidate among the states actually tested, not an unqualified claim of global ground-state identity.

## Build and audit the reference state

Begin with one exact accepted geometry. Prepare a fresh static input with the final method and numerical settings, run it, inspect termination and SCF history, identify the state reached, compare plausible competitors, and preserve the accepted density/wavefunction lineage. The optimization-to-static route is common, not universal. A fixed experimental, strained, constrained, or deliberately metastable geometry may be the intended object.

Four gates remain separate. Normal program termination does not establish SCF convergence. SCF convergence does not establish ionic optimization convergence. Ionic optimization convergence does not identify the lowest relevant state. The lowest identified state is not automatically the scientifically appropriate reference state.

## Define the reference state operationally

The reference calculation is fixed-geometry and binds the exact cell/atom order, charge, spin/SOC, XC and corrections, datasets, basis/grids, Brillouin-zone sampling, occupations, electrostatic boundary, code/version, and convergence criteria. This calculation is not simply “the last SCF in the relaxation.” Use [Prepare a Fixed-Geometry Reference Calculation](/DFT-Research-Workflow/operations/calculate-reference-ground-state/guides/prepare-fixed-geometry-reference-calculation/) for exact QE input, local/HPC commands, monitoring, output checks, and next steps. Optional theory is in [Atlas Self-Consistent Field Methods](/Electronic-Structure-Learning/theory/self-consistent-field-methods/).

## Enumerate candidate electronic states

A successful SCF solution is not automatically the global electronic ground state. List plausible spin, magnetic order, SOC direction, charge, occupation, symmetry, and constrained branches before ranking. One arbitrary initialization is not a search strategy. Initial moments guide the solver toward candidate magnetic states; they do not define the final state by themselves. Use [Compare charge, spin, and magnetic candidates](/DFT-Research-Workflow/operations/calculate-reference-ground-state/guides/compare-charge-spin-and-magnetic-candidates/) for the candidate ledger.

A smearing width chosen for Brillouin-zone integration is not automatically a physical temperature. Energy values from different charges or electrostatic references are not directly ranked without a declared thermodynamic/reference construction.

## Distinguish internal SCF convergence from state verification

Read the full residual/energy history, warnings, occupations, charge, moments, and state changes. A small final residual does not identify which self-consistent basin was reached. Increasing the iteration limit does not repair an unstable state evaluator. Restart success means that a compatible stored state was accepted and the calculation completed. Compare a critical restart with a genuinely fresh initialization using [Fresh and file-initialized states](/DFT-Research-Workflow/operations/calculate-reference-ground-state/guides/compare-fresh-and-restarted-electronic-states/).

## Compare candidate energies under one common evaluator

Exclude failed, unconverged, or method-incompatible candidates before ranking. The lowest accepted candidate among the tested inventory is the current reference. That is not a universal workflow law or proof of exhaustive minimality. This same-geometry ranking answers a fixed-nuclei electronic question. For magnetostructural ordering, competing state branches may require their own relaxations before a scientifically relevant comparison.

Force and stress verification does not establish vibrational, dynamical, thermal, or thermodynamic stability. State identity should be checked from outputs, not inferred from input labels. The reference energy is a provenance anchor for one state, not a standalone physical observable.

## Repeat critical states from independent initializations

Repeat close or claim-critical candidates from independent moments, densities, occupation patterns, symmetry choices, or fresh/restart paths. Repeated convergence to one state strengthens operational robustness but still does not prove exhaustive global minimality.

## Package charge density and wavefunction lineage

Preserve exact parent input, software/version, datasets and hashes, scratch/restart compatibility, produced density/potential/wavefunction artifacts, and downstream reader requirements. A file being readable is not evidence that it is scientifically compatible. Use [Package reusable lineage](/DFT-Research-Workflow/operations/calculate-reference-ground-state/guides/package-reusable-reference-state-lineage/) before branching.

## Preserve a reference-state evidence package

Keep geometry checksum; method identity; candidate inventory and initialization rules; fresh/restart lineage; final inputs/outputs; SCF histories and warnings; charge, occupation, moment, force, and stress diagnostics; comparable energy table with exclusions; artifact hashes or retention locations; repeated-start results; and unresolved alternatives. A single “SCF converged” line is not a reference-state record.

## What this task does not establish

This task does not establish exhaustive global minimality, the lowest structural phase, physical stability, experimental realization, finite-temperature equilibrium, excited-state accuracy, method accuracy, or a scientific conclusion. The reference state closes the common C-stage backbone and opens the D-stage branching library. Each later observable needs its own execution and convergence evidence.

## Sources and methods

- [Quantum ESPRESSO `pw.x`](https://www.quantum-espresso.org/Doc/INPUT_PW.html); VASP [electronic minimization](https://vasp.at/wiki/Electronic_minimization), [ground-state properties](https://vasp.at/wiki/Electronic_ground-state_properties), [`ISTART`](https://vasp.at/wiki/ISTART), [`ICHARG`](https://vasp.at/wiki/ICHARG), [`MAGMOM`](https://vasp.at/wiki/MAGMOM), [`LCHARG`](https://vasp.at/wiki/LCHARG), and [`LWAVE`](https://vasp.at/wiki/LWAVE).
- CP2K [SCF](https://manual.cp2k.org/trunk/CP2K_INPUT/FORCE_EVAL/DFT/SCF.html) and [DFT](https://manual.cp2k.org/trunk/CP2K_INPUT/FORCE_EVAL/DFT.html); [ABINIT ground-state tutorial](https://docs.abinit.org/tutorial/base1/).
- [Hohenberg–Kohn](https://doi.org/10.1103/PhysRev.136.B864), [Kohn–Sham](https://doi.org/10.1103/PhysRev.140.A1133), [Mermin](https://doi.org/10.1103/PhysRev.137.A1441), and [SCF methods](https://doi.org/10.1088/1361-648X/ab31c0).

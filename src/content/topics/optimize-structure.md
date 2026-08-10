---
topic_slug: optimize-structure
status: reviewed
---

Structure optimization searches for a stationary candidate by updating declared atomic and, when appropriate, cell degrees of freedom. Its inputs are a credible model, a trustworthy electronic evaluator, constraints, and acceptance criteria. Its output is an exact verified geometry plus the trajectory and evidence needed to judge it—not merely the last coordinates printed.

## Follow the common route from model to accepted geometry

Inspect the starting model; declare free/fixed atomic and cell components; run the relaxation; monitor electronic and ionic steps; inspect forces, stress, displacement, state, warnings, and geometry; extract and reopen the endpoint; then run a fresh fixed-geometry energy-and-gradient check. This route is common, not universal. A fixed experimental, strained, constrained, or scanned geometry can be the intended object.

Keep four gates distinct. Normal program termination does not establish SCF convergence. SCF convergence does not establish ionic optimization convergence. Ionic optimization convergence does not identify the lowest relevant state. The lowest identified state is not automatically the scientifically appropriate reference state.

## Define the quantity and variables being optimized

A fixed-cell relaxation minimizes the electronic energy with respect to selected atomic coordinates while holding the lattice fixed. Variable-cell optimization also changes declared cell components, often using energy, enthalpy, stress, or pressure. Those are different physical problems. Empty numerical space is part of the boundary model, not a material coordinate seeking an equilibrium length. A constrained stationary point is stationary only in the active subspace.

Use [Choose relaxed degrees of freedom and constraints](/DFT-Research-Workflow/operations/optimize-structure/guides/choose-relaxed-degrees-and-constraints/) for a concrete QE route, including exact input, run, monitoring, final-coordinate extraction, visual inspection, and fresh static SCF handoff.

## Begin from physically credible starting structures

Start from one or more checked candidates that represent plausible basins, state branches, and constraints. Local optimizers normally find a nearby basin, not the global minimum of a complicated potential-energy surface. Different final basins are not failed calculations. Compare important alternatives with [Multiple starts and minima](/DFT-Research-Workflow/operations/optimize-structure/guides/compare-multiple-starts-and-minima/).

## Make forces and stress trustworthy enough to drive motion

Carry forward converged-enough datasets, basis/grid controls, k sampling, occupations, charge, spin, and boundary treatment. A total energy that appears smooth is not sufficient when force or stress noise is comparable to the intended stopping criterion. The B-stage convergence study is an initial baseline rather than a permanent certificate. Recheck gradients when geometry or state changes expose sensitivity.

## Read energy, force, stress, and displacement together

At every accepted ionic step verify electronic convergence and inspect every free Cartesian force component; inspect stress/pressure when the cell is active. Track energy or enthalpy, displacement, cell evolution, state diagnostics, warnings, and the actual stop condition. Do not interpret a state switch as ordinary optimizer noise. The [force, stress, and state guide](/DFT-Research-Workflow/operations/optimize-structure/guides/diagnose-forces-stress-and-state/) shows how to keep these evidence classes separate.

## Optimizer stopping is not proof of a physical minimum

The optimizer is a numerical strategy, not the definition of the scientific task. Hitting the maximum number of steps is program termination, not structural convergence. A stopping message means that the implemented criteria were satisfied in the active subspace, or that another termination condition was reached. Inspect the exact reason, constraints, and last accepted geometry before continuing or restarting.

## Verify the final candidate independently

After the optimizer stops, run a fresh energy-and-gradient evaluation on the exact final structure using the declared verification settings. Reopen the extracted structure and confirm atom order, cell, periodic images, constraints, active forces, relevant stress, electronic convergence, and state identity. For an interrupted run, follow [Restart and verify optimization](/DFT-Research-Workflow/operations/optimize-structure/guides/restart-and-verify-optimization/); restart continuity is not endpoint acceptance.

## Preserve an optimization evidence package

Keep source/model IDs; every start; free/fixed variables; constraints; method and datasets; numerical controls; software/environment; optimizer and stopping settings; trajectory; SCF, force, stress, displacement, state, warning, and restart histories; exact final structure and checksum; fresh verification; and unresolved metastability. A final structure alone is not a reproducible optimization result.

## What this task does not establish

Optimization does not establish the global minimum, dynamical or thermal stability, experimental realization, method accuracy, or convergence of every later observable. Optimization is not a universal prerequisite for every reference-state calculation. It also does not replace **Calculate the Reference Ground State**. Continue with a [fresh fixed-geometry reference calculation](/DFT-Research-Workflow/operations/calculate-reference-ground-state/guides/prepare-fixed-geometry-reference-calculation/).

## Sources and methods

- [Quantum ESPRESSO `pw.x`](https://www.quantum-espresso.org/Doc/INPUT_PW.html); ASE [optimization](https://docs.ase-lib.org/ase/optimize.html) and [constraints](https://docs.ase-lib.org/ase/constraints.html).
- VASP [structure optimization](https://vasp.at/wiki/Structure_optimization) and [`ISIF`](https://vasp.at/wiki/ISIF); [CP2K geometry/cell optimization](https://manual.cp2k.org/trunk/methods/optimization/geometry_and_cell_opt.html).
- [Pulay forces](https://doi.org/10.1080/00268976900100941), [first-principles stress](https://doi.org/10.1103/PhysRevB.32.3780), [FIRE](https://doi.org/10.1103/PhysRevLett.97.170201), and [basin hopping](https://doi.org/10.1021/jp970984n).

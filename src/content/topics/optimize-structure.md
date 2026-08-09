---
topic_slug: optimize-structure
status: reviewed
---

Structure optimization searches for a stationary structure of the declared energy or enthalpy model by updating selected atomic and cell degrees of freedom from one or more starting configurations. Its scientific output is not merely a final coordinate file. It is a traceable statement about which variables were allowed to change, which state evaluator supplied energies, forces, and stress, which constraints were imposed, how the optimization behaved, and what was verified after it stopped.

## Follow the common route from model to accepted geometry

Start with a named computational model and one or more physically motivated structures. Declare which atomic coordinates and cell components may move, which constraints remain active, and which electronic or magnetic state the optimizer should follow. Run the relaxation, inspect the electronic and ionic history together, and accept a geometry only after a fresh energy-and-gradient evaluation on the exact final coordinates.

The common sequence is:

```text
prepared structure and state
→ declared active degrees of freedom and constraints
→ relaxation trajectory
→ termination, SCF, force, stress, displacement, and state checks
→ accepted geometry with a stable identity
→ fresh fixed-geometry reference calculation
```

This route is common, not universal. An experimental fixed geometry, a strained or constrained structure, a deliberately scanned coordinate, or a metastable state can be the intended object. In those cases, record why the geometry is held or constrained instead of silently forcing it through a free relaxation.

Read four gates separately:

- Normal program termination does not establish SCF convergence.
- SCF convergence does not establish ionic optimization convergence.
- Ionic optimization convergence does not identify the lowest relevant state.
- The lowest identified state is not automatically the scientifically appropriate reference state.

The first two gates are checked from the current run. The third requires alternative starts or state branches when they are scientifically plausible. The fourth belongs to the reference-state audit and the intended downstream claim.

## Define the quantity and variables being optimized

Before choosing an optimizer, define the mathematical problem. A fixed-cell relaxation minimizes the electronic energy with respect to selected atomic coordinates while holding the lattice fixed. A variable-cell calculation may optimize atomic coordinates, cell shape, volume, or some restricted combination, often under a declared external pressure or stress condition.

Those are different physical problems. Relaxing a bulk crystal at zero external pressure is not equivalent to relaxing atoms inside an experimentally fixed lattice. Optimizing a strained film at a prescribed in-plane lattice constant is not equivalent to finding its free-standing equilibrium cell. A molecule in a large numerical box normally requires internal-coordinate relaxation, not optimization of the surrounding vacuum.

Record the active variables explicitly. “The structure was relaxed” is incomplete when it does not say whether atoms, volume, cell shape, selected lattice vectors, or only a subset of coordinates were allowed to move.


Fixed-cell optimization is appropriate when the lattice is a controlled condition, inherited from a substrate or experiment, already established by another calculation, or irrelevant to an isolated object placed in a numerical box. Variable-cell optimization is appropriate when equilibrium volume, lattice shape, pressure, or residual stress is part of the intended reference state.

Partial cell relaxation is often the scientifically correct middle case. A two-dimensional material may relax its in-plane lattice while retaining a chosen nonperiodic vacuum direction. A coherent interface may keep imposed lateral matching while relaxing the out-of-plane dimension and internal coordinates. A fixed-volume calculation may change shape but not density. A hydrostatic equation-of-state workflow may vary volume outside the optimizer and relax only internal coordinates at each point.

Do not allow a general cell optimizer to change a vacuum dimension merely because the code exposes that degree of freedom. Empty numerical space is part of the boundary model, not a material coordinate seeking an equilibrium length.


Fixed atoms, selective dynamics, frozen layers, fixed bond lengths, cell-shape restrictions, symmetry preservation, and collective-coordinate constraints change the optimization problem. They can represent a substrate, an experimental condition, a reaction coordinate, a rigid molecular fragment, or a deliberate screening approximation. They can also hide relaxation modes and create artificial residual forces at the constrained boundary.

Every constraint should have a physical or workflow justification and a stable identity. Record the affected atoms or components, coordinate convention, software version, and reason for the restriction. A constraint inherited from a template must not become invisible merely because it is syntactically valid.

A constrained stationary point is stationary only in the active subspace. It is not evidence that the fully unconstrained structure is a minimum.

## Begin from physically credible starting structures

Local optimizers normally find a nearby basin, not the global minimum of a complicated potential-energy surface. Starting structures with atom overlaps, unrealistic coordination, inappropriate cell shapes, or incompatible magnetic initialization can produce extreme forces, electronic failure, uncontrolled steps, or convergence to an irrelevant basin.

Inspect every starting candidate before execution. For materials with plausible polymorphs, stackings, defect reconstructions, adsorption sites, magnetic orders, or molecular conformations, prepare more than one scientifically motivated start. Preserve the parent identity and the transformation that generated each candidate.

A quick preliminary relaxation may repair a rough but meaningful model, but it should remain a separate stage with its own method and evidence. Looser preliminary settings do not automatically qualify the resulting final step as a production structure.

## Make forces and stress trustworthy enough to drive motion

An optimizer acts on forces and, for variable-cell calculations, stress. Their numerical quality depends on the electronic solver, basis or grid, pseudopotential or all-electron treatment, Brillouin-zone integration, occupations, and implementation-specific derivatives. A total energy that appears smooth is not sufficient when force or stress noise is comparable to the intended stopping criterion.

Pulay terms arise when the numerical representation changes with geometry or is incomplete. Variable-cell calculations are especially sensitive because changing the cell can change basis completeness or real-space grids and thereby introduce artificial stress or discontinuities. Force and stress convergence should therefore be tested as observables during calculation preparation, not inferred from energy convergence alone.

At every ionic step, verify that the electronic state reached the required internal criterion and that warnings, occupation changes, or failed response calculations did not contaminate the gradient. Tightening the ionic threshold without improving force quality does not create more accurate geometry.

The B-stage convergence study is an initial baseline rather than a permanent certificate. As geometry, cell, or electronic character changes, recheck the force and stress accuracy that drives motion. If stricter settings move the stationary candidate materially, repeat the affected optimization and carry the revised geometry back into convergence and reference-state checks.


Each geometry step contains an electronic-state calculation. As atoms or the cell move, the self-consistent solution may switch magnetic order, charge localization, occupation pattern, symmetry, spin direction, or another metastable electronic basin. The optimizer then sees a discontinuous or piecewise potential-energy surface.

Track state diagnostics together with energy, force, and stress. Relevant quantities may include total and local moments, charge state, band occupations, symmetry labels, Fermi-level behaviour, constrained variables, and the identity of any broken-symmetry solution. Reusing the previous density or wavefunction can improve continuity, but it may also preserve an unintended metastable state.

Do not interpret a state switch as ordinary optimizer noise. Separate branches, restart from controlled electronic initializations, or report that the geometry path does not represent one continuous state evaluator.


Conjugate-gradient, quasi-Newton, limited-memory, damped-dynamics, FIRE, and related algorithms use different histories and step controls. A method that is efficient near a smooth local minimum may fail when the starting structure is poor, the forces are noisy, or the active degrees of freedom have very different scales.

The optimizer is a numerical strategy, not the definition of the scientific task. Select it according to system size, distance from the expected basin, memory requirements, curvature, constraints, and observed force quality. Trust radii, line searches, damping, and maximum-step controls should be adjusted in response to diagnosed behaviour rather than copied as universal values.

Changing optimizer can be a valid recovery action. Preserve the transition in the optimization history instead of presenting the final segment as if one uninterrupted algorithm produced the complete path.

## Read energy, force, stress, and displacement together

Optimization progress cannot be judged from one scalar alone. Inspect at least the objective value, maximum and root-mean-square active forces, relevant stress or pressure components, maximum and representative displacements, active constraints, electronic convergence, and state identity.

Intermediate energy increases can occur during a legitimate line search, trust-region update, cell change, or recovery from a poor Hessian estimate. Conversely, a nearly constant energy can coexist with significant residual forces along a soft coordinate. A small displacement can indicate proximity to a stationary point, an over-restricted step, or a stalled optimizer.

The stopping rule should correspond to the active variables and downstream use. A fixed-cell atomic relaxation does not need a cell-stress condition to stop, but residual stress may still be a scientifically important diagnostic. A variable-cell optimization must assess the stress components that actually drive the permitted cell changes.


Repeated structures, alternating forces, growing step sizes, excessive line-search evaluations, abrupt cell changes, persistent electronic failures, or atom collisions are failure evidence. Hitting the maximum number of steps is program termination, not structural convergence.

First inspect the starting model and the quality of the state evaluator. Then examine the optimizer history, trust or step controls, constraints, cell parameterization, symmetry, and electronic restart strategy. Reducing a step size may suppress instability, but it should not hide a wrong model, discontinuous electronic state, or unconverged force.

A recovery must create a new traceable segment. Record the last accepted structure, changed settings, reason for the change, reused restart objects, and whether the scientific model remained identical.


Cell optimization couples atomic coordinates to lattice degrees of freedom and can amplify numerical discontinuities. The stress tensor must be converged for the intended cell update, and the representation should remain consistent enough that changes in basis or grid do not masquerade as physical pressure.

Inspect individual stress components rather than only a scalar pressure when shape or anisotropic strain can change. Confirm the sign and unit conventions used by the code. For slabs, wires, and layered systems, define which stress components have physical meaning under the chosen periodic boundary treatment.

A variable-cell run that reaches its internal pressure criterion still represents the chosen electronic method and external-stress condition. It does not establish a finite-temperature lattice constant, zero-point expansion, or experimental equation of state.


Long optimizations may stop because of wall time, queue policy, hardware failure, or a recoverable electronic problem. Restart from a documented accepted structure and compatible optimizer or wavefunction state. Preserve the preceding trajectory, restart files, input revision, environment identity, and reason for continuation.

Optimizer history can accelerate continuation, but it is valid only when the coordinate ordering, active degrees of freedom, constraints, calculator, and optimizer representation are compatible. When those change, begin a new segment or reconstruct only the information that remains meaningful.

Never overwrite the only copy of an incomplete path. A final coordinate file without its trajectory and restart lineage cannot show whether it came from a smooth relaxation, a state switch, a manual edit, or an unconverged last step.

## Optimizer stopping is not proof of a physical minimum

A stopping message means that the implemented criteria were satisfied in the active subspace, or that another termination condition was reached. It does not by itself prove positive curvature in all unconstrained directions, absence of a soft mode, global minimality, dynamical stability, or thermodynamic stability.

A local minimum should have small active gradients and no descending direction within the tested subspace. Vibrational or phonon analysis can reveal unstable curvature, but that belongs to later target calculations and has its own convergence requirements. Symmetry-breaking perturbations or alternative starts may reveal lower structures that the original path could not access.

Use precise language: “the optimizer satisfied the declared force and stress criteria” is stronger and more auditable than “the structure is stable.”


When the potential-energy landscape may contain competing minima, optimize several distinct starts under a consistent method and numerical protocol. Deduplicate structures only after comparing composition, cell, symmetry, atomic mapping, magnetic state, and a declared structural tolerance.

Different starts converging to the same final basin provide useful robustness evidence. Different final basins are not failed calculations. They are candidate stationary structures that require comparable reference-state calculations and later energy or stability analysis.

Do not discard a higher-energy local minimum merely because it is not the current leading candidate. It may correspond to an experimentally accessible polymorph, metastable stacking, defect reconstruction, magnetic branch, or transition intermediate. Preserve the result and the reason it was or was not promoted.


Symmetry can reduce noise and cost, but enforced symmetry also removes degrees of freedom. If the intended structure may distort, reconstruct, polarize, magnetically order, or undergo a Jahn–Teller-like instability, a symmetry-preserving optimization can remain trapped at a stationary point that is unstable to a forbidden perturbation.

Test relevant lower-symmetry starts or small physically motivated displacements. Record whether symmetry was detected, imposed, disabled, or recovered after relaxation. Turning symmetry off without a hypothesis is not a substitute for constructing meaningful perturbations.

The final symmetry is an observed property of the optimized candidate under the declared tolerance and state. It is not guaranteed by the source file or by a high-symmetry starting label.

## Verify the final candidate independently

After the optimizer stops, run a fresh energy-and-gradient evaluation on the exact final structure using the declared verification settings. Confirm the active force components, relevant stress or pressure, electronic convergence, state identity, constraints, cell, and atom ordering. This separates the final accepted geometry from optimizer-internal extrapolation, stale wavefunctions, or a loosely converged last step.

Where the production protocol is stricter than a preliminary relaxation, perform a bounded final refinement or restart and document the relationship between stages. Recheck the quantities that matter for downstream calculations; a structure intended for phonons, elastic response, small energy differences, or electron–phonon coupling may require more reliable gradients than a coarse screening geometry.

Final verification does not convert the optimized candidate into the reference ground state. That next task must establish a consistent high-quality electronic reference and compare competing states where required.

Optimization is not a universal prerequisite for every reference-state calculation. A fixed experimental, constrained, or deliberately scanned geometry may be the intended object. Conversely, if the claim concerns magnetostructural ordering, competing electronic or magnetic states may each require their own traceable relaxation rather than one shared geometry.

## Preserve an optimization evidence package

The durable output should include:

- source and computational-model identities;
- initial structure and every candidate start;
- active atomic and cell degrees of freedom;
- all constraints and symmetry treatment;
- method, potentials, basis, grids, occupations, and software version;
- optimizer, step controls, stopping criteria, and restarts;
- trajectory with energy, force, stress, displacement, and state diagnostics;
- failures, recoveries, manual interventions, and branch changes;
- final structure, checksum, and atom mapping;
- fresh final energy-and-gradient verification;
- unresolved metastability and the boundary for downstream reuse.

Keep enough raw output or provenance links to reconstruct every accepted step and every plotted diagnostic. A final structure alone is not a reproducible optimization result.

## What this task does not establish

Structure optimization establishes a bounded stationary candidate under the declared model, method, active variables, constraints, and stopping evidence. It does not establish the global minimum, dynamical or thermal stability, experimental realizability, finite-temperature equilibrium, method accuracy, numerical convergence of every later observable, or support for a scientific claim.

It also does not replace **Calculate the Reference Ground State**. The optimized structure is an input to that task, where a consistent electronic reference, competing electronic or magnetic states, and the high-quality parent data needed by later calculations must be established.

## Sources and methods

- [Quantum ESPRESSO `pw.x` input description](https://www.quantum-espresso.org/Doc/INPUT_PW.html)
- [ASE structure optimization documentation](https://docs.ase-lib.org/ase/optimize.html)
- [ASE constraints documentation](https://docs.ase-lib.org/ase/constraints.html)
- [VASP structure-optimization documentation](https://vasp.at/wiki/Structure_optimization)
- [VASP `ISIF` degrees-of-freedom documentation](https://vasp.at/wiki/ISIF)
- [CP2K geometry and cell optimization documentation](https://manual.cp2k.org/trunk/methods/optimization/geometry_and_cell_opt.html)
- [Pulay, force derivatives and equilibrium geometry](https://doi.org/10.1080/00268976900100941)
- [Nielsen and Martin, first-principles stress and forces](https://doi.org/10.1103/PhysRevB.32.3780)
- [Bitzek et al., FIRE structural relaxation](https://doi.org/10.1103/PhysRevLett.97.170201)
- [Wales and Doye, basin-hopping and multiple minima](https://doi.org/10.1021/jp970984n)

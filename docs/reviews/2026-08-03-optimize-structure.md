# Optimize the Structure — scientific, execution, source, and media review

## Scope

This review covers the researcher-scale topic:

> C · Reference-State Calculations → Optimize the Structure

and four subordinate implementation guides:

- Choose Relaxed Degrees of Freedom and Constraints;
- Diagnose Forces, Stress, and Electronic-State Continuity;
- Restart and Verify a Structural Optimization;
- Compare Multiple Starts and Metastable Minima.

The topic consolidates the useful structure-optimization meaning of migration sources O13, O14, and O20 without restoring those identifiers as parallel reader-facing operations. Path and transition-state optimization remain under the later D4 target-calculation topics.

The decision is **reviewed within the declared educational and execution scope**.

## Scientific definition

The overview correctly defines structure optimization as a basin-dependent search for a stationary candidate under a declared energy or enthalpy evaluator, active atomic and cell variables, constraints, symmetry treatment, and stopping evidence.

It preserves the following distinctions:

- fixed-cell atomic relaxation, restricted-cell relaxation, volume or shape optimization, and full variable-cell optimization solve different problems;
- a vacuum direction is normally a numerical boundary variable rather than a material lattice coordinate;
- constraints create a stationary point only in the active subspace;
- optimizer termination is not proof of a physical local minimum;
- a verified local minimum candidate is not proof of the global minimum;
- a stationary candidate is not evidence of dynamical, thermal, or thermodynamic stability;
- an optimized geometry is an input to Calculate the Reference Ground State, not a substitute for that task.

The article does not prescribe a universal force, stress, pressure, displacement, energy, step-size, trust-radius, electronic, or iteration threshold.

## Source review

The reviewed source set is:

- Quantum ESPRESSO `pw.x` input description: https://www.quantum-espresso.org/Doc/INPUT_PW.html
- ASE structure optimization: https://docs.ase-lib.org/ase/optimize.html
- ASE constraints: https://docs.ase-lib.org/ase/constraints.html
- VASP structure optimization: https://vasp.at/wiki/Structure_optimization
- VASP `ISIF`: https://vasp.at/wiki/ISIF
- CP2K geometry and cell optimization: https://manual.cp2k.org/trunk/methods/optimization/geometry_and_cell_opt.html
- Pulay force-derivative theory: https://doi.org/10.1080/00268976900100941
- Nielsen and Martin stress and force theory: https://doi.org/10.1103/PhysRevB.32.3780
- FIRE structural relaxation: https://doi.org/10.1103/PhysRevLett.97.170201
- Basin hopping and multiple minima: https://doi.org/10.1021/jp970984n

The official code documentation supports the implementation-sensitive distinctions among atomic and cell degrees of freedom, constraints, force and stress criteria, optimizer behaviour, trajectories, restarts, and local-minimum scope. The primary papers support force and stress derivatives, one representative relaxation algorithm, and the distinction between local relaxation and broader basin exploration.

No one code is treated as the definition of structure optimization. Code-specific keywords are examples of how the researcher-scale problem is implemented.

Semantic source support, time-bounded link reachability, rendered-link presence, software execution, structural convergence, and physical validity remain independent evidence classes.

## Overview coverage

The overview addresses:

- the optimized objective and active variables;
- fixed-cell, full-cell, and restricted-cell protocols;
- constraints and symmetry as model assumptions;
- physically credible starting structures;
- numerical quality of forces and stress, including Pulay effects;
- feedback from geometry or state changes to the B-stage numerical baseline;
- continuity of electronic, magnetic, charge, occupation, and symmetry state;
- optimizer choice, trust, damping, and line-search behaviour;
- coupled energy, force, stress, displacement, and electronic diagnostics;
- stalls, oscillations, large steps, and maximum-iteration termination;
- variable-cell stress and boundary interpretation;
- restart lineage and compatibility;
- optimizer stopping versus local-minimum evidence;
- multiple starting structures and metastability;
- symmetry-breaking tests;
- fresh final energy-and-gradient verification;
- the durable optimization evidence package;
- the boundary to Calculate the Reference Ground State.

The organization is natural to the subject and does not restore a visible Inputs/Outputs-style contract.

## Executable evidence

Current declared companion bindings are:

- `examples/practical-guides/silicon_qe_relax.py` for the degrees/constraints and
  force-history guides;
- `examples/practical-guides/silicon_qe_restarts.py` for the restart guide;
- `examples/practical-guides/optimization_multiple_starts.py` for multiple starts.

The earlier ASE degrees/constraints, synthetic-history, and ASE restart scripts
are conceptual teaching fixtures, not declared companions for the first three
pages. The scripts calculate no electronic energy with a DFT code and call no
first-principles electronic-structure engine; that statement applies to those
fixtures and the retained multiple-start companion, not to provenance claimed
for stored QE outputs.

The two QE reconstruction scripts check only exact hashes, literal markers, and
parsed quantities. `silicon_qe_relax.py` checks one input/output pair, five energy
and total-force rows, and a lower final force. `silicon_qe_restarts.py` checks four
output hashes, completion markers, two relaxation-segment messages, and equal
printed energy for a separate fresh/restart pair. Neither executes QE or validates
state continuity, stress, constraints, input compatibility, or restart objects.

Execution success is not structural convergence for a real calculation. None of
those checks establishes a local or global minimum for a real calculation, force
or stress accuracy, DFT convergence, physical stability, or scientific support.

### Silicon execution addendum (2026-08-04)

Three guides bind stored QE 7.5 fixed-cell Silicon outputs, including a BFGS
continuation for an intentionally displaced two-site CC0 COD 9013102 cell.
The first segment deliberately reaches its two-step limit; the compatible
`restart_mode='restart'` continuation reports `End of BFGS Geometry Optimization`.
The relaxation reconstruction verifies one input/output identity and five reported
force rows; the restart reconstruction verifies output hashes, marker strings, and
the segment boundary. It does not validate a constrained or variable-cell
implementation, compare independent structures or electronic states, establish
force/stress convergence, or prove a physical minimum.

## Media review

The four displayed SVGs are original project diagrams:

- active atomic and cell degrees of freedom;
- coupled force, stress, displacement, and state diagnostics;
- restart, continuation, and fresh verification lineage;
- multiple starts descending to distinct local basins.

Every asset is declared in `workflow/practical-guide-media.json` with a stable ID, guide binding, repository path, creation date, original-media reuse basis, caption, and alt text.

They are conceptual diagrams, not plots of calculated data.

No official-manual screenshot, publisher figure, GUI asset, licensed potential, or unpublished result was copied.

## Interface review

The existing practical-page collection and generic static route are reused. The Optimize the Structure parent page will expose four restrained static cards. Every child page contains selectable code or text, explicit tested versions, an execution-script path, exact source links, one original diagram, and an evidence boundary.

The pages remain readable without client-side JavaScript. Browser validation must cover desktop and 390-pixel layouts, rendered sources, media alt text, parent-child links, and no-JavaScript content before merge.

## Deliberate exclusions

This optimization review does not validate the separate reference-state task,
real VASP or CP2K runs, a cell-relaxation implementation, any transferable force
or stress threshold, vibrational proof of a minimum, global-search completeness,
phase or target-property ranking, finite-temperature lattice effects, licensed
potentials, or private calculation data.

## Evidence boundary

Semantic source review establishes that the educational article and guides accurately describe the cited concepts and implementations within their stated scope. Link auditing establishes only time-bounded source reachability. Browser smoke establishes public rendering and layout. Python execution establishes only the declared stored-output hash/marker/parsing checks and the multiple-start fixture logic; conceptual ASE/history snippets are not execution evidence.

None of those checks establishes structural convergence, a local or global minimum, reference-ground-state identity, physical stability, method accuracy, transferability, or scientific support for any real DFT study.

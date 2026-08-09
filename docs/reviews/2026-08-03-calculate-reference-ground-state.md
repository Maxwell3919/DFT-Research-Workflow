# Calculate the Reference Ground State — scientific, execution, source, and media review

## Scope

This review covers the researcher-scale topic:

> C · Reference-State Calculations → Calculate the Reference Ground State

and four subordinate implementation guides:

- Prepare a Fixed-Geometry Reference Calculation;
- Compare Fresh and Restarted Electronic States;
- Compare Charge, Spin, and Magnetic Candidates;
- Package a Reusable Reference-State Lineage.

The topic consolidates the useful reference-state meaning of migration sources O13 and O20 and the former ground-state SCF, high-accuracy static, and initial-result routes without restoring those identifiers as parallel reader-facing operations.

The decision is **reviewed within the declared educational and execution scope**.

## Scientific definition

The overview correctly defines the reference ground state as a reproducible fixed-geometry electronic reference selected from an explicitly prepared and verified candidate set under one declared Hamiltonian, boundary model, occupation protocol, and numerical representation.

It preserves these distinctions:

- one converged SCF solution and exhaustive global ground-state identity;
- an optimized geometry and the final fixed-geometry electronic reference;
- method continuity and a declared method change;
- a fresh electronic start and a continuation from stored charge density or wavefunctions;
- internal solver convergence and verification of charge, occupation, symmetry, and magnetic state;
- one raw total energy and a comparable, normalized candidate-state table;
- fixed-geometry electronic ordering and state-specific magnetostructural ordering;
- one fixed-charge ranking and a separate charged-state thermodynamic framework;
- reusable electronic artifacts and scientifically compatible downstream reuse;
- the C-stage reference state and later D-stage target-property calculations.

The article does not prescribe a universal SCF residual, energy tolerance, iteration count, smearing width, magnetic seed, number of bands, number of candidate states, or number of fresh starts.

## Source review

The reviewed source set is:

- Quantum ESPRESSO `pw.x` input description: https://www.quantum-espresso.org/Doc/INPUT_PW.html
- VASP electronic minimization: https://vasp.at/wiki/Electronic_minimization
- VASP electronic ground-state properties: https://vasp.at/wiki/Electronic_ground-state_properties
- VASP `ISTART`: https://vasp.at/wiki/ISTART
- VASP `ICHARG`: https://vasp.at/wiki/ICHARG
- VASP `MAGMOM`: https://vasp.at/wiki/MAGMOM
- VASP `LCHARG`: https://vasp.at/wiki/LCHARG
- VASP `LWAVE`: https://vasp.at/wiki/LWAVE
- CP2K SCF section: https://manual.cp2k.org/trunk/CP2K_INPUT/FORCE_EVAL/DFT/SCF.html
- CP2K DFT section: https://manual.cp2k.org/trunk/CP2K_INPUT/FORCE_EVAL/DFT.html
- ABINIT basic ground-state tutorial: https://docs.abinit.org/tutorial/base1/
- Hohenberg–Kohn theorem: https://doi.org/10.1103/PhysRev.136.B864
- Kohn–Sham equations: https://doi.org/10.1103/PhysRev.140.A1133
- Mermin finite-temperature DFT: https://doi.org/10.1103/PhysRev.137.A1441
- SCF methods and implementation review: https://doi.org/10.1088/1361-648X/ab31c0

Official code documentation supports fixed-geometry self-consistent calculations, fresh and restarted electronic-state choices, occupations, magnetization initialization and diagnostics, charge-density and wavefunction output, and code-specific completion controls. The primary papers support the ground-state density-functional framework, the self-consistent Kohn–Sham construction, finite-temperature electronic occupations, and the numerical character of SCF algorithms.

No one code is treated as the definition of a reference ground state. Implementation controls illustrate the researcher-scale task.

Semantic support, time-bounded link reachability, rendered-link presence, script execution, SCF convergence, candidate-state completeness, physical validity, and reuse rights remain independent evidence classes.

## Overview coverage

The overview addresses:

- operational reference-state identity;
- fixed geometry and method continuity;
- an independent final fixed-geometry calculation;
- candidate electronic-state enumeration;
- fresh starts and continuations;
- occupations and electronic temperature;
- charge and electrostatic boundaries;
- spin, magnetization, noncollinearity, and spin–orbit branches;
- internal SCF convergence and state verification;
- oscillation, stagnation, charge sloshing, and false convergence;
- comparable candidate-energy ranking;
- force and stress verification;
- post-convergence state identity;
- reference-energy normalization;
- repeated independent initializations;
- charge-density and wavefunction lineage;
- handoff to D-stage target calculations;
- the durable reference-state evidence package;
- explicit exclusions and scientific boundaries.

The organization is natural to the subject and does not restore a fixed Inputs/Outputs-style article contract.

## Executable evidence

Current declared companion bindings are:

- `examples/practical-guides/silicon_qe_convergence.py` for fixed-geometry
  preparation and lineage packaging;
- `examples/practical-guides/silicon_qe_restarts.py` for fresh/restart comparison;
- `examples/practical-guides/reference_state_candidate_comparison.py` for the
  charge/spin/magnetic candidate fixture.

The earlier protocol-continuity, synthetic fresh/restart, and lineage-manifest
modules remain conceptual teaching support; they are not declared execution
evidence for those three pages. The scripts calculate no electronic energy with
a DFT code and call no electronic-structure engine; that statement applies to
those conceptual modules and the candidate-table companion.

The candidate script filters explicit charge, evaluator, normalization,
completion, and state-label fields and ranks two accepted fixture rows. It does
not encode geometry or a charged-state thermodynamic potential.
`silicon_qe_convergence.py` verifies expected output hashes, marker strings, and
parsed energies; it does not inspect inputs or construct a lineage manifest.
`silicon_qe_restarts.py` verifies four output hashes, marker strings, equal printed
fresh/restart energies, and two relaxation-segment messages; it does not inspect
input compatibility, restart data, or state identity.

Execution success is not reference-ground-state verification for a real calculation.
None of those checks establishes global ground-state identity for a real calculation,
candidate completeness, SCF convergence, force/stress accuracy, physical stability,
method accuracy, transferability, or scientific support.

### Silicon execution addendum (2026-08-04)

Three guides use stored outputs recorded as QE 7.5 evidence for the fixed two-site
COD 9013102 Silicon cell. The reconstruction checks nine SCF output hashes,
electronic-convergence and `JOB DONE` strings, and reported energies. A separate
fresh/restart pair has matching printed total energy (`-22.83943950 Ry`), but the
script does not verify the inputs or electronic state. The package contains no
charge density or wavefunction and establishes no candidate comparison,
observable convergence, compatible restart execution, or ground state.

## Media review

The four displayed SVGs are original project diagrams:

- continuity from optimized geometry to a final fixed-geometry protocol;
- fresh and restarted state lineages;
- comparable candidate-state filtering and bounded ranking;
- reusable reference-state artifact lineage.

Every asset is declared in `workflow/practical-guide-media.json` with a stable ID, guide binding, repository path, creation date, original-media reuse basis, caption, and alt text.

They are conceptual diagrams, not plots of calculated data.

No manual screenshot, publisher figure, GUI asset, licensed potential, wavefunction, charge-density file, or unpublished result was copied.

## Interface review

The existing practical-page collection and generic static route are reused. The parent topic will expose four restrained static cards. Each child page contains selectable text or code, a tested-version declaration, an execution-script path, exact source links, one original diagram, and an evidence boundary.

The pages remain readable without client-side JavaScript. Browser validation must cover desktop and 390-pixel layouts, rendered sources, media alt text, parent-child links, and no-JavaScript content before merge.

## Deliberate exclusions

This reference-state review does not validate real VASP, CP2K, or ABINIT runs;
one-SCF global-ground-state identity; exhaustive magnetic, charge, occupation,
geometry, or symmetry enumeration; a transferable SCF or initialization
threshold; D-stage target calculations; licensed potential contents; restart
payloads; private hosts; or unpublished calculation trees.

## Evidence boundary

Semantic source review establishes that the educational article and guides accurately describe the cited concepts and implementations within their stated scope. Link auditing establishes only time-bounded source reachability. Browser smoke establishes public rendering and layout. Python execution establishes only the current companion scripts' stored-output checks and bounded candidate-table logic; conceptual continuity and manifest snippets are not execution evidence.

None of those checks establishes a real reference ground state, exhaustive global ground-state identity, SCF convergence, force or stress accuracy, physical stability, method accuracy, transferability, or scientific support for any real DFT study.

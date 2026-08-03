# Equation of State and Structural Phase Stability — scientific, execution, source, and media review

## Scope

This review covers:

> D1 · Energetics and Stability → Equation of State and Structural Phase Stability

and three subordinate pages:

- Design a Traceable Energy–Volume Series;
- Fit and Challenge an Equation of State;
- Compare Phase Enthalpies at Common Pressure.

The decision is **reviewed within the declared educational and execution scope**. The batch does not change the A–E or D1–D5 registry and does not restore a retired ontology as reader-facing navigation.

## Scientific review

The overview correctly separates:

- scalar volume from the deformation and relaxation path used to reach it;
- one continuous structural/electronic branch from a phase or state switch;
- raw sampled energies from an analytic EOS fit and its derivatives;
- equilibrium volume, bulk modulus, and pressure derivative from the full elastic tensor;
- a common-pressure enthalpy crossing from an `E(V)` intersection at common volume;
- equilibrium phase selection from metastability, hysteresis, barriers, and kinetics;
- positive hydrostatic curvature from mechanical and dynamical stability;
- static electronic energy from finite-temperature Gibbs free energy;
- numerical, fit, phase-set, and method uncertainty.

Every displayed equation defines its symbols, normalization, units, purpose, and assumptions. The article prescribes no universal point count, volume range, pressure range, cutoff, k mesh, smearing, force threshold, stress threshold, fit form, or uncertainty tolerance.

Convex-hull stability, elastic tensors, phonons, anharmonicity, reaction paths, and finite-temperature sampling remain separate topics. They appear only where needed to state what an EOS can and cannot establish.

## Source review

- Birch is the primary finite-strain source for the Birch equation family.
- Murnaghan is the primary source for the pressure-dependent compressibility form bearing that name.
- Vinet et al. is the primary source for the Vinet compression equation.
- Mouhat and Coudert directly establishes why mechanical stability requires the full symmetry-appropriate elastic conditions rather than one bulk modulus.
- ASE officially documents the supported EOS fit forms, returned equilibrium volume/energy/bulk modulus, and native bulk-modulus units.
- VASP officially documents fixed-volume relaxation, EOS fitting, and numerical discontinuities from basis and FFT-grid changes.
- Phonopy officially documents volume-indexed quasiharmonic free energies and the pressure-volume term.
- IUPAC defines enthalpy as internal energy plus pressure times volume.

All eight URLs returned live official pages or recognized primary DOI redirects during the pre-write check. Reachability, semantic support, and the article synthesis remain distinct evidence classes.

Reviewed source records:

- https://doi.org/10.1103/PhysRev.71.809
- https://doi.org/10.1073/pnas.30.9.244
- https://doi.org/10.1029/JB092iB09p09319
- https://doi.org/10.1103/PhysRevB.90.224104
- https://docs.ase-lib.org/ase/eos.html
- https://vasp.at/wiki/Volume_relaxation
- https://phonopy.github.io/phonopy/qha.html
- https://goldbook.iupac.org/terms/view/H02752

## Practical execution review

The three scripts are deterministic teaching fixtures:

- `eos_sampling_protocol.py` filters one invented A2B2 volume series by composition, charge, evaluator, relaxation policy, completion, and electronic-state identity, then verifies that the accepted sampled minimum is bracketed.
- `eos_fit_sensitivity.py` generates invented Birch–Murnaghan data with deterministic perturbations and compares Birch–Murnaghan, Murnaghan, and Vinet fits over full and narrow windows through ASE 3.29.0.
- `eos_phase_enthalpy.py` minimizes two invented analytic phase branches at common pressure, converts GPa through the pinned ASE unit constant, and locates one synthetic enthalpy crossing.

The scripts use Python 3.12 and, for fit/unit implementation, pinned ASE 3.29.0. They execute no DFT code and ingest no material data. Their volumes, energies, moduli, pressure, and transition point are invented fixtures, not recommendations or scientific results.

Execution success is not EOS convergence for a real calculation. It verifies only ledger filtering, minimum bracketing, fit invocation, unit conversion, fit-form/window comparison, analytic enthalpy minimization, and crossing logic. It does not establish a real equilibrium volume, bulk modulus, pressure calibration, phase transition, mechanical or dynamical stability, finite-temperature boundary, or material conclusion.

## Media review

Three SVGs are original conceptual diagrams created for this repository:

- a state-continuous energy–volume sampling ledger;
- sampled points challenged by several analytic curves and windows;
- two phase enthalpy branches compared at common pressure.

They are conceptual diagrams, not plots of calculated data. No publisher figure, manual screenshot, proprietary interface, or licensed asset was copied.

## Validation boundary

Repository validation, source audits, deterministic fixture execution, Astro build, responsive browser checks, no-JavaScript checks, Hosted CI, and exact-SHA Pages smoke can establish the implemented pages and declared fixture logic. They do not establish any real EOS, DFT convergence, pressure-induced transition, thermodynamic or kinetic stability, experimental realization, method accuracy, or scientific conclusion.

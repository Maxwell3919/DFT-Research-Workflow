# Surface Energy and Work Function — scientific, execution, source, and media review

## Scope

This review covers:

> D1 · Energetics and Stability → Surface Energy and Work Function

and three subordinate pages:

- Build a Surface-Energy Ledger and Diagnose Bulk Drift;
- Extract Side-Specific Work Functions from a Potential Profile;
- Compare Published Si Surface Energies and Work Functions.

The decision is **reviewed within the declared educational and execution scope**. The batch changes neither the A–E/D1–D5 registry nor stable public routes.

## Scientific review

The overview correctly separates:

- orientation from termination, reconstruction, stoichiometry, adsorbates, defects, strain, charge, and environment;
- raw slab energy from a surface excess per area;
- a symmetric two-face value from an asymmetric sum of two unknown face energies;
- stoichiometric static surface energy from an open-reservoir surface grand potential;
- cleavage energy, unrelaxed surface energy, and relaxed surface energy;
- SCF convergence from convergence of slab thickness, vacuum, energy subtraction, and potential plateau;
- compatible bulk subtraction from a small slope mismatch that grows with slab size;
- an ideal polar termination from a physically compensated surface;
- a dipole correction from a surface-compensation mechanism;
- one Fermi energy from two possible side-specific vacuum levels;
- a field-free vacuum plateau from a boundary value on a sloped potential;
- metallic work function from semiconductor ionization potential, electron affinity, doping, and band-bending questions;
- equilibrium Wulff shape from kinetic growth morphology;
- a clean-vacuum calculation from an experimentally prepared or environment-covered surface;
- a real published-data comparison from a rerun or independent validation of its underlying calculations.

Every displayed equation defines its symbols, unit or normalization, purpose, and assumptions. No universal slab thickness, vacuum, k mesh, cutoff, smearing, force threshold, dipole setting, reconstruction set, or agreement tolerance is prescribed.

## Source review

- Fiorentini and Methfessel provide the simultaneous slab-series slope/intercept route for convergent surface energies.
- Boettger identifies nonconvergence from inconsistent bulk and film energy references.
- Bengtsson supplies the primary periodic-slab dipole-correction method.
- Tasker establishes the electrostatic distinction that makes ideal polar ionic surfaces problematic.
- Herring provides the equilibrium relation between orientation-dependent surface free energy and crystal shape.
- Reuter and Scheffler demonstrate chemical-potential-dependent atomistic thermodynamics for RuO₂(110).
- Lin and co-workers review work-function definition, calculation, measurement, engineering, and applications.
- Derry, Kern, and Worth critically compile clean-metal surface work functions and their experimental specificity.
- Choudhary and Garrity provide the CC BY 3.0 InterMat surface dataset and the published Si Table 1 values used by the worked example.
- VASP and GPAW official documentation support implementation-specific potential averaging, side-specific plateaus, and dipole-correction diagnostics.

Reviewed source records:

- https://doi.org/10.1088/0953-8984/8/36/005
- https://doi.org/10.1103/PhysRevB.49.16798
- https://doi.org/10.1103/PhysRevB.59.12301
- https://doi.org/10.1088/0022-3719/12/22/036
- https://doi.org/10.1103/PhysRev.82.87
- https://doi.org/10.1103/PhysRevB.65.035406
- https://doi.org/10.1103/PhysRevApplied.19.037001
- https://doi.org/10.1116/1.4934685
- https://doi.org/10.1039/D4DD00031E
- https://vasp.at/wiki/Computing_the_work_function
- https://gpaw.readthedocs.io/tutorialsexercises/electrostatics/dipole_correction/dipole.html

Every URL was visited before writing through the primary DOI resolver, publisher record, or official documentation. Semantic support, resolver or page reachability, licence, rendered links, script execution, and scientific validity remain separate evidence classes.

## Practical execution review

`surface_energy_ledger.py` uses four invented symmetric-slab rows. It verifies one-face area, two-face normalization, eV Å⁻² to J m⁻² conversion, a simultaneous energy-versus-atom-count fit, and thickness drift caused by a deliberately perturbed bulk slope.

`work_function_potential.py` generates an analytic invented planar potential with two exactly flat vacuum windows and one Fermi energy. It verifies window means, plateau spans, and two side-specific subtractions. It does not parse electronic-structure output.

`intermat_si_surfaces.py` reads a frozen 3-row public-data snapshot, verifies exact source DOI, CC BY 3.0 label, JARVIS identity, Miller order, and published OptB88vdW values, records the snapshot hash, computes two descriptive mean absolute differences, and creates an original plot. The repository does not claim to have rerun the underlying InterMat calculations.

The first two scripts execute no DFT code and ingest no material data. The third post-processes published values but also executes no electronic-structure code. Execution success is not surface or work-function convergence for a real calculation. It does not establish a real surface energy, work function, reconstruction, termination ordering, electrostatic boundary, experimental match, method accuracy, or scientific conclusion.

## Media review

Three SVGs are generated locally by the companion scripts:

- one conceptual plot of invented thickness drift and a fitted surface intercept;
- one conceptual plot of an invented asymmetric planar potential and two vacuum plateaus;
- one original paired-dot plot of real published InterMat Si calculation and experimental values.

The first two are conceptual plots of invented data. The Si plot is a derived visualization of numerical facts from an open-access CC BY 3.0 table, with DOI, method, material ID, state scope, access date, licence, and non-rerun boundary preserved in the snapshot and page. No publisher figure, table layout, manual screenshot, proprietary input, potential file, or private calculation was copied.

## Validation boundary

Repository validation, source audits, deterministic execution, Astro build, responsive browser checks, no-JavaScript checks, Hosted CI, and exact-SHA Pages smoke can establish the implemented pages, fixture arithmetic, frozen transcription, and rendering. They cannot establish a real slab's convergence, a lowest reconstruction, polar compensation, equilibrium morphology, surface free energy, work function, experimental surface identity, emission or catalytic property, or accuracy of the underlying method.

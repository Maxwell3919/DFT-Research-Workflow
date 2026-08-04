---
topic_slug: choose-dft-method-and-computational-setup
status: reviewed
---

A computational model says what system a calculation is meant to represent. The method and setup say which approximate electronic problem will be solved for that model. These are different decisions. A carefully built slab can still answer the wrong question if its electrostatics, spin treatment, exchange–correlation approximation, or electron count are inconsistent with the intended physics.

This task establishes a **versioned method identity** and a defensible starting setup. It does not prove that the numerical parameters are converged. Cutoffs, grids, k-point densities, basis sizes, smearing widths, vacuum dimensions, and other controls must later be tested against the quantity that the study intends to report.

## Begin with the scientific comparison

Method selection should start from the comparison or claim, not from a familiar input file. State which systems, states, or observables must be compared and which physical effects could change that comparison.

A conventional ground-state Kohn–Sham calculation for fixed nuclei and a fixed electron number is not the only possible problem. A study may instead require a charged state, constrained magnetization, finite electronic temperature, fixed chemical potential, applied field, dielectric environment, or another defined ensemble. These choices determine which quantity is variational and which energy or thermodynamic potential can be compared.

The method specification should therefore identify:

- the electronic theory and approximation being used;
- the electron-number or chemical-potential condition;
- the spin and relativistic degrees of freedom;
- any interaction corrections or external environment;
- the electron–ion and core treatment;
- the numerical representation in which the problem is solved;
- the electrostatic boundary treatment;
- the software implementation and version;
- the reference calculations that must remain method-compatible.

A method is suitable only within a declared purpose. Success for equilibrium lattice constants does not automatically establish accuracy for band gaps, magnetic energy differences, adsorption, defect charge transitions, van der Waals binding, phonons, or electron–phonon coupling.

## Separate the physical approximation from its discretization

Some setup decisions define the approximate Hamiltonian or energy functional. Others define how that approximation is represented numerically.

Choosing a semilocal or hybrid exchange–correlation functional, adding a Hubbard correction, including spin–orbit coupling, selecting a dispersion model, changing the core–valence partition, or changing electrostatic boundary conditions modifies the physical approximation. These changes can alter the limiting result even after every numerical parameter is converged.

Choosing a plane-wave cutoff, real-space grid spacing, number of local orbitals, k-point mesh, FFT grid, or convergence threshold controls discretization and numerical error within the selected approximation. Increasing these controls should approach a method-specific limit; it does not repair an inappropriate physical approximation.

The two categories interact. A hybrid functional introduces exact-exchange sampling and cutoffs that a semilocal calculation does not have. A harder pseudopotential requires a different basis resolution. Spin–orbit coupling changes wavefunction character and symmetry. The setup must expose these dependencies while leaving the quantitative convergence proof to **Test Numerical Convergence**.

## Choose exchange–correlation treatment by the physics and error

The exchange–correlation approximation is part of the scientific model. Labels such as LDA, GGA, meta-GGA, hybrid, or nonlocal functional identify broad families, not a universal accuracy ranking.

PBE is a constraint-based generalized-gradient approximation. SCAN is a meta-GGA constructed to satisfy additional exact constraints and appropriate norms. Screened hybrids such as HSE mix a specified amount of short-range exact exchange with semilocal exchange and correlation. These examples differ in ingredients, computational cost, known strengths, and characteristic errors.

A formally higher rung is not automatically better for every observable or material. A method may improve one property while worsening another, and apparently good agreement may result from cancellation between errors. Metallic screening, localized states, magnetism, weak interactions, self-interaction, structural energetics, and response properties can place different demands on the functional.

Record the exact functional identity rather than a broad family name. For hybrids, include the exact-exchange fraction, range-separation or screening parameter, and implementation. For composed functionals, record exchange and correlation components. When a code permits a user-defined or library functional, preserve the functional identifiers and library version.

Functional choice should be supported by relevance to the target property, prior benchmarks where available, and sensitivity tests when the conclusion could change. Benchmarking is not the same as selecting whichever method happens to agree with one desired number.

## Define the core and valence treatment

Electron–ion treatment determines which electrons are represented explicitly and how the rapidly varying all-electron problem near nuclei is handled.

All-electron methods retain an explicit treatment of core and valence states within their own basis and partitioning schemes. Pseudopotential methods replace the chemically inert core region with an effective interaction for the valence states. Norm-conserving and ultrasoft pseudopotentials impose different construction conditions. The projector augmented-wave method uses augmentation data to connect smooth auxiliary wavefunctions with all-electron-like partial-wave information.

These categories are not interchangeable file formats. The setup includes:

- the pseudopotential or PAW dataset identity and checksum, or the all-electron basis definition;
- the generating exchange–correlation functional;
- the valence configuration and frozen-core partition;
- inclusion or exclusion of semicore states;
- scalar-relativistic or fully relativistic generation;
- nonlinear core correction and other generation choices;
- the dataset format and version;
- evidence about transferability for the chemical environments being studied.

A pseudopotential file being readable does not establish its accuracy or transferability. Suggested cutoffs are starting information, not a convergence result. Two datasets for the same element may represent different valence spaces and cannot be substituted silently in a comparative study.

Method compatibility also matters. Some implementations support particular response functions, meta-GGAs, exact exchange, spin–orbit coupling, or higher derivatives only for certain core treatments. Quantum ESPRESSO, for example, supports norm-conserving, ultrasoft, and PAW data but documents feature-specific restrictions. The available implementation must be checked before a production protocol is designed.

## Choose a numerical representation that can express the method

Plane waves, localized orbitals, augmented-wave bases, finite elements, and real-space grids are different representations of the electronic problem. Each has its own completeness controls, conditioning, boundary assumptions, and code-specific approximations.

A plane-wave setup is defined by more than an orbital cutoff. Charge-density grids, augmentation charges, exact-exchange cutoffs, reciprocal-space sampling, and pseudopotential hardness may introduce separate controls. A localized-orbital setup must identify basis functions, confinement, polarization functions, numerical radial grids, and possible basis-set superposition effects. A real-space representation must identify the grid, domain, boundary treatment, and discretization order.

The representation should support the intended method and observable. A basis adequate for total-energy ordering may be inadequate for stress, unoccupied states, response functions, core-sensitive quantities, or weak energy differences. The family and meaning of each control are chosen here; the values are accepted only after observable-specific convergence tests.

Comparisons should not mix representations casually. Cross-code agreement is meaningful only when the physical approximation, core treatment, electron count, spin state, boundary conditions, and numerical accuracy are made genuinely comparable.

## Decide which spin and relativistic degrees of freedom are active

A non-spin-polarized calculation constrains the electronic state differently from a collinear spin-polarized calculation. Noncollinear magnetism allows the magnetization direction to vary in space, and spin–orbit coupling couples spin and orbital degrees of freedom. Scalar-relativistic and fully relativistic core treatments are also distinct.

The setup should state whether the calculation is:

- non-spin-polarized;
- collinear spin-polarized;
- noncollinear without spin–orbit coupling;
- noncollinear with spin–orbit coupling;
- constrained to a total or local magnetization;
- based on scalar-relativistic or fully relativistic electron–ion data.

Initial magnetic moments and spin directions help select a starting basin, but they are not evidence that the final state is the magnetic ground state. The candidate magnetic patterns belong to model construction; the electronic degrees of freedom and relativistic Hamiltonian belong to method setup; comparing converged magnetic states belongs to later calculations and validation.

Spin–orbit coupling should not be added only during the final band plot when it can alter the relaxed geometry, magnetic anisotropy, Fermi surface, band inversion, phonons, or energy ordering relevant to the claim. Conversely, its cost does not justify including it without checking whether the chosen core data, functional, symmetry treatment, and target calculation support it consistently.

## Treat DFT+U as a defined extension, not a generic repair

DFT+U modifies the approximate energy functional for selected localized subspaces. A reported value of \(U\) or \(J\) is incomplete without the definition of those subspaces, projectors, occupation matrices, double-counting convention, and underlying exchange–correlation functional.

The effective interaction can depend on oxidation state, coordination, volume, screening environment, projector construction, and the method used to determine it. Linear-response approaches are explicitly tied to a definition of the localized occupation. A value transferred between codes, pseudopotentials, projector choices, or chemically different sites is therefore not automatically equivalent.

Record:

- which atoms and angular-momentum manifolds receive the correction;
- the projector or localized-orbital definition;
- the \(U\), \(J\), or effective-\(U\) convention;
- the double-counting and rotational form;
- how the parameters were obtained;
- whether site-dependent values are used;
- the initial occupation or magnetic candidates when relevant.

DFT+U is not a universal elemental constant and not a knob to force a preferred gap or magnetic state. Its effect on structural, energetic, electronic, vibrational, and response properties must be treated as a method dependence. Reference calculations used in energy differences must apply compatible definitions.

## Include dispersion and other long-range interactions deliberately

Semilocal exchange–correlation approximations do not provide one universal treatment of long-range dispersion. Pairwise corrections, environment-dependent atom-based models, many-body dispersion, and nonlocal van der Waals density functionals use different physical approximations.

The original vdW-DF construction introduces nonlocal correlation through a density-dependent kernel. DFT-D, Tkatchenko–Scheffler, many-body dispersion, XDM, and related approaches add or model dispersion differently. They are not interchangeable switches and should not be combined without checking double counting and compatibility with the base functional.

Record the complete combination: base exchange–correlation functional, dispersion method, damping or range parameters, many-body terms, and implementation version. A geometry optimized with one dispersion treatment is method-dependent; it should not be silently reused as though it were a method-neutral structure.

Long-range treatment may also include dielectric embedding, continuum solvation, external fields, exact exchange, screened interactions, or other environment models. Each modifies the physical problem and must be stated separately from numerical convergence settings.

## Distinguish electron number, occupations, smearing, and temperature

The model's nominal charge and the electronic ensemble must be connected to the implemented electron number. A charged periodic cell may invoke a compensating background or another electrostatic convention. A fixed-electron calculation and a fixed-chemical-potential calculation minimize different thermodynamic quantities.

Occupations also have several roles. For an insulator, fixed occupations may represent the intended zero-temperature state. For metals, Brillouin-zone integration may use smearing or a tetrahedron method. Quantum ESPRESSO, for example, distinguishes fixed occupations, multiple tetrahedron schemes, Gaussian-type smearings, and explicit occupations, with method-specific restrictions for forces and dynamics.

A smearing width used to stabilize metallic integration is not automatically a physical electronic temperature. If Fermi–Dirac occupations are used as a finite-temperature Mermin-DFT ensemble, the reported quantity must distinguish internal energy, entropy contribution, free energy, electron temperature, and chemical potential. If smearing is only a numerical integration device, its residual effect on the target observable must later be tested and extrapolated or bounded as appropriate.

The setup should therefore record electron count or charge, occupation method, smearing kernel, width or electronic temperature, number of bands, and which energy expression is used for comparison. The acceptable values and k-point coupling remain a convergence problem, not a universal default.

## Match electrostatic boundary treatment to the model

Many solid-state codes solve Poisson's equation under three-dimensional periodic boundary conditions. A molecule, isolated charged object, asymmetric slab, gated layer, or two-dimensional material may require additional treatment because vacuum alone does not remove all periodic electrostatic interactions.

Possible implementations include dipole corrections, effective-screening media, isolated-system corrections, compensating backgrounds, Coulomb-kernel truncation, and boundary-specific Poisson solvers. Ismail-Beigi's truncation method, for example, removes selected periodic-image interactions for confined systems rather than merely increasing the cell size.

The boundary method must match the model's dimensionality, net charge, dipole, applied field, and intended environment. Record the periodic directions, electrostatic kernel or correction, reference potential, neutralization convention, field or electrode condition, and any restrictions on cell shape or geometry.

A correction name is not enough. Implementations may change total energies, potentials, forces, stress, eigenvalue alignment, or the thermodynamic potential in different ways. Compatibility with relaxation, phonons, response, hybrid functionals, and charged calculations must be checked in the chosen code. Residual cell-size dependence remains a later convergence and validation question.

## Keep reference calculations method-compatible

Energy differences are meaningful only when the compared calculations share a compatible method definition. Formation energies, adsorption energies, defect energies, magnetic energy differences, phase rankings, and interface binding energies can be corrupted when references use inconsistent core partitions, functionals, dispersion treatments, spin constraints, \(U\) definitions, relativistic treatments, or electrostatic conventions.

Compatibility does not always mean identical numerical cells or k-point meshes. It means that differences required by the physical models are deliberate while avoidable method changes are excluded or quantified. An isolated atom, molecule, bulk solid, slab, and charged defect may require different boundary or spin settings, but the relation between those settings must be part of the reference scheme.

When methods cannot be made identical, the study should state the mismatch and test its effect rather than hiding it behind a common label such as “PBE” or “PAW.” A functional name alone does not identify the complete calculation.

## Respect implementation and feature compatibility

Scientific methods are implemented through specific software versions, data files, libraries, and code paths. A method described in a paper may be incomplete, approximate, or unavailable in a particular code and version. Certain combinations may be unsupported even when each option exists separately.

Official input documentation should be checked for:

- valid combinations of functional, core treatment, and response method;
- support for noncollinear magnetism and spin–orbit coupling;
- Hubbard-projector definitions and syntax;
- exact-exchange and dispersion implementations;
- occupation methods allowed for forces, dynamics, or density of states;
- isolated, slab, charged, field, and grand-canonical boundary options;
- known restrictions involving symmetry, grids, stress, or derivatives.

A parser accepting the input does not prove that the intended method was executed. Preserve warnings, code-reported method summaries, and data-file metadata. A successful program exit establishes neither methodological suitability nor numerical convergence.

## Record the setup as a versioned method identity

The setup should be reconstructable without relying on a human-readable input file alone. Record at least:

- scientific target and reference scheme;
- electronic theory, functional, and all extension parameters;
- electron number, charge, ensemble, occupations, and smearing interpretation;
- spin, magnetization constraints, and relativistic treatment;
- electron–ion/core data identities, checksums, valence partitions, and generation metadata;
- basis or grid family and all active numerical controls;
- dispersion, electrostatic, field, solvent, or environment treatments;
- software name, version, relevant libraries, and feature restrictions;
- the relation between model candidates and method variants;
- which quantities still require convergence or robustness tests.

This record distinguishes a deliberate method variation from an accidental setup drift. It also makes clear which comparisons are valid and which results belong to different approximations.

## Use method context to guide later choices and feedback

Method context is carried forward rather than isolated in a separate framework. The chosen functional, core treatment, occupations, boundary conditions, and implementation determine which structural models, reference states, target calculations, and validation tests are meaningful. Conversely, a convergence, state-identity, or validation failure can require a return to this setup and a newly identified method variant.

Record that return explicitly: say which assumption changed, which calculations are no longer directly comparable, and which observable must be retested. This keeps a branching research workflow legible without treating a software option or a single material example as a universal prescription.

## The result of this task

The task is complete when each model or comparison has a coherent, reconstructable method specification whose physical approximations, electronic degrees of freedom, core treatment, representation, occupations, boundaries, and implementation are explicit.

Completion does not mean that the setup is numerically sufficient. It does not establish a stable structure, a ground state, an accurate band gap, a converged energy difference, or a supported scientific claim. The next task, **Test Numerical Convergence**, varies the relevant controls and tests the intended observable against declared tolerances. Method alternatives that could change the conclusion remain part of later robustness validation.

There is no universal best functional, pseudopotential library, all-electron method, code, basis, cutoff, k-point mesh, smearing width, Hubbard parameter, or boundary correction. The defensible choice is the one whose assumptions and errors are appropriate for the question and whose numerical limit and robustness are demonstrated.

## Sources and methods

- [Quantum ESPRESSO 7.5: `pw.x` input description](https://www.quantum-espresso.org/Doc/INPUT_PW.html)
- [Quantum ESPRESSO pseudopotential resources and implementation notes](https://pseudopotentials.quantum-espresso.org/)
- [Quantum ESPRESSO Unified Pseudopotential Format](https://pseudopotentials.quantum-espresso.org/home/unified-pseudopotential-format)
- [Perdew, Burke, and Ernzerhof, “Generalized Gradient Approximation Made Simple”](https://doi.org/10.1103/PhysRevLett.77.3865)
- [Sun, Ruzsinszky, and Perdew, “Strongly Constrained and Appropriately Normed Semilocal Density Functional”](https://doi.org/10.1103/PhysRevLett.115.036402)
- [Heyd, Scuseria, and Ernzerhof, “Hybrid functionals based on a screened Coulomb potential”](https://doi.org/10.1063/1.1564060)
- [Blöchl, “Projector augmented-wave method”](https://doi.org/10.1103/PhysRevB.50.17953)
- [Troullier and Martins, “Efficient pseudopotentials for plane-wave calculations”](https://doi.org/10.1103/PhysRevB.43.1993)
- [van Setten et al., “The PseudoDojo: Training and grading a 85 element optimized norm-conserving pseudopotential table”](https://doi.org/10.1016/j.cpc.2018.01.012)
- [Cococcioni and de Gironcoli, linear-response Hubbard parameters](https://doi.org/10.1103/PhysRevB.71.035105)
- [Dion et al., “Van der Waals Density Functional for General Geometries”](https://doi.org/10.1103/PhysRevLett.92.246401)
- [Mermin, “Thermal Properties of the Inhomogeneous Electron Gas”](https://doi.org/10.1103/PhysRev.137.A1441)
- [Methfessel and Paxton, “High-precision sampling for Brillouin-zone integration in metals”](https://doi.org/10.1103/PhysRevB.40.3616)
- [Ismail-Beigi, “Truncation of periodic image interactions for confined systems”](https://doi.org/10.1103/PhysRevB.73.233103)

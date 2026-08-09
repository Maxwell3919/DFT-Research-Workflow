---
topic_slug: choose-dft-method-and-computational-setup
status: reviewed
---

This task produces the method sheet that every later input, output, and comparison must match. It answers a practical question: **which physical approximation and implementation will be used, and how will another researcher identify exactly the same setup?**

Before a production calculation, create a small method record beside the inputs:

~~~bash
mkdir -p method/pseudo
cp selected.UPF method/pseudo/
sha256sum method/pseudo/* > method/pseudopotentials.sha256
head -n 80 method/pseudo/selected.UPF
grep -Ei 'functional|valence|relativ|cutoff|wavefunction|density' method/pseudo/selected.UPF
~~~

<code>sha256sum</code> fixes the file identity. <code>head</code> and <code>grep</code> expose whatever metadata that particular file makes readable; they do not establish transferability or accuracy. Record absent fields as unknown rather than inferring them from a filename.

Use a plain-text sheet that travels with the calculation:

~~~text
scientific question and target observable:
model and reference comparison:
electronic theory and exact functional:
charge or electron-number condition:
spin, magnetization, and relativistic treatment:
pseudopotential or all-electron dataset, source, valence, checksum:
basis or grid family:
occupations and smearing interpretation:
dispersion, Hubbard, field, solvent, or boundary treatment:
software, version, libraries, and known feature restrictions:
parameters still requiring numerical convergence:
~~~

Prepare a representative input, run it, and compare the program-reported setup with this sheet:

~~~bash
pw.x -in scf.in > scf.out
grep -Ei 'program pwscf|exchange-correlation|pseudo|cutoff|k points|occupation|smearing|spin' scf.out
grep "JOB DONE" scf.out
~~~

The first <code>grep</code> only locates version-dependent setup summaries for inspection. The second checks normal program termination only. A successful program exit establishes neither methodological suitability nor numerical convergence.

This task establishes a **versioned method identity** and a defensible starting setup. It does not accept cutoffs, k meshes, smearing widths, vacuum dimensions, or response grids; those require observable-specific tests.

## Begin with the scientific comparison

Write the comparison before selecting software options. Identify the systems or states being compared, the observable needed, the required precision, and the physical effects that could change the answer.

Choose the electronic ensemble deliberately: fixed electron number, charged state, fixed chemical potential, constrained magnetization, finite electronic temperature, applied field, or another defined condition. Record which energy or thermodynamic potential is comparable. A setup that is valid for an equilibrium lattice constant is not automatically valid for a band gap, adsorption energy, defect charge transition, magnetic ordering, phonon, or electron–phonon observable.

## Separate the physical approximation from its discretization

Functional, Hubbard correction, dispersion model, core–valence partition, spin–orbit coupling, ensemble, and electrostatic boundary treatment define the approximate physical problem. Cutoffs, basis size, real-space grids, k meshes, FFT grids, and solver thresholds control its numerical representation.

Increasing these controls should approach a method-specific limit; it does not repair an inappropriate physical approximation. Change one category intentionally: refinement at fixed method identity is numerical convergence, while changing the Hamiltonian or boundary model is a robustness branch.

## Choose exchange–correlation treatment by the physics and error

Record the exact functional, not only a family such as GGA or hybrid. For a hybrid, include the exact-exchange fraction, range-separation or screening parameter, and implementation. For a composed or library functional, preserve component identifiers and library version.

A formally higher rung is not automatically better for every observable or material. Choose using relevance to the target property, known failure modes, available benchmarks, and sensitivity tests when the conclusion could change. Agreement with one desired number is not a method-selection rule.

## Define the core and valence treatment

Obtain the dataset from an identified source and preserve the exact file. Record its generating functional, explicit valence configuration, frozen-core partition, semicore choice, relativistic treatment, nonlinear core correction where present, format, version, checksum, and any recommended starting cutoffs.

A pseudopotential file being readable does not establish its accuracy or transferability. A library cutoff is a starting point, and two datasets for the same element cannot be exchanged silently when their valence spaces or generation choices differ.

Check that the selected functional and requested feature are compatible with the dataset and implementation. Response functions, meta-GGAs, spin–orbit coupling, exact exchange, forces, and higher derivatives may impose additional restrictions.

## Choose a numerical representation that can express the method

Name every active completeness control. A plane-wave calculation may require wavefunction, charge-density, augmentation, and exact-exchange cutoffs. A localized basis requires orbital identities, ranges, polarization functions, confinement, and integration grids. A real-space method requires domain, spacing, boundary conditions, and discretization order.

Choose the control family here, but accept its value only after testing the target quantity. Energy convergence ≠ force convergence, and a basis adequate for occupied-state energy ordering may be inadequate for stress, unoccupied states, response, or weak differences.

## Decide which spin and relativistic degrees of freedom are active

State whether the calculation is non-spin-polarized, collinear, noncollinear, constrained, scalar relativistic, or fully relativistic with spin–orbit coupling. Preserve starting moments and directions as input choices and inspect the final moments and state identity in the output.

Initial magnetic moments and spin directions help select a starting basin, but they are not evidence that the final state is the magnetic ground state. Compare all relevant converged candidates later with a common evaluator. Include spin–orbit coupling consistently wherever it can change the geometry, ordering, Fermi surface, phonons, or target claim.

## Treat DFT+U as a defined extension, not a generic repair

Record the corrected atoms and manifolds, projector definition, $U$, $J$, or effective-$U$ convention, double-counting and rotational form, parameter source, and initial occupation candidates. Preserve these fields with every reference calculation.

DFT+U is not a universal elemental constant and not a knob to force a preferred gap or magnetic state. Changing projectors, pseudopotentials, oxidation state, coordination, or code can change the meaning of the parameter and therefore defines a method variation.

## Include dispersion and other long-range interactions deliberately

Record the base functional, dispersion model, damping or range parameters, many-body terms, and implementation version. Pairwise corrections, environment-dependent models, many-body dispersion, and nonlocal correlation use different approximations. They are not interchangeable switches and should not be combined without checking compatibility and double counting.

Fields, solvation, dielectric embedding, screened exchange, and other environment models also change the physical problem. Keep them in the method sheet rather than hiding them among numerical controls.

## Distinguish electron number, occupations, smearing, and temperature

Record charge or electron count, occupation method, smearing kernel, width and units, number of bands, and the energy expression used for comparison. For a metal, smearing or tetrahedra serve a Brillouin-zone integration purpose; for a finite-temperature ensemble, occupations also define a physical electron temperature and thermodynamic potential.

A smearing width used to stabilize metallic integration is not automatically a physical electronic temperature. Its residual effect must be tested together with the k mesh. An integration treatment suitable for DOS is not automatically appropriate for forces, dynamics, or optimization.

## Match electrostatic boundary treatment to the model

State periodic directions, cell shape, net charge, dipole, neutralization convention, Coulomb kernel or correction, reference potential, and any applied field or environment. Vacuum alone may not remove long-range periodic interactions in a molecule, charged defect, asymmetric slab, or two-dimensional material.

Changing from a periodic kernel to truncation, dipole correction, effective screening, or another Poisson solver changes the method identity. At fixed boundary method, residual cell-size dependence remains a numerical convergence problem.

## Keep reference calculations method-compatible

Before comparing energies or response quantities, check that avoidable method changes are absent. Functionals, core partitions, dispersion, spin constraints, Hubbard definitions, relativistic treatment, charge convention, and boundary model must be compatible across the reference cycle.

Different physical objects can require different cells or spin states, but those differences must be declared. When an exact match is impossible, quantify the mismatch rather than hiding it under a common label such as <code>PBE</code> or <code>PAW</code>.

## Respect implementation and feature compatibility

Read the official documentation for the exact software version. Confirm that the requested combination supports the needed forces, stress, relaxation, phonons, response, noncollinearity, Hubbard projectors, exact exchange, dispersion, occupations, boundary correction, and symmetry treatment.

After the representative run, inspect warnings and the code-reported method summary. A parser accepting an input does not prove that the intended method was executed.

## Record the setup as a versioned method identity

The method sheet is accepted when it identifies:

- the scientific target and reference scheme;
- theory, functional, and extension parameters;
- charge, ensemble, occupations, spin, and relativity;
- exact electron–ion or all-electron datasets and checksums;
- basis or grid family and active numerical controls;
- dispersion, electrostatic, field, solvent, and environment treatments;
- software, version, libraries, and feature restrictions;
- method-compatible references;
- every quantity still awaiting convergence or robustness testing.

Compare the sheet with the input, the exact data files, and the output summary. Any mismatch returns to setup before a larger sweep begins.

## The result of this task

The result is a reconstructable method identity, not a claim that the calculation is accurate or converged. The next task varies numerical controls at fixed method identity and accepts settings only against a declared observable and tolerance.

There is no universal best functional, pseudopotential library, all-electron method, code, basis, cutoff, k-point mesh, smearing width, Hubbard parameter, or boundary correction. The defensible choice is bounded by the scientific question, implementation, convergence evidence, and robustness tests.

## Sources and methods

- [Quantum ESPRESSO 7.5: <code>pw.x</code> input description](https://www.quantum-espresso.org/Doc/INPUT_PW.html)
- [Quantum ESPRESSO pseudopotential resources and implementation notes](https://pseudopotentials.quantum-espresso.org/)
- [Quantum ESPRESSO Unified Pseudopotential Format](https://pseudopotentials.quantum-espresso.org/home/unified-pseudopotential-format)
- [Perdew, Burke, and Ernzerhof, generalized-gradient approximation](https://doi.org/10.1103/PhysRevLett.77.3865)
- [Sun, Ruzsinszky, and Perdew, SCAN](https://doi.org/10.1103/PhysRevLett.115.036402)
- [Heyd, Scuseria, and Ernzerhof, screened hybrid functionals](https://doi.org/10.1063/1.1564060)
- [Blöchl, projector augmented-wave method](https://doi.org/10.1103/PhysRevB.50.17953)
- [Troullier and Martins, norm-conserving pseudopotentials](https://doi.org/10.1103/PhysRevB.43.1993)
- [van Setten et al., PseudoDojo](https://doi.org/10.1016/j.cpc.2018.01.012)
- [Cococcioni and de Gironcoli, linear-response Hubbard parameters](https://doi.org/10.1103/PhysRevB.71.035105)
- [Dion et al., nonlocal van der Waals density functional](https://doi.org/10.1103/PhysRevLett.92.246401)
- [Mermin, finite-temperature density-functional theory](https://doi.org/10.1103/PhysRev.137.A1441)
- [Methfessel and Paxton, metallic Brillouin-zone integration](https://doi.org/10.1103/PhysRevB.40.3616)
- [Ismail-Beigi, truncation of periodic image interactions](https://doi.org/10.1103/PhysRevB.73.233103)

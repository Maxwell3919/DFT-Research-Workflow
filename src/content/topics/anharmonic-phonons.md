---
topic_slug: anharmonic-phonons
status: reviewed
---

Anharmonic phonon calculations ask how the harmonic normal modes of one declared reference state interact, shift, and acquire finite lifetimes. They are needed when a harmonic spectrum alone cannot represent temperature-dependent frequencies, linewidths, thermal expansion, or a strongly unstable parent structure. They do not turn a finite-temperature calculation into proof that a phase is synthesizable, nor do they by themselves calculate lattice thermal conductivity; transport is the neighbouring topic.

## Inspect the configurations and the temperature-dependent spectrum

Begin with a qualified harmonic parent and name the target: a renormalized frequency, linewidth, spectral function, free-energy difference, or transport input. Choose a perturbative force-constant route, a temperature-dependent effective-potential route, or a self-consistent/stochastic route according to that target. Open representative displaced structures or sampled configurations before fitting; check atom mapping, displacement amplitudes, symmetry, collisions, and whether the set actually explores the degrees of freedom claimed by the model.

Calculate forces with one compatible method, fit the declared order and range, and compare predicted forces with configurations withheld from the fit. Then inspect temperature-dependent dispersions, spectral functions, linewidths, and their mode character rather than accepting one scalar residual or a smooth curve. Converge the target against supercell or q coverage, displacement amplitude, force accuracy, integration treatment, temperature sampling, and included interaction order. Routes through Phono3py, ALAMODE, TDEP, and self-consistent methods are indexed under [lattice dynamics](/DFT-Research-Workflow/operations/resource-landscape/#lattice-dynamics); this overview does not claim an executed anharmonic run.

A concrete [Phono3py](/DFT-Research-Workflow/tools/phono3py/) start retains the trusted primitive and supercell definitions, generated displacement metadata such as `phono3py_disp.yaml`, every matched force calculation, and the assembled second- and third-order force constants such as `fc2.hdf5` and `fc3.hdf5`. Count the expected configurations before submitting forces, inspect several displaced structures in [VESTA](/DFT-Research-Workflow/tools/vesta/), and compare fitted with withheld forces before opening linewidth, self-energy, or temperature-dependent spectrum output. If force files are missing, atom ordering changes, residuals are localized by mode or configuration, or the result changes strongly with cutoff/order, stop at the force-constant model; do not proceed to a smooth spectrum merely because the fitter terminated.

## The quantity beyond the harmonic model

Expanding the Born--Oppenheimer energy in displacements $u$ gives a harmonic term with second-order force constants $\Phi^{(2)}$, then cubic and quartic terms $\Phi^{(3)}$ and $\Phi^{(4)}$:

$$
E = E_0
+ \frac{1}{2}\sum \Phi^{(2)}u^2
+ \frac{1}{3!}\sum \Phi^{(3)}u^3
+ \frac{1}{4!}\sum \Phi^{(4)}u^4
+ \cdots .
$$

Every sum is over atom, Cartesian, and lattice indices. $E_0$ is the energy of the declared reference structure. $\Phi^{(3)}$ couples three displacement coordinates and permits three-phonon processes; $\Phi^{(4)}$ contributes to frequency renormalization and four-phonon processes. These tensors are derivatives at a specified structural, electronic, magnetic, charge, boundary, and numerical state. They are not transferable labels attached to a chemical formula.

The harmonic frequencies and eigenvectors provide the basis in which an anharmonic self-energy is expressed. Its real part shifts a mode frequency and its imaginary part gives a model-dependent linewidth or lifetime. A linewidth is not a band width, numerical smearing, or an experimental resolution. A calculated lifetime also does not become a thermal conductivity until group velocities, occupations, scattering channels, reciprocal-space sampling, and a transport equation are declared and converged.

## Constructing higher-order force constants

Finite-displacement routes evaluate forces for a symmetry-reduced set of singly and multiply displaced supercells, then fit $\Phi^{(2)}$, $\Phi^{(3)}$, and sometimes $\Phi^{(4)}$. The displacement set, supercell, force accuracy, fitting model, interaction range, symmetry treatment, and any cutoff together define the result. Regression residuals alone do not demonstrate that a truncation is physically adequate: omitted long-range or higher-order interactions can change the target linewidth or renormalized spectrum without producing an obvious local fitting failure.

Perturbative DFPT routes can obtain selected higher derivatives without enumerating the same supercells, but retain their own response, q-grid, electronic-state, and implementation conditions. Never combine a harmonic model from one cell or Hamiltonian with cubic terms from another merely because their formulas look compatible. Long-range electrostatics, Born charges, dielectric data, sum-rule treatment, occupations, and reference geometry must remain coherent with the harmonic parent.

## Perturbation theory and self-consistent effective phonons answer different questions

At weak anharmonicity, a perturbative self-energy evaluated from harmonic modes can describe a frequency shift and a scattering rate subject to the chosen order and conservation treatment. It can fail when the parent harmonic model has large unstable regions, near-degenerate modes, or shifts comparable to the unperturbed frequencies. A self-consistent phonon or stochastic effective-potential method instead seeks a temperature-dependent effective harmonic model. It can stabilize an effective finite-temperature spectrum, but this is still conditional on the sampled ensemble, fitted order, quantum or classical statistics, and numerical convergence.

Thus a positive renormalized frequency at one temperature is not the same proposition as a zero-temperature harmonic local minimum. A temperature-dependent effective spectrum also is not automatically a free-energy ranking of phases: phase comparison requires compatible free-energy calculations for every competing state and a declared thermodynamic ensemble.

## Conservation, phase space, and linewidth interpretation

For a three-phonon event, reciprocal momentum is conserved up to a reciprocal lattice vector $\mathbf G$, schematically $\mathbf q\pm\mathbf q'=\mathbf q''+\mathbf G$; energy conservation is imposed with frequencies from the chosen model. A finite reciprocal mesh replaces exact conservation with an integration procedure. Its broadening or tetrahedron-like treatment is a numerical approximation to a delta function, not an observed lifetime. Refining that treatment, the q mesh, force-constant range, and electronic calculations can alter both phase space and matrix elements.

Selection rules, branch character, avoided crossings, polar corrections, isotope or boundary scattering assumptions, and temperature all alter what a reported linewidth means. A smooth temperature curve can still be wrong if it was produced with an inadequate force-constant model or reciprocal sampling. Retain the fitted force constants or input force/displacement data, symmetry operations, cell definitions, mesh and integration settings, frequency convention, temperature grid, and the exact transformation from self-energy to any plotted quantity.

## Failure modes and evidence boundary

Small displacements can be overwhelmed by force noise, while large ones can leave the derivative regime. Symmetry reduction can be invalidated by an inconsistent magnetic or structural state. Fitting only cubic terms may be insufficient where quartic renormalization matters. Treating an imaginary harmonic frequency as a small real number before applying a perturbative formula is not a valid repair. None of these issues is diagnosed merely by a completed executable or a visually smooth dispersion.

Converge the observable that motivates the calculation: a selected temperature-dependent frequency, a linewidth, a spectral function, a free-energy difference, or a later transport input. The relevant variables include the reference state, electronic and response accuracy, displacement/force data, supercell or q coverage, force-constant order and range, fitting conditioning, reciprocal integration, polar treatment, and temperature sampling. No universal displacement, supercell, interaction cutoff, q mesh, frequency broadening, or force threshold follows from the method.

An adequately documented anharmonic calculation can support a conditional statement about the declared effective spectrum or interaction model. It does not independently establish phase equilibrium, experimental linewidths, thermal conductivity, electron--phonon coupling, superconductivity, kinetic persistence, or a material conclusion. The next topic turns appropriately validated scattering information into lattice-transport modelling; it must not inherit an unverified linewidth as if it were an accepted transport result.

## Sources and methods

- [Esfarjani and Stokes, extraction of anharmonic force constants](https://doi.org/10.1103/PhysRevB.77.144112)
- [Li et al., first-principles phonon lifetimes and spectral functions](https://doi.org/10.1103/PhysRevB.84.054303)
- [Errea et al., weak-to-strong anharmonic phonon calculation](https://doi.org/10.1103/PhysRevB.91.054304)
- [Phono3py overview](https://phonopy.github.io/phono3py/)
- [Phono3py force-set and force-constant workflow](https://phonopy.github.io/phono3py/workflow.html)
- [Phono3py API reference](https://phonopy.github.io/phono3py/api-reference.html)
- [Quantum ESPRESSO PHonon package structure](https://www.quantum-espresso.org/Doc/ph_user_guide/node5.html)

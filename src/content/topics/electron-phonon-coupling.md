---
topic_slug: electron-phonon-coupling
status: reviewed
---

Electron--phonon coupling (EPC) describes how a specified lattice vibration changes the electronic Hamiltonian and thereby couples electronic states. It is not a single material constant. The result depends on the electronic and vibrational reference states, carrier condition, temperature, reciprocal-space sampling, electrostatic boundary treatment, and the observable being constructed.

A phonon calculation supplies the normal modes and their perturbations. EPC adds the response of the electronic states to those perturbations. Superconductivity, transport, and spectral renormalization are later uses of that information, each with additional assumptions and convergence requirements.

## Inspect the coupled electronic and vibrational objects

Do not begin with $\lambda$. First open the electronic bands or Fermi surface and the phonon dispersion for the same state. Inspect the modes and q regions that enter the intended observable, including any imaginary branch, polar small-q behaviour, or narrow Fermi-surface feature. Calculate EPC matrix elements on a declared coarse k--q representation, then compare interpolated electronic bands, phonons, and selected coupling values directly with their coarse-grid parents before integrating on dense meshes.

For a superconducting or mechanism claim, view phonon linewidths or mode/q-resolved coupling together with $\alpha^2F(\omega)$ and the cumulative $\lambda(\omega)$ integral. For transport, inspect the state- and momentum-resolved scattering object rather than only an averaged lifetime. These plots reveal where a scalar originates but do not establish convergence. Vary k mesh, q mesh, smearing or delta treatment, interpolation, bands, carrier state, and long-range reconstruction for the actual reported quantity. Preserve unresolved imaginary modes and missing q-point evidence as blockers. Major EPW, Perturbo, DFPT, and interpolation routes are indexed under [lattice dynamics](/DFT-Research-Workflow/operations/resource-landscape/#lattice-dynamics) and [specialist tools](/DFT-Research-Workflow/operations/resource-landscape/#specialist-tools).

One executable ecosystem is [Quantum ESPRESSO](/DFT-Research-Workflow/tools/quantum-espresso/) plus [Wannier90](/DFT-Research-Workflow/tools/wannier90/) plus [EPW](/DFT-Research-Workflow/tools/epw/). Its operational object chain is: accepted metallic SCF -> compatible uniform NSCF/wavefunctions -> complete coarse-q `ph.x` dynamical and perturbation data -> Wannier inputs and localization outputs -> direct-versus-interpolated band/phonon/matrix-element checks -> dense k-q integration -> linewidths or $\alpha^2F(\omega)$ -> cumulative $\lambda(\omega)$ and the target observable. The QE PHonon guide also documents a direct coarse/dense k integration route for interaction coefficients; it is a separate implementation choice, not a shortcut around k, q, broadening, and low-frequency convergence.

Before writing an EPC input, make a stage ledger that declares the cell, pseudopotential, method, charge/spin/SOC state, `prefix`, code versions, k/q meshes, filenames, and hashes that are intended to be compatible. Then inspect the actual save directories, stdout/stderr, q inventory, Wannier windows, and direct/interpolated comparisons. Declared compatibility and matching filenames do not by themselves prove historical ancestry or scientific acceptance. A missing q point, unresolved imaginary mode, unavailable perturbation file, incompatible save tree, failed Wannier window, or unvalidated interpolation is a stop condition.

This site currently has no retained end-to-end EPC execution that produces a real matrix-element set, $\alpha^2F$, or $\lambda$. Therefore this topic maps the required objects and official tool routes but does not provide copy-ready EPW parameters or a synthetic result. Start with the harmonic-phonon practical guide and the installed-version QE/EPW/Wannier90 official tutorials; preserve the first real workflow only when every parent and convergence gate is inspectable.

## The matrix element is the primitive quantity

For an initial state $\lvert n\mathbf{k}\rangle$, a final state $\lvert m,\mathbf{k}+\mathbf{q}\rangle$, and phonon branch $\nu$, the coupling is commonly written

$$
g_{mn\nu}(\mathbf k,\mathbf q)
= \left\langle
u_{m,\mathbf k+\mathbf q}
\middle|
\Delta_{\mathbf q\nu}v^{\mathrm{KS}}
\middle|
u_{n,\mathbf k}
\right\rangle_{\mathrm{uc}}.
$$

Here $u_{n\mathbf k}$ and $u_{m,\mathbf k+\mathbf q}$ are cell-periodic Kohn--Sham states, while $\Delta_{\mathbf q\nu}v^{\mathrm{KS}}$ is the first-order change in the self-consistent Kohn--Sham potential produced by the normalized phonon mode. The matrix element is an amplitude for one electronic transition induced by one vibrational perturbation.

That distinction matters. A matrix element is not yet a scattering rate, linewidth, self-energy, transport coefficient, coupling constant $\lambda$, or superconducting transition temperature. Those quantities are constructed by combining many channels with occupations, energy conservation, phonon frequencies, reciprocal-space weights, and an observable-specific averaging rule.

The normalization convention must also be preserved. Mode eigenvectors, atomic masses, cell choice, phase, and electronic gauge can change intermediate representations. A physically meaningful comparison therefore uses either the same conventions or a final observable that is invariant under the allowed transformations.

## From a matrix element to an observable

Fermi's golden rule combines $|g_{mn\nu}(\mathbf k,\mathbf q)|^2$ with occupations and energy-conserving factors. Phonon linewidths, electronic self-energies, transport rates, and superconducting averages use different weights and answer different questions.

For a metal, the interaction can be averaged over the Fermi surface. The Eliashberg spectral function $\alpha^2F(\omega)$ resolves this Fermi-surface-weighted interaction by phonon frequency. A common dimensionless coupling is then

$$
\lambda
= 2\int_0^\infty
\frac{\alpha^2F(\omega)}{\omega}\,d\omega .
$$

A large local $|g|$ does not guarantee a large total $\lambda$: phase space, density of states, phonon frequency, band and momentum weights, and the chosen electronic window also enter. Conversely, a single reported $\lambda$ does not reveal which modes, bands, or regions of the Fermi surface produced it. Preserve mode-, momentum-, or frequency-resolved information when the mechanism matters.

## Comparable inputs and dense reciprocal space

DFPT can evaluate phonon perturbations and EPC matrix elements on a coarse, explicitly declared k--q representation. Many observables require much denser integration because the relevant states may occupy narrow regions near a Fermi surface or band edge. A smooth band or phonon interpolation is therefore only an intermediate requirement; the final observable must be converged on the dense integration grid.

Wannier--Fourier interpolation is one controlled route from coarse first-principles data to dense k and q meshes. It introduces its own choices: orbital projections, disentanglement and frozen windows, localization, real-space cutoffs, gauge continuity, and treatment of long-range terms. Validate the interpolated electronic bands, phonons, and selected EPC quantities against direct coarse-grid data before relying on the dense result.

The electronic and phonon meshes form a coupled sampling problem. Refining only one mesh, changing only the smearing, or plotting a visually smooth $\alpha^2F(\omega)$ can hide unresolved Fermi-surface or small-q sensitivity. Convergence should be demonstrated for the quantity that will be interpreted downstream.

$\lambda$ convergence is not $T_c$ convergence. A superconducting inference additionally depends on the qualified normal state, the full low-frequency spectrum, $\omega_{\log}$, Coulomb treatment, and the selected transition-temperature solver.

## Keep the reference state and electrostatics consistent

The ground-state Hamiltonian, pseudopotential or all-electron treatment, exchange--correlation model, spin and SOC state, cell, carrier condition, occupations, phonon eigenvectors, and electrostatic boundary model must remain compatible across the chain.

This is especially important in polar and reduced-dimensional systems. Long-range Fröhlich-like contributions near $\mathbf q\to0$ require an explicit separation and reconstruction rather than being treated as an ordinary short-range interpolation error. Vacuum size, Coulomb truncation, dielectric environment, doping model, and dimensional normalization can all change the intended observable.

An intrinsic insulator, a doped semiconductor, and a metal obtained by shifting the Fermi level are not automatically equivalent EPC problems. State how carriers are introduced and which electronic state enters the Fermi-surface or band-edge average.

## Converge the observable, not the file sequence

Select the convergence target before running the dense calculation. Depending on the study, it may be a matrix element, phonon linewidth, electronic self-energy, mode-resolved coupling, $\alpha^2F(\omega)$, total $\lambda$, carrier scattering rate, or an input to a later transport or superconductivity calculation.

Relevant tests can include:

- electronic and phonon meshes and their relative commensurability;
- bands, energy windows, and Fermi-surface resolution;
- occupations, smearing, and delta-function treatment;
- phonon and Wannier interpolation;
- long-range small-q reconstruction;
- carrier density, temperature, and electronic-state definition;
- cell size, vacuum, and dimensional normalization.

No universal k mesh, q mesh, smearing width, empty-band count, or interpolation window certifies EPC across materials.

## What the result can support

Preserve the declared and verified stage relationships: parent ground-state record, DFPT perturbations, k and q meshes and weights, phonon and electronic conventions, matrix-element normalization, interpolation inputs, carrier or Fermi-level definition, integration settings, code versions, and convergence series. Call the chain continuous ancestry only when the runtime/save-tree evidence actually demonstrates it.

A completed EPC workflow can support a conditional statement about the interaction or a derived observable within its declared model. It does not establish electron-phonon-limited mobility, an experimental linewidth, a superconducting phase, or a material conclusion. **Conventional Superconductivity** must separately justify the pairing model, Coulomb treatment, stability of the normal state, and transition-temperature inference.

## Sources and methods

- [Giustino, electron--phonon interactions from first principles](https://doi.org/10.1103/RevModPhys.89.015003)
- [Quantum ESPRESSO `ph.x` electron--phonon input documentation](https://www.quantum-espresso.org/Doc/INPUT_PH.html)
- [Quantum ESPRESSO PHonon guide: interaction coefficients](https://www.quantum-espresso.org/Doc/ph_user_guide/node10.html)
- [EPW theory: electron--phonon matrix elements](https://docs.epw-code.org/Theory.html)
- [EPW coupling, linewidth, and Eliashberg-function documentation](https://docs.epw-code.org/doc/Electron-phononCoupling.html)
- [EPW interpolation tutorial](https://docs.epw-code.org/tutorials/tutorial_01/index.html)

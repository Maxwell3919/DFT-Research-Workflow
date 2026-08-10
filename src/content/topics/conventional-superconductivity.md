---
topic_slug: conventional-superconductivity
status: reviewed
---

Conventional superconductivity asks whether a declared phonon-mediated pairing model predicts an instability of a specified normal electronic state. If it does, the model may provide a transition temperature, gap function, and related thermodynamic quantities. The conclusion does not follow from a large density of states, a soft phonon, a large matrix element, or a total EPC constant $\lambda$ alone.

The calculation consumes mutually compatible electronic states, phonons, and electron--phonon coupling data. It then adds a treatment of retarded attraction, residual Coulomb repulsion, temperature, and the superconducting gap equation. Each step has its own numerical and physical boundary.

## Read the normal state and pairing spectrum before reporting $T_c$

Start by viewing the selected metallic normal state's Fermi surface, phonon dispersion, and any mode-resolved linewidth or EPC map. Plot $\alpha^2F(\omega)$ beside the cumulative $\lambda(\omega)$ integral so that low-frequency or single-mode dominance remains visible; do not reduce the parent chain to one total $\lambda$. Inspect unresolved imaginary modes and low-frequency spectral weight before forming $\omega_{\log}$ or solving for a transition.

Declare the Coulomb model and $\mu^*$ sensitivity, then choose an approximate formula, isotropic Eliashberg solver, or anisotropic/multiband solver according to the question. For anisotropic work, inspect the gap over the actual Fermi surface rather than only its average. Converge the final reported quantity against k and q meshes, smearing, interpolation, bands, frequency and temperature grids, and solver cutoffs. Human routes through EPC codes, Fermi-surface viewers, tutorials, and manuals are indexed under [lattice dynamics](/DFT-Research-Workflow/operations/resource-landscape/#lattice-dynamics) and [literature and learning](/DFT-Research-Workflow/operations/resource-landscape/#literature-learning).

$\lambda$ convergence is not $T_c$ convergence. If an Allen--Dynes implementation reports an undefined result because its denominator or inputs fall outside the meaningful model, preserve it as undefined; do not rewrite it as $T_c=0$. A numerical transition in the pairing model is not evidence of an experimentally realized superconducting phase.

For an [EPW](/DFT-Research-Workflow/tools/epw/) start, follow this object chain: qualified metallic full-zone state -> converged phonons -> converged EPC matrix elements and interpolation -> $\alpha^2F(\omega)$ -> cumulative $\lambda(\omega)$ -> $\omega_{\log}$ -> declared Coulomb model/$\mu^*$ -> approximate formula or isotropic/anisotropic Eliashberg solver -> convergence and sensitivity envelope for the reported $T_c$ or gap. Open the normal-state, phonon, Wannier, and EPC stage records before editing the superconductivity input. Compatibility must be demonstrated from runtime and save-tree evidence; a collection of matching filenames or hashes is not automatically one continuous ancestry.

Retain separate stdout/stderr, the raw spectrum, cumulative integral, $\omega_{\log}$ record, every declared $\mu^*$ value, and the gap/solver history. Plot the spectrum and cumulative integral before copying a scalar $T_c$ into a table. If the normal state is not metallic on a qualified full-zone sample, phonons remain imaginary, low-frequency weight changes with sampling, the gap solver fails to bracket a transition, or an approximate formula is undefined, stop the positive superconductivity claim and return to that parent gate.

DRW currently contains no retained end-to-end superconductivity execution with a real $\alpha^2F$, $\lambda$, $\omega_{\log}$, and solver output. The official QE PHonon and EPW routes linked below define the software path; this page does not invent an input, scalar result, or pass status. The first practical case should be added only after a real metallic parent, full q/k convergence evidence, spectrum, model inputs, and solver records can be published together.

## From an Eliashberg spectrum to a pairing model

For an isotropic phonon-mediated model, the Eliashberg spectral function $\alpha^2F(\omega)$ organizes the Fermi-surface-weighted interaction by phonon frequency. Two commonly reported moments are

$$
\lambda
= 2\int_0^\infty\frac{\alpha^2F(\omega)}{\omega}\,d\omega,
\qquad
\omega_{\log}
= \exp\left[
\frac{2}{\lambda}
\int_0^\infty
\frac{\ln(\omega)\alpha^2F(\omega)}{\omega}\,d\omega
\right].
$$

$\lambda$ is a dimensionless coupling measure, while $\omega_{\log}$ is a logarithmic average of the phonon frequencies. Both depend on the full spectrum and on the electronic state, Fermi surface, phonons, matrix elements, reciprocal meshes, occupations, and integration treatment used to construct it.

Neither quantity is a transition temperature. Low-frequency spectral weight is amplified in the integral for $\lambda$, so unresolved soft modes, smearing sensitivity, or an unstable harmonic reference can strongly affect the result. A similar-looking plotted spectrum can also yield different moments if its low-frequency region or normalization changes.

## Coulomb repulsion is an additional model input

The Coulomb pseudopotential $\mu^*$ represents a retarded residual repulsion within a chosen cutoff and effective model. It is not generated automatically by the phonon calculation and is not a universal constant that can be transferred silently between materials.

State how $\mu^*$ was chosen or calculated, the cutoff convention to which it belongs, and how the predicted observable changes over a defensible range. A $T_c$ value quoted without its $\mu^*$ convention is incomplete even when the underlying EPC data are well converged.

## Approximate transition-temperature formulas are conditional maps

McMillan and Allen--Dynes-type formulas map a small set of spectral moments and $\mu^*$ to an approximate isotropic transition temperature. A schematic Allen--Dynes form is

$$
T_c
= \frac{f_1f_2\omega_{\log}}{1.2}
\exp\left[
-\frac{1.04(1+\lambda)}
{\lambda-\mu^*(1+0.62\lambda)}
\right].
$$

The factors $f_1$ and $f_2$ account for strong-coupling and spectral-shape effects, and the temperature unit follows the unit convention used for $\omega_{\log}$.

Such a formula is useful for screening and sensitivity analysis within its intended regime. It cannot repair an unconverged Fermi surface, questionable metallic state, unresolved phonon instability, inconsistent carrier model, poor interpolation, or unexamined Coulomb treatment. Ranking unlike calculations by the resulting scalar $T_c$ can therefore compare numerical and modelling choices rather than materials.

## Eliashberg solutions answer a more specific question

The isotropic Eliashberg equations solve for temperature-dependent renormalization and gap functions using $\alpha^2F(\omega)$ and a declared Coulomb kernel. A linearized equation can locate the onset of an instability. A nonlinear solution below the transition can provide the model gap function. These are related but distinct calculations.

An anisotropic or multiband treatment retains momentum, band, and gap variation over the Fermi surface. It can resolve distinct gaps or strongly anisotropic pairing, but it requires much denser and better validated electronic, phonon, and EPC sampling. An isotropic average can be adequate only when that loss of information is justified for the stated question.

Solver settings belong to the scientific record: Matsubara or real-frequency grids, energy and Coulomb cutoffs, temperature bracketing, analytic continuation, number of bands, interpolation, gap tolerance, and the criterion used to identify the transition.

## Validate the normal state before interpreting the paired state

The parent normal state must be physically and numerically appropriate for the pairing model. Check its structure, magnetic order, SOC treatment, carrier condition, Fermi-surface topology, phonons, and EPC lineage. Convergence of an SCF calculation does not establish convergence of the pairing kernel, and convergence of $\lambda$ does not establish convergence of $T_c$.

Where magnetic fluctuations, strong correlations, nonadiabatic effects, disorder, competing order, reduced dimensionality, or anharmonic phonon renormalization may be important, the phonon-mediated result should be presented as a conditional model rather than a complete mechanism.

In low-dimensional systems, a mean-field pairing temperature is also not automatically the experimentally observed transition temperature. Phase fluctuations, finite-size effects, substrate coupling, and disorder can require additional evidence outside the present calculation.

## Match the claim to the computed quantity

Converge the quantity that will be reported: moments of $\alpha^2F$, an approximate $T_c$, the leading eigenvalue of a linearized equation, an anisotropic gap, or a sensitivity envelope. Test reciprocal meshes, Fermi-surface integration, phonon and EPC interpolation, carrier state, Coulomb treatment, frequency and temperature grids, and all band or solver cutoffs that affect that quantity.

Preserve the full spectrum or matrix-element route, normal-state definition, $\mu^*$ convention, solver settings, convergence evidence, and sensitivity analysis. A calculation may support a conditional prediction within its declared pairing model. It does not establish experimental superconductivity, synthesis of the phase, a unique pairing mechanism, a record transition temperature, critical fields, vortex behaviour, or device performance.

## Sources and methods

- [McMillan, transition temperature of strong-coupled superconductors](https://doi.org/10.1103/PhysRev.167.331)
- [Allen and Dynes, strong-coupling transition-temperature analysis](https://doi.org/10.1103/PhysRevB.12.905)
- [Quantum ESPRESSO PHonon guide: $\alpha^2F$, $\lambda$, and $T_c$ route](https://www.quantum-espresso.org/Doc/ph_user_guide/node10.html)
- [Quantum ESPRESSO PHonon user guide](https://www.quantum-espresso.org/Doc/user_guide_PDF/ph_user_guide.pdf)
- [EPW superconductivity inputs and linearized Eliashberg solver](https://docs.epw-code.org/Inputs/Inputs.html)
- [EPW electron--phonon coupling documentation](https://docs.epw-code.org/doc/Electron-phononCoupling.html)

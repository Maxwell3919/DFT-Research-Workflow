---
topic_slug: conventional-superconductivity
status: reviewed
---

Conventional superconductivity asks whether a declared phonon-mediated pairing model predicts an instability of a specified normal electronic state. If it does, the model may provide a transition temperature, gap function, and related thermodynamic quantities. The conclusion does not follow from a large density of states, a soft phonon, a large matrix element, or a total EPC constant `λ` alone.

The calculation consumes mutually compatible electronic states, phonons, and electron--phonon coupling data. It then adds a treatment of retarded attraction, residual Coulomb repulsion, temperature, and the superconducting gap equation. Each step has its own numerical and physical boundary.

## From an Eliashberg spectrum to a pairing model

For an isotropic phonon-mediated model, the Eliashberg spectral function `α²F(ω)` organizes the Fermi-surface-weighted interaction by phonon frequency. Two commonly reported moments are

```text
λ = 2 ∫₀∞ α²F(ω) / ω dω,

ω_log = exp[(2/λ) ∫₀∞ ln(ω) α²F(ω) / ω dω].
```

`λ` is a dimensionless coupling measure, while `ω_log` is a logarithmic average of the phonon frequencies. Both depend on the full spectrum and on the electronic state, Fermi surface, phonons, matrix elements, reciprocal meshes, occupations, and integration treatment used to construct it.

Neither quantity is a transition temperature. Low-frequency spectral weight is amplified in the integral for `λ`, so unresolved soft modes, smearing sensitivity, or an unstable harmonic reference can strongly affect the result. A similar-looking plotted spectrum can also yield different moments if its low-frequency region or normalization changes.

## Coulomb repulsion is an additional model input

The Coulomb pseudopotential `μ*` represents a retarded residual repulsion within a chosen cutoff and effective model. It is not generated automatically by the phonon calculation and is not a universal constant that can be transferred silently between materials.

State how `μ*` was chosen or calculated, the cutoff convention to which it belongs, and how the predicted observable changes over a defensible range. A `T_c` value quoted without its `μ*` convention is incomplete even when the underlying EPC data are well converged.

## Approximate transition-temperature formulas are conditional maps

McMillan and Allen--Dynes-type formulas map a small set of spectral moments and `μ*` to an approximate isotropic transition temperature. A schematic Allen--Dynes form is

```text
T_c = f₁ f₂ ω_log / 1.2
      × exp[-1.04(1+λ) / (λ - μ*(1+0.62λ))].
```

The factors `f₁` and `f₂` account for strong-coupling and spectral-shape effects, and the temperature unit follows the unit convention used for `ω_log`.

Such a formula is useful for screening and sensitivity analysis within its intended regime. It cannot repair an unconverged Fermi surface, questionable metallic state, unresolved phonon instability, inconsistent carrier model, poor interpolation, or unexamined Coulomb treatment. Ranking unlike calculations by the resulting scalar `T_c` can therefore compare numerical and modelling choices rather than materials.

## Eliashberg solutions answer a more specific question

The isotropic Eliashberg equations solve for temperature-dependent renormalization and gap functions using `α²F(ω)` and a declared Coulomb kernel. A linearized equation can locate the onset of an instability. A nonlinear solution below the transition can provide the model gap function. These are related but distinct calculations.

An anisotropic or multiband treatment retains momentum, band, and gap variation over the Fermi surface. It can resolve distinct gaps or strongly anisotropic pairing, but it requires much denser and better validated electronic, phonon, and EPC sampling. An isotropic average can be adequate only when that loss of information is justified for the stated question.

Solver settings belong to the scientific record: Matsubara or real-frequency grids, energy and Coulomb cutoffs, temperature bracketing, analytic continuation, number of bands, interpolation, gap tolerance, and the criterion used to identify the transition.

## Validate the normal state before interpreting the paired state

The parent normal state must be physically and numerically appropriate for the pairing model. Check its structure, magnetic order, SOC treatment, carrier condition, Fermi-surface topology, phonons, and EPC lineage. Convergence of an SCF calculation does not establish convergence of the pairing kernel, and convergence of `λ` does not establish convergence of `T_c`.

Where magnetic fluctuations, strong correlations, nonadiabatic effects, disorder, competing order, reduced dimensionality, or anharmonic phonon renormalization may be important, the phonon-mediated result should be presented as a conditional model rather than a complete mechanism.

In low-dimensional systems, a mean-field pairing temperature is also not automatically the experimentally observed transition temperature. Phase fluctuations, finite-size effects, substrate coupling, and disorder can require additional evidence outside the present calculation.

## Match the claim to the computed quantity

Converge the quantity that will be reported: moments of `α²F`, an approximate `T_c`, the leading eigenvalue of a linearized equation, an anisotropic gap, or a sensitivity envelope. Test reciprocal meshes, Fermi-surface integration, phonon and EPC interpolation, carrier state, Coulomb treatment, frequency and temperature grids, and all band or solver cutoffs that affect that quantity.

Preserve the full spectrum or matrix-element route, normal-state definition, `μ*` convention, solver settings, convergence evidence, and sensitivity analysis. A calculation may support a conditional prediction within its declared pairing model. It does not establish experimental superconductivity, synthesis of the phase, a unique pairing mechanism, a record transition temperature, critical fields, vortex behaviour, or device performance.

## Sources and methods

- [McMillan, transition temperature of strong-coupled superconductors](https://doi.org/10.1103/PhysRev.167.331)
- [Allen and Dynes, strong-coupling transition-temperature analysis](https://doi.org/10.1103/PhysRevB.12.905)
- [Quantum ESPRESSO PHonon guide: `α²F`, `λ`, and `T_c` route](https://www.quantum-espresso.org/Doc/ph_user_guide/node10.html)
- [Quantum ESPRESSO PHonon user guide](https://www.quantum-espresso.org/Doc/user_guide_PDF/ph_user_guide.pdf)
- [EPW superconductivity inputs and linearized Eliashberg solver](https://docs.epw-code.org/Inputs/Inputs.html)
- [EPW electron--phonon coupling documentation](https://docs.epw-code.org/doc/Electron-phononCoupling.html)

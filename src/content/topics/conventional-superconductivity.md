---
topic_slug: conventional-superconductivity
status: reviewed
---

Conventional superconductivity asks whether a declared electron--phonon pairing model predicts a superconducting instability and, if so, what transition temperature and gap properties follow within that model. It does not follow from a large electron--phonon matrix element, a soft mode, a high density of states, or a reported total `λ` alone. The question consumes compatible electronic states, phonons, and electron--phonon coupling data; it adds a treatment of retarded attraction, Coulomb repulsion, temperature, and the gap equation.

## From an Eliashberg spectrum to a pairing model

The isotropic Eliashberg spectral function `α²F(ω)` combines a Fermi-surface-weighted electron--phonon interaction with phonon frequencies `ω`. Its standard moments include

```text
λ = 2 ∫₀∞ α²F(ω)/ω dω,
ω_log = exp[(2/λ) ∫₀∞ ln(ω) α²F(ω)/ω dω].
```

`λ` is a dimensionless coupling strength and `ω_log` is a logarithmic phonon-frequency average. The integrals require a declared frequency unit and a spectrum built from the same electronic state, Fermi level or carrier model, phonons, matrix elements, reciprocal meshes, and integration treatment. Neither quantity is a measured transition temperature. A change in the Fermi-surface model or in a low-frequency contribution can alter the integrals even when a plotted spectrum looks similar.

The Coulomb pseudopotential `μ*` represents an effective, retarded residual repulsion within a chosen model and cutoff convention. It is not a universal constant, an output automatically determined by a phonon calculation, or a parameter that may be silently reused across materials and electronic models. State its origin, cutoff treatment, and sensitivity whenever it enters a `T_c` estimate.

## Approximate transition-temperature formulas are conditional maps

McMillan and Allen--Dynes-type expressions map `λ`, a frequency scale such as `ω_log`, and `μ*` to an approximate isotropic `T_c`; schematically, an Allen--Dynes form is

```text
T_c = f₁ f₂ ω_log/1.2 × exp[-1.04(1+λ)/(λ-μ*(1+0.62λ))].
```

`f₁` and `f₂` are strong-coupling and spectral-shape corrections, and the temperature unit follows the unit convention for `ω_log`. The formula is useful for a sensitivity analysis under its assumptions, not a license to rank unlike calculations by one number. It can be unreliable outside its intended coupling, adiabatic, isotropic, and phonon-mediated setting; it does not repair poor reciprocal-space convergence, a questionable metallic state, unstable phonons, an inconsistent carrier model, or an untested Coulomb treatment.

## Eliashberg solutions answer a more specific question

Isotropic Eliashberg equations solve for temperature-dependent renormalization and gap functions from an `α²F` spectrum and a declared Coulomb kernel. An anisotropic, multiband formulation retains momentum, band, and gap structure and requires substantially denser, validated electronic and phonon sampling. A linearized equation can locate an instability temperature; a nonlinear solution below it provides a model gap function. Those are distinct calculations with distinct convergence checks.

The energy cutoff, Matsubara or real-frequency grids, analytic continuation, gap convergence, Coulomb window, temperature bracketing, band resolution, and anisotropy treatment belong in provenance. Convergence of an EPC `λ` does not prove convergence of `T_c`, and convergence of a linearized eigenvalue does not establish the zero-temperature gap, isotope effect, critical field, coherence length, vortex behaviour, or experimental transition.

## Evidence boundary and downstream interpretation

Check that the normal reference is physically and numerically appropriate for the pairing model: its Fermi surface, occupations, magnetism, SOC, phonons, and EPC inputs must be mutually compatible. Where magnetic fluctuations, strong electronic correlations, nonadiabatic physics, disorder, competing order, low dimensionality, or anharmonic renormalization are plausible, an electron--phonon Eliashberg result needs an explicit limitation rather than an implicit claim of completeness.

Converge the claimed observable, including `α²F` moments, `T_c`, anisotropic gap structure, or a sensitivity envelope, against reciprocal meshes, integrations, interpolation, phonon/EPC lineage, Coulomb treatment, frequency and temperature grids, and all band or gap cutoffs. Preserve the full spectrum or matrix-element route, model definition, `μ*` convention, solver settings and convergence record, and sensitivity data. A calculation can support a conditional prediction within its declared pairing model; it does not establish experimental superconductivity, a synthesized phase, a record `T_c`, a mechanism excluding alternatives, or a device performance claim.

## Sources and methods

- [McMillan, transition temperature of strong-coupled superconductors](https://doi.org/10.1103/PhysRev.167.331)
- [Allen and Dynes, strong-coupling transition-temperature analysis](https://doi.org/10.1103/PhysRevB.12.905)
- [Quantum ESPRESSO PHonon guide: `α²F`, `λ`, and `T_c` route](https://www.quantum-espresso.org/Doc/ph_user_guide/node10.html)
- [Quantum ESPRESSO PHonon user guide](https://www.quantum-espresso.org/Doc/user_guide_PDF/ph_user_guide.pdf)
- [EPW superconductivity inputs and linearized Eliashberg solver](https://docs.epw-code.org/Inputs/Inputs.html)
- [EPW electron--phonon coupling documentation](https://docs.epw-code.org/doc/Electron-phononCoupling.html)

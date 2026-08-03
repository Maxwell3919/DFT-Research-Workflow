---
topic_slug: magnetic-anisotropy-and-exchange-interactions
status: reviewed
---

Magnetic anisotropy and exchange interactions answer two different questions after a compatible magnetic state has been selected. Anisotropy asks how the energy changes when an otherwise specified magnetic texture is rotated relative to the crystal. Exchange asks how the energy changes when the relative orientations of specified local moments are changed. Both are small differences between carefully matched electronic calculations. Neither follows from the existence of a spin-polarized solution, a local moment, or a lower collinear magnetic candidate.

## Direction is a physical variable only when it is coupled to the lattice

Without spin--orbit coupling (SOC), a simultaneous rotation of all spins is a symmetry of the usual spin-rotation-invariant model. The energy of a ferromagnetic texture therefore cannot distinguish an in-plane from an out-of-plane direction merely by changing the axis used to print moments. SOC couples spin space to the real-space lattice and makes that directional comparison meaningful. Crystal symmetry then constrains the allowed angular form: a uniaxial model is often written

```text
E(θ, φ) − E_reference = K₁ sin²θ + K₂ sin⁴θ + … ,
```

where `θ` and `φ` locate the magnetization relative to declared crystallographic axes, `E_reference` is the energy of one declared direction, and the `K` values are anisotropy coefficients in the stated normalization. This is a model for a fitted angular dependence, not an input-independent definition of a material constant. The axes, magnetic texture, cell, strain, charge, SOC treatment, exchange--correlation functional, Hubbard treatment, and whether ions are held fixed must accompany every reported coefficient.

For a finite set of directions, the directly computed quantity is the magnetocrystalline anisotropy energy (MAE), for example

```text
MAE(u; 0) = [E(u) − E(0)] / N.
```

Here `E(u)` and `E(0)` are SOC-inclusive total energies for the same magnetic state with directions `u` and `0`, and `N` is explicitly a magnetic ion, formula unit, area, or common cell. A positive number says only that `u` is higher than the declared reference in that model. It does not by itself determine a bulk coercive field, domain pattern, switching barrier, Curie temperature, or experimentally observable easy axis.

## Exchange parameters are a reduced model, not raw energy differences renamed

For localized moments, a common effective model is the Heisenberg form

```text
H = − Σᵢⱼ Jᵢⱼ eᵢ · eⱼ,
```

where `eᵢ` is a unit vector defining the orientation assigned to site `i`, `Jᵢⱼ` is an exchange parameter under the chosen sign convention, and the sum convention must state whether each pair is counted once. A positive `J` favours parallel alignment in the form written above; changing the sign or pair-counting convention changes the numerical interpretation. Anisotropic exchange, Dzyaloshinskii--Moriya terms, single-ion anisotropy, itinerant magnetism, and longitudinal moment changes can make this minimal Hamiltonian insufficient.

One can fit `Jᵢⱼ` to a deliberately chosen set of compatible total-energy differences, or derive response-based parameters under their own assumptions. In either case, the mapping is an inference from DFT energies to a model with a defined lattice, neighbor shell, spin length convention, and set of terms. It should be challenged by predicting energies of held-out magnetic configurations. A good fit to two collinear states does not prove uniqueness of the interaction range, validate a classical-spin approximation, or justify a finite-temperature transition temperature.

## Establish a compatible SOC reference before subtracting micro-energy differences

Start from the identified magnetic candidate and decide which degrees of freedom remain fixed. A fixed geometry isolates directional electronic energy within that geometry. Relaxing each direction can instead measure a magnetostructural response, provided equal relaxation freedom and the final structures are retained. Do not subtract a scalar-relativistic energy from an SOC energy, or compare different pseudopotentials, Hubbard branches, charge states, occupation treatments, smearing models, symmetry reductions, or k-point sets and call the result MAE.

For each direction, preserve the real-space vector moment map, the crystallographic coordinate frame, the SOC-capable potential data, initial and final charge/spin density lineage, symmetry behaviour, total energy, and the normalization. A spin axis in code coordinates has no portable physical meaning until it is mapped to the cell axes. In noncollinear calculations, a global rotation can also alter which symmetries survive and hence the irreducible reciprocal sampling. Use a compatible full-zone representation or explicitly verify that the symmetry choice has not changed the numerical comparison.

## Converge the observable that is actually being subtracted

MAE is commonly much smaller than total energies, so apparent directional order can reverse when reciprocal sampling, basis/grid representation, occupation integration, empty-state treatment, charge-density strategy, SOC implementation, or symmetry changes. Converge directional differences and the easy-axis ranking together; an SCF residual or a stable absolute total energy alone is not sufficient. Repeating a calculation from independent compatible starts tests path dependence, but it does not replace convergence with respect to the physical and numerical model.

Exchange fitting has an additional resolution problem. The magnetic supercell must represent the selected relative orientations; each configuration must use compatible structural and electronic conditions; and the energy set must contain enough independent changes to identify the chosen parameters. If fit parameters change materially as extra configurations or neighbor shells are added, that is evidence about model inadequacy or underdetermination, not a reason to report only the most convenient fit.

## Read results at the scope they support

An easy direction is conditional on the selected state, geometry, Hamiltonian, angular sampling, and numerical convergence. A fitted `J` set is conditional on the chosen effective Hamiltonian and mapping. Magnetic ordering temperatures require an additional statistical-mechanics model, dimensionality and anisotropy treatment, finite-size analysis, and sensitivity to the fitted interactions. In low-dimensional systems, an isotropic short-range classical model has special limitations; SOC-derived anisotropy can be physically central rather than a small decorative correction.

This topic supplies a traceable comparison of SOC directional energies and, where justified, a tested mapping from compatible magnetic energies to an explicitly written exchange model. It does not establish a complete magnetic Hamiltonian, spin-wave spectrum, domain behaviour, finite-temperature phase transition, experimental easy axis, or magnetic-device performance.

## Sources and methods

- [Hohenberg and Kohn, density-functional foundation](https://doi.org/10.1103/PhysRev.136.B864)
- [Kohn and Sham, self-consistent equations](https://doi.org/10.1103/PhysRev.140.A1133)
- [Liechtenstein et al., exchange interactions from local spin-density theory](https://doi.org/10.1016/0304-8853%2887%2990721-9)
- [Quantum ESPRESSO `pw.x` noncollinear and spin--orbit inputs](https://www.quantum-espresso.org/Doc/INPUT_PW.html)
- [VASP magnetic-anisotropy documentation](https://vasp.at/wiki/Determining_the_Magnetic_Anisotropy)
- [VASP `LSORBIT` documentation](https://vasp.at/wiki/LSORBIT)

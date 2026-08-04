---
topic_slug: excitons-and-bethe-salpeter-equation
status: reviewed
---

The Bethe--Salpeter equation (BSE) is used when a neutral excitation cannot be represented as an independent transition between one-electron levels. Light creates an electron and a hole, and their interaction can shift excitation energies, redistribute oscillator strength, and produce bound or resonant excitonic states.

A BSE spectrum therefore answers a different question from a Kohn--Sham band structure, a quasiparticle gap, or a measured spectrum affected by temperature, disorder, substrates, phonons, and carrier populations.

## Build neutral excitations from electron--hole pairs

At transferred momentum `Q`, an excitonic state can be expanded as

```text
|S_Q⟩ = Σ_vck A^S_vckQ |v k⟩ |c, k+Q⟩ .
```

`v` and `c` label occupied and empty states, `k` is a Brillouin-zone point, and the coefficients `A^S` describe the electron--hole composition of excitation `S`.

In a common static formulation,

```text
Σ_v'c'k' H^BSE_vck,v'c'k' A^S_v'c'k'
= Ω_S A^S_vck,

H^BSE = (E^QP_ck - E^QP_vk) δ + K^x + K^d .
```

The diagonal term contains compatible quasiparticle transition energies. `K^x` is the exchange or local-field contribution, and `K^d` is the screened direct electron--hole interaction. Their signs, screening model, spin and SOC convention, Coulomb boundary treatment, and transition basis are part of the result.

The BSE does not apply one universal correction to a band gap. It diagonalizes a two-particle Hamiltonian whose eigenvalues and eigenvectors define neutral excitations.

## Binding energy is a comparison between compatible quantities

For an identified bound state, one often writes

```text
E_b = E_g^QP - Ω_S .
```

`E_g^QP` must be the compatible quasiparticle continuum edge, and `Ω_S` must refer to the same geometry, Hamiltonian, spin/SOC state, k mesh, and boundary model.

The lowest BSE eigenvalue need not be optically bright. A bright peak need not be bound. Determine the continuum threshold, oscillator strength, momentum, and polarization before assigning an exciton binding energy.

This consistency is especially important in reduced-dimensional systems, where dielectric environment and Coulomb truncation can strongly affect both the quasiparticle gap and the electron--hole interaction. A binding energy from one vacuum or substrate model is not automatically transferable to another.

## The transition space controls the result

The numerical representation is defined by the valence and conduction band windows, k sampling, quasiparticle inputs, dielectric screening basis, local-field cutoff, and treatment of `q → 0`. Excitons that are extended in real space can require very dense reciprocal-space sampling; strongly localized states can require a broad transition basis.

A smooth broadened spectrum can therefore be misleading. Converge the quantity that will be interpreted: a specified excitation energy, continuum onset, oscillator strength, polarization dependence, or exciton character. Solver residual alone is not enough.

The Tamm--Dancoff approximation removes coupling between resonant and anti-resonant sectors. It can be useful within a stated regime, but it is not the full BSE. Challenge it when low-energy collective response, strong coupling between sectors, or spectral redistribution may matter.

Broadening also needs a clear role. A numerical broadening can make a spectrum readable; it does not establish a physical lifetime unless connected to an independently justified scattering or decay model.

## Read the spectrum as a response function

Diagonalizing the BSE gives neutral excitation energies and amplitudes. Constructing an optical spectrum additionally requires transition matrix elements, polarization, normalization, and a stated broadening.

Compare the same observable on both sides. Absorption, reflectance, loss spectra, and photoluminescence involve different response functions and experimental conditions. Agreement of one peak position does not validate the screening model, oscillator strength, exciton character, or the full material description.

Inspect the excitation amplitudes when making a mechanistic statement. A label such as “valley exciton,” “charge-transfer exciton,” or “layer exciton” should follow from the electron--hole composition and real- or reciprocal-space localization, not from the energy of a peak alone.

## Preserve the full two-particle lineage

Retain the mean-field and quasiparticle parent calculations, dielectric matrices or their reproducible construction, valence and conduction windows, k meshes and interpolation, kernel convention, Coulomb treatment, solver settings, polarization, broadening, eigenvectors or state-selection records, and raw spectra.

A BSE calculation can support a conditional statement about neutral excitations within its declared quasiparticle, screening, and kernel model. It does not establish a radiative lifetime, exciton diffusion length, finite-temperature photophysics, experimental synthesis, or device performance without additional evidence.

## Sources and methods

- [Onida, Reining, and Rubio, electronic excitations review](https://doi.org/10.1103/RevModPhys.74.601)
- [Rohlfing and Louie, electron--hole excitations from first principles](https://doi.org/10.1103/PhysRevB.62.4927)
- [BerkeleyGW BSE theory and tutorial](https://berkeleygw.org/documentation/tutorial/tutorial-bethe-salpeter-equation/)
- [BerkeleyGW GW--BSE workflow tutorial](https://berkeleygw.org/documentation/tutorial/)
- [Yambo BSE solvers overview](https://wiki.yambo-code.eu/wiki/index.php/BSE_solvers_overview)

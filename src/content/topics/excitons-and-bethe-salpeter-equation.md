---
topic_slug: excitons-and-bethe-salpeter-equation
status: reviewed
---

The Bethe--Salpeter equation (BSE) is used when an optical or other two-particle excitation cannot be represented as an independent transition between one-electron levels. Light can create an electron and a hole whose Coulomb interaction changes both the excitation energies and their oscillator strengths. A BSE spectrum therefore answers a different question from a quasiparticle band structure, a Kohn--Sham transition spectrum, or a measured spectrum with temperature, disorder, substrates, phonons, and finite carrier populations.

## From electron--hole pairs to neutral excitations

At fixed transferred momentum `Q`, an exciton can be expanded in electron--hole pair states,

```text
|S_Q> = sum_vck A^S_vckQ |v k> |c, k+Q>.
```

`v` and `c` label occupied and empty bands, `k` is a Brillouin-zone point, `S` labels a neutral excitation, and `A` gives its composition. In the common static BSE formulation the coefficients and excitation energy `Omega_S` follow from

```text
sum_v'c'k' H^BSE_vck,v'c'k' A^S_v'c'k'
= Omega_S A^S_vck,
H^BSE = (E^QP_ck - E^QP_vk) delta
+ K^x + K^d.
```

The diagonal term is a declared independent quasiparticle transition energy. `K^x` is the repulsive exchange/local-field contribution and `K^d` is the attractive screened direct electron--hole interaction. Their signs, screening model, Coulomb boundary treatment, spin/SOC convention, and transition basis are part of the result. The BSE is not a universal gap correction.

## What an exciton binding energy compares

For a specified bright or otherwise identified state, an often reported quantity is

```text
E_b = E_g^QP - Omega_1.
```

Here `E_g^QP` must be the compatible quasiparticle continuum edge and `Omega_1` the compatible neutral excitation. The subtraction is meaningful only when geometry, Hamiltonian, spin/SOC state, k-grid, boundary model, and the definition of the continuum match. The lowest eigenvalue need not be optically bright, and a bright peak need not be a bound exciton: selection rules, momentum, polarization, and the continuum threshold must be inspected. In a reduced-dimensional model, dielectric environment and Coulomb truncation can change both terms, so a value from one supercell or substrate model is not directly transferable to another.

## Numerical representation is physical evidence

The transition space is controlled by valence and conduction band windows, coarse and fine k grids, dielectric screening representation, local-field cutoff, quasiparticle input, and the treatment of `q -> 0`. Bound excitons can be sharply localized in reciprocal space or extended in real space; either case can make a seemingly smooth optical curve numerically misleading. Converge the target observable--for example a specified exciton energy, polarization-resolved oscillator strength, or continuum onset--rather than only the BSE solver residual.

The Tamm--Dancoff approximation removes coupling between resonant and anti-resonant sectors. It can be a useful stated approximation, but it is not identical to the full BSE and should be challenged where coupling, low-energy collective response, or spectral redistribution matters. A broadened spectrum also does not establish a lifetime unless the broadening is tied to a separately justified physical model rather than a display parameter.

## Reading a spectrum without overclaiming

Diagonalising the BSE yields neutral excitation energies and amplitudes; a spectrum additionally requires transition matrix elements, polarization, normalization, and a chosen broadening. Compare like with like: absorption, reflectance, loss, and photoluminescence probe different response functions and experimental conditions. The optical onset is not automatically the fundamental quasiparticle gap, and agreement of one peak position does not validate screening, oscillator strength, exciton character, or a whole material model.

Retain the mean-field and QP lineage, dielectric matrices, band windows, k meshes and interpolation, kernel convention, solver and tolerance, polarization, broadening, eigenvectors or a reproducible state-selection record, and raw spectra. This topic consumes a compatible quasiparticle and screening description and produces conditional neutral-excitation evidence. It does not establish a radiative lifetime, exciton diffusion length, finite-temperature photophysics, experimental synthesis outcome, or device performance.

## Sources and methods

- [Onida, Reining, and Rubio, electronic excitations review](https://doi.org/10.1103/RevModPhys.74.601)
- [Rohlfing and Louie, electron--hole excitations from first principles](https://doi.org/10.1103/PhysRevB.62.4927)
- [BerkeleyGW BSE theory and tutorial](https://berkeleygw.org/documentation/tutorial/tutorial-bethe-salpeter-equation/)
- [BerkeleyGW GW--BSE workflow tutorial](https://berkeleygw.org/documentation/tutorial/)
- [Yambo BSE solvers overview](https://wiki.yambo-code.eu/wiki/index.php/BSE_solvers_overview)

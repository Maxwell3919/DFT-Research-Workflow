---
topic_slug: excitons-and-bethe-salpeter-equation
status: reviewed
---

The Bethe--Salpeter equation (BSE) is used when a neutral excitation cannot be represented as an independent transition between one-electron levels. Light creates an electron and a hole, and their interaction can shift excitation energies, redistribute oscillator strength, and produce bound or resonant excitonic states.

A BSE spectrum therefore answers a different question from a Kohn--Sham band structure, a quasiparticle gap, or a measured spectrum affected by temperature, disorder, substrates, phonons, and carrier populations.

## Inspect the spectrum and the electron--hole state together

Start from compatible quasiparticle energies and screening. Select valence/conduction windows, k sampling, momentum transfer, spin/SOC sector, Coulomb boundary, kernel, polarization, and solver approximation. Plot the BSE spectrum against the independent-particle or quasiparticle continuum, keeping oscillator strengths and polarization visible. For an assigned excitation, inspect its valence/conduction and k-space weights and, where supported, a real-space electron--hole distribution with a clearly fixed electron or hole position.

These views distinguish bright, dark, bound, resonant, localized, interlayer, and charge-transfer candidates more reliably than peak energy alone, but they remain representation-dependent evidence. Converge the specific excitation, continuum placement, oscillator strength, and spatial or reciprocal character against windows, meshes, screening, and solver choices. Major BSE/GW codes and tutorials are indexed under [electronic properties](/DFT-Research-Workflow/operations/resource-landscape/#electronic-properties). Solver residual alone is not target convergence, and one peak does not establish an exciton mechanism. This overview does not claim an executed BSE calculation.

Keep the quasiparticle-energy and screening parent records beside the BSE input, valence/conduction windows, k mesh, kernel/cutoff settings, solver report, raw eigenvalues and oscillator strengths, and the independent-particle comparison spectrum. The [BerkeleyGW BSE tutorial](https://berkeleygw.org/documentation/tutorial/tutorial-bethe-salpeter-equation/) and [Yambo BSE solver route](https://wiki.yambo-code.eu/wiki/index.php/BSE_solvers_overview) expose these objects with different names, so follow the version-matched manual rather than copying one code's flags. For a state assignment, inspect the $A^S_{vc\mathbf k}$ weights and, if generated, a real-space electron--hole distribution with the fixed particle and plotting isovalue recorded. If the continuum edge moves with the quasiparticle parent, oscillator strength changes with the transition window, or a real-space pattern changes with k mesh or fixed-particle position, stop the binding-energy or mechanism claim and converge that object first.

## From electron--hole pairs to neutral excitations

At transferred momentum $\mathbf Q$, an excitonic state can be expanded as

$$
|S_{\mathbf Q}\rangle
= \sum_{vc\mathbf k}
A^S_{vc\mathbf k\mathbf Q}
|v\mathbf k\rangle
|c,\mathbf k+\mathbf Q\rangle .
$$

$v$ and $c$ label occupied and empty states, $\mathbf k$ is a Brillouin-zone point, and the coefficients $A^S$ describe the electron--hole composition of excitation $S$.

In a common static formulation,

$$
\sum_{v'c'\mathbf k'}
H^{\mathrm{BSE}}_{vc\mathbf k,v'c'\mathbf k'}
A^S_{v'c'\mathbf k'}
= \Omega_S A^S_{vc\mathbf k},
$$

$$
H^{\mathrm{BSE}}
= \left(E^{\mathrm{QP}}_{c\mathbf k}
-E^{\mathrm{QP}}_{v\mathbf k}\right)\delta
+K^x+K^d .
$$

The diagonal term contains compatible quasiparticle transition energies. $K^{\mathrm x}$ is the exchange or local-field contribution, and $K^{\mathrm d}$ is the screened direct electron--hole interaction. Their signs, screening model, spin and SOC convention, Coulomb boundary treatment, and transition basis are part of the result.

The BSE does not apply one universal correction to a band gap. It diagonalizes a two-particle Hamiltonian whose eigenvalues and eigenvectors define neutral excitations.

## What an exciton binding energy compares

For an identified bound state, one often writes

$$
E_b = E_g^{\mathrm{QP}}-\Omega_S .
$$

$E_g^{\mathrm{QP}}$ must be the compatible quasiparticle continuum edge, and $\Omega_S$ must refer to the same geometry, Hamiltonian, spin/SOC state, k mesh, and boundary model.

The lowest BSE eigenvalue need not be optically bright. A bright peak need not be bound. Determine the continuum threshold, oscillator strength, momentum, and polarization before assigning an exciton binding energy.

This consistency is especially important in reduced-dimensional systems, where dielectric environment and Coulomb truncation can strongly affect both the quasiparticle gap and the electron--hole interaction. A binding energy from one vacuum or substrate model is not automatically transferable to another.

## Numerical representation is physical evidence

The numerical representation is defined by the valence and conduction band windows, k sampling, quasiparticle inputs, dielectric screening basis, local-field cutoff, and treatment of $\mathbf q\to0$. Excitons that are extended in real space can require very dense reciprocal-space sampling; strongly localized states can require a broad transition basis.

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

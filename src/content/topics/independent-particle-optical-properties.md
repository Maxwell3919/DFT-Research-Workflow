---
topic_slug: independent-particle-optical-properties
status: reviewed
---

Independent-particle optical properties ask how a declared electronic structure absorbs or disperses light when an electron--hole pair is represented as two independent single-particle states. The central output is a frequency- and direction-dependent dielectric response, not a generic experimental spectrum. It begins with a ground-state structure and electronic state whose symmetry, spin state, spin--orbit treatment, occupations, energy reference, and numerical representation are known.

## Calculate the tensor over the required spectral window

Start from a qualified parent state and choose the tensor components, polarization, photon-energy range, dimensional normalization, and independent-particle/local-field model. Include enough full-zone k points and unoccupied states for that range, calculate the transition matrix elements, and inspect raw real/imaginary response, sum or causality checks where available, broadening dependence, peak positions, integrated weight, and unit conversions. Converge the reported spectrum rather than the parent SCF energy. This overview does not claim an executed optical calculation.

## A spectrum is a tensor response to specified light

For a periodic solid in the long-wavelength limit, the complex macroscopic dielectric tensor is written

$$
\epsilon_{\alpha\beta}(\omega)
= \epsilon_{1,\alpha\beta}(\omega)
+ i\epsilon_{2,\alpha\beta}(\omega).
$$

$\omega$ is angular frequency, $\alpha$ and $\beta$ label Cartesian polarization directions, and $\epsilon_1$ and $\epsilon_2$ are the real and imaginary parts. In a non-magnetic isotropic model this may reduce to one scalar; in a low-symmetry, magnetic, strained, layered, or spin--orbit-coupled model it generally does not. A plotted trace must therefore retain the component or polarization, propagation geometry where relevant, the frequency or photon-energy axis, and the macroscopic-volume convention.

Within an independent-particle treatment, $\epsilon_2$ is assembled from transitions between occupied and unoccupied states at the same crystal momentum, weighted by optical matrix elements and energy conservation. Schematically,

$$
\epsilon_{2,\alpha\beta}(\omega)
\propto
\sum_{vc}\int_{\mathrm{BZ}}d\mathbf k\,
p^\alpha_{vc}(\mathbf k)p^\beta_{cv}(\mathbf k)
\delta\!\left[E_c(\mathbf k)-E_v(\mathbf k)-\hbar\omega\right].
$$

$v$ and $c$ denote initially occupied and final unoccupied bands, $\mathbf k$ is a Brillouin-zone point, $p$ is the polarization-resolved transition matrix element, and $\hbar$ is the reduced Planck constant. This expression explains why a joint density of states alone is not an absorption spectrum: dipole selection rules and polarization can suppress or enhance transitions with similar energy differences. The real part is conventionally reconstructed through a Kramers--Kronig relation; its quality depends on a sufficiently represented spectral range and a declared treatment of the unresolved tail.

## From dielectric function to reported optical quantities

The complex refractive index $N(\omega)=n(\omega)+i\kappa(\omega)$ satisfies $N^2=\epsilon$ for the stated non-magnetic bulk convention. Absorption, reflectance, loss functions, and refractive indices are derived quantities with additional geometry and boundary assumptions. For example, an absorption coefficient often uses $\alpha(\omega)=2\omega\kappa(\omega)/c$, where $c$ is the speed of light. That conversion is meaningful only when the chosen dielectric response and sample geometry match the optical model. A bulk three-dimensional $\epsilon$ cannot be compared point by point with an absorbance measured for a thin supported flake without the appropriate thickness, environment, polarization, and multiple-reflection treatment.

For a slab supercell, vacuum enters the cell volume used to report a three-dimensional macroscopic response. Changing the vacuum can change the reported bulk-normalized tensor even when the isolated layer physics is unchanged. Report the supercell convention and, when appropriate, a declared two-dimensional polarizability or sheet-response transformation. Do not hide this normalization issue by treating a vacuum-dependent peak height as a material-intrinsic bulk dielectric constant.

## Numerical completion is observable-specific

An optical calculation is more than a non-self-consistent rerun. The k-point integration must resolve the transitions contributing over the desired energy range and in each reported direction. The number and character of unoccupied states must cover those transitions. The basis, pseudopotential or all-electron representation, velocity or length-gauge implementation, spin and spin--orbit treatment, occupation model, frequency grid, and local-field approximation all belong to the calculation identity.

The delta function is represented numerically by a stated broadening or integration scheme. Its width can merge peaks, move apparent maxima on a coarse grid, and change low-intensity structure. It is a numerical or phenomenological presentation choice unless a distinct lifetime model has been calculated; it is not itself a measured carrier lifetime or linewidth. Convergence must target the claimed observable: inspect selected tensor components, spectral weight, peak positions or integrated windows under justified changes to k sampling, empty-state coverage, frequency representation, and broadening. SCF convergence alone cannot establish optical-spectrum convergence.

## What independent particles omit

The spectrum uses the chosen one-electron energy differences and independent transition amplitudes. Semilocal Kohn--Sham gaps, quasiparticle gaps, and optical onset energies are different quantities. Electron--hole attraction can create bound or resonant excitons and redistribute oscillator strength; quasiparticle self-energy can shift energy differences; microscopic local fields can modify the macroscopic response. Time-dependent response, GW, and Bethe--Salpeter calculations address related effects with their own convergence and reference requirements. A scissor shift is a declared model adjustment, not evidence that a spectrum has acquired quasiparticle accuracy or excitonic structure.

Likewise, a negative or positive feature in a selected component does not establish a sample's colour, transparency, detector response, luminescence, or experimental peak assignment. Temperature, disorder, phonons, surfaces, substrates, finite thickness, carrier populations, and experimental geometry can change a measured signal. Keep the calculated response, the conversion model, and any experimental comparison as separate layers of evidence.

## Comparison, provenance, and the next question

Two spectra are comparable only after their structures, electronic state, functional and relativistic choices, k-space and empty-state coverage, tensor/polarization, energy zero, broadening, volume or sheet normalization, and post-processing are compatible or explicitly transformed. Preserve the ground-state lineage, input and code version, transition and response settings, raw dielectric data, units, axis convention, and every post-processing operation. A successful file or smooth curve supports only the traceable calculation it represents.

This topic establishes a declared independent-particle dielectric response and derived optical quantities within that model. **Time-Dependent Response and Spectroscopy** treats interacting response and excitation probes; **Quasiparticle Corrections** changes single-particle energy differences; **Excitons and the Bethe--Salpeter Equation** treats electron--hole correlations. It does not establish an experimental optical spectrum, an exciton binding energy, a quasiparticle gap, a lifetime, or material suitability for an optical device.

## Sources and methods

- [Adler, dielectric response of an interacting electron gas](https://doi.org/10.1103/PhysRev.126.413)
- [Wiser, dielectric constant with energy bands](https://doi.org/10.1103/PhysRev.129.62)
- [Gajdoš et al., linear optical properties in PAW](https://doi.org/10.1103/PhysRevB.73.045112)
- [VASP `LOPTICS` documentation](https://vasp.at/wiki/index.php/LOPTICS)
- [Yambo independent-particle RPA documentation](https://wiki.yambo-code.eu/wiki/index.php?title=RPA%2FIP)
- [Quantum ESPRESSO `pw2gw.x` input description](https://www.quantum-espresso.org/Doc/INPUT_pw2gw.html)

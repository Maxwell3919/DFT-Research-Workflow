---
topic_slug: time-dependent-response-and-spectroscopy
status: reviewed
---

Time-dependent response asks how the electron density of a declared reference state changes under a specified perturbation in time or frequency. It is the appropriate next model when an independent-particle transition sum omits the induced Hartree and exchange--correlation response. It does not make every calculated peak an experimental assignment: the perturbation, observable, response approximation, geometry, and comparison model remain part of the result.

## Choose the probe and numerical route first

Define the observable, perturbation, polarization or momentum transfer, boundary geometry, response kernel, and desired energy resolution. Choose real-time propagation, transition-space response, or a Sternheimer/Lanczos route, then retain the raw time signal or response solution. Inspect perturbation linearity, propagation or solver stability, transition-space completeness, causality/sum rules where applicable, polarization selection, Fourier/window dependence, and convergence of the reported peak or integrated response. This overview does not claim an executed spectroscopy calculation.

## The response function connects a perturbation to an observable

For a weak external perturbation $\delta v_{\mathrm{ext}}(\mathbf r',\omega)$, linear response defines the density change

$$
\delta n(\mathbf r,\omega)
= \int
\chi(\mathbf r,\mathbf r',\omega)
\delta v_{\mathrm{ext}}(\mathbf r',\omega)\,
d\mathbf r'.
$$

$\chi$ is the interacting density-response function; $\mathbf r$ and $\mathbf r'$ are positions, and $\omega$ is angular frequency. In TDDFT it is related to the independent Kohn--Sham response $\chi_0$ through a Dyson-like equation,

$$
\chi = \chi_0+\chi_0\left(v+f_{\mathrm{xc}}\right)\chi.
$$

Here $v$ is the Coulomb kernel and $f_{\mathrm{xc}}=\delta v_{\mathrm{xc}}/\delta n$ is the chosen exchange--correlation kernel. The equation states the scientific distinction: independent-particle transitions enter $\chi_0$, while screening and the kernel alter the collective response. A named functional alone does not define $f_{\mathrm{xc}}$, nor does a successful solution show that a kernel is adequate for a particular excitation.

## Three numerical routes can target related response

Real-time propagation applies a declared weak kick or field, propagates the time-dependent Kohn--Sham equations, records a dipole, current, or density, and Fourier transforms the time signal. Its spectral resolution depends on propagation duration, time discretization, damping/window convention, perturbation amplitude, and the treatment of boundaries. A longer trace can sharpen an artificial Fourier feature without repairing an inadequate spatial grid or response approximation.

Casida-style linear response constructs a transition-space problem from occupied and unoccupied reference states. It yields excitation energies and transition strengths within its declared approximation, but requires convergence of the transition space and care with spin character, degeneracy, and oscillator-strength conventions. Sternheimer or Liouville--Lanczos methods solve response equations without explicitly enumerating every empty state; this changes the numerical representation, not the need to converge the requested observable. Agreement between two routes is useful cross-method evidence only when their Hamiltonian, perturbation, boundary conditions, and reported quantity have been aligned.

## Spectra retain their probe and geometry

An absorption cross section for an isolated finite system, a periodic macroscopic dielectric tensor, electron-energy-loss response, Raman intensity, and a nonlinear susceptibility are not interchangeable outputs. Polarization, wave-vector limit, local-field convention, finite versus periodic boundary conditions, spin selection, temperature model, and orientational average can each alter the observable. A molecular dipole response does not acquire a bulk dielectric constant by changing units; a slab response needs its declared volume or sheet normalization; and a finite momentum-loss calculation is not an optical $\mathbf q\to0$ spectrum.

Broadening used to display discrete excitations or damp a time signal is not automatically a computed lifetime. Report its functional form and scale, the energy axis and zero, the polarization, units, and whether a peak is an eigenexcitation, a broadened transition, or a derived optical quantity. Compare integrated weight, selected features, and tensor components under justified numerical changes rather than reading physical linewidths from a plotting choice.

## Evidence needed before a spectroscopy claim

Converge the ground-state lineage first, then the response-specific spatial representation, k sampling or box/boundary representation, transition or iterative-response space, frequency or time representation, perturbation linearity, and spectral post-processing. Inspect causality or sum-rule diagnostics when applicable, symmetry and polarization selection, stability to analysis choices, and the model's treatment of screening, local fields, and electron--hole interaction. SCF convergence, a stable Fourier transform, or a visually plausible peak does not establish excitation-energy accuracy.

Experimental spectra can include vibronic structure, temperature, disorder, solvent or substrate screening, surfaces, finite thickness, instrumental resolution, populations, and an excitation process not represented by the calculated observable. Preserve the reference structure and state, software and version, kernel or interaction approximation, perturbation definition, numerical controls, raw time trace or response data, transformations, and uncertainty evidence. A calculated response can support a conditional statement about that model; it does not alone validate a material identity, colour, luminescence mechanism, or device performance.

This topic treats interacting time-dependent or linear response. **Independent-Particle Optical Properties** supplies a non-interacting transition baseline; **Quasiparticle Corrections** changes one-particle energy differences; **Excitons and the Bethe--Salpeter Equation** treats a specific two-particle electron--hole framework. It does not establish a quasiparticle gap, an exciton binding energy, a real lifetime, a nonlinear material coefficient, or experimental agreement.

## Sources and methods

- [Runge and Gross, time-dependent density-functional theory](https://doi.org/10.1103/PhysRevLett.52.997)
- [Casida, linear-response TDDFT implementation](https://doi.org/10.1103/PhysRevA.71.032514)
- [Octopus optical-response tutorials](https://octopus-code.org/documentation/main/tutorial/response/)
- [Octopus Casida linear-response documentation](https://www.octopus-code.org/documentation/15/manual/calculations/casida/)
- [Yambo nonlinear response documentation](https://wiki.yambo-code.eu/wiki/index.php/Correlation_effects_in_the_non-linear_response)

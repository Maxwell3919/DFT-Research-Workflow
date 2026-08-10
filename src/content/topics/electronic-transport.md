---
topic_slug: electronic-transport
status: reviewed
---

Electronic transport connects an electronic structure to the charge and heat currents produced by weak electric fields and temperature gradients. The central object is not a band gap, an effective mass, or a density of states alone. It is a non-equilibrium carrier distribution, together with velocities, occupations, and a declared model for how scattering returns that distribution toward equilibrium.

This topic concerns diffusive or semiclassical transport in an extended material. A nanoscale conductor whose contacts, finite scattering region, transmission channels, and bias profile are explicit belongs to **Quantum Transport**. The distinction matters: a bulk conductivity has units per length and depends on scattering, whereas a ballistic conductance is a contact-to-contact property and can remain finite without a bulk relaxation time.

## Inspect the full-zone carriers and transport maps

Start from a qualified electronic parent and calculate or interpolate energies and velocities over the full Brillouin zone; a high-symmetry line path is not transport sampling. View the Fermi surface or relevant isoenergy surfaces and inspect band velocities, valleys, and anisotropy before reducing them to tensors. For state-dependent scattering, inspect energy-, band-, or k-resolved lifetimes and transport contributions; for constant-$\tau$ work, keep $\sigma/\tau$ visibly distinct from an absolute conductivity.

Choose the temperature and chemical-potential or carrier-density domain, dimensional normalization, and scattering model before solving for $\sigma$, $S$, or $\kappa_e$. Plot tensor components and carrier-count mapping together, validate interpolation on withheld points, and test k mesh, bands, integration, derivatives, and scattering inputs. Boltzmann, EPC-based, Wannier, and visualization routes are indexed under [electronic properties](/DFT-Research-Workflow/operations/resource-landscape/#electronic-properties) and [specialist tools](/DFT-Research-Workflow/operations/resource-landscape/#specialist-tools). The CoSb3 guide reprocesses derived public data only; it does not run the parent electronic or transport calculation.

Make the first transport table traceable to the full-zone parent: retain the uniform-mesh eigenvalues and weights, Fermi level, band/velocity interpolation input, temperature and chemical-potential grid, carrier-count output, tensor units, and scattering model. A [Wannier90](/DFT-Research-Workflow/tools/wannier90/) or BoltzTraP-style route should compare interpolated energies and derivatives with withheld parent points before reading a `.condtens`-like tensor table; an [EPW](/DFT-Research-Workflow/tools/epw/) route must additionally retain the phonon/EPC parents and state-resolved lifetimes. If carrier counts fail to close, velocities change under interpolation, $\sigma/\tau$ is mistaken for $\sigma$, or a sign/peak shifts with mesh, return to the full-zone and scattering inputs rather than fitting a relaxation time to the desired curve.

## The response starts from a distribution, not a band plot

At equilibrium, state $(n,\mathbf{k})$ has energy $\epsilon_{n\mathbf k}$ and Fermi--Dirac occupation $f_0(\epsilon_{n\mathbf k},\mu,T)$. Its band velocity is

$$
\mathbf v_{n\mathbf k}
= \frac{1}{\hbar}
\nabla_{\mathbf k}\epsilon_{n\mathbf k}.
$$

where $n$ labels a band, $\mathbf k$ spans the full Brillouin zone, $\hbar$ is the reduced Planck constant, and the gradient is taken with respect to reciprocal-space wavevector. A line plot along selected symmetry directions does not contain the full set of velocities required by a transport integral.

A weak field or temperature gradient changes the distribution by $\delta f_{n\mathbf k}$. The linearized Boltzmann transport equation balances the driving term against a collision operator. Solving that equation yields a response only within its assumptions: well-defined quasiparticles, a near-equilibrium distribution, a specified scattering model, and a length scale on which a local bulk description is meaningful.

In a relaxation-time approximation, the electrical conductivity tensor can be written schematically as

$$
\sigma_{ab}(\mu,T)
= \frac{e^2}{V}\sum_{n\mathbf k}
\tau_{n\mathbf k}
v_{n\mathbf k,a}v_{n\mathbf k,b}
\left[-\frac{\partial f_0}{\partial\epsilon}\right]_{\epsilon_{n\mathbf k}}.
$$

$e$ is the positive elementary-charge magnitude, $V$ is the real-space normalization volume, $a$ and $b$ are Cartesian directions, and $\tau_{n\mathbf k}$ is a state- and possibly temperature-dependent transport relaxation time. The derivative of $f_0$ selects an energy window around the chemical potential; velocities determine which states carry current; $\tau_{n\mathbf k}$ determines how long the driven distribution persists. Depending on k-point weights and spin conventions, prefactors may be written differently, so units and normalization must travel with the output.

## Transport moments separate what the bands provide from what scattering supplies

Energy-weighted velocity moments combine the full-zone bands with $\tau_{n\mathbf k}$ and the occupation window. They produce conductivity, Seebeck, and electronic thermal-conductivity tensors only under the declared normalization and collision model. Tensor order matters in anisotropic systems; componentwise division is not generally valid.

If every $\tau_{n\mathbf k}$ is replaced by one constant $\tau$, then $\sigma/\tau$ and $\kappa_e/\tau$ are band-structure transport functions rather than absolute conductivities. The common factor cancels from $S$ only under that strict assumption. A constant-$\tau$ result can compare band-shape trends under one shared model; it cannot determine absolute mobility or resistivity.

## Chemical potential is not automatically a realizable carrier concentration

Transport is often evaluated as a function of chemical potential and temperature. Converting $\mu$ into electron or hole concentration requires integration of the same electronic states with a declared cell volume, dimensional normalization, spin counting, and charge-neutrality convention. In a semiconductor, ionized dopants, defects, compensating centres, and temperature-dependent band edges can determine the actual chemical potential.

A rigid-band scan changes occupations while leaving the band energies and wavefunctions fixed. It is a model for dilute perturbations, not proof that a chosen carrier concentration can be introduced without structural relaxation, impurity states, band renormalization, phase change, or compensation. Comparing two materials at the same $\mu-E_{\mathrm{edge}}$ answers a different question from comparing them at the same carrier concentration, temperature, and scattering model.

Mobility introduces another normalization:

$$
\mu_{\mathrm{drift},ab}
= \frac{\sigma_{ab}}{n|e|}.
$$

for a single dominant carrier density $n$ under compatible tensor and sign conventions. In multiband or bipolar transport this scalar reduction can hide coupled electron and hole currents. Hall mobility additionally depends on magnetic-field response and need not equal drift mobility.

## Scattering is a physical model, not a fitting footnote

Electron--phonon, ionized-impurity, neutral-defect, alloy, electron--electron, boundary, and other processes can contribute different state, energy, direction, and temperature dependences. Adding inverse lifetimes by Matthiessen's rule assumes statistically independent channels and can fail when mechanisms interfere or when the collision operator couples states strongly.

The self-energy relaxation-time approximation replaces the collision operator by diagonal state lifetimes. An iterative Boltzmann solution retains scattering-in terms that redistribute the non-equilibrium population among states. The two can differ substantially when forward scattering or anisotropy is important. A quasiparticle linewidth is also not automatically a transport lifetime: small-angle events may broaden a state while relaxing little current.

First-principles electron--phonon transport therefore consumes more than band energies. It needs phonons, electron--phonon matrix elements, energy-conserving phase space, occupations, long-range polar or quadrupolar terms where relevant, and dense electronic and vibrational sampling. Defect- or impurity-limited claims require their own concentrations, charge states, screening, and disorder model. Omitting a mechanism defines the result as limited by the included channels; it does not establish the total experimental mobility.

## Numerical convergence follows the transport window

Transport weights combine sharp occupation derivatives, velocities, near-degeneracies, and scattering phase space. Converge the reported observable over the full temperature and chemical-potential or carrier-density domain, not merely the total energy or a band-path appearance. Relevant tests can include parent electronic-state convergence, number of bands, full-zone k meshes, interpolation quality and derivatives, energy integration or smearing, q meshes for phonon scattering, delta-function treatment, and solver iteration.

Validate an interpolation against directly calculated energies and, when used, velocity or momentum matrix elements on withheld points, especially near band crossings and closely spaced valleys. A visually smooth band curve can have inaccurate derivatives. Check symmetry-equivalent tensor components, Onsager relations where applicable, carrier-count closure, limiting behaviour, and unit conversions. Compare constant-$\tau$, state-dependent-lifetime, and iterative solutions only when their inputs and reported quantities are aligned.

Electronic thermal conductivity is not the lattice thermal conductivity from **Lattice Thermal Transport**. The Seebeck coefficient is not a direct measure of conductivity, and a large power factor $S^2\sigma$ does not establish a large thermoelectric figure of merit without lattice heat transport, geometry, contacts, temperature stability, and the same scattering model. Agreement with one experimental number can mask compensating errors in carrier density, band structure, and lifetime.

## Preserve enough lineage to reuse the result

Archive the structure and electronic-state identity; functional and quasiparticle corrections; spin, SOC, and dimensional convention; cell volume or sheet-thickness normalization; bands and k weights; interpolation representation and validation; temperature and chemical-potential/carrier grids; scattering mechanisms and approximations; lifetimes or collision kernels; solver settings; tensor basis; units; convergence series; and any experimental inputs. Store $\sigma/\tau$ as such rather than silently assigning a lifetime later.

The subordinate CoSb3 example shows how a real published `.condtens` output can be traced and replotted. It verifies source bytes, selected columns, units, and a sign change in that frozen output; it does not rerun the parent electronic structure, prove transport convergence, or establish experimental behaviour.

## Sources and methods

- [Madsen and Singh, the original BoltzTraP method](https://arxiv.org/abs/cond-mat/0602203)
- [Madsen, Carrete, and Verstraete, BoltzTraP2](https://arxiv.org/abs/1712.07946)
- [Pizzi and co-workers, BoltzWann](https://arxiv.org/abs/1305.1587)
- [Ponce and co-workers, first-principles carrier transport review](https://arxiv.org/abs/1908.01733)
- [EPW GaN-II tutorial: SERTA and iterative BTE](https://docs.epw-code.org/tutorials/GaN-II.html)

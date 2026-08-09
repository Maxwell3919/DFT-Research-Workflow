---
topic_slug: dielectric-response-and-born-effective-charges
status: reviewed
---

Dielectric response asks how the polarization or displacement field of a specified state changes under a specified electric perturbation. Born effective charges ask how macroscopic polarization changes when a sublattice is displaced, or equivalently how a force changes under an electric field. These are linear-response derivatives, not fixed ionic valences and not a generic optical spectrum. Their meaning depends on frequency, electrical boundary condition, ionic freedom, crystal state, and the macroscopic-field convention used for a periodic solid.

## Obtain and audit the requested response tensor

Start from an accepted insulating reference state. Decide whether the target is the ion-clamped dielectric tensor, a static response including lattice motion, or Born effective charges, then choose a compatible DFPT or signed finite-difference route. Inspect every tensor component, units, symmetry, solver warnings, the Born-charge acoustic sum, and any non-analytic phonon data that consume the result. Converge the tensor itself against the electronic representation, k sampling, perturbation settings, and response solver. The Silicon guide checks one real QE 7.5 Gamma response only; one Gamma calculation and one setup do not establish dielectric or phonon convergence.

## Separate the response functions before comparing numbers

At low frequency, the electronic or ion-clamped dielectric tensor $\epsilon_\infty$ describes the electronic polarization response while nuclei are fixed. The static tensor $\epsilon_0$ additionally includes allowed ionic displacement contributions in an insulating stable structure. A schematic relation is

$$
\boldsymbol{\epsilon}_0
= \boldsymbol{\epsilon}_{\infty}
+ \boldsymbol{\epsilon}_{\mathrm{ion}} .
$$

where every term is a tensor under a declared unit system and boundary condition. $\epsilon_{\mathrm{ion}}$ is not a universal correction: it depends on zone-centre vibrational modes, Born effective charges, force constants, and which structural degrees of freedom are permitted to respond. A metal, a gapped crystal, a two-dimensional slab in vacuum, and a finite molecule do not share one interchangeable “dielectric constant.”

Frequency also changes the question. A static response, an independent-particle optical dielectric function, and a frequency-dependent interacting response have different perturbations and physical content. Do not compare a zero-frequency static $\epsilon_0$ to an optical refractive-index measurement or a high-frequency $\epsilon_\infty$ without identifying what ions, carriers, local fields, temperature, and frequency range each quantity includes.

## Born effective charge is a dynamical tensor

For atom $\kappa$, Cartesian directions $\alpha$ and $\beta$, and cell volume $\Omega$, the Born effective charge is conventionally written

$$
Z^{*}_{\kappa,\alpha\beta}
= \left.\frac{\Omega}{e}\frac{\partial P_\alpha}{\partial u_{\kappa\beta}}\right|_{\mathbf E}
= \left.\frac{1}{e}\frac{\partial F_{\kappa\beta}}{\partial E_\alpha}\right|_{\mathbf u}.
$$

$P_\alpha$ is the macroscopic polarization component, $u_{\kappa\beta}$ is a rigid sublattice displacement, $E_\alpha$ is the macroscopic electric field, $F_{\kappa\beta}$ is the force, and $e$ is the elementary charge. The equality connects two reciprocal linear-response routes when the same conventions and constraints are used. Index order and sign conventions differ among codes and papers; preserve the displayed convention instead of silently transposing a tensor.

$Z^*$ measures a polarization or force derivative in the crystal. It can differ substantially from a nominal oxidation state or an atom-centred charge partition because covalency, hybridization, and collective electronic screening contribute to the response. In an insulating periodic crystal it also obeys an acoustic sum rule, $\sum_\kappa Z^*_{\kappa,\alpha\beta}=0$, for each tensor component when all atoms in the chosen cell are included. Sum-rule closure is a diagnostic of the calculated response and convention; it does not prove that each individual tensor entry or the physical model is accurate.

## State and electrical boundary condition are inputs to the observable

The response must consume a named reference structure and electronic state. A changed magnetic order, charge state, strain, structural domain, Hubbard model, exchange--correlation functional, or pseudopotential can change both dielectric and Born-charge tensors. For polar or piezoelectric systems, specify whether derivatives are at fixed electric field $E$, fixed displacement field $D$, fixed strain, or relaxed strain. These are different thermodynamic derivatives, not interchangeable post-processing views.

Macroscopic polarization in a periodic solid has a branch structure. Only polarization changes along a continuous insulating path are directly comparable; an arbitrary absolute branch must not be used as a raw charge label. A path that becomes metallic or changes electronic state can invalidate the intended adiabatic derivative. For slabs and low-dimensional materials, the supercell volume includes vacuum, so a three-dimensional dielectric tensor changes when the vacuum length changes. Report a vacuum-independent polarizability or an explicitly defined effective convention instead of treating a supercell-dependent number as a bulk material constant.

## Choose and cross-check a response route

DFPT obtains the derivative of the self-consistent state with respect to an infinitesimal perturbation. Finite-field or finite-displacement calculations estimate the same derivative from a controlled sequence of small signed perturbations. These are complementary implementations, not a licence to mix their references. A finite-difference check requires symmetric perturbations, stable polarization branch tracking, consistent electronic settings, and a tested perturbation range. DFPT still needs convergence with respect to the reference electronic state, reciprocal sampling, basis/grid representation, empty-state treatment where applicable, local-field treatment, and the response solver.

Compare independent routes when they answer the same constrained question. Check tensor symmetry implied by the actual state, the Born-charge acoustic sum rule, mode effective charges, and the relation of $\epsilon_\infty$ and $Z^*$ to the non-analytic long-range correction used in polar phonons. A successful SCF or response-solver termination does not show that the target tensor, LO--TO splitting, mode frequency, or downstream dielectric-dependent observable has converged.

## What the results support

The tensor may support a conditional statement about linear static electronic or ionic response of the declared model. Large or anomalous Born effective charges can motivate a bonding or polar-instability hypothesis, but they do not alone demonstrate ferroelectric switching, a spontaneous polarization branch, a phase transition, a dielectric breakdown field, a device capacitance, or an experimental dielectric constant. Those claims need their own structural paths, fields, defects, domain physics, finite-temperature sampling, geometry, and measurement-model evidence.

Retain the reference lineage; electric and mechanical boundary conditions; frequency and ion-relaxation choice; perturbation or DFPT setup; tensor conventions and units; all component values; sum-rule and symmetry diagnostics; convergence traces; and the link to any phonon or piezoelectric calculation that consumes the results. This preserves the distinction between a calculated response derivative and a larger scientific conclusion.

This topic establishes traceable dielectric and Born-effective-charge response tensors for a declared insulating or otherwise explicitly qualified model. It does not establish optical absorption, excitonic screening, a polar ground state, ferroelectricity, a finite-temperature dielectric constant, dielectric breakdown, device performance, or experimental agreement.

## Sources and methods

- [Hohenberg and Kohn, density-functional foundation](https://doi.org/10.1103/PhysRev.136.B864)
- [Kohn and Sham, self-consistent equations](https://doi.org/10.1103/PhysRev.140.A1133)
- [Baroni et al., DFPT review](https://doi.org/10.1103/RevModPhys.73.515)
- [Gonze and Lee, dielectric and Born-charge DFPT](https://doi.org/10.1103/PhysRevB.55.10355)
- [Quantum ESPRESSO `ph.x` dielectric and effective-charge inputs](https://www.quantum-espresso.org/Doc/INPUT_PH.html)
- [VASP Born effective charges](https://vasp.at/wiki/Born_effective_charges)
- [VASP electric-field DFPT response](https://vasp.at/wiki/Electric_field_response_from_density-functional-perturbation_theory)

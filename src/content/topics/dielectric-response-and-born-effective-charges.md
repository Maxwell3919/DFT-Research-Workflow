---
topic_slug: dielectric-response-and-born-effective-charges
status: reviewed
---

Dielectric response asks how the polarization or displacement field of a specified state changes under a specified electric perturbation. Born effective charges ask how macroscopic polarization changes when a sublattice is displaced, or equivalently how a force changes under an electric field. These are linear-response derivatives, not fixed ionic valences and not a generic optical spectrum. Their meaning depends on frequency, electrical boundary condition, ionic freedom, crystal state, and the macroscopic-field convention used for a periodic solid.

## Read the response in the crystal axes

Open the accepted insulating structure and establish how its crystallographic directions map onto the Cartesian tensor printed by the software. Decide whether the target is the ion-clamped dielectric tensor, a static response including lattice motion, or Born effective charges. Choose DFPT or a compatible signed finite-field/displacement route, then read the complete tensor table rather than only its diagonal or a scalar average. For Born charges, compare atoms related by the actual symmetry, inspect the acoustic-sum residual, and view the displacement direction or polar phonon mode that will consume the tensor.

Converge the tensor itself against the electronic representation, k sampling, perturbation settings, and response solver. For polar phonons, inspect the dispersion and LO--TO behaviour with compatible dielectric and charge tensors; a table alone does not show the mode character. The Silicon guide checks one real QE 7.5 Gamma response only, so its plot is a transcription aid rather than a complete response workflow. See the [electronic-property resources](/DFT-Research-Workflow/operations/resource-landscape/#electronic-properties) and [lattice-dynamics routes](/DFT-Research-Workflow/operations/resource-landscape/#lattice-dynamics) for major implementations and visual tools.

For a concrete DFPT route, keep the ground-state input and output beside the response input, response output, dynamical matrix, and separate stderr record. In [Quantum ESPRESSO](/DFT-Research-Workflow/tools/quantum-espresso/), verify that `ph.x` consumes the accepted `pw.x` `prefix`/`outdir` lineage, then locate the complete dielectric and effective-charge blocks in `ph.out`; in [VASP](/DFT-Research-Workflow/tools/vasp/), inspect the corresponding tensor records in the main output instead of relying on a GUI scalar. Use [VESTA](/DFT-Research-Workflow/tools/vesta/) or another structure viewer to keep atom labels and Cartesian axes visible while reading atom-resolved tensors. If the response solver fails, Born-charge neutrality is poor, or symmetry-related atoms disagree, preserve the raw blocks and check the parent state, k mesh, thresholds, tensor convention, and atom mapping before applying a sum rule or reporting an average.

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

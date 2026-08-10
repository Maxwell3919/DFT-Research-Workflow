---
topic_slug: piezoelectric-response
status: reviewed
---

Piezoelectric response connects a mechanical perturbation to a change in macroscopic polarization, or an electric perturbation to stress or strain. It is a linear derivative of a declared insulating crystal state under declared electrical and mechanical boundary conditions. A polar crystal, a finite polarization difference, or a large dielectric constant is not itself a piezoelectric coefficient.

## Inspect the axes, deformation, and tensor together

Decide whether the required output is $e$, $d$, or another constitutive tensor and declare the electrical, mechanical, clamped-ion, and internally relaxed conditions. Open the reference structure with its crystallographic axes visible, record the Cartesian and Voigt conventions, and inspect representative positive and negative deformations. When internal coordinates relax, compare the actual atomic motion with the clamped structure; the two responses are different physical objects, not two columns to combine without inspection.

Run compatible DFPT or signed finite-strain calculations, follow the polarization branch, and plot each requested tensor component against the applied perturbation before fitting it. Inspect symmetry, units, linearity, branch continuity, and conversion inputs. Converge every elastic or dielectric tensor used to obtain a different coefficient. The subordinate ledger is synthetic-only and demonstrates arithmetic with invented entries; it is not a piezoelectric workflow. Relevant response codes, GUI tools, and manuals are grouped under [electronic properties](/DFT-Research-Workflow/operations/resource-landscape/#electronic-properties) and [specialist tools](/DFT-Research-Workflow/operations/resource-landscape/#specialist-tools).

In the working directory, pair every signed strain or field with its actual structure, polarization or stress output, internal-coordinate status, and tensor convention. View representative clamped and relaxed cells in [VESTA](/DFT-Research-Workflow/tools/vesta/), and read the full tensor from the version-matched [VASP](/DFT-Research-Workflow/tools/vasp/), [Quantum ESPRESSO](/DFT-Research-Workflow/tools/quantum-espresso/), or other response output before converting between $e$ and $d$. If a branch jump creates an anomalous slope, symmetry-related entries disagree, or the compliance conversion is ill-conditioned, stop and inspect the raw perturbation series and the separately converged elastic tensor; do not repair the table component by component.

## Decide which constitutive tensor answers the question

The direct piezoelectric stress tensor is commonly written

$$
e_{iJ}
= \left.\frac{\partial P_i}{\partial \eta_J}\right|_{\mathbf E}.
$$

where $P_i$ is polarization, $\eta_J$ is a symmetric strain in Voigt notation, $\mathbf E$ is electric field, and $i$ and $J$ label Cartesian electrical and mechanical components. The converse relation gives the electric-field derivative of stress under the compatible mechanical constraint. The strain tensor $d_{iJ}=\left.\partial P_i/\partial\sigma_J\right|_{\mathbf E}$ instead uses stress $\sigma_J$; it is related to $e$ through the appropriate elastic compliance or stiffness. $e$, $d$, voltage coefficients, and electromechanical coupling factors therefore have different units and require different elastic, dielectric, and boundary-condition inputs. They must not be compared as interchangeable tables.

Crystal symmetry constrains which tensor components can be nonzero, but symmetry does not replace calculation or convergence. State the conventional cell, axis convention, Voigt ordering, stress sign convention, electric boundary condition, and whether a reported tensor is proper or improper before comparing it with another calculation or measurement.

## Electronic and internal-relaxation responses are different derivatives

At fixed ion positions, the clamped-ion contribution describes the immediate electronic change in polarization with strain. Allowing internal coordinates to relax adds an ionic contribution mediated by internal strain, force constants, and Born effective charges. A schematic decomposition is

$$
\mathbf e
= \mathbf e^{\mathrm{clamped}}
+ \mathbf e^{\mathrm{internal}}.
$$

The second term can be large near a soft but stable mode, and it changes if the internal constraints, structural state, or electrical boundary condition changes. It does not justify calling a response large without reporting which contribution is included. A fully relaxed response may further involve macroscopic strain relaxation; it is not equivalent to a fixed-cell $e$ tensor.

DFPT evaluates these derivatives around one reference state. Finite differences can provide an independent check only when positive and negative strains use compatible cells, the same electronic state is retained, ionic constraints are identical, and the strain range is verified to be in the intended linear regime. A fitted slope from one strain sign, one branch of a polarization calculation, or one unconstrained relaxation cannot establish the requested tensor.

## Follow polarization branches while applying strain

Because periodic polarization is defined modulo a polarization quantum, a piezoelectric finite difference must follow the continuous branch as strain changes. The derivative belongs to a specified path near the reference state. A branch jump can look like a giant response even when it is only a bookkeeping change. Preserve the cell definition and reciprocal-space convention across strained images; a cell transformation can also change the tensor representation.

For a slab or monolayer, the three-dimensional supercell volume includes vacuum. A bulk-style $e$ or $d$ reported without a vacuum-independent two-dimensional convention changes with the chosen cell height. Report the normalization and mechanical thickness convention explicitly, and do not compare it directly with a three-dimensional bulk coefficient.

## Convergence and interpretation

Converge the target tensor and any elastic or dielectric conversion quantity, not merely the SCF residual. Test reciprocal sampling, basis/grid representation, response-solver settings, strain derivative or perturbation range, symmetry handling, relaxed internal degrees of freedom, and the reference state. Check tensor symmetry only after confirming the intended structural symmetry; enforcing an incorrect symmetry can hide a real distortion, while a numerically broken symmetry can create spurious components.

A linear tensor can support a conditional statement about the small-signal response of the declared model. It does not establish a usable actuator displacement, generator output, coercive field, switching endurance, breakdown limit, experimental coefficient, or device performance. Those claims additionally depend on geometry, electrodes, domains, defects, temperature, nonlinear response, mechanical boundary conditions, and measurement protocol.

Retain the reference lineage, structure and state, all mechanical and electrical constraints, tensor convention and units, clamped/internal/relaxed decomposition, branch tracking, perturbation or DFPT records, conversion inputs, convergence evidence, and links to the elastic and dielectric calculations consumed by the result. The following phonon topic addresses vibrational normal modes and stability; a piezoelectric response does not itself establish that a mode is dynamically stable.

## Sources and methods

- [Wu, Vanderbilt, and Hamann, DFPT treatment of strain, displacements, and fields](https://doi.org/10.1103/PhysRevB.72.035105)
- [Baroni et al., DFPT review](https://doi.org/10.1103/RevModPhys.73.515)
- [VASP electric-field DFPT response](https://vasp.at/wiki/Electric_field_response_from_density-functional-perturbation_theory)
- [VASP linear response](https://vasp.at/wiki/Linear_response)
- [VASP piezoelectric tensor interface](https://vasp.at/py4vasp/0.9/raw/piezoelectric_tensor/)
- [Quantum ESPRESSO `ph.x` input description](https://www.quantum-espresso.org/Doc/INPUT_PH.html)

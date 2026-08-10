---
topic_slug: electrostatic-potential-and-band-alignment
status: reviewed
---

## Place the potential profile beside the geometry

Open the slab or interface and identify its normal, surfaces, layers, vacuum regions, and dipole direction. Plot the planar and, where appropriate, macroscopic average of the potential on the same spatial coordinate. Select bulk-like or field-free reference regions by inspecting the curve and structure together; do not let an unattended plateau detector make that physical decision.

For band offsets, display the separate bulk references and interface lineup in one auditable diagram with a common convention. Check thickness, vacuum, dipole correction, and residual field before reading a number. Relevant plotting routes appear under [electronic-property tools](/DFT-Research-Workflow/operations/resource-landscape/#electronic-properties), [visual tools](/DFT-Research-Workflow/operations/resource-landscape/#visual-symmetry), and [specialist tools](/DFT-Research-Workflow/operations/resource-landscape/#specialist-tools).

Use electrostatic-potential analysis when a surface work function, bulk-to-bulk reference, explicit-interface band offset, field, or charged-defect correction needs an energy reference. The parent object is an accepted slab, bulk, or interface electronic state with its boundary conditions, geometry, charge, spin/SOC state, occupations, electrostatic corrections, and raw potential field preserved.

Decide the reference construction before plotting. A periodic potential has an arbitrary additive constant, so absolute values from separate calculations cannot be compared directly. A plotted profile is not automatically a vacuum level, built-in field, band offset, Schottky barrier, or device diagram.

## A periodic potential needs a reference before it can align energies

No executed practical guide currently accompanies this topic. The bounded implementation route is therefore code-specific:

- With Quantum ESPRESSO, start from the compatible parent state and use the documented `pp.x` potential selector to write a volumetric potential. The available field definitions and selector values depend on the installed release; use the linked `INPUT_PP` and post-processing guide rather than assuming a remembered value.
- With VASP, retain `LOCPOT` from the declared parent calculation and verify from the linked documentation which local-potential components were written for that setup.

Hartree, ionic-plus-Hartree local, total local Kohn--Sham, PAW-reconstructed, and spin-dependent potentials are not interchangeable. Preserve the exact field definition, pseudopotential or PAW convention, grid, units, corrections, and parent-state identity. The downstream plane-averaging tool may be a code utility or a transparent analysis script, but its input field, direction, origin, and integration weights must remain inspectable.

## Find a real reference region

For a slab whose averaging plane has area $A$, form the planar average

$$
\bar V(z) = \frac{1}{A}\int_A V(x,y,z)\,dx\,dy.
$$

Inspect the raw and averaged arrays together. Record the averaging direction, cell vectors, grid, origin, units, interpolation, and any macroscopic-averaging window. Averaging removes atomic-scale oscillations; it cannot manufacture a vacuum plateau or bulk-like region that the model does not contain.

For a surface work function, identify a side-specific plateau in the same slab state and evaluate

$$
\Phi = V_{\mathrm{vac}} - E_{\mathrm F}.
$$

An asymmetric slab may have two different plateaus. Do not average them into one value. A residual slope must be traced to the model, such as a physical dipole, external field, periodic-image interaction, insufficient vacuum, or correction convention, rather than hidden by smoothing.

## Vacuum alignment is a surface construction

The vacuum reference is usable only when a side-specific plateau exists under the declared electrostatic treatment. Its value remains conditional on termination, reconstruction, adsorption, charge, external field, dipole correction, geometry, and electronic state.

## Vacuum alignment and an interface lineup answer different questions

A bonded interface generally cannot be reconstructed by aligning two independent vacuum slabs. For a declared interface, a common valence-band lineup is

$$
\Delta E_v =
\left(E_v^B - V_{\mathrm{ref}}^B\right)
- \left(E_v^A - V_{\mathrm{ref}}^A\right)
+ \Delta V_{\mathrm{interface}}.
$$

Obtain the bulk band-edge-to-reference terms with the same Hamiltonian and structural convention used for the interface constituents, then extract the reference shift from bulk-like regions of the explicit interface. Orientation, registry, termination, strain partition, relaxation, polarization, defects, and charge state belong to this calculation object.

Potential alignment supplies an energy zero; it does not establish accurate band edges. Confirm how the valence and conduction extrema were found over the full Brillouin zone, whether spin/SOC and occupations match, and whether any quasiparticle correction is compatible on both sides. A shared plotting zero or shifted Fermi level is not an alignment calculation.

## Band edges and offsets require their own electronic evidence

The potential reference and band-edge calculation must remain separately inspectable. A Kohn--Sham lineup remains a Kohn--Sham result unless a compatible correction is justified for every compared constituent.

## Decide whether the reference is usable

Check normal postprocessor termination, field identity, grid and units first. Then test the decision-relevant reference against grid refinement, averaging window, slab or interface thickness, vacuum, dipole correction, and reference-region selection. Inspect both sides of asymmetric models and retain the raw profile so that a plateau or shift can be re-evaluated.

## Preserve the complete alignment construction

Accept the result only when the selected reference region exists and the reported work function or lineup is stable to the tested numerical and model choices. Preserve the structures, field definition, raw and averaged arrays, selected regions, band-edge search, corrections, and sensitivity tests. The supported claim is a conditional reference or offset for the specified surface, bulk pair, or explicit interface. It does not establish an absolute potential, experimental band offset, Schottky barrier, carrier concentration, contact resistance, interface stability, or device performance from one potential profile.

## Sources and methods

- [Kohn and Sham, self-consistent equations](https://doi.org/10.1103/PhysRev.140.A1133)
- [Van de Walle and Martin, theoretical band offsets](https://doi.org/10.1103/PhysRevB.35.8154)
- [Bengtsson, dipole correction for slabs](https://doi.org/10.1103/PhysRevB.59.12301)
- [Quantum ESPRESSO post-processing guide](https://quantum-espresso.org/Doc/pp_user_guide/node6.html)
- [Quantum ESPRESSO `pp.x` documentation](https://www.quantum-espresso.org/Doc/INPUT_PP.html)
- [VASP `LOCPOT` documentation](https://vasp.at/wiki/LOCPOT)

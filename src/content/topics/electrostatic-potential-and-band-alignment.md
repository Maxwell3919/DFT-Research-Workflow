---
topic_slug: electrostatic-potential-and-band-alignment
status: reviewed
---

Electrostatic-potential analysis creates a reference for comparing energies whose zero is otherwise arbitrary in a periodic calculation. It can support a surface work function, a bulk-to-bulk lineup, an explicit interface band offset, or a charged-defect correction. It does so only when the potential field, averaging operation, geometry, boundary conditions, and compared electronic states are specified.

A plotted potential profile is therefore not automatically a vacuum level, built-in field, band offset, Schottky barrier, or device band diagram. The scientific result is the reference construction and its tested domain, not the plot alone.

## Separate the arbitrary zero from a measurable difference

Adding a constant to a periodic potential changes neither the charge density nor the forces, but it shifts the displayed energy reference. Absolute potential values from separate periodic calculations cannot therefore be compared directly.

A useful alignment is a difference built from a common reference, such as:

- a side-specific vacuum plateau in one slab calculation;
- a bulk-like macroscopic average;
- a local core-like marker with controlled chemical environment;
- a reference shift extracted across one explicit interface.

The potential field itself must be identified. Codes may output the Hartree contribution, an ionic-plus-Hartree local potential, a total local Kohn--Sham potential, reconstructed PAW fields, or spin-dependent components. These are not interchangeable. Use one compatible definition throughout the comparison and preserve the pseudopotential, PAW, charge, solvent, dipole-correction, and boundary conventions that determine it.

## Averaging removes oscillations; it does not create a reference region

For a slab periodic in the plane, a planar average may be written

```text
Vbar(z) = 1/A ∫_A V(x,y,z) dx dy,
```

where `A` is the area of the chosen plane. A macroscopic average then smooths the atomic-scale oscillations over a declared window.

This operation helps reveal vacuum-like or bulk-like regions, but it cannot manufacture them. A valid reference region must already exist in the model and remain stable under reasonable changes to grid, averaging window, slab thickness, and vacuum.

Record the averaging direction, cell vectors, grid, origin, units, interpolation, window, and exact field used. Without those details, two visually similar profiles may represent different quantities.

## Vacuum alignment is a surface construction

For an isolated surface, the work function is commonly constructed from a side-specific vacuum level and the electron chemical potential of the same electronic state. The vacuum reference is defensible only where the profile reaches a plateau under the declared electrostatic treatment.

A residual slope can indicate a physical dipole, an external field, periodic-image interaction, insufficient vacuum, or the effect of a correction convention. It must be diagnosed rather than averaged away. An asymmetric slab may have different vacuum levels on its two sides and therefore different work functions; averaging the two plateaus erases the surface-specific result.

The work function remains conditional on termination, reconstruction, adsorption, charge, field, dipole, geometry, and electronic state. It is not a universal property of a composition.

## An explicit interface lineup includes interface physics

A bonded heterojunction cannot generally be reconstructed by aligning two independent vacuum slabs. The interface can introduce charge redistribution, chemical bonding, polarization, strain, and a potential step that does not exist in either isolated constituent.

A common lineup separates bulk band-edge-to-reference terms from the reference shift measured in the interface calculation:

```text
ΔE_v = (E_v^B - Vref^B)
       - (E_v^A - Vref^A)
       + ΔV_interface .
```

`E_v^A` and `E_v^B` are method-consistent valence-band edges, `Vref` is a compatible bulk reference, and `ΔV_interface` is the reference shift across the explicit interface. Orientation, registry, termination, strain partition, relaxation, polarization, defects, and charge state are part of the defined object.

A vacuum-aligned electron affinity can be useful for an isolated constituent, but it does not include the interface lineup term and should not be reported as the bonded-interface offset without additional evidence.

## Band edges require a separate electronic analysis

Potential alignment sets the reference; it does not determine whether the band edges are accurate. Define how the valence and conduction extrema were found over the full Brillouin zone, the Hamiltonian and structural state used, spin and SOC treatment, occupations, and any quasiparticle correction.

A shared plotting zero or shifted Fermi level is not an alignment construction. Likewise, a Kohn--Sham band offset remains a Kohn--Sham result unless a compatible correction is introduced and justified for both constituents.

Core levels can act as local markers only when their site, chemical environment, strain, charge, and potential convention are controlled. A chemically shifted core state is not a universal ruler.

## Fields and finite models constrain the interpretation

A slope in a potential profile can diagnose an electric field only after the derivative direction, units, boundary conditions, and reference region are specified. Finite slabs may be too thin to contain realistic depletion widths or band bending. Metallic screening, ferroelectric polarization, charged defects, gates, solvent, and external fields can all make the profile strongly state dependent.

A potential step does not by itself prove a Schottky barrier, carrier injection efficiency, contact resistance, or device performance. Those claims require compatible band-edge, occupation, transport, and often finite-temperature evidence.

## Preserve the complete alignment construction

Keep the structures, surfaces or interface terminations, orientation and registry, cell and strain, charge/spin/SOC state, occupations, potential-output definition, pseudopotential or PAW convention, grid, raw and averaged arrays, reference-region selection, band-edge search, lineup equation, corrections, and sensitivity tests.

This topic can establish a tested electrostatic reference for a specified surface, bulk comparison, or explicit interface. It does not establish an absolute universal potential, experimental band offset, Schottky barrier, carrier concentration, transport coefficient, interface stability, or device behaviour from one profile alone.

## Sources and methods

- [Kohn and Sham, self-consistent equations](https://doi.org/10.1103/PhysRev.140.A1133)
- [Van de Walle and Martin, theoretical band offsets](https://doi.org/10.1103/PhysRevB.35.8154)
- [Bengtsson, dipole correction for slabs](https://doi.org/10.1103/PhysRevB.59.12301)
- [Quantum ESPRESSO post-processing guide](https://quantum-espresso.org/Doc/pp_user_guide/node6.html)
- [Quantum ESPRESSO `pp.x` documentation](https://www.quantum-espresso.org/Doc/INPUT_PP.html)
- [VASP `LOCPOT` documentation](https://vasp.at/wiki/LOCPOT)

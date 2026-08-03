---
topic_slug: electrostatic-potential-and-band-alignment
status: reviewed
---

Electrostatic-potential analysis provides a reference construction for comparing energies that otherwise carry an arbitrary periodic gauge. It can support a surface work function, a band lineup, or a charged-defect correction only when the potential quantity, averaging operation, geometry, electrostatic boundary condition, and comparison object are explicit. A plotted potential trace is not automatically a vacuum level, a band offset, a built-in field, or a device band diagram.

## A periodic potential needs a reference before it can align energies

Adding a constant to an electrostatic potential changes no forces or charge density but shifts every displayed eigenvalue reference. Absolute values from separate periodic calculations are therefore not directly comparable. The useful quantity is a declared difference: a common core-like local reference, a bulk-like average, a vacuum plateau, or a lineup extracted from one explicit interface calculation.

The output must also be identified. A code can write an electrostatic contribution, a local ionic-plus-Hartree potential, a total local potential containing exchange--correlation terms, or spinor components. These are different fields. Do not replace one with another silently or compare profiles made with different pseudopotential, PAW reconstruction, charge, solvent, dipole-correction, or boundary conventions.

## Averaging reveals a reference only where a suitable region exists

For a slab periodic in the plane, a planar average may be written

```text
Vbar(z) = 1/A ∫_A V(x,y,z) dx dy,
```

where `A` is the area of the declared plane. A macroscopic average further convolves this profile with a stated window. Averaging suppresses atomic oscillations; it does not manufacture a field-free vacuum or bulk-like region. Record direction, cell vectors, grid, interpolation, window, origin, unit, and the exact potential field used.

A vacuum level is defensible only when the chosen nonperiodic region displays a plateau under the declared electrostatic treatment. A residual slope can reflect a physical dipole, periodic-image interaction, an external field, insufficient separation, or a correction convention. For asymmetric slabs, the two sides may have different plateaus and therefore different work functions; averaging them would erase the surface-specific question.

## Vacuum alignment and an interface lineup answer different questions

For an isolated surface, a work-function construction often uses a side-specific vacuum reference and an electron chemical potential from the same state. It is a surface property conditional on termination, dipole, adsorption, charge, field, and geometry. It does not determine the offset at a bonded heterojunction.

For a coherent, explicit interface, a common lineup decomposes a band offset into bulk band-edge-to-reference terms and a reference shift measured across the interface. In schematic form,

```text
ΔE_v = (E_v^B − Vref^B) − (E_v^A − Vref^A) + ΔV_interface.
```

`E_v^A` and `E_v^B` are specified valence-band edges, `Vref` is the compatible bulk reference, and `ΔV_interface` is the reference shift from the interface calculation. Strain, orientation, registry, termination, atomic relaxation, polarization, defects, charge transfer, and interface chemistry all belong to the defined comparison object. Independently aligning two vacuum slabs omits that interface contribution.

## Band edges and offsets require their own electronic evidence

The lineup procedure does not repair an inaccurate band gap or change the meaning of a Kohn--Sham eigenvalue. Define how each edge is found over the full Brillouin zone, the Hamiltonian, spin/SOC, occupations, structural state, and any quasiparticle correction. If corrections differ between the two constituents, specify how they enter the offset. A shared plot origin or a shifted Fermi level is not an alignment construction.

Core levels can serve as local markers only after their chemical environment, strain, charge, pseudopotential/PAW convention, and site selection are controlled. A chemically shifted core state is not a universal ruler. The neighbouring Charge Density topic supplies real-space redistribution evidence; it does not by itself establish a potential lineup or band offset.

## Fields, screening, and finite models limit interpretation

An observed slope is an electric-field diagnostic only after units, derivative direction, boundary conditions, and a field-free reference are specified. In a finite slab, band bending and depletion widths may not fit within the model. Metallic screening, dielectric response, charged defects, ferroelectric polarization, gates, solvent, and imposed fields can make the profile state dependent. A flat macroscopic average does not prove equilibrium contact, and a potential step does not prove a Schottky barrier, carrier injection, transport, or device performance.

## Preserve the alignment evidence

Keep the parent structures, terminations, orientation and registry; cell and strain; charge/spin/SOC and occupations; pseudopotential/PAW and potential-output definition; grid and averaging parameters; unaveraged and averaged arrays; plateau or bulk-region selection; band-edge search; reference equations; interface and isolated-bulk calculations; corrections; sensitivity series; and plotting transforms. A band diagram without this lineage cannot be audited or transferred to a new state.

## What this topic establishes

This topic establishes how to construct and test an electrostatic reference for a specified surface, bulk comparison, or explicit interface. It does not establish an absolute potential, universal electron affinity, experimental band offset, Schottky barrier, contact resistance, carrier concentration, band bending, transport coefficient, interface stability, or device behavior from one potential profile alone.

## Sources and methods

- [Kohn and Sham, self-consistent equations](https://doi.org/10.1103/PhysRev.140.A1133)
- [Van de Walle and Martin, theoretical band offsets](https://doi.org/10.1103/PhysRevB.35.8154)
- [Bengtsson, dipole correction for slabs](https://doi.org/10.1103/PhysRevB.59.12301)
- [Quantum ESPRESSO post-processing guide](https://quantum-espresso.org/Doc/pp_user_guide/node6.html)
- [Quantum ESPRESSO `pp.x` documentation](https://www.quantum-espresso.org/Doc/INPUT_PP.html)
- [VASP `LOCPOT` documentation](https://vasp.at/wiki/LOCPOT)

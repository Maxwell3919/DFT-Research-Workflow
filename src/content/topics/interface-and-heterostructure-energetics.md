---
topic_slug: interface-and-heterostructure-energetics
status: reviewed
---

An interface calculation asks for the energy of a particular contact between two declared materials, not for a universal property of the two chemical formulae. Plane, orientation, termination, lateral registry, stoichiometry, strain allocation, thickness, periodic boundary condition, charge state, and relaxation constraints together identify the state. Changing any one can change both the structure and the energy being compared.

## Start by naming the contact

Write an interface as a state such as `A(hkl, termination α) | B(uvw, termination β; registry r)`, then record the lateral cell and the number of interfaces in that periodic cell. A coherent bilayer made by straining both slabs to one common in-plane lattice is a model of a contact; it is not automatically a model of an incoherent experimental interface containing misfit dislocations, steps, intermixing, or disorder.

Lattice matching is therefore candidate generation. The Zur--McGill construction searches commensurate superlattices, while modern interface builders expose orientations, terminations, and matched cells. A small geometric mismatch does not decide which candidate is physically relevant: strain can be partitioned differently between the constituents, relieved by defects, or stored elastically as thickness grows.

## Interface excess energy needs reservoirs

For a periodic cell containing an interface area `A`, one useful excess is

```text
γ_int = [E_cell − Σ_i N_i μ_i] / (n_int A)
```

Here `E_cell` is the DFT total energy of the fully specified interface cell, `N_i` is the count of species `i`, `μ_i` is its compatible bulk or environmental reference chemical potential, and `n_int` is the number of equivalent interfaces in the repeated cell. `γ_int` has units of energy per area. The formula answers a reservoir-dependent excess-energy question; it does not eliminate the need to specify which bulk phases, strain states, and chemical potentials supplied the atoms.

For an off-stoichiometric termination, changing `μ_i` changes the comparison. A number obtained by subtracting two arbitrary slabs may still be useful, but it is a different energy cycle and must not be renamed as an equilibrium interface energy.

## Separation, binding, and excess are different cycles

The reversible work of separation is commonly written

```text
W_sep = [E_A^sep + E_B^sep − E_AB] / A.
```

`E_AB` is the combined contact and `E_A^sep`, `E_B^sep` are the two fragments after the stated separation path. If they retain the interface in-plane lattice and frozen interface geometry, the result isolates a constrained interaction. If they relax after cleavage, it includes the stated relaxation response. Both can be legitimate, but neither is interchangeable with `γ_int`, which references bulk or reservoirs rather than separated fragments.

The relation `W_sep = γ_A + γ_B − γ_int` applies only when the surface energies `γ_A` and `γ_B` describe the exact surfaces produced by that cleavage under compatible strain, composition, and reference conventions. A negative interaction or adhesion energy per interface cell is also not automatically a positive area-normalized work of separation; sign and normalization have to travel with the value.

## Coherency stores elastic energy

Periodic in-plane matching can put one or both constituents under strain. The chemical bonding contribution near the interface is then entangled with elastic energy distributed through the finite slabs. Because an interfacial term scales with area whereas coherent strain energy can scale with volume, increasing thickness may change a nominal interface energy rather than merely improve a numerical approximation.

Compare candidates at the same declared strain state when the question is registry or termination ordering. If the scientific question is an interface between unstrained bulk phases, evaluate how the imposed coherency model approaches or fails to approach that limit; do not hide the strain in the word “lattice matched.”

## Termination and registry are structural variables

Different terminations change atom counts, local bonding, electrostatics, and the chemical-potential ledger. Translating one slab across the other changes which atoms face each other even when the orientation and cell are unchanged. Relaxation can transform a nominal top, bridge, hollow, or aligned registry into a different final state.

Generate and retain a documented set of terminations and translations, relax them under the same policy, deduplicate final structures, and preserve metastable outcomes. Symmetry reduces duplicates but does not prove that a selected registry is the global minimum. A single hand-built contact is evidence for that prepared state only.

## Boundary conditions decide the electrostatics

A fully periodic superlattice represents repeated interfaces and contains no vacuum. A slab contact with vacuum represents free outer surfaces as well as the buried interface. These models have different reference terms and may have different numbers of interfaces. Polar discontinuities, charged layers, asymmetric slabs, and net dipoles can create artificial fields or require a compensating charge model; an electrostatic correction is part of a specified boundary condition, not a guarantee of neutrality or realism.

Charge-density differences and plane-averaged potentials can help diagnose redistribution and residual fields, but a partitioning scheme does not directly measure a unique amount of charge transferred. Likewise, a contact-induced potential step is not by itself a band alignment or a transport prediction. Those electronic observables belong to the following band-structure and alignment analyses.

## Dispersion and electronic structure can reorder contacts

Van der Waals heterostructures often have shallow registry-dependent energy landscapes, while metal--ceramic contacts can form chemical bonds, reconstruct, or transfer atoms. Exchange--correlation treatment, dispersion model, spin state, core treatment, and any Hubbard or relativistic choices must be consistent across every term in the energy cycle. Method agreement for one isolated slab does not demonstrate cancellation at the contact.

For semiconducting or insulating interfaces, band edges also need a common potential reference and a convergence analysis separate from the interface-energy ledger. Do not infer a Schottky barrier, tunnelling conductance, charge mobility, or device performance from a favourable interface energy.

## Converge the observable, not only the SCF loop

A normal program exit establishes only that the executable reached an exit path. Satisfaction of the declared SCF residual criterion supports one internally self-consistent solution for the finite model; state identity and the requested observable require separate checks. Converge the requested difference—`γ_int`, `W_sep`, registry ordering, potential step, or another stated observable—against the quantities that alter its cancellation: basis or cutoff, Brillouin-zone sampling, slab thickness, lateral cell, vacuum when present, number of constrained layers, reference states, electrostatic treatment, and relaxation policy. No common thickness, vacuum, mesh, or force threshold is transferable across material classes.

Numerical convergence of the requested energy difference should be assessed only after the interface state, reference-energy cycle, electrostatic boundary treatment, and relaxation constraints are fixed. Changes to those choices test reference, state, or model robustness; basis, reciprocal sampling, and finite-area or finite-thickness refinements within that fixed problem constrain numerical uncertainty.

When two registries differ by less than numerical drift or method sensitivity, the ordering is unresolved. A smooth total-energy series can still conceal a change of termination, magnetic state, reconstruction, or final registry. Inspect the final structures and the actual cleavage surfaces as carefully as the reported scalar.

## A published Al/TiN contact shows why state identity matters

Feldbauer and co-workers calculated atomically flat Al/TiN contacts for several orientations, terminations, and lateral alignments. Their published PBE table reports negative adhesion or interaction energies per interface cell and an Al-layer removal energy for each contact. The subordinate plot redraws those seven table rows: some contacts whose interaction magnitude exceeds the listed removal energy show material transfer in the authors' contact-separation simulations, whereas other rows do not.

This is real published DFT data, redrawn from the table; this project did not rerun it. It demonstrates the sensitivity to termination and registry, and the need to distinguish an interaction-energy convention from a cleavage or fracture claim. It does not establish a universal transfer criterion, a kinetic barrier, a finite-temperature interface, or the behaviour of any new material.

## Preserve a comparison object

Store parent bulk structures; oriented terminations; every supercell transformation and imposed strain; translation and stacking labels before and after relaxation; interface count and area; atom counts and chemical-potential references; constraints; charge and spin; method identity; energies in the exact ledger; convergence series; electrostatic diagnostics; and hashes of outputs. Record whether fragments in a separation cycle were frozen, separately relaxed, or allowed to reconstruct.

This provenance allows a later reader to decide whether a surface energy, interface excess, binding energy, or separation work can be reused. Without it, an apparently precise interface number has no stable comparison object.

## What this topic can and cannot support

This topic supports a conditional energetic comparison among explicitly defined coherent-interface candidates and a route to separate reservoir, cleavage, strain, and boundary-condition choices. It does not establish the global interface structure, an incoherent or disordered experimental interface, kinetic accessibility, fracture toughness, transport, band alignment, device performance, or experimental realizability from one relaxed contact.

## Sources and methods

- [Zur and McGill, lattice-match search](https://doi.org/10.1063/1.333084)
- [Interface-energy review](https://doi.org/10.1038/s41524-019-0160-9)
- [pymatgen interface documentation](https://pymatgen.org/pymatgen.analysis.interfaces.html)
- [InterMat workflow and implementation](https://doi.org/10.1039/D4DD00031E)
- [Feldbauer and co-workers, Al/TiN contact calculations](https://doi.org/10.1103/PhysRevB.91.165413)
- [Open preprint of the Al/TiN study](https://arxiv.org/abs/1504.06192)
- [Klepeis and co-workers, Cu/SiO₂ interface energetics](https://doi.org/10.1103/PhysRevB.68.125403)
- [Pakdel and co-workers, stacking-dependent two-dimensional bilayers](https://doi.org/10.1038/s41467-024-45003-w)
- [BiDB public database](https://www.2dhub.org/bidb/bidb.html)
- [High-throughput van der Waals heterostructure study](https://doi.org/10.1038/s41699-021-00200-9)

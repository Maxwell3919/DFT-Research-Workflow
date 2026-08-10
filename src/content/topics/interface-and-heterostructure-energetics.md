---
topic_slug: interface-and-heterostructure-energetics
status: reviewed
---

## Inspect registry, strain, and separation as atomistic objects

Open both parent structures and every shortlisted matched supercell. View the interface along the normal and in plane; identify termination, registry, imposed strain, layer count, vacuum if present, shortest contacts, and any reconstruction after relaxation. A lattice-mismatch dot plot cannot substitute for this atomistic inspection.

Compare an annotated structure with the area-normalized energy ledger and, when available, a separation or adhesion curve. The decision is whether the same geometry and reference convention support a specific interface claim, not simply whether one enumerated match has the smallest scalar mismatch. Use [structure sources](/DFT-Research-Workflow/operations/resource-landscape/#structures-data), [visual and symmetry tools](/DFT-Research-Workflow/operations/resource-landscape/#visual-symmetry), and [specialist interface tools](/DFT-Research-Workflow/operations/resource-landscape/#specialist-tools) as complementary routes.

Use an interface-energy calculation to compare explicitly defined contacts, not chemical formula pairs. Start from accepted parent structures for both materials, choose the contact plane and terminations, and preserve the imposed strain, lateral registry, stoichiometry, thickness, boundary condition, and relaxation policy. Those choices define the quantity more strongly than the label “A/B interface.”

## Build candidates before evaluating energies

Record each parent bulk reference, orientation, termination, lateral-cell transformation, strain tensor and its allocation, registry translation, layer count, composition, interface area and count, charge and spin, constraints, and electrostatic model. A coherent periodic match is one finite model; it does not represent misfit dislocations, steps, intermixing, or an incoherent experimental contact unless those features are included.

Start with **Build an Interface-Energy and Separation Ledger** to recover the definitions behind the published Al/TiN rows. Use **Replot Published Al/TiN Contact and Separation Data** only for the separate task of inspecting their axes and reported transfer labels. **Enumerate a Teaching Fixture of Lattice Matches and Registries** is optional arithmetic: it contains invented square lattices and no atomistic interface, termination, or relaxed registry.

Generate a documented set of matched cells, terminations, and translations. Relax candidates under one stated policy, inspect the final contact, deduplicate equivalent outcomes, and retain metastable states. A low mismatch or a named registry is a starting object, not evidence that the final interface is stable or globally preferred.

## Choose the energy cycle before subtraction

For a repeated cell with $n_{\mathrm{int}}$ equivalent interfaces of area $A$, a reservoir-referenced excess can be written

$$
\gamma_{\mathrm{int}}
=\frac{E_{\mathrm{cell}}-\sum_i N_i\mu_i}{n_{\mathrm{int}}A}.
$$

State which bulk phases, strain states, and chemical potentials define every $\mu_i$. Off-stoichiometric terminations change the reservoir ledger. Count the interfaces in the actual periodic cell; a slab contact with vacuum also contains outer free surfaces and is not interchangeable with a fully periodic superlattice.

This is a reservoir-dependent excess-energy question; it is not a fragment-separation energy.

If the question is reversible separation, define the fragments and path first:

$$
W_{\mathrm{sep}}
=\frac{E_A^{\mathrm{sep}}+E_B^{\mathrm{sep}}-E_{AB}}{A}.
$$

Record whether the separated fragments retain the interface strain and frozen interface geometry, relax internally, reconstruct, or change composition. Those choices define different works. The identity

$$
W_{\mathrm{sep}}=\gamma_A+\gamma_B-\gamma_{\mathrm{int}}
$$

is valid only when $\gamma_A$ and $\gamma_B$ are the exact cleavage surfaces under compatible strain, composition, area, and reference conventions. A negative interaction or adhesion energy per interface cell is also not automatically a positive area-normalized work of separation. It cannot be relabelled as $\mathrm{J\,m^{-2}}$ without the source definition and area.

## Keep strain and reference states visible

Coherency stores elastic energy through the finite slabs. Because interface excess scales with area while coherent strain energy can grow with volume, a thickness trend may reflect the imposed model rather than ordinary numerical convergence. Compare registries and terminations at the same declared strain state. If the question concerns unstrained bulk materials, evaluate how the coherent model approaches or fails to approach that limit.

Build one ledger containing candidate ID, parent files, transformation matrices, imposed strain, registry before and after relaxation, final structure, area, interface count, atom counts, reservoirs or separated-fragment files, constraints, total energies, derived quantity, units, sign, and output hashes. Do not mix reservoir-referenced interface excess, constrained binding, per-cell interaction energy, and relaxed cleavage work in one ranking column.

## Decide whether the interface object is ready for comparison

A normal program exit establishes only that the executable reached an exit path. SCF convergence is an inner condition; state identity and the requested observable require separate checks. Numerical convergence of the requested energy difference should be assessed only after the interface state, reference-energy cycle, electrostatic boundary treatment, and relaxation constraints are fixed. Then refine basis or cutoff, k-point sampling, thickness, lateral cell, vacuum where present, and constrained-layer count. Track the requested quantity and candidate ordering while inspecting final structures, charge distribution, and potential profiles for state switches or residual fields.

If two registries differ by less than numerical drift or method sensitivity, report the ordering as unresolved. A smooth energy series can still conceal a termination change, reconstruction, magnetic-state switch, atom transfer, or different final registry.

The published Al/TiN guides use seven real Table 2 rows reported in eV per interface cell; this project did not rerun it. Their scripts audit and redraw those public values; they do not rerun DFT, recover a missing interface area, convert the table to $\gamma_{\mathrm{int}}$ or $W_{\mathrm{sep}}$, or establish a material-transfer rule.

An accepted interface ledger supports a conditional comparison among the represented coherent contacts. It does not establish the global interface structure, an incoherent experimental contact, fracture toughness, cleavage kinetics, band alignment, transport, device performance, or method accuracy.

## Sources and methods

- [Zur and McGill, lattice-match search](https://doi.org/10.1063/1.333084)
- [Interface-energy review](https://doi.org/10.1038/s41524-019-0160-9)
- [pymatgen interface documentation](https://pymatgen.org/pymatgen.analysis.interfaces.html)
- [InterMat workflow and implementation](https://doi.org/10.1039/D4DD00031E)
- [Feldbauer and co-workers, Al/TiN contact calculations](https://doi.org/10.1103/PhysRevB.91.165413)
- [Open preprint of the Al/TiN study](https://arxiv.org/abs/1504.06192)
- [Klepeis and co-workers, Cu/SiO2 interface energetics](https://doi.org/10.1103/PhysRevB.68.125403)
- [Pakdel and co-workers, stacking-dependent two-dimensional bilayers](https://doi.org/10.1038/s41467-024-45003-w)
- [BiDB public database](https://www.2dhub.org/bidb/bidb.html)
- [High-throughput van der Waals heterostructure study](https://doi.org/10.1038/s41699-021-00200-9)

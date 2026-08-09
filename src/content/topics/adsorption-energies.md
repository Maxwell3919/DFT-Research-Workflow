---
topic_slug: adsorption-energies
status: reviewed
---

Use an adsorption calculation when the question is the energetic change for moving a specified species from declared reservoirs into a specified surface state. Begin with an accepted clean slab, explicit adsorbate references, and a candidate set. A relaxed adsorbate-slab energy by itself does not define the reaction, sign, coverage, or comparison.

## Prepare the state

Record parent bulk and surface lineage, facet, termination, reconstruction, defects, lateral cell, slab and vacuum thickness, constraints, charge and spin, adsorbate composition, starting site and orientation, coverage definition, and environment. Assign a persistent candidate ID before running any relaxation.

## Follow the practical sequence

Use **Build an Adsorption-Energy and Free-Energy Ledger** to audit a public CMR reaction and separate it from synthetic arithmetic. Then use **Compare Adsorption Sites, Coverage, and Periodic Cells** for matched grouping and final-state relabelling. **Replot the CMR CO-on-fcc(111) Adsorption Benchmark** closes the sequence with a bounded public-data audit.

## Write the sign convention

For one adsorbate $A$ under a negative-is-favourable convention,

$$
E_{\mathrm{ads}}
=E_{\mathrm{slab}+A}-E_{\mathrm{slab}}-E_{A,\mathrm{ref}}.
$$

Some literature defines a positive binding energy as the negative of this expression. Preserve the written reaction, sign, reference, and whether the result is per adsorbate, reaction, site, cell, or area.

## Balance every reservoir

For molecular, dissociative, charged, or proton-coupled cases, retain the full reaction ledger:

$$
\Delta E
=\sum_{j\in\mathrm{products}}\nu_jE_j
-\sum_{i\in\mathrm{reactants}}\nu_iE_i.
$$

Balance atoms, charge, electrons, protons, and other reservoirs before evaluation. Referencing one adsorbed H to $\tfrac12E_{\mathrm{H_2}}$ and referencing OH through $\mathrm{H_2O}+*\rightarrow\mathrm{OH*}+\tfrac12\mathrm{H_2}$ answer different questions.

## Average and differential adsorption energies answer different questions

For $N$ identical adsorbates,

$$
\bar E_{\mathrm{ads}}(N)
=\frac{E_{\mathrm{slab}+NA}-E_{\mathrm{slab}}-NE_{A,\mathrm{ref}}}{N},
$$

whereas the next addition is

$$
\Delta E_{\mathrm{ads}}(N)
=E_{\mathrm{slab}+NA}-E_{\mathrm{slab}+(N-1)A}-E_{A,\mathrm{ref}}.
$$

Do not compare an average at one coverage with a differential value at another.

## Adsorption, interaction, and deformation energies are not synonyms

Adsorption energy compares relaxed reactants and product under a written reaction. An interaction energy holds fragments in specified combined-state geometries; deformation terms connect those frozen fragments to their isolated minima. Record the fragment partition, geometry, and basis treatment before using such a decomposition.

## Match the clean reference

Confirm that clean and adsorbed slabs share the intended cell, termination, layer sequence, strain, k-point sampling, basis, pseudopotentials, functional, spin treatment, charge convention, electrostatic correction, and fixed-layer policy. Put every composition change into explicit reservoirs. A clean slab on another reconstruction or magnetic branch is not automatically compatible.

## Generate candidate sites

Generate plausible sites, anchoring atoms, orientations, conformers, dissociation states, and initial heights. Relax each under one declared policy and retain every start-to-output mapping. A site finder constructs candidates; it does not find the global minimum.

## Relabel the final geometry

The final relaxed structure is the state being measured; the starting high-symmetry label is only a hypothesis. Inspect bonding, migration, dissociation, desorption, reconstruction, and residual forces. Relabel final structures, deduplicate genuine equivalents, and retain distinct metastable states.

## Coverage changes the physical problem

State whether coverage means site fraction, adsorbates per surface atom, molecules per area, or surface-cell stoichiometry. Adsorbate electrostatics, elastic response, dispersion, substrate-mediated interactions, and collective reconstruction can change energy and ordering as coverage changes.

## Supercell size and coverage should not be conflated

One adsorbate in a larger cell changes both coverage and image separation. A fixed-coverage finite-cell test needs commensurate cells with the same adsorbate density and ordering. A physical coverage study instead changes occupied sites while holding the surface identity and reaction ledger controlled.

## Inspect relaxation and final constraints

Record whether the slab is frozen, partially constrained, or fully relaxed and whether adsorption changes magnetism or reconstruction. A low residual force on one candidate does not show that other sites, products, or reconstructions are absent.

## Audit the molecular reference

Check conformer, charge, spin multiplicity, symmetry, molecular box, image interaction, electrostatic convention, and numerical compatibility. The molecule may be a poor numerical or chemical reference for a particular functional; a substituted balanced reaction can improve cancellation but changes the thermodynamic question.

## Finite localized bases can borrow functions

In atom-centred bases, the combined system can use basis functions on the other fragment and make interaction appear too favourable. Diagnose basis-set superposition error under an explicit fragment and ghost-function convention. Plane-wave representations have different convergence behaviour and do not use the same counterpoise construction.

## Control asymmetric electrostatics

One-sided adsorption can create a periodic dipole and a residual vacuum field. Inspect the potential and charge density, place any correction consistently, and converge the boundary model with vacuum and cell size. A correction does not make a physically charged interface neutral.

## Keep the method family compatible

Use the same functional, core treatment, Hubbard definition, relativistic model, occupation treatment, and dispersion convention throughout a ledger. Do not add a correction to only one side. Compare alternative methods on representative states when the conclusion is sensitive to method choice.

## Separate program completion from SCF

A normal program exit establishes only that the executable reached an exit path. Satisfaction of the declared SCF residual criterion is only an inner numerical condition. Inspect final geometry, warnings, expected artifacts, and state identity before evaluating the adsorption quantity.

## Converge the adsorption observable

Numerical convergence of an adsorption energy should be assessed only after coverage and adsorbate order, charge ensemble, electrostatic boundary treatment, and relaxation constraints are fixed. Then refine basis or cutoff, k-point sampling, occupations, slab thickness, vacuum, lateral cell, and molecular reference cell while tracking the target difference.

## Resolve the ordering

Converge the energy gaps among relevant final states, not only each large total energy. If numerical drift, reference uncertainty, or method sensitivity is comparable to a site-energy gap, report that ordering as unresolved.

## Static energy is not adsorption free energy

A schematic thermodynamic ledger is

$$
\Delta G_{\mathrm{ads}}(T,p,\ldots)
=\Delta E_{\mathrm{DFT}}+\Delta E_{\mathrm{ZPE}}
+\Delta H_{\mathrm{thermal}}-T\Delta S
+\Delta G_{\mathrm{environment}}.
$$

Retain frequencies or sampling data, statistical model, standard state, temperature, and each additive term. Do not count zero-point or thermal contributions twice.

## Introduce pressure through chemical potentials

Use explicit $\mu_i(T,p_i,\ldots)$ terms for gas or other reservoirs. Surface grand potentials, reaction free energies, configurational entropy, lateral interactions, and competing adsorbates determine equilibrium populations; one static adsorption energy does not predict an isotherm.

## Define the electrochemical ensemble

The computational hydrogen electrode transforms a proton-electron chemical potential under a stated potential scale. It does not make a neutral vacuum slab a constant-potential electrochemical interface. Declare electron number or charge, electrode-potential reference, solvent, field, pH convention, and double-layer model as required by the question.

## Audit the CMR benchmark

The subordinate example freezes selected CMR $\mathrm{CO}+\mathrm{slab}\rightarrow\mathrm{CO/slab}$ rows for Cu, Pd, Pt, and Au and redraws four method fields. It is attributed real published data; this repository did not rerun the calculations. The method spread is descriptive, not an accuracy proof or catalytic ranking.

## Separate thermodynamic and kinetic claims

A migration, dissociation, desorption, or reaction barrier requires a path and transition-state calculation. A negative endpoint energy does not show that adsorption is fast, reversible, selective, or experimentally realized. Catalytic activity additionally needs a reaction network, coverages, barriers, transport, and operating conditions.

## Preserve the record, state the claim, and cite the sources

Retain final adsorbed and clean structures, parent lineage, start and final labels, coverage and area, charge and spin, constraints, all ledger terms, method identity, numerical series, corrections, raw-output hashes, and rejected candidates. An accepted ledger supports a conditional endpoint comparison among represented states. It does not establish a global minimum, equilibrium coverage, kinetics, operando state, catalytic activity, selectivity, or method accuracy from one negative energy.

- [Schmidt and Thygesen, RPA surface and adsorption benchmark](https://doi.org/10.1021/acs.jpcc.7b12258)
- [CMR benchmark description and data schema](https://cmr.fysik.dtu.dk/adsorption/adsorption.html)
- [CMR adsorption database download](https://wiki.fysik.dtu.dk/cmr-files/adsorption.db)
- [CMR data licence](https://cmr.fysik.dtu.dk/index.html)
- [Wellendorff and co-workers, BEEF-vdW and ensemble uncertainty](https://doi.org/10.1103/PhysRevB.85.235149)
- [Neugebauer and Scheffler, adsorbate interactions and dipole correction](https://doi.org/10.1103/PhysRevB.46.16067)
- [Campbell and Sellers, entropies of adsorbed molecules](https://doi.org/10.1021/ja3080117)
- [Correction to Campbell and Sellers](https://doi.org/10.1021/ja407293b)
- [Norskov and co-workers, computational hydrogen electrode](https://doi.org/10.1021/jp047349j)
- [Reuter and Scheffler, atomistic thermodynamics](https://doi.org/10.1103/PhysRevB.65.035406)
- [Boys and Bernardi, counterpoise method](https://doi.org/10.1080/00268977000101561)
- [Henkelman and Jonsson, improved nudged elastic band method](https://doi.org/10.1063/1.1329672)
- [ASE official surface and adsorbate construction](https://docs.ase-lib.org/ase/build/surface.html)
- [pymatgen official adsorption-site API](https://pymatgen.org/pymatgen.core.html#pymatgen.core.adsorption.AdsorbateSiteFinder)

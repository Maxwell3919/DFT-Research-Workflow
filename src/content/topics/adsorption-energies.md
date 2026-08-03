---
topic_slug: adsorption-energies
status: reviewed
---

Adsorption calculations ask how the energy changes when a specified species moves from a declared reference reservoir into a particular state at a particular surface. The answer is conditional on the adsorbate identity, adsorption site, coverage, surface model, reference reaction, electronic-structure method, and thermodynamic environment. A single relaxed adsorbate–slab total energy does not define any of those choices by itself.

## Define the adsorption state before its energy

The physical object is more specific than “molecule on material.” It includes the substrate phase and facet, termination and reconstruction, defects or dopants, lateral cell, number of layers, strain, adsorbate stoichiometry, coverage, site, orientation, dissociation state, charge and spin, solvent or field model, and all relaxation constraints. The final relaxed structure is the state being measured; the starting high-symmetry label is only a hypothesis.

Store a persistent identifier for every candidate. If an initially molecular adsorbate dissociates, migrates to another site, removes a surface atom, or reconstructs the slab, it must be relabelled rather than retained under its starting geometry.

## Adsorption energy is a balanced energy difference

For one molecular adsorbate `A` and a negative-is-favourable convention, a common static definition is

```text
E_ads = E_(slab+A) - E_slab - E_A,ref
```

`E_(slab+A)` is the total energy of the relaxed combined state, `E_slab` is the compatible clean-slab energy, and `E_A,ref` is the energy assigned to the reference form of `A`. The result is normally reported in eV per adsorbate or per written reaction. Under this convention a negative value means that the product is lower in static electronic energy than the stated reactants.

Some literature defines a positive binding energy as the negative of this expression. The sign, reaction, normalization, and reference state must accompany every number; the label “adsorption energy” alone is insufficient.

## Write a reaction ledger for molecular and dissociative cases

A general reaction energy is

```text
ΔE = Σ_products ν_j E_j - Σ_reactants ν_i E_i
```

where each `ν` is a positive stoichiometric coefficient and every `E` belongs to the same compatible method family. For dissociative adsorption, `1/2 E_H2` can reference one adsorbed H atom, while an adsorbed OH state may be referenced through `H2O + * → OH* + 1/2 H2`. These are different reactions even when the final surface geometry contains the same elements.

Balance atoms, charge, and any electron or proton reservoirs before subtraction. Then state whether the reported value is per adsorbate, per dissociated molecule, per occupied site, per surface cell, or per unit area.

## Average and differential adsorption energies answer different questions

For `N` identical adsorbates in one cell, the average energy is

```text
Ē_ads(N) = [E_slab+N A - E_slab - N E_A,ref] / N
```

The differential energy for adding the `N`th adsorbate is

```text
ΔE_ads(N) = E_slab+N A - E_slab+(N-1) A - E_A,ref
```

The average distributes all interactions over the occupied layer; the differential value measures the next addition. They coincide only when adsorption is effectively independent of coverage. Confusing them can hide repulsion, attraction, cooperative reconstruction, or an emerging overlayer phase.

## Adsorption, interaction, and deformation energies are not synonyms

Adsorption energy compares relaxed reactants and product under a chosen reaction. An interaction energy instead holds the separated slab and adsorbate fragments in the geometries they possess inside the combined structure. The difference contains deformation energies associated with changing the slab and adsorbate from their isolated minima to those frozen geometries.

This decomposition can reveal whether strong apparent binding pays for a large molecular distortion or surface reconstruction. It depends on a precisely defined fragment partition and, for localized basis sets, on how ghost functions and basis-set superposition error are treated. It is an analysis of one energy cycle, not a unique observable.

## Comparable calculations need the same surface identity

Cancellation is strongest when the adsorbed and clean slabs share the same cell, atom count, termination, layer sequence, in-plane strain, k-point sampling, basis, pseudopotentials, functional, spin treatment, charge convention, electrostatic correction, and fixed-layer policy. If adsorption causes a composition change, the missing or added species must enter the ledger through explicit reservoirs.

A clean reference relaxed into a different reconstruction or magnetic branch is not automatically compatible with the adsorbed state. Either construct a thermodynamic cycle that includes the transformation or report that the comparison crosses state identities.

## Site and orientation form a candidate search

Top, bridge, hollow, step, vacancy, edge, and defect sites are geometric classes rather than guaranteed minima. Molecular orientation, anchoring atom, conformer, protonation, and initial height can lead to different basins. Symmetry can remove truly equivalent candidates, but it cannot show that the remaining set is complete.

Generate plausible starts broadly, relax each without silently forcing the starting label, deduplicate the final structures, and retain metastable states. An automated site finder documents candidate construction; it does not establish the global adsorption minimum.

## Coverage changes the physical problem

Coverage may be expressed as adsorbates per surface atom, fraction of a declared site lattice, molecules per area, or a surface-cell stoichiometry. These definitions are not interchangeable unless the site density and cell area are stated. One adsorbate in a larger lateral supercell changes both coverage and the periodic-image separation.

Adsorbate–adsorbate electrostatics, elastic response, dispersion, substrate-mediated interactions, and collective reconstruction can make the adsorption energy coverage dependent. Neugebauer and Scheffler's Na and K adlayers on Al(111) demonstrate that adsorbate–substrate and adsorbate–adsorbate contributions must be separated rather than treating one periodic monolayer as the isolated limit.

## Supercell size and coverage should not be conflated

Changing the lateral cell while holding one adsorbate changes coverage. To diagnose periodic-image error at fixed coverage, construct commensurate cells with the same adsorbate density and ordering but different image geometry where possible. To study physical coverage dependence, keep the surface model and reference convention controlled while varying the number or pattern of occupied sites.

Finite-cell convergence is observable specific. Adsorption energy, site ordering, dipole, charge transfer, geometry, and vibrational modes can converge at different rates. No universal surface cell or adsorbate separation is sufficient for every system.

## Relaxation couples binding to surface response

Adsorption can rumple layers, change bond lengths, reconstruct the surface, induce magnetism, or transfer charge. A frozen-slab energy and a fully relaxed adsorption energy describe different constrained processes. Fixing lower layers may approximate a bulk support, but the selected depth and constraint policy become part of the state definition.

Inspect forces and the final bonding network as well as the energy. A low residual force on one candidate does not prove that another site, reconstruction, dissociation product, or adsorbate arrangement is absent.

## Molecular references need their own convergence and state checks

Gas-phase references must use the intended molecule, conformer, charge, spin multiplicity, symmetry, and dissociation state. Open-shell atoms and molecules can converge to the wrong spin branch. A periodic molecular box requires checks for image interaction, cell-size effects, basis treatment, electrostatic conventions, and numerical consistency with the slab calculations.

The molecule may be a poor numerical or chemical reference for a particular functional. Alternative balanced reactions can improve cancellation, but they also change the thermodynamic question. Reference substitutions and empirical corrections must remain explicit rather than being folded silently into `E_ads`.

## Finite localized bases can borrow functions

With atom-centred basis sets, the combined system can lower its variational energy by using basis functions located on the other fragment. The resulting basis-set superposition error can make interaction appear too favourable. The Boys–Bernardi counterpoise construction evaluates fragments in the combined basis using ghost functions to diagnose or correct this imbalance.

Counterpoise is not a universal repair: basis incompleteness, fragment relaxation, periodic implementation, and the chosen fragment partition still matter. Plane-wave calculations have different convergence behaviour and do not use the same ghost-basis correction, although all representations still require convergence of the adsorption-energy difference.

## Asymmetric and charged adsorption needs electrostatic control

Adsorption on one side of a periodic slab can create a net dipole and an artificial field between repeated images. Dipole corrections or Coulomb truncation can restore an intended boundary model, but their placement and convergence must be verified from the potential and energy. A correction does not make a physically charged interface neutral.

Charged adsorbates, polar slabs, external fields, and electrochemical cells require an explicit countercharge or electrode model and a defined potential reference. Comparing neutral fixed-electron calculations with charged constant-potential states without a thermodynamic transformation mixes ensembles.

## Exchange, correlation, and dispersion affect different ledger terms

Adsorption can combine covalent bonding, charge transfer, Pauli repulsion, substrate screening, and long-range dispersion. A method that describes the clean surface well can still misdescribe the molecule or bond formation, so errors need not cancel. Wellendorff and co-workers designed BEEF-vdW around this surface-chemistry compromise and used an ensemble to expose model sensitivity; the ensemble quantifies uncertainty within that construction, not all possible method error.

Compare physically motivated methods on representative states when the conclusion is method sensitive. Do not add a dispersion correction to only one side of the energy ledger or compare adsorption energies whose functionals, core treatments, Hubbard definitions, or relativistic models differ.

## Converge the adsorption observable and its ordering

SCF completion is only an inner numerical condition. Converge adsorption energies and the energy differences between relevant sites against basis or cutoff, k sampling, occupations, slab thickness, vacuum, lateral size, electrostatic treatment, relaxation policy, and molecular reference cell. Inspect whether the same electronic and structural state survives the sequence.

When the conclusion is an ordering, converge the ordering and its uncertainty, not merely each large total energy. A small energy gap between sites is not resolved when numerical drift, reference uncertainty, or method spread is comparable to that gap.

## Static energy is not adsorption free energy

A thermodynamic adsorption quantity may be written schematically as

```text
ΔG_ads(T, p, …) = ΔE_DFT + ΔE_ZPE + ΔH_thermal - TΔS + ΔG_environment
```

`ΔE_DFT` is the compatible static electronic-energy difference; `ΔE_ZPE` is the zero-point contribution; `ΔH_thermal` and `ΔS` contain thermal changes under stated statistical models; and `ΔG_environment` collects only explicitly defined effects such as solvation, fields, or reservoir transformations. If a vibrational free energy already includes zero-point and thermal terms, those terms must not be counted again.

Campbell and Sellers show that adsorbate entropy can be substantial, and their published correction must be read with the original paper. Replacing every adsorbate by an immobile harmonic oscillator is an approximation whose adequacy depends on hindered translations, rotations, coverage, and temperature.

## Pressure and composition enter through chemical potentials

For exchange with reservoirs, compare surface grand potentials or reaction free energies containing chemical potentials `μ_i(T,p_i,…)`, not just isolated-molecule electronic energies. Reuter and Scheffler's RuO₂(110) analysis shows how the stable surface composition can change with oxygen chemical potential.

An adsorption energy at one coverage does not by itself predict an isotherm. Configurational entropy, site degeneracy, lateral interactions, competing adsorbates, and possible surface phase changes determine equilibrium populations. Kinetic trapping can prevent the thermodynamic distribution from being reached.

## Electrochemical references change the ensemble

The computational hydrogen electrode relates the chemical potential of a proton–electron pair to a hydrogen reference and an electrode potential under a declared reference scale. This can transform proton-coupled adsorption steps into potential-dependent free-energy differences without explicitly calculating a solvated proton.

It does not make a neutral vacuum slab a constant-potential electrochemical interface. Double-layer structure, solvent, pH convention, field, surface charge, capacitance, and potential-dependent geometry can require additional models. State whether the calculation fixes electron number, charge, potential, or another electrochemical variable.

## Environment and coadsorbates can change the preferred state

Solvent, spectator ions, supports, strain, electric fields, defects, coadsorbates, and finite temperature can alter both the adsorption geometry and its reference free energy. Adding an implicit-solvent correction after a vacuum relaxation assumes that the geometry and electronic state remain appropriate; that assumption should be tested when it affects the conclusion.

Likewise, a clean ideal terrace may not represent the active surface under reaction conditions. The relevant comparison can require competing coverages, oxide or hydride phases, segregated alloys, steps, vacancies, and coadsorbed intermediates.

## A real CMR benchmark exposes method and state dependence

The Computational Materials Repository supplies 200 full-coverage reactions for eight adsorbates on 25 transition-metal surfaces. Its documented database uses top-site adsorption on three-layer fcc(111) models for the broad benchmark and defines negative reaction energy as favourable relative to explicit gas-phase reference reactions.

The subordinate example freezes the CMR `CO + slab → CO/slab` rows for Cu, Pd, Pt, and Au and redraws PBE, RPBE, BEEF-vdW, and `RPA+EXX` values. For example, the stored Pt values span `-0.946 eV` with PBE to `-0.478 eV` with RPBE, while the corresponding Cu values are positive for all four methods. This is a real published calculation dataset under CC BY-SA 4.0. It demonstrates conditional method spread; this repository did not rerun the calculations or independently establish which method is accurate.

## Failure patterns reveal missing definitions

A sign that reverses when a script changes often indicates an undocumented convention. Energy drift with lateral size can indicate periodic adsorbate interactions, while a site ordering that changes after full relaxation may reveal that the starting labels were not final states. A molecular reference with the wrong spin, an unmatched clean slab, or double-counted thermal terms can shift every result systematically.

Other warnings include a sloped vacuum potential, residual forces confined to fixed layers, charge spilling into vacuum, large basis-set counterpoise corrections, adsorbate desorption during relaxation, or multiple candidates collapsing to different products. Each failure points to a specific missing control; reporting more digits does not resolve it.

## Preserve the adsorption comparison object

A reusable record contains the final adsorbate and clean-slab structures; parent bulk and surface lineage; site and orientation labels before and after relaxation; coverage definition and area; composition, charge, spin, constraints, and environment; every energy-ledger term with units and sign convention; method identity; convergence series; corrections; and hashes of source outputs.

For free energies, retain frequencies or sampling data, statistical-mechanical model, standard state, temperature, pressure or activity, potential reference, and every additive term. Store rejected and metastable candidates so later work can distinguish an incomplete search from a reproducible energetic ordering.

## Keep thermodynamics, kinetics, and catalytic claims separate

Adsorption energies compare endpoint states. A migration, dissociation, desorption, or reaction barrier requires a path and transition-state calculation such as a nudged elastic band analysis. Even a negative adsorption free energy does not show that adsorption is fast, reversible, selective, or experimentally realizable.

Catalytic activity depends on a network of elementary steps, coverages, barriers, transport, operating conditions, and often competing surface phases. A “stronger binding” trend or one favourable intermediate cannot establish turnover rate, selectivity, poisoning resistance, or a Sabatier optimum.

## What this topic establishes

This topic establishes how to define a balanced and normalized adsorption-energy ledger, how sites, coverage, relaxation, references, numerical controls, and environment change its meaning, and what extra terms are required to move from a static total-energy difference toward a thermodynamic quantity.

It does not establish the exhaustive global adsorption minimum, a converged real-material value, equilibrium coverage, adsorption or reaction kinetics, an operando surface state, experimental realizability, catalytic activity, selectivity, or method accuracy from one negative energy.

## Sources and methods

- [Schmidt and Thygesen, RPA surface and adsorption benchmark](https://doi.org/10.1021/acs.jpcc.7b12258)
- [CMR benchmark description and data schema](https://cmr.fysik.dtu.dk/adsorption/adsorption.html)
- [CMR adsorption database download](https://wiki.fysik.dtu.dk/cmr-files/adsorption.db)
- [CMR data licence](https://cmr.fysik.dtu.dk/index.html)
- [Wellendorff and co-workers, BEEF-vdW and ensemble uncertainty](https://doi.org/10.1103/PhysRevB.85.235149)
- [Neugebauer and Scheffler, adsorbate interactions and dipole correction](https://doi.org/10.1103/PhysRevB.46.16067)
- [Campbell and Sellers, entropies of adsorbed molecules](https://doi.org/10.1021/ja3080117)
- [Correction to Campbell and Sellers](https://doi.org/10.1021/ja407293b)
- [Nørskov and co-workers, computational hydrogen electrode](https://doi.org/10.1021/jp047349j)
- [Reuter and Scheffler, atomistic surface thermodynamics](https://doi.org/10.1103/PhysRevB.65.035406)
- [Boys and Bernardi, counterpoise method](https://doi.org/10.1080/00268977000101561)
- [Henkelman and Jónsson, improved nudged elastic band method](https://doi.org/10.1063/1.1329672)
- [ASE official surface and adsorbate construction](https://docs.ase-lib.org/ase/build/surface.html)
- [pymatgen official adsorption-site API](https://pymatgen.org/pymatgen.core.html#pymatgen.core.adsorption.AdsorbateSiteFinder)

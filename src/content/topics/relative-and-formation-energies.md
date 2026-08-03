---
topic_slug: relative-and-formation-energies
status: reviewed
---

Energy differences connect an electronic-structure calculation to questions such as which candidate structure is lower, whether a reaction is exothermic within a stated model, and how costly it is to form a compound from chosen reservoirs. The subtraction is simple only after the compared calculations have been made commensurate. A raw total energy is an internal value for one calculation; a relative, reaction, or formation energy is a derived quantity whose meaning comes from the comparison that defines it.

## Begin with the scientific comparison

Write the comparison before collecting energies. Identify the candidates or reaction, the composition and charge of every object, the physical state of each reference, the thermodynamic conditions, the energy convention, and the normalization in which the answer will be reported.

Three questions that sound similar require different constructions:

- **Relative energy:** which of several explicitly enumerated states with the same conserved composition and charge is lower under one evaluator?
- **Reaction energy:** what is the energy change for one balanced transformation between declared reactants and products?
- **Formation energy:** what is the reaction energy for forming a target from a specified set of elemental or other reference reservoirs?

The sign of any one of these quantities has meaning only with its written reaction and convention. It is not a portable label attached to a material.

## A raw total energy is not yet a comparable result

The DFT total energy depends on the Hamiltonian and numerical representation used to evaluate it. Functional, potentials or all-electron treatment, Hubbard parameters, relativistic terms, charge, boundary conditions, basis or grids, occupations, and implementation conventions all contribute to the reported number. Its absolute zero is not generally shared across codes, potential families, or different compositions.

Useful cancellation occurs when the subtracted calculations share the same method identity and closely related numerical errors. Cancellation must be demonstrated by construction; it does not follow merely because every output is measured in electronvolts.

Preserve the raw value, but never place heterogeneous outputs in one ranking table without an explicit compatibility model.

## Build a ledger before subtracting

An energy ledger gives every term a scientific identity. For each calculation record:

- structure and electronic-state identifiers;
- composition, atom count, formula-unit count, and total charge;
- energy field and units, including any entropy or extrapolation convention;
- method, potential or basis identity, corrections, and software version;
- geometry state, boundary model, k-point or other integration setup;
- completion, convergence, and state-verification status;
- parent calculation, input and output hashes, and provenance.

The ledger separates three decisions: whether a calculation completed, whether its target energy is numerically usable, and whether it belongs in a particular comparison. A failed or incompatible term remains evidence, but it cannot silently enter the arithmetic.

## Relative energies compare a bounded candidate set

For candidates `i` and reference candidate `r` with the same composition and charge, define

```text
ΔE_rel(i | r) = [E_i - E_r] / N
```

Here `E_i` and `E_r` are the same reported energy quantity from a common evaluator, and `N` is the declared normalization: for example, the number of atoms, formula units, magnetic sites, or another physically motivated count. If `E_i`, `E_r`, and `N` refer to one computational cell, the unnormalized difference is in energy per cell; dividing by the number of formula units gives energy per formula unit.

The zero is conventional: choosing another accepted candidate as `r` shifts every table entry by a constant but does not change pairwise ordering. The statement “candidate A is lower than candidate B” is bounded by the enumerated states, shared method, accepted convergence, and uncertainty. It does not prove that an untested structure or electronic state is absent below them.

## Balance a reaction before evaluating its energy

Write a reaction as a stoichiometric vector `ν_j`, negative for reactants and positive for products:

```text
Σ_j ν_j Species_j = 0
ΔE_rxn = Σ_j ν_j E_j
```

Each element must balance, and charge, electron count, adsorbates, molecular species, or other conserved quantities must be handled consistently with the chosen ensemble. `E_j` is the energy for the exact calculation object represented by its coefficient. Multiplying every `ν_j` by the same factor multiplies `ΔE_rxn`; therefore the reaction extent and reporting basis must accompany the value.

A reaction between compounds may cancel systematic errors differently from formation out of elemental phases. Two balanced reactions that produce the same target can answer different thermodynamic questions because their reservoirs differ.

## Formation energy is a special reference reaction

For a compound containing `n_i` atoms of element `i`, a common zero-temperature electronic formation energy is

```text
ΔE_f = E_compound - Σ_i n_i μ_i^ref
```

`E_compound` is the calculated electronic energy of the target in the same formula-unit convention as `n_i`. `μ_i^ref` is the energy per atom of the declared elemental reference phase, or the corresponding fraction of a molecular reference calculation. The result is an energy per chosen formula unit until another normalization is applied.

This expression solves one question: the energy change for forming the target from those references within the stated electronic-energy model. Experimental standard enthalpy of formation is a thermodynamic quantity for specified standard states and temperature. It is not identical by definition to a raw 0 K DFT electronic-energy difference.

## Reference states are part of the result

An elemental symbol does not uniquely specify a reservoir. The reference must include allotrope or molecular form, magnetic and electronic state, crystal structure, pressure convention, and any finite-temperature state. A wrong oxygen molecule, metal phase, magnetic order, or charge convention changes the reaction, not merely a metadata field.

Compound reservoirs may be more appropriate when the scientific process is synthesis from precursors, exchange with an environment, or decomposition among nearby phases. Chemical potentials describe open-system reservoirs only within explicitly stated bounds and thermodynamic conditions. They must not be treated as freely adjustable numbers detached from the phases that constrain them.

Whenever a fitted elemental reference, gas correction, or database compatibility scheme is used, retain both the unadjusted calculated term and the named correction with its version and calibration scope.

## Normalize only after the stoichiometry is clear

The same reaction energy can be reported per computational cell, formula unit, atom, mole of reaction, exchanged particle, or another basis. These values are numerically different but physically equivalent only when the conversion is exact and declared.

Let one computed cell contain `Z` formula units and `N_atoms` atoms. Then

```text
ΔE per formula unit = ΔE per cell / Z
ΔE per atom = ΔE per cell / N_atoms
```

For molar reporting, convert the energy for the declared reaction extent using the appropriate physical constant and state the resulting unit. Never compare “eV” columns until their denominator, cell contents, and stoichiometric extent agree. A per-atom normalization is convenient for composition-wide plots, while per-formula-unit or per-reaction values may communicate chemistry more directly.

## Keep electronic energy, enthalpy, and free energy distinct

A typical static DFT result approximates an electronic internal-energy contribution for fixed nuclei under a selected approximation. Depending on the scientific question, a thermodynamic potential may require additional terms:

```text
F(T,V) = E_DFT(V) + F_vib(T,V) + F_el(T,V) + F_other(T,V)
G(T,p) = min_V [F(T,V) + pV]
```

`F` is Helmholtz free energy at temperature `T` and volume `V`; `G` is Gibbs energy at temperature `T` and pressure `p`. `F_vib` may contain zero-point and thermal vibrational contributions, `F_el` an electronic thermal contribution, and `F_other` any explicitly modeled configurational, magnetic, rotational, translational, or additional free-energy term appropriate to the phase. The `pV` term converts the fixed-volume potential to the constant-pressure potential through a volume minimization.

Every term must use the same normalization and compatible reference reaction. Omitting a term is an approximation whose importance depends on temperature, pressure, phase, composition, and the size of the energy difference. Numerical smearing used for Brillouin-zone integration is not automatically `F_el` at a physical temperature.

## Method consistency controls error cancellation

Energy differences are most defensible when all terms use one method family and compatible settings. Mixing functionals, potential libraries, Hubbard treatments, relativistic levels, or basis conventions introduces offsets that do not cancel automatically. A database may define a calibrated mixing or correction scheme, but the scheme itself then becomes part of the energy model.

Elemental and molecular references can carry different systematic errors from the target compound. Primary studies of GGA/GGA+U mixing and fitted elemental-phase reference energies show why reference corrections may improve formation enthalpies for a particular calibrated domain. Such corrections are not universal properties of the elements and cannot be transferred silently to another functional, potential set, or dataset release.

Report corrected and uncorrected quantities separately. A correction may improve agreement with a benchmark while reducing the independence of a later comparison to that benchmark.

## Converge the difference and its least-cancelling terms

Converging each total energy in isolation is not enough. Test the derived energy difference against the numerical variables that can change unequally across terms: basis and grids, Brillouin-zone sampling, occupations, cell size, vacuum and image interactions, molecular boxes, spin states, geometry optimization, and any correction-specific inputs.

Use a common evaluator when possible, then tighten the variables most likely to cancel poorly. A molecule in a box and a periodic solid, or two phases with different metallicity, may require different raw settings to reach comparable error in the final reaction energy. The acceptance criterion belongs to the target difference and intended conclusion, not to a universal cutoff or mesh.

Retain convergence tables for both the individual terms and the assembled difference. Apparent stability caused by cancellation at one setting can disappear when the terms are independently refined.

## State identity and geometry remain part of every term

The compared structures must correspond to the intended minima or constrained states, and their final electronic identities must be verified. A lower energy caused by an unintended magnetic collapse, changed charge, different symmetry constraint, or unconverged geometry does not answer the planned comparison.

Same-composition polymorphs may be compared directly only after they share the evaluator and have appropriate geometry treatment. Formation energies need independently verified reference phases. If zero-point or thermal contributions are added, their structures, volumes, force constants, and electronic parents require their own lineage.

## Treat small differences as estimates with uncertainty

An energy difference should be accompanied by evidence about numerical uncertainty and sensitivity to plausible method choices. Useful tests include stricter numerical settings, independent structural or electronic starts, alternative but defensible reference states, and comparison with experimental or higher-level data when available.

Do not convert a near-degeneracy into an exact ordering. If the separation is comparable to the observed numerical variation, reference uncertainty, or method sensitivity, report the candidates as unresolved within the tested model. Agreement of several calculations that share the same approximation is reproducibility within that approximation, not independent physical validation.

## A negative formation energy is not a phase-stability proof

`ΔE_f < 0` means that the target is below its chosen elemental references for that formation reaction. Thermodynamic stability against decomposition requires comparison with every relevant competing combination of elements and compounds under the chosen conditions. That is a convex-hull or equivalent phase-equilibrium problem.

A compound can have a negative formation energy and still decompose exothermically into other compounds. Conversely, a phase above the equilibrium hull may be experimentally accessible because of kinetics, finite temperature, pressure, defects, surfaces, or synthesis history. Formation energy alone establishes neither equilibrium stability nor experimental synthesizability.

Equation-of-state fitting, structural phase transitions, compositional convex hulls, defect formation, surface and adsorption energies, and interface energetics therefore remain separate D1 topics with their own references and convergence problems.

## Preserve the complete comparison object

A reusable result package should contain the balanced reaction or candidate set, raw ledger, excluded terms and reasons, exact normalization, uncorrected and corrected energies, correction versions, convergence evidence, uncertainty assessment, and links to every parent calculation. Derived tables should be reproducible from machine-readable records without scraping rounded values from a figure.

Downstream work should cite the comparison object, not just one number. Convex-hull analysis needs composition-normalized formation energies and compatibility metadata; kinetic modeling needs a specific reaction landscape; experimental comparison needs matched thermodynamic states; scientific claims need the uncertainty and model boundary.

## What this topic establishes

This topic establishes how to construct traceable relative, reaction, and formation energies from compatible calculations and declared references. It can support bounded statements about an enumerated candidate ordering or a written reaction within a stated energy model.

It does not establish the global structural or electronic ground state, stability against all competing phases, a finite-temperature equilibrium, a reaction barrier or rate, experimental synthesizability, or the accuracy of the underlying method. Those conclusions require additional calculations and evidence.

## Sources and methods

- [Materials Project phase-diagram methodology](https://docs.materialsproject.org/methodology/materials-methodology/thermodynamic-stability/phase-diagrams-pds)
- [Materials Project energy-correction methodology](https://docs.materialsproject.org/methodology/materials-methodology/thermodynamic-stability/thermodynamic-stability)
- [IUPAC definition of Gibbs energy](https://goldbook.iupac.org/terms/view/G02629)
- [Phonopy thermodynamic-property formulations](https://phonopy.github.io/phonopy/formulation.html)
- [Hohenberg and Kohn, inhomogeneous electron gas](https://doi.org/10.1103/PhysRev.136.B864)
- [Kohn and Sham, self-consistent equations](https://doi.org/10.1103/PhysRev.140.A1133)
- [Mermin, finite-temperature density-functional theory](https://doi.org/10.1103/PhysRev.137.A1441)
- [Jain and co-workers, formation enthalpies from mixed GGA and GGA+U calculations](https://doi.org/10.1103/PhysRevB.84.045115)
- [Stevanović and co-workers, fitted elemental-phase reference energies](https://doi.org/10.1103/PhysRevB.85.115104)
- [Bartel and co-workers, decomposition reactions and solid stability](https://doi.org/10.1038/s41524-018-0143-2)

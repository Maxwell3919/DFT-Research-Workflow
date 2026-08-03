---
topic_slug: chemical-bonding-analysis
status: reviewed
---

Chemical-bonding analysis converts a declared electronic state into an interpretable indicator of interactions between selected atoms, orbitals, or real-space regions. It can explain why particular states are bonding, nonbonding, antibonding, or localized within that representation. It does not turn a density plot, a population, or one integrated curve into a unique chemical bond, a bond order, a stability ranking, or an experimental bonding measurement.

## A bonding indicator is a projection, partition, or topology—not the total energy

The DFT total energy is a functional of the whole electronic state. A bonding analysis introduces an additional construction: a localized-orbital projection, a partition of real space, or a topology of a scalar field. Its answer therefore depends on the chosen atoms, orbitals, basis/projection, energy reference, spin channel, and integration domain.

Crystal orbital Hamilton population (COHP) resolves a Hamiltonian-weighted pair contribution by energy. In a common sign convention, a displayed `-COHP(E)` is positive in bonding regions, but conventions vary; report the plotted sign rather than infer it from colour or axis direction. For a selected pair `A,B`, an occupied-state integral has the schematic form

```text
ICOHP(A,B; E1,E2) = ∫[E1,E2] COHP(A,B; E) dE.
```

`E1` and `E2` are declared energy limits, usually tied to a specified reference and occupation. The integral is an energy-partition indicator for that pair and representation. It is not a transferable bond energy: changing the projection basis, pair list, cell, spin/SOC treatment, Fermi reference, occupation, or energy window changes the number.

## Orbital-pair curves need a faithful reconstruction of the calculated state

Plane-wave calculations do not begin with a finite atom-centred orbital basis. A projected COHP or COOP therefore reconstructs local-orbital information from the computed wavefunctions. The reconstruction quality must be reported before its curves are interpreted. Charge spilling, basis completeness, the retained bands, k-point weights, spin channels, and any projection warnings are evidence about that mapping, not minor implementation details.

Inspect the total and selected projected density of states beside the pair curve. A peak in a DOS says that states occur at that energy; it does not say whether the selected contact is bonding. Conversely, a pair curve is conditional on the selected pair and projection and cannot establish that no other interaction matters. Sum rules or reconstruction diagnostics should close within the limits declared by the analysis tool before comparing pairs or materials.

## Localization and density topology answer different real-space questions

The electron localization function (ELF) is a dimensionless real-space indicator built from local kinetic-energy-density information relative to a reference. Its maxima and basins can reveal localized shells, lone-pair-like regions, or localized features for the chosen state. A contour or isosurface still requires a specified value, colour map, slice, cell, and spin treatment. High ELF between atoms is useful structural evidence, not an automatic covalent bond order.

Density topology follows stationary points and gradient paths of the chosen density field. In a QTAIM-style analysis, a bond path and its critical point are features of that field and partition. The electron density and its Laplacian at the critical point can support a carefully bounded comparison across compatible states. They do not alone determine reaction barriers, mechanical strength, oxidation states, or a unique bond classification across metallic, ionic, multicentre, and delocalized systems.

## Compare a bonding change only after matching the electronic question

Ask which state changes: geometry, composition, strain, magnetic order, charge, coverage, defect state, pressure, or occupation. Then calculate the comparison with compatible cells, Hamiltonian, pseudopotential/PAW convention, k sampling, basis/projection definition, and energy reference. A pair integral over one spin channel cannot be compared directly with a spin-summed result. A curve aligned to the Fermi level is not automatically aligned to a common chemical reference between two calculations.

For a structural trend, combine the bonding indicator with the relevant energetic comparison from D1 and with the structural and electronic evidence that defines the state. A more negative value under one `-ICOHP` convention may indicate a stronger contribution for that declared pair; it cannot by itself rank thermodynamic stability, prove a causal mechanism, or replace a converged energy difference.

## Numerical convergence includes the projection and the observable

An SCF-converged state can still give an unstable bonding interpretation when bands, k sampling, smearing, real-space grid, basis/projection, or the selected energy window change the indicator. Converge the comparison quantity actually used: a pair integral, a signed energy window, a critical-point property, a basin population, or an ELF feature. Check that the geometry and electronic state have not changed between members of the series.

Avoid presenting a smooth curve without its numerical lineage. Preserve the parent calculation inputs and outputs; structure and state labels; occupied/unoccupied-band selection; k weights; projection basis and quality diagnostics; pair list; sign convention; energy zero; integration limits; spin/SOC handling; real-space grid and isovalues; raw curves or volumetric fields; post-processing version; and scripts that generated plots and integrals.

## What this topic establishes

This topic establishes how to formulate, calculate, check, and compare a bounded bonding indicator for a declared electronic state. It does not establish a unique bond order, formal oxidation state, thermodynamic ground state, material stability, reaction mechanism, experimental bond strength, or causal explanation from one COHP/COOP curve, ELF image, population, or density-topology feature alone.

## Sources and methods

- [Dronskowski and Blöchl, crystal orbital Hamilton populations](https://doi.org/10.1021/j100135a014)
- [Deringer, Tchougréeff, and Dronskowski, projection of COHP from plane waves](https://doi.org/10.1021/jp202489s)
- [Becke and Edgecombe, electron localization function](https://doi.org/10.1063/1.458517)
- [Savin et al., ELF interpretation](https://doi.org/10.1002/anie.199718081)
- [Bader, zero-flux surfaces and atoms in molecules](https://doi.org/10.1007/s002140000233)
- [Official COHP reference](https://schmeling.ac.rwth-aachen.de/cohp/)

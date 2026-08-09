---
topic_slug: chemical-bonding-analysis
status: reviewed
---

Use bonding analysis when a converged structural or energetic trend needs a bounded electronic interpretation: which selected atom pair contributes bonding or antibonding states, where a localization feature appears, or how a density topology changes between compatible states. The parent object is the accepted electronic state together with its structure, wavefunctions or density, k-point weights, occupations, spin/SOC treatment, and energy reference.

Choose the indicator before choosing the plotting tool. COHP/COOP, electron localization function (ELF), and density topology answer different questions. None is a unique bond order or a replacement for the energy comparison that established the state.

## A bonding indicator is a projection, partition, or topology—not the total energy

No executed practical guide currently accompanies this topic. Use the official documentation for the explicitly selected implementation, because required wavefunction formats, projection bases, filenames, and quality diagnostics vary by software and version.

- For COHP or COOP, pass the parent wavefunctions and structure through the selected projection implementation. Preserve its projection-quality or charge-spilling report, pair list, spin channels, energy grid, and raw pair-resolved output before plotting or integrating.
- For ELF, use the parent code's documented postprocessor to write the volumetric ELF field. Retain the cell, grid, spin treatment, and exact isovalue or slice used in every image.
- For density topology, provide the declared density field to the chosen topology tool and retain its basin or critical-point table, integration residuals, and algorithm version.

Do not invent a generic conversion command between incompatible packages. The operational route is valid only when the selected tool documents the parent object it reads and the output object it produces.

## Orbital-pair curves need a faithful reconstruction of the calculated state

For a selected pair $A,B$, an occupied-window integral can be written schematically as

$$
\mathrm{ICOHP}_{AB}(E_1,E_2)
= \int_{E_1}^{E_2}\mathrm{COHP}_{AB}(E)\,dE.
$$

First identify the program's sign convention. Some plots show `-COHP`, while others retain `COHP`; a larger positive `-ICOHP` and a more negative `ICOHP` can describe the same convention. Record $E_1$, $E_2$, the energy zero, occupations, pair multiplicity, spin channel, and normalization.

Inspect projection completeness, charge spilling, missing-band warnings, k-point weights, and reconstruction sum rules before reading individual peaks. Compare the total and projected density of states beside the pair curve. A DOS peak locates states; it does not by itself identify whether the selected pair is bonding.

## Localization and density topology answer different real-space questions

For ELF, inspect the raw volumetric field before selecting a contour. Test whether the decision-relevant maximum, basin, or interatomic feature persists under grid refinement and a bounded change of isovalue. A visually bright interatomic region is not an automatic covalent bond order.

For density topology, check the integrated density, basin closure, critical-point search stability, and sensitivity to the input grid. A bond path and critical point are features of that declared field. They do not alone determine a reaction barrier, mechanical strength, oxidation state, or universal bond class.

## Compare like electronic states

Match geometry, composition, strain, magnetic order, charge, coverage, pressure, Hamiltonian, pseudopotential/PAW convention, k sampling, projection definition, and energy reference across the series. Do not compare a spin-resolved pair integral with a spin-summed value, or Fermi-aligned curves from different states as though they share a chemical reference.

## Numerical convergence includes the projection and the observable

Converge the quantity used in the conclusion, such as a pair integral, selected energy window, critical-point property, basin population, or ELF feature. SCF completion and a smooth curve do not establish projection quality or observable convergence.

## What this topic establishes

The supported result is a comparison of one declared bonding indicator for compatible electronic states. It may support an interpretation of an energetic or structural trend. It does not establish a unique bond order, formal oxidation state, thermodynamic ground state, material stability, reaction mechanism, experimental bond strength, or causal explanation by itself.

## Sources and methods

- [Dronskowski and Blochl, crystal orbital Hamilton populations](https://doi.org/10.1021/j100135a014)
- [Deringer, Tchougreeff, and Dronskowski, projection of COHP from plane waves](https://doi.org/10.1021/jp202489s)
- [Becke and Edgecombe, electron localization function](https://doi.org/10.1063/1.458517)
- [Savin et al., ELF interpretation](https://doi.org/10.1002/anie.199718081)
- [Bader, zero-flux surfaces and atoms in molecules](https://doi.org/10.1007/s002140000233)
- [Official COHP reference](https://schmeling.ac.rwth-aachen.de/cohp/)

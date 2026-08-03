# Relative Energies and Formation Energies — scientific, execution, source, and media review

## Scope

This review covers:

> D1 · Energetics and Stability → Relative Energies and Formation Energies

and two subordinate pages:

- Build a Comparable Energy Ledger;
- Balance Reference Reactions and Normalization.

The decision is **reviewed within the declared educational and execution scope**. The batch does not change the A–E or D1–D5 registry, create a new top-level operation, or restore O01–O24 or former 00–34 identifiers as public chapter structure.

## Scientific review

The overview correctly separates:

- a raw code-dependent total energy from a derived energy difference;
- same-composition relative energy from reaction and formation energy;
- elemental formation references from compound or open-system reservoirs;
- per-cell, per-formula-unit, per-atom, molar, and reaction-extent normalization;
- a static DFT electronic energy from enthalpy, Helmholtz free energy, and Gibbs energy;
- a named correction scheme from an intrinsic elemental property;
- individual-run completion from convergence of the assembled difference;
- a negative formation energy from stability against all competing phases;
- a bounded candidate ordering from an exhaustive ground-state claim.

Every displayed equation defines its symbols, normalization, units, purpose, and assumptions in the surrounding text. The article prescribes no universal cutoff, k mesh, smearing width, box size, convergence tolerance, correction value, temperature, pressure, or uncertainty threshold.

Equation-of-state fitting, convex-hull construction, defects, surfaces, adsorption, and interfaces remain separate topics. The article mentions them only to define the boundary of this page.

## Source review

The source set was checked for semantic support before writing:

- Materials Project phase-diagram methodology directly defines the formation-energy expression, per-atom normalization, convex-hull construction, and decomposition-energy stability boundary.
- Materials Project energy-correction methodology documents that database energies can include named, release-sensitive adjustments and mixing schemes.
- IUPAC defines Gibbs energy as enthalpy minus thermodynamic temperature times entropy.
- Phonopy's official formulation gives the harmonic vibrational Helmholtz free-energy terms and their variables.
- Hohenberg–Kohn and Kohn–Sham are the primary foundations for the electronic-energy model.
- Mermin is the primary finite-temperature DFT source.
- Jain et al. is the primary source for a calibrated GGA/GGA+U formation-enthalpy mixing scheme.
- Stevanović et al. is the primary source for fitted elemental-phase reference energies and the incomplete-error-cancellation problem.
- Bartel et al. directly establishes why formation against elements does not generally decide stability against compound decomposition.

The Materials Project, IUPAC, and Phonopy pages returned live documents with the expected semantic terms during the pre-write check. DOI resolution was checked separately from semantic support; APS DOI endpoints returned access-controlled responses to a command-line client but were recognized DOI records and are handled by the repository's declared DOI audit semantics. The Nature DOI resolved to the primary article.

Reachability does not establish correctness of the article synthesis, and repeated presentation of the same method is not independent validation.

Reviewed source records:

- https://docs.materialsproject.org/methodology/materials-methodology/thermodynamic-stability/phase-diagrams-pds
- https://docs.materialsproject.org/methodology/materials-methodology/thermodynamic-stability/thermodynamic-stability
- https://goldbook.iupac.org/terms/view/G02629
- https://phonopy.github.io/phonopy/formulation.html
- https://doi.org/10.1103/PhysRev.136.B864
- https://doi.org/10.1103/PhysRev.140.A1133
- https://doi.org/10.1103/PhysRev.137.A1441
- https://doi.org/10.1103/PhysRevB.84.045115
- https://doi.org/10.1103/PhysRevB.85.115104
- https://doi.org/10.1038/s41524-018-0143-2

## Practical execution review

The two Python scripts are deterministic teaching fixtures:

- `formation_energy_ledger.py` checks composition, charge, evaluator identity, normalization, completion, and verified state before constructing a same-composition relative-energy table.
- `formation_energy_reactions.py` balances an abstract `A2B3` formation reaction from elemental reservoirs and a separate reaction from an `AB` compound reservoir, preserving exact fractional stoichiometry and explicit per-formula-unit/per-atom conversion.

The scripts use Python 3.12 standard-library arithmetic. They execute no DFT code and ingest no unpublished calculation. Their numerical values are invented fixtures, not material data or recommended parameters.

Execution success is not energy convergence for a real calculation. It verifies only the declared filtering, stoichiometric balance, reaction-ledger arithmetic, and normalization logic. It does not establish a real formation energy, a stable phase, method accuracy, a finite-temperature free energy, or a scientific conclusion.

## Media review

Two SVGs are original conceptual diagrams created for this repository:

- a comparability filter from raw calculation records to one bounded relative-energy table;
- a balanced reference-reaction ledger showing distinct elemental and compound-reservoir paths.

They are conceptual diagrams, not plots of calculated data. No manual screenshot, publisher figure, database plot, proprietary interface, or licensed potential was copied.

## Validation boundary

Repository validation, source audits, deterministic fixture execution, Astro build, responsive browser checks, no-JavaScript checks, Hosted CI, and exact-SHA Pages smoke can establish the implemented page behavior and declared fixture logic. They do not establish the physical accuracy of DFT energies, the completeness of a reference set, thermodynamic equilibrium, phase stability, synthesizability, or any material-specific scientific claim.

---
topic_slug: relative-and-formation-energies
status: reviewed
---

## Begin with the comparison, not the formula

Open the calculation records and the Methods or supporting information that define every candidate and reference. Build a table with composition, charge, cell size, structural or magnetic state, functional, pseudopotential family, numerical settings, and energy convention before subtracting any values. A spreadsheet is often the fastest manual check; a script becomes useful only after the rows are demonstrably comparable.

Plot the normalized differences and inspect outliers against the corresponding structures and source records. The decision is whether a stated reaction or ranking is supported by like-for-like calculations, not whether an arithmetic expression returned a number. Use the [literature and learning sources](/DFT-Research-Workflow/operations/resource-landscape/#literature-learning) to find reported reference conventions and the [specialist analysis tools](/DFT-Research-Workflow/operations/resource-landscape/#specialist-tools) when repeated ledgers need automation.

Use relative or formation energies when the scientific question is a comparison: which named candidate is lower, what is the energy change for a balanced reaction, or how a target compares with declared reservoirs. The required output is not one total energy. It is a ledger plus a reproducible subtraction, its normalization, exclusions, convergence evidence, and claim boundary.

Start with the attached **Build a Comparable Energy Ledger** guide when several calculations must be filtered and normalized. Use **Balance Reference Reactions and Normalization** when the result is defined by a reaction.

Stop before subtraction if any row still lacks a recoverable structure, final-state identity, energy convention, denominator, or convergence decision. The first useful outcome may be an exclusion table rather than an energy ranking.

## A raw total energy is not yet a comparable result

A raw total energy is an internal value for one calculation; comparison requires a declared subtraction and compatible parents.

Do not subtract until the geometries and electronic states are accepted, every term has the intended composition and charge, and the target energy difference is numerically converged. Program completion or SCF convergence of one parent does not make a comparison trustworthy.

## Begin with the scientific comparison

Write the candidate set or balanced reaction before collecting numbers. State the physical states, conserved quantities, thermodynamic conditions, energy convention, reference states, and reporting denominator. Relative energy, reaction energy, and formation energy are distinct objects even when they use some of the same calculations.

## Build a ledger before subtracting

For every row preserve structure and electronic-state identifiers; composition, charge, cell contents, and formula-unit count; raw energy and units; method and potential identity; correction terms; numerical settings; completion, relaxation, state, and target-convergence evidence; and input/output lineage.

Exclude incompatible rows without deleting them. A lower number from a different evaluator, charge, state, or correction model answers a different question.

## Relative energies compare a bounded candidate set

The statement “candidate A is lower than candidate B” is bounded by the enumerated states and the tested evaluator.

For candidates $i$ and $r$ with the same composition and charge,

$$
\Delta E_{\mathrm{rel}}(i\mid r)=\frac{E_i-E_r}{N},
$$

<!-- ΔE_rel(i | r) = [E_i - E_r] / N -->

where $N$ is the declared number of atoms, formula units, magnetic sites, or another relevant count. Changing $r$ shifts the zero but not pairwise ordering. The claim remains bounded by the enumerated candidates and common evaluator.

## Balance a reaction before evaluating its energy

For negative reactant coefficients and positive product coefficients,

$$
\sum_j\nu_j\,\mathrm{Species}_j=0,
\qquad
\Delta E_{\mathrm{rxn}}=\sum_j\nu_jE_j.
$$

<!-- ΔE_rxn = Σ_j ν_j E_j -->

Check elemental balance, charge, electron count, adsorbates, and any open reservoirs before evaluating the sum. State the reaction extent because multiplying every coefficient multiplies the reported energy.

## Formation energy is a special reference reaction

Experimental standard enthalpy of formation is a thermodynamic quantity for specified standard states and temperature.

A common static formation energy for a compound is

$$
\Delta E_{\mathrm f}
=
E_{\mathrm{compound}}-\sum_i n_i\mu_i^{\mathrm{ref}}.
$$

<!-- ΔE_f = E_compound - Σ_i n_i μ_i^ref -->

Every reference requires a phase or molecular form, magnetic and electronic state, pressure convention, method identity, and normalization. Keep fitted references and database corrections as named ledger terms and preserve raw and corrected values separately.

## Normalize only after the stoichiometry is clear

Convert cell totals only after the stoichiometry is explicit. Store both the original cell energy and the derived per-atom, per-formula-unit, or per-reaction value. Never compare columns labelled only “eV” when their denominators or cell contents differ.

## Keep electronic energy, enthalpy, and free energy distinct

When temperature or pressure matters, add only justified terms under one normalization:

$$
F(T,V)=E_{\mathrm{DFT}}(V)+F_{\mathrm{vib}}(T,V)
+F_{\mathrm{el}}(T,V)+F_{\mathrm{other}}(T,V),
$$

<!-- F(T,V) = E_DFT(V) + F_vib(T,V) + F_el(T,V) + F_other(T,V) -->

$$
G(T,p)=\min_V\left[F(T,V)+pV\right].
$$

<!-- G(T,p) = min_V [F(T,V) + pV] -->

Numerical smearing used for Brillouin-zone integration is not automatically $F_{\mathrm{el}}$ at a physical temperature. Every thermal term must refer to the same reaction, state, and denominator.

## Converge the difference and its least-cancelling terms

Test the derived difference against variables that cancel least well: basis or cutoff, Brillouin-zone sampling, occupations, molecular box or vacuum, geometry, magnetic initialization, and correction-specific inputs. Retain individual terms and the assembled difference across the series.

The acceptance criterion belongs to the target difference and intended conclusion, not to a universal cutoff or mesh.

## State identity and geometry remain part of every term

Confirm that every accepted calculation ended in the intended geometry, charge, spin, symmetry, and occupation state. A lower energy caused by magnetic collapse, an unintended distortion, or a different charge distribution does not answer the planned comparison.

## Treat small differences as estimates with uncertainty

Compare the separation with numerical variation, reference uncertainty, and defensible method sensitivity. If those scales overlap, report the ordering as unresolved within the tested model rather than selecting a winner from extra digits.

## Method consistency controls error cancellation

Keep functional, potential or basis family, relativistic and Hubbard treatment, correction model, and energy convention compatible across all terms.

A negative reaction energy places the written products below the written reactants in the stated model. It does not calculate a barrier, rate, finite-temperature equilibrium, or experimental outcome.

## A negative formation energy is not a phase-stability proof

$\Delta E_{\mathrm f}<0$ means that the target is below its chosen elemental references for that formation reaction.

A compound can have a negative formation energy and still decompose exothermically into other compounds. Formation energy alone establishes neither equilibrium stability nor experimental synthesizability.

Stability against decomposition requires a compatible competing-phase set and a convex-hull or equivalent equilibrium calculation.

## Preserve the complete comparison object

Store the balanced reaction or candidate set, raw ledger, exclusions, normalization, raw and corrected terms, convergence tables, uncertainty assessment, and links to every parent artifact. Downstream work should consume this object rather than scrape a rounded figure.

## Decide what may continue

Reopen every elemental phase, molecular form, magnetic state, and reservoir condition before accepting the ledger. If a reference remains ambiguous or a relevant energy difference is not resolved at the required precision, report the comparison as unresolved and stop the downstream ranking.

Send compatible composition-normalized formation energies to a convex hull. Send state-labelled energy-volume points to EOS work. Defect, surface, adsorption, and interface calculations require their own reservoir or excess-quantity construction.

An accepted ledger can support a bounded candidate ordering or written reaction within a stated evaluator, normalization, and uncertainty. It does not establish the global structural or electronic ground state, an exhaustive competing-phase set, a reaction pathway or rate, finite-temperature equilibrium without the required terms, synthesizability, or agreement with experiment.

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

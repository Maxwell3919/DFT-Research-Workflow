---
topic_slug: relative-and-formation-energies
guide_slug: balance-reference-reactions-and-normalization
title: Balance Reference Reactions and Normalization
kind: worked-example
tools:
  - python
status: reviewed
summary: Use exact rational stoichiometry to compare an elemental formation reaction with a distinct compound-reservoir reaction for one abstract deterministic energy fixture.
tested_versions:
  - Python 3.12
execution_script: examples/practical-guides/formation_energy_reactions.py
source_ids:
  - materials-project-phase-diagrams
  - materials-project-energy-corrections
  - jain-formation-enthalpies
  - stevanovic-fere
  - bartel-decomposition-reactions
media_ids:
  - balanced-reference-reactions
review: docs/reviews/2026-08-03-relative-and-formation-energies.md
reviewed_at: "2026-08-03"
---

This worked example uses invented energies for abstract species `A`, `B2`, `AB`, and `A2B3`. It demonstrates exact reaction balance, signed stoichiometric coefficients, and normalization. No symbol denotes a real element or compound.

## Write two different reactions

The elemental formation reaction is

```text
2 A + 3/2 B2 -> A2B3
```

The compound-reservoir reaction is

```text
2 AB + 1/2 B2 -> A2B3
```

Both conserve two `A` atoms and three `B` atoms, but they use different reservoirs. The first asks for formation from declared elemental references. The second asks for an energy change from an `AB` precursor and a `B2` reservoir. They are not interchangeable labels for one number.

## Represent coefficients without rounding

Reactant coefficients are negative and product coefficients positive. Python's `Fraction` keeps `3/2` and `1/2` exact:

```python
elemental = {"A": Fraction(-2), "B2": Fraction(-3, 2), "A2B3": Fraction(1)}
compound = {"AB": Fraction(-2), "B2": Fraction(-1, 2), "A2B3": Fraction(1)}
```

The script multiplies every coefficient by the elemental composition of its species and asserts that the net amount of both elements is zero. Arithmetic begins only after this balance passes.

## Evaluate the signed energy sum

For either reaction,

```text
ΔE_rxn = Σ_j ν_j E_j
```

`ν_j` is the exact signed coefficient and `E_j` is the fixture energy per listed calculation object. The invented table yields `-0.50 eV` per `A2B3` formula unit for elemental formation and `-0.10 eV` per formula unit for the compound-reservoir reaction.

Because `A2B3` contains five atoms, the same fixture results are `-0.10 eV` per atom and `-0.02 eV` per atom, respectively. Reporting the denominator prevents a per-formula-unit value from being compared accidentally with a per-atom value.

## Read the sign with the reaction

Under the chosen sign convention, a negative result places the products below the written reactants in this static fixture energy model. It says nothing about an omitted phase, a reaction barrier, finite-temperature equilibrium, or whether the reference calculations are accurate.

The two values differ because their reservoirs differ. A fitted elemental reference or database correction would add another declared ledger term; it would not be hidden by replacing a raw energy.

## Reproduce the fixture

```python
from formation_energy_reactions import run

report = run()
print(report["elemental_formation_reaction"])
print(report["compound_reservoir_reaction"])
```

The output includes equations, exact balance checks, per-formula-unit and per-atom results, and the interpretation boundary.

## What this example does not establish

The example does not run a DFT code, validate elemental reference phases, converge a reaction energy, calculate a real formation enthalpy, add zero-point or thermal terms, construct a convex hull, establish phase stability, or predict synthesizability.

Its negative fixture formation energy is deliberately insufficient as a stability claim. Real phase stability requires the complete relevant competitor set and a thermodynamic model appropriate to the conditions.

## Official and primary sources

- [Materials Project phase-diagram methodology](https://docs.materialsproject.org/methodology/materials-methodology/thermodynamic-stability/phase-diagrams-pds)
- [Materials Project energy-correction methodology](https://docs.materialsproject.org/methodology/materials-methodology/thermodynamic-stability/thermodynamic-stability)
- [Jain and co-workers, formation enthalpies from mixed GGA and GGA+U calculations](https://doi.org/10.1103/PhysRevB.84.045115)
- [Stevanović and co-workers, fitted elemental-phase reference energies](https://doi.org/10.1103/PhysRevB.85.115104)
- [Bartel and co-workers, decomposition reactions and solid stability](https://doi.org/10.1038/s41524-018-0143-2)

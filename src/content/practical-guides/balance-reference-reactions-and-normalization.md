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

## Open the source records before balancing the reaction

A researcher normally begins with the candidate and reservoir structures, the calculation records that produced their energies, and the paper or database metadata defining the reference convention. Put stoichiometries and per-cell energies in a spreadsheet, balance the reaction by hand, and inspect whether charge, composition, method, and state identity are compatible before converting to a per-atom or per-formula-unit value. Use [structure and data sources](/DFT-Research-Workflow/operations/resource-landscape/#structures-data) and [literature sources](/DFT-Research-Workflow/operations/resource-landscape/#literature-learning) to recover missing reference definitions.

**Audit the stored fixture:** the displayed abstract reaction is a conceptual, deterministic teaching fixture. Its companion script checks rational stoichiometry and normalization; it is not a real material reaction or formation-energy result.

Use this fixture when you need to check reaction balance, coefficient signs, and reporting normalization before inserting calculated energies. It uses invented energies for abstract species `A`, `B2`, `AB`, and `A2B3`; none denotes a real material.

From the companion-script directory, inspect the returned report with:

```bash
cd examples/practical-guides
python3 - <<'PY'
from formation_energy_reactions import run

report = run()
print(report["elemental_formation_reaction"])
print(report["compound_reservoir_reaction"])
PY
```

This calls the reviewed `run()` object. It does not execute DFT.

## Enter the reactions exactly

The fixture compares two distinct reservoir choices:

$$
2\,\mathrm A+\frac{3}{2}\,\mathrm{B_2}
\rightarrow
\mathrm{A_2B_3},
$$

$$
2\,\mathrm{AB}+\frac{1}{2}\,\mathrm{B_2}
\rightarrow
\mathrm{A_2B_3}.
$$

Both conserve two A atoms and three B atoms. The first is formation from declared elemental references; the second starts from an AB precursor and a B2 reservoir. They answer different questions.

Keep coefficients exact in the input object:

```python
elemental = {"A": Fraction(-2), "B2": Fraction(-3, 2), "A2B3": Fraction(1)}
compound = {"AB": Fraction(-2), "B2": Fraction(-1, 2), "A2B3": Fraction(1)}
```

Reactants are negative and products positive. The first check is the net amount of every element and charge. Do not calculate an energy until each balance is zero.

## Inspect the report

For either reaction,

$$
\Delta E_{\mathrm{rxn}}=\sum_j\nu_jE_j.
$$

Confirm that the report preserves the written reaction, signed coefficients, exact balance, energy per formula unit, and energy per atom. The invented values are $-0.50$ eV per A2B3 formula unit for the elemental reaction and $-0.10$ eV per formula unit for the compound-reservoir reaction. Because A2B3 has five atoms, the corresponding fixture values are $-0.10$ and $-0.02$ eV per atom.

Those numbers check fixture arithmetic only. If a real ledger uses a different cell size, convert each energy to the same reaction extent before summing. Keep fitted references and database corrections as separate named terms.

## Claim boundary

Accept the reaction object only when:

- every conserved component balances exactly;
- each energy corresponds to the object named by its coefficient;
- the coefficient sign convention is explicit;
- the formula-unit, atom, or reaction denominator is stored;
- the same method and correction model applies to all accepted terms.

A negative result places the written products below the written reactants in the stated static model. It does not establish an omitted competitor, a barrier, finite-temperature equilibrium, calculation accuracy, or synthesizability. Move to a convex hull only after a compatible competitor ledger exists.

## Official and primary sources

- [Materials Project phase-diagram methodology](https://docs.materialsproject.org/methodology/materials-methodology/thermodynamic-stability/phase-diagrams-pds)
- [Materials Project energy-correction methodology](https://docs.materialsproject.org/methodology/materials-methodology/thermodynamic-stability/thermodynamic-stability)
- [Jain and co-workers, formation enthalpies from mixed GGA and GGA+U calculations](https://doi.org/10.1103/PhysRevB.84.045115)
- [Stevanović and co-workers, fitted elemental-phase reference energies](https://doi.org/10.1103/PhysRevB.85.115104)
- [Bartel and co-workers, decomposition reactions and solid stability](https://doi.org/10.1038/s41524-018-0143-2)

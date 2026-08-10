---
topic_slug: adsorption-energies
guide_slug: build-adsorption-energy-ledger
title: Build an Adsorption-Energy and Free-Energy Ledger
kind: implementation
tools:
  - python
status: reviewed
summary: Inspect an attributed CO/surface reaction ledger before using synthetic normalization and free-energy bookkeeping examples.
tested_versions:
  - Python 3.12
execution_script: examples/practical-guides/adsorption_ledger_cmr.py
source_ids:
  - cmr-adsorption-paper
  - campbell-adsorbate-entropy
  - campbell-entropy-correction
  - norskov-che
  - reuter-surface-thermodynamics
  - cmr-adsorption-page
  - cmr-adsorption-db
  - cmr-data-license
media_ids:
  - adsorption-energy-ledger
review: docs/reviews/2026-08-04-adsorption-energies.md
reviewed_at: "2026-08-04"
---

## Put the real adsorption geometries beside the ledger

Open the clean slab, gas-phase or molecular reference, and relaxed adsorbate structure. View the final structure from above and from the side, identify the actual site and coverage, and measure relevant distances before entering its energy in a spreadsheet or notebook. Compare the reaction convention with the source Methods or supporting information; the energy ledger cannot reveal migration, dissociation, or reconstruction. Use [visual tools](/DFT-Research-Workflow/operations/resource-landscape/#visual-symmetry), [specialist surface tools](/DFT-Research-Workflow/operations/resource-landscape/#specialist-tools), and [literature sources](/DFT-Research-Workflow/operations/resource-landscape/#literature-learning) for this human route.

**Audit the stored fixture:** the companion script checks the attributed ledger and its synthetic bookkeeping extensions. The schematic ledger is secondary evidence and must not be read as an atomistic adsorption configuration or a new calculation.

Audit the attributed public reaction ledger first:

```bash
python3 examples/practical-guides/adsorption_ledger_cmr.py
```

The command checks the frozen CMR source identity, database SHA-256, reaction, sign convention, coverage statement, metal order, and selected scalar values. Its JSON output exposes the source hash and four PBE values. It does not launch DFT, calculate a new adsorption energy, or establish another site or coverage.

## Read the reaction before the numbers

The snapshot defines

$$
\mathrm{CO(g)}+*\rightarrow\mathrm{CO*}
$$

with products minus reactants and negative values favourable. It records full-coverage top-site fcc(111) models and PBE values of `0.263`, `-0.682`, `-0.946`, and `0.105 eV` per written reaction for Cu, Pd, Pt, and Au. Those state and reference choices travel with every number.

For a private calculation, build the ledger before subtraction. Record the clean slab, combined state, every reservoir, stoichiometric coefficient, charge and spin, coverage, unit, and sign. For one adsorbate,

$$
E_{\mathrm{ads}}
=E_{\mathrm{slab}+A}-E_{\mathrm{slab}}-E_{A,\mathrm{ref}}.
$$

The retained synthetic explanation separately evaluates $\mathrm{CO(g)}+*\rightarrow\mathrm{CO*}$ and $\mathrm{H_2(g)}+2*\rightarrow2\mathrm{H*}$. It divides by two only after balancing the second reaction. Those invented totals demonstrate normalization; they are not source data or reusable reference energies.

## Keep coverage quantities distinct

The synthetic one- and two-CO totals yield an average adsorption energy of `-0.60 eV per CO` at $N=2$, while the second addition is `-0.40 eV`. The average and differential quantities answer different questions. State whether coverage is a site fraction, adsorbates per surface atom, molecules per area, or a surface-cell stoichiometry before comparing rows.

Add zero-point, thermal, entropy, solvent, pressure, or electrode terms only after closing the static reaction ledger. Record the model and unit of every term, and do not count a contribution twice. The [Campbell and Sellers paper](https://doi.org/10.1021/ja3080117) and its [published correction](https://doi.org/10.1021/ja407293b) bound the entropy discussion; [surface thermodynamics](https://doi.org/10.1103/PhysRevB.65.035406) and the [computational hydrogen electrode](https://doi.org/10.1021/jp047349j) define different reservoir transformations.

## What this guide verifies

Check that the reaction is balanced, the sign and denominator are explicit, clean and adsorbed states are compatible, final geometry matches its label, and the target energy and ordering are converged. A successful companion run verifies frozen-data identity and ledger arithmetic only. It does not establish adsorption convergence, thermodynamic accuracy, a real site or coverage series, entropy, solvent, pressure, electrode conditions, catalytic ranking, or a material conclusion.

## Official sources

- [Schmidt and Thygesen, adsorption benchmark reactions](https://doi.org/10.1021/acs.jpcc.7b12258)
- [Campbell and Sellers, adsorbate entropy](https://doi.org/10.1021/ja3080117)
- [Correction to the adsorbate-entropy paper](https://doi.org/10.1021/ja407293b)
- [Norskov and co-workers, computational hydrogen electrode](https://doi.org/10.1021/jp047349j)
- [Reuter and Scheffler, atomistic surface thermodynamics](https://doi.org/10.1103/PhysRevB.65.035406)
- [CMR adsorption project and schema](https://cmr.fysik.dtu.dk/adsorption/adsorption.html)
- [CMR adsorption database](https://wiki.fysik.dtu.dk/cmr-files/adsorption.db)
- [CMR data licence](https://cmr.fysik.dtu.dk/index.html)

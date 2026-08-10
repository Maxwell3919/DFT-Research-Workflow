---
topic_slug: surface-energy-and-work-function
guide_slug: build-surface-energy-ledger
title: Build a Surface-Energy Ledger and Diagnose Bulk Drift
kind: implementation
tools:
  - python
status: reviewed
summary: Use an attributed published Si-surface ledger alongside a synthetic bulk-drift diagnostic, without confusing three table values with a converged slab series.
tested_versions:
  - Python 3.12
execution_script: examples/practical-guides/surface_ledger_intermat.py
source_ids:
  - fiorentini-methfessel-surfaces
  - boettger-surface-nonconvergence
  - gpaw-al-surface
  - intermat-paper
  - intermat-nist-pdf
  - cc-by-3
media_ids:
  - surface-energy-ledger
review: docs/reviews/2026-08-04-surface-energy-and-work-function.md
reviewed_at: "2026-08-04"
---

## View the facets and slab definitions before comparing values

Open each facet as a slab, view it from the side and along the surface normal, and identify termination, surface-cell area, layer count, fixed atoms, vacuum, and whether the two faces are equivalent. Read the source Methods or database record to determine the bulk reference and unit convention, then place those definitions beside the energy table. Use [visual tools](/DFT-Research-Workflow/operations/resource-landscape/#visual-symmetry), [structure and surface data](/DFT-Research-Workflow/operations/resource-landscape/#structures-data), and [literature sources](/DFT-Research-Workflow/operations/resource-landscape/#literature-learning).

**Reproduce this site's figure:** the companion script redraws attributed published silicon surface values and a separate synthetic bulk-drift diagnostic. The three source values are not a slab-thickness or vacuum-convergence series, and the schematic diagnostic is secondary rather than real slab evidence.

Start by auditing the attributed InterMat ledger:

```bash
python3 examples/practical-guides/surface_ledger_intermat.py
```

This declared companion checks the frozen snapshot identity, SHA-256, licence, method label, orientation order, and the three reported Si surface-energy values. It reads and audits an existing public-data ledger. It does not launch a DFT executable, build a slab, or test slab convergence.

## Inspect the parent objects

The snapshot records unreconstructed Si(111), Si(110), and Si(001) rows for `JVASP-1002` from the open-access [InterMat paper](https://doi.org/10.1039/D4DD00031E). It reports OptB88vdW surface energies of `1.60`, `1.66`, and `2.22 J m^-2`. The [NIST-hosted PDF](https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=957179) remains the authority for the calculation and experimental context.

Check the source ID, facet, method, units, and state definition before comparing the three values. They are different orientations from one table, not a thickness series, and cannot diagnose bulk-reference drift or establish a reconstruction ranking.

For a real symmetric stoichiometric slab ledger, record $N$, one-face area $A$, slab energy, compatible bulk energy per counted unit, surface count, units, final structure, and output hashes. Then evaluate

$$
\gamma=\frac{E_{\mathrm{slab}}(N)-N e_{\mathrm{bulk}}}{2A}.
$$

Use the divisor $2A$ only for two equivalent faces. An asymmetric slab yields a sum of two surface excesses; a nonstoichiometric slab needs explicit chemical potentials.

## Run the separate drift diagnostic

The repository also retains an invented four-slab fixture for the specific failure pattern caused by an incompatible bulk slope:

```bash
python3 examples/practical-guides/surface_energy_ledger.py \
  --svg public/media/practical-guides/surface-energy-and-work-function/build-surface-energy-ledger/surface-energy-ledger.svg
```

It fits

$$
E_{\mathrm{slab}}(N)=N e_{\mathrm{bulk}}^{\mathrm{fit}}+E_{\mathrm{excess}}
$$

for one invented slab family, then perturbs the slope by `0.003 eV/atom` to expose thickness drift. The script checks regression arithmetic, unit conversion, the two-face factor, and deterministic rendering. Its red line is a deliberately synthetic failure pattern, not Si data or a recommended tolerance.

## What this guide verifies

For a real series, first confirm that orientation, termination, reconstruction, stoichiometry, area, strain, constraints, magnetic state, and numerical protocol remain unchanged. Inspect the final structures and central layers. Accept a plateau or fitted intercept only after slab thickness, bulk cancellation, and the target surface energy meet the study's declared tolerance without a state switch.

The two commands verify a public snapshot and a synthetic diagnostic, respectively. Neither establishes a new surface energy, executes DFT, proves termination completeness, validates the bulk reference, or supports a material-stability claim.

## Official sources

- [Fiorentini and Methfessel, convergent surface energies](https://doi.org/10.1088/0953-8984/8/36/005)
- [Boettger, thin-film surface-energy nonconvergence](https://doi.org/10.1103/PhysRevB.49.16798)
- [GPAW aluminium-surface tutorial](https://gpaw.readthedocs.io/tutorialsexercises/basics/surface/surface.html)
- [Choudhary and Garrity, InterMat](https://doi.org/10.1039/D4DD00031E)
- [NIST-hosted InterMat article PDF](https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=957179)
- [Creative Commons Attribution 3.0 Unported](https://creativecommons.org/licenses/by/3.0/)

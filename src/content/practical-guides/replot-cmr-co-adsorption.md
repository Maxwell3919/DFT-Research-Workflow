---
topic_slug: adsorption-energies
guide_slug: replot-cmr-co-adsorption
title: Replot the CMR CO-on-fcc(111) Adsorption Benchmark
kind: worked-example
tools:
  - python
status: reviewed
summary: Reproduce an attributed four-metal, four-method view of real published CMR adsorption energies from a hash-bound frozen snapshot.
tested_versions:
  - Python 3.12
execution_script: examples/practical-guides/cmr_co_adsorption.py
source_ids:
  - cmr-adsorption-paper
  - cmr-adsorption-page
  - cmr-adsorption-db
  - cmr-data-license
media_ids:
  - cmr-co-adsorption
review: docs/reviews/2026-08-04-adsorption-energies.md
reviewed_at: "2026-08-04"
---

## Read the adsorption table with the missing geometries in view

Open the CMR record and source publication, inspect the four methods, metal surfaces, adsorption definition, and any supplied structures or supporting information. Compare methods only when site, coverage, slab, molecular reference, and sign convention match; view the final adsorption geometries if they are available. Use [structure and data sources](/DFT-Research-Workflow/operations/resource-landscape/#structures-data), [visual tools](/DFT-Research-Workflow/operations/resource-landscape/#visual-symmetry), and [literature sources](/DFT-Research-Workflow/operations/resource-landscape/#literature-learning).

**Reproduce this site's figure:** the companion script redraws a frozen, hash-bound public dataset. It does not supply the atomistic geometries or rerun the calculations, and the plot supports only the attributed comparison.

Rebuild the attributed plot from the frozen snapshot:

```bash
python3 examples/practical-guides/cmr_co_adsorption.py \
  --svg public/media/practical-guides/adsorption-energies/replot-cmr-co-adsorption/cmr-co-adsorption.svg
```

The command hashes the exact JSON bytes, checks the DOI, licence, source database hash, row IDs, metal order, selected PBE values, and sign pattern, then writes the SVG. It does not run PBE, RPBE, BEEF-vdW, exact-exchange, or RPA calculations.

## Claim boundary

The [CMR project page](https://cmr.fysik.dtu.dk/adsorption/adsorption.html) documents 200 reaction records, their schema, reference reactions, and broad calculation setup. The source [ASE database](https://wiki.fysik.dtu.dk/cmr-files/adsorption.db) was downloaded on 2026-08-04 as `3,719,168` bytes with SHA-256 `2ea151bbf599868fb48d615b784f8bf9c82cac94f51baf85697e1c28e025e9bf`.

The snapshot preserves row IDs `109`, `116`, `124`, and `125` for CO on Cu, Pd, Pt, and Au. It selects PBE, RPBE, BEEF-vdW, and the database's final `RPA_EXX_adsorp` field without redistributing the complete database or copying the source figure.

The reaction is

$$
\mathrm{CO(g)}+\mathrm{slab}\rightarrow\mathrm{CO/slab},
$$

with products minus reactants and negative values favourable. The broad benchmark uses full coverage and top-site adsorption on three-layer fcc(111) models under the documented relaxation construction. Those conditions define every plotted point.

The Pt row spans `-0.946 eV` with PBE to `-0.478 eV` with RPBE; all selected Pd and Pt values are negative, while all selected Cu and Au values are positive. This is descriptive method spread, not an uncertainty interval, catalytic ranking, or proof that the full-coverage top-site state is experimentally realized.

To bind the compact snapshot to a local copy of the exact public database, run:

```bash
python3 examples/practical-guides/cmr_co_adsorption.py \
  --source-db /path/to/adsorption.db
```

A matching byte length, hash, and selected-row comparison establish extraction integrity only. The [benchmark paper](https://doi.org/10.1021/acs.jpcc.7b12258) remains the scientific source, and CMR records the database under [CC BY-SA 4.0](https://cmr.fysik.dtu.dk/index.html). Neither command independently establishes source convergence, method accuracy, low-coverage adsorption, an experimental site, catalytic activity, or a new material conclusion.

## Official sources

- [Schmidt and Thygesen, benchmark paper](https://doi.org/10.1021/acs.jpcc.7b12258)
- [CMR adsorption project and schema](https://cmr.fysik.dtu.dk/adsorption/adsorption.html)
- [CMR adsorption database](https://wiki.fysik.dtu.dk/cmr-files/adsorption.db)
- [CMR data licence](https://cmr.fysik.dtu.dk/index.html)

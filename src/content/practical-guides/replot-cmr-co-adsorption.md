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

This example adds a real surface-chemistry figure without presenting public data as this repository's calculation. It extracts four rows from the CMR benchmark, freezes their exact scalar values and acquisition metadata, and draws a new comparison plot.

## Inspect the source and scope first

The [CMR project page](https://cmr.fysik.dtu.dk/adsorption/adsorption.html) documents 200 adsorption reactions, the key-value schema, reference reactions, and broad calculation setup. The underlying [ASE database](https://wiki.fysik.dtu.dk/cmr-files/adsorption.db) was downloaded on 2026-08-04 as `3,719,168` bytes with SHA-256 `2ea151bbf599868fb48d615b784f8bf9c82cac94f51baf85697e1c28e025e9bf`.

The snapshot retains database row IDs `109`, `116`, `124`, and `125` for CO on Cu, Pd, Pt, and Au. It stores PBE, RPBE, BEEF-vdW, and the database's final `RPA_EXX_adsorp` field. It does not copy the source figure or redistribute the full database.

## Read the values as one bounded comparison

The reaction is `CO(g) + slab → CO/slab`, with products minus reactants and negative values favourable. The broad benchmark uses full coverage, top-site adsorption on three-layer fcc(111) models with the documented relaxation construction. Those conditions are part of every plotted point.

The Pt row ranges from `-0.946 eV` with PBE to `-0.478 eV` with RPBE; all four Pd and Pt values are negative, while all four selected Cu and Au values are positive. The method spread is descriptive. It is not an uncertainty interval, a cross-material catalytic ranking, or proof that the full-coverage top-site state is experimentally realized.

## Rebuild the original rendering

```text
python3 examples/practical-guides/cmr_co_adsorption.py \
  --svg public/media/practical-guides/adsorption-energies/replot-cmr-co-adsorption/cmr-co-adsorption.svg
```

The script hashes the exact JSON bytes, asserts the DOI, licence, database hash, row IDs, metal order, selected PBE values, and sign pattern, and then draws the committed SVG. The [benchmark paper](https://doi.org/10.1021/acs.jpcc.7b12258) supplies the method and scientific context. CMR declares its databases under [CC BY-SA 4.0](https://cmr.fysik.dtu.dk/index.html), which is recorded in both the snapshot and media provenance.

If you download the source database yourself, the same script can also verify its byte length and SHA-256 before comparing the four energy fields in all four selected SQLite rows:

```text
python3 examples/practical-guides/cmr_co_adsorption.py \
  --source-db /path/to/adsorption.db
```

This optional check ties the compact JSON snapshot back to one exact database binary. A matching hash and row comparison establish extraction integrity; they still do not independently validate the calculations stored in that database.

## What this example does not establish

This repository did not rerun the CMR PBE, RPBE, BEEF-vdW, exact-exchange, or RPA calculations. The script verifies frozen-data identity, selected-field transcription, sign checks, spread arithmetic, and rendering only. It does not independently establish source convergence, method accuracy, low-coverage adsorption, the experimental site or coverage, catalytic activity, or a new conclusion about Cu, Pd, Pt, or Au.

## Official sources

- [Schmidt and Thygesen, benchmark paper](https://doi.org/10.1021/acs.jpcc.7b12258)
- [CMR adsorption project and schema](https://cmr.fysik.dtu.dk/adsorption/adsorption.html)
- [CMR adsorption database](https://wiki.fysik.dtu.dk/cmr-files/adsorption.db)
- [CMR data licence](https://cmr.fysik.dtu.dk/index.html)

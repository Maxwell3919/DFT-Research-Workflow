---
topic_slug: electronic-transport
guide_slug: replot-boltztrap-cosb3-transport
title: Replot a Published CoSb3 Transport Output
kind: worked-example
tools:
  - python
status: reviewed
summary: Trace and redraw a real CoSb3 BoltzTraP conductivity and Seebeck output while preserving relaxation-time, unit, source, and convergence boundaries.
tested_versions:
  - Python 3.12
execution_script: examples/practical-guides/boltztrap_cosb3_transport.py
source_ids:
  - boltztrap-original-paper
  - boltztrap2-paper
  - boltztrap2-public-repository
  - boltztrap2-license
media_ids:
  - boltztrap-cosb3-transport
review: docs/reviews/2026-08-04-electronic-transport.md
reviewed_at: "2026-08-04"
---

**Evidence class: derived-public-data.** This example adds a real material transport figure without presenting public output as a calculation performed by this repository. It traces all 14 rows of `CoSb3.condtens` from the BoltzTraP2 public source archive, stores only the five columns needed here, and generates an original two-panel SVG.

## Read the displayed transport object first

Inspect both tensor-component curves with their axes, temperature range, fixed chemical-potential coordinate, and units visible. Ask whether the plotted quantity is absolute or divided by a relaxation time, where the Seebeck sign changes, whether the sampling is dense enough to resolve that feature, and what parent band or scattering information is absent. The figure supports human comparison of two stored trends; it does not show the CoSb3 Fermi surface, k-resolved transport contributions, interpolation error, or a scattering mechanism. See the [electronic-transport resources](/DFT-Research-Workflow/operations/resource-landscape/#electronic-properties) for those routes.

### Optional automation: rebuild the bounded artifact

```bash
python3 examples/practical-guides/boltztrap_cosb3_transport.py \
  --svg public/media/practical-guides/electronic-transport/replot-boltztrap-cosb3-transport/boltztrap-cosb3-transport.svg
```

The script reads `examples/practical-guides/data/boltztrap-cosb3-condtens-20260804.json`, checks the frozen source hashes, row and temperature ordering, selected values and sign-change bracket, then writes the SVG. It does not run WIEN2k, BoltzTraP, BoltzTraP2, or a transport convergence study.

## Trace the source before interpreting the curves

The [BoltzTraP2 public repository](https://gitlab.com/sousaw/BoltzTraP2/-/tree/public) is distributed under [GPL-3.0-or-later](https://gitlab.com/sousaw/BoltzTraP2/-/blob/public/LICENSE.txt). The frozen source commit is `7ed9146c42d671562daee86d87e253fcbdedaeab`. Its `data.tar.xz` archive had 43,752,436 bytes and SHA-256 `ec88d20ae4d00bd58ea98277ef8ee45281eb807160d3955406a819931f3f5169`; the extracted member `data/CoSb3/CoSb3.condtens` had SHA-256 `67b6d7e26fa62b4e0a0b56415fa87bade2b764f472b2ed627b09484fa7f81939`.

The compact snapshot retains every row and records the source header. The plotted fields are temperature, the diagonal `xx` conductivity divided by the relaxation time, and the diagonal `xx` Seebeck coefficient at the output's fixed chemical-potential coordinate. The [original BoltzTraP paper](https://arxiv.org/abs/cond-mat/0602203) defines the transport approach, while the [BoltzTraP2 paper](https://arxiv.org/abs/1712.07946) documents the later interpolation and Onsager implementation.

## Interpret both panels with their assumptions attached

The source stores `sigma_xx/tau`, not an absolute conductivity. Its rise or fall cannot be converted to resistivity without a relaxation time that is compatible with the same state, temperature, direction, and scattering model. The Seebeck component is stored in volts per kelvin; the redraw multiplies it by `10^6` and labels microvolts per kelvin.

For this fixed output coordinate, the stored Seebeck values change sign between 200 and 250 K. The script reports that bracket directly from adjacent rows; it does not interpolate a transition temperature or attribute the sign to a unique carrier type. The electron count and thermal occupation change slightly over the series, and the result belongs to the exact source model rather than to all CoSb3 samples.

## Inspect the artifact and its assumptions

The standard-library script checks the exact JSON bytes, both recorded source hashes, row count, temperature grid, fixed energy coordinate, selected values, sign-change bracket, and monotonic temperature ordering before redrawing the SVG. The plot footer carries source, licence, commit, and execution boundaries so that a detached image does not become stronger evidence than its data.

## What this example does not establish

This repository did not rerun WIEN2k, BoltzTraP, or BoltzTraP2. The example does not establish parent DFT convergence, interpolation accuracy, an absolute relaxation time, scattering-limited conductivity, experimental Seebeck agreement, doping feasibility, thermal stability, or a new conclusion about CoSb3. It is a hash-bound public-output post-processing and provenance test.

## Official and primary sources

- [Madsen and Singh, the original BoltzTraP method](https://arxiv.org/abs/cond-mat/0602203)
- [Madsen, Carrete, and Verstraete, BoltzTraP2](https://arxiv.org/abs/1712.07946)
- [BoltzTraP2 public repository](https://gitlab.com/sousaw/BoltzTraP2/-/tree/public)
- [BoltzTraP2 GPL-3.0-or-later licence](https://gitlab.com/sousaw/BoltzTraP2/-/blob/public/LICENSE.txt)
